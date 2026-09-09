import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AffirmTargetDetail,
  AffirmTargetItem,
  AffirmTargetRow,
  AffirmTargetService,
  EvsGradeOption,
  EvsResumeOption,
} from './affirm-target.service';

export interface AffirmTargetConfig {
  apiBase: 'affirmTarget1' | 'affirmTarget2';
  i18nPrefix: string;
  /** Cấp đang nhập điểm ở trang này ('1' hoặc '2'). */
  level: '1' | '2';
  evsLevel: string;
  editableActivity: string;
}

interface SectionTotals {
  itemScoreTotal: number;
  selfTotal: number;
  readonlyTotal: number;
  inputTotal: number;
  hasInput: boolean;
}

/**
 * Component dùng chung cho viewAffirmTarget1 và viewAffirmTarget2 (đánh giá
 * lần 1 / lần 2 phía người đánh giá). Xem ghi chú lý do gộp trong
 * affirm-target.service.ts. Cấu hình truyền qua route `data: { affirmTargetConfig }`.
 */
@Component({
  selector: 'app-affirm-target',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './affirm-target.component.html',
  styleUrl: './affirm-target.component.scss',
})
export class AffirmTargetComponent implements OnInit {
  private readonly service = inject(AffirmTargetService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected config!: AffirmTargetConfig;
  private evsType = '';

  protected readonly hasAnyResume = signal(true);
  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);

  protected readonly rows = signal<AffirmTargetRow[]>([]);
  protected readonly listLoading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly recordsFiltered = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);
  protected readonly quickFilter = signal('');
  protected readonly savingDraft = signal(false);
  protected readonly executing = signal(false);

  protected readonly gradeList = signal<EvsGradeOption[]>([]);
  protected readonly gradeMapByCode = computed(() => {
    const map = new Map<string, EvsGradeOption>();
    this.gradeList().forEach((g) => g.evsGrade && map.set(g.evsGrade, g));
    return map;
  });
  protected readonly stdRate = signal<Record<string, unknown>>({});
  protected readonly gradeSummary = signal<Record<string, unknown>[]>([]);
  protected readonly distributionVisible = signal(false);

  /** seq -> điểm số đang nhập inline trong bảng danh sách (chưa lưu). */
  protected readonly inputScores = signal<Map<string, string>>(new Map());

  protected readonly filteredRows = computed(() => {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(kw)));
  });

  protected readonly hasEditableRows = computed(() => this.rows().some((r) => r.activity === this.config.editableActivity));
  protected readonly canExecute = computed(() => {
    if (!this.hasEditableRows()) return false;
    return this.rows()
      .filter((r) => r.activity === this.config.editableActivity)
      .every((r) => !!this.scoreValue(r) && !!this.gradeForRow(r));
  });

  // ── Modal chi tiết ──
  protected readonly detailVisible = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detail = signal<AffirmTargetDetail | null>(null);
  protected readonly items = signal<AffirmTargetItem[]>([]);
  protected readonly canInputDetail = signal(false);
  protected readonly affirmContent = signal('');
  protected readonly dmSaving = signal(false);
  /** seq item -> điểm nhập ở cấp đang đánh giá, trong modal chi tiết. */
  protected readonly itemInputScores = signal<Map<string, string>>(new Map());

  protected readonly strategicItems = computed(() => this.items().filter((r) => String(r.itemType) === '1'));
  protected readonly operationItems = computed(() => this.items().filter((r) => String(r.itemType) !== '1'));
  protected readonly strategicTotals = computed(() => this.sectionTotals(this.strategicItems()));
  protected readonly operationTotals = computed(() => this.sectionTotals(this.operationItems()));
  protected readonly grandItemScoreTotal = computed(
    () => Math.round((this.strategicTotals().itemScoreTotal + this.operationTotals().itemScoreTotal) * 100) / 100,
  );
  protected readonly grandSelfTotal = computed(
    () => Math.round((this.strategicTotals().selfTotal + this.operationTotals().selfTotal) * 100) / 100,
  );
  protected readonly grandReadonlyTotal = computed(
    () => Math.round((this.strategicTotals().readonlyTotal + this.operationTotals().readonlyTotal) * 100) / 100,
  );
  protected readonly grandHasInput = computed(() => this.strategicTotals().hasInput || this.operationTotals().hasInput);
  protected readonly grandInputTotal = computed(
    () => Math.round((this.strategicTotals().inputTotal + this.operationTotals().inputTotal) * 100) / 100,
  );
  protected readonly detailGrade = computed(() => (this.grandHasInput() ? this.calcGradeFromScore(this.grandInputTotal()) : null));

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.config = this.route.snapshot.data['affirmTargetConfig'] as AffirmTargetConfig;
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';

    try {
      const resumeList = await this.service.getResumeOptions(this.evsType, this.config.evsLevel);
      if (!resumeList.length) {
        this.hasAnyResume.set(false);
        return;
      }
      this.resumeOptions.set(resumeList);
      this.searchResumeSeq.set(resumeList[0].seq ?? null);
      await this.search();
    } catch {
      this.hasAnyResume.set(false);
    }
  }

  protected t(key: string, fallback: string): string {
    return this.i18n.t(`${this.config.i18nPrefix}.${key}`, fallback);
  }

  protected tc(key: string, fallback: string): string {
    return this.i18n.t(key, fallback);
  }

  private scoreField(): 'evsPoint1' | 'evsPoint2' {
    return `evsPoint${this.config.level}` as 'evsPoint1' | 'evsPoint2';
  }

  private gradeField(): 'evsGrade1' | 'evsGrade2' {
    return `evsGrade${this.config.level}` as 'evsGrade1' | 'evsGrade2';
  }

  protected scoreValue(row: AffirmTargetRow): string {
    const edited = row.seq ? this.inputScores().get(row.seq) : undefined;
    if (edited != null) return edited;
    return row[this.scoreField()] ?? '';
  }

  protected gradeForRow(row: AffirmTargetRow): EvsGradeOption | null {
    if (row.seq && this.inputScores().has(row.seq)) {
      return this.calcGradeFromScore(this.scoreValue(row));
    }
    const existing = row[this.gradeField()];
    if (existing) return this.gradeMapByCode().get(existing) ?? null;
    return this.calcGradeFromScore(row[this.scoreField()] ?? '');
  }

  protected calcGradeFromScore(score: string | number | null | undefined): EvsGradeOption | null {
    if (score === '' || score == null) return null;
    const s = Number(score);
    if (isNaN(s)) return null;
    let found: EvsGradeOption | null = null;
    for (const g of this.gradeList()) {
      const maxS = Number(g.endScore);
      const minS = Number(g.startScore);
      if (!isNaN(maxS) && !isNaN(minS) && s >= minS && s <= maxS) found = g;
    }
    return found;
  }

  onScoreInput(row: AffirmTargetRow, value: string | number | null): void {
    if (!row.seq) return;
    const map = new Map(this.inputScores());
    map.set(row.seq, value == null ? '' : String(value));
    this.inputScores.set(map);
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.t('msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.pageIndex.set(1);
    this.inputScores.set(new Map());
    this.quickFilter.set('');
    await this.service.getGradeList(resumeSeq, this.evsType).then((grades) => {
      this.gradeList.set(grades);
      this.distributionVisible.set(true);
    });
    await this.service.getStandardRate(this.config.apiBase, resumeSeq).then((rate) => this.stdRate.set(rate));
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getObjectList(this.config.apiBase, resumeSeq, this.evsType, this.pageIndex(), start, this.pageSize());
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.recordsFiltered.set(resp.data?.length || 0);
      this.rows.set(resp.data || []);
      this.gradeSummary.set(await this.service.getGradeSummary(this.config.apiBase, resumeSeq));
    } catch {
      this.rows.set([]);
      this.recordsTotal.set(0);
      this.recordsFiltered.set(0);
    } finally {
      this.listLoading.set(false);
    }
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadList();
  }

  protected stdCount(gradeKey: string): number {
    const total = this.recordsTotal();
    const pct = Number(this.stdRate()[`${gradeKey}_PCT`]) || 0;
    return total > 0 ? Math.round((total * pct) / 100) : 0;
  }

  protected stdPct(gradeKey: string): number {
    return Number(this.stdRate()[`${gradeKey}_PCT`]) || 0;
  }

  protected curCount(gradeName: string): number {
    const row = this.gradeSummary().find((s) => String(s['EVS_GRADE_NAME'] ?? s['evs_grade_name'] ?? '') === gradeName);
    return row ? Number(row['CNT'] ?? row['cnt'] ?? 0) : 0;
  }

  protected curPct(gradeName: string): number {
    const total = this.recordsTotal();
    if (!total) return 0;
    return Math.round((this.curCount(gradeName) / total) * 1000) / 10;
  }

  protected curNotEntered(): number {
    const total = this.recordsTotal();
    const graded = ['EX', 'VG', 'GD', 'NI', 'UN'].reduce((acc, g) => acc + this.curCount(g), 0);
    return total - graded;
  }

  protected gradeRange(gradeName: string): { max: string; min: string } {
    const g = this.gradeList().find((x) => x.evsGradeName === gradeName);
    return { max: g?.endScore || '-', min: g?.startScore || '-' };
  }

  async saveDraft(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.t('msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.t('msg.confirmSave', 'Bạn có chắc muốn lưu tạm thời?'),
      nzOnOk: async () => {
        this.savingDraft.set(true);
        try {
          const res = await this.service.saveBatch(this.config.apiBase, resumeSeq, this.buildBatchItems());
          if (res.success) {
            this.message.success(this.t('msg.saveSuccess', 'Lưu tạm thời thành công!'));
            await this.loadList();
          } else {
            this.message.error(res.message || this.t('msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.t('msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
        } finally {
          this.savingDraft.set(false);
        }
      },
    });
  }

  async executeAll(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.t('msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.t('msg.confirmExecute', 'Bạn có chắc muốn thực hiện?'),
      nzOnOk: async () => {
        this.executing.set(true);
        try {
          const res = await this.service.execute(this.config.apiBase, resumeSeq, this.buildBatchItems());
          if (res.success) {
            this.message.success(this.t('msg.executeSuccess', 'Thực hiện thành công!'));
            await this.loadList();
          } else {
            this.message.error(res.message || this.t('msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.t('msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
        } finally {
          this.executing.set(false);
        }
      },
    });
  }

  private buildBatchItems(): { seq: string; evsPoint?: string; evsGrade?: string; affirmContent?: string }[] {
    return this.filteredRows()
      .filter((r) => r.seq)
      .map((r) => ({
        seq: r.seq!,
        evsPoint: this.scoreValue(r),
        evsGrade: this.gradeForRow(r)?.evsGrade || '',
        affirmContent: '',
      }));
  }

  // ── Modal chi tiết ──
  async openDetail(row: AffirmTargetRow): Promise<void> {
    if (!row.seq) return;
    this.detail.set(null);
    this.items.set([]);
    this.itemInputScores.set(new Map());
    this.affirmContent.set('');
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    try {
      const info = await this.service.getObjectInfo(this.config.apiBase, row.seq);
      if (!info?.seq) {
        this.detailVisible.set(false);
        return;
      }
      this.detail.set(info);
      this.canInputDetail.set(info.activity === this.config.editableActivity);
      this.affirmContent.set(info[`affirmContent${this.config.level}` as 'affirmContent1' | 'affirmContent2'] || '');
      this.items.set(await this.service.getItemList(this.config.apiBase, row.seq));
    } catch {
      this.detailVisible.set(false);
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  protected period(): string {
    const d = this.detail();
    if (!d) return '';
    return (d.evsStartDate || '') + (d.evsEndDate ? '~' + d.evsEndDate : '');
  }

  protected selfGradeName(): string {
    const d = this.detail();
    if (!d) return '-';
    return this.gradeMapByCode().get(d.evsGrade0 || '')?.evsGradeName || d.evsGrade0 || '-';
  }

  protected readonlyGradeName(): string {
    const d = this.detail();
    if (!d) return '-';
    return this.gradeMapByCode().get(d.evsGrade1 || '')?.evsGradeName || d.evsGrade1 || '-';
  }

  protected itemReadonlyScore(item: AffirmTargetItem): string {
    return (this.config.level === '2' ? item.evsScore1 : undefined) || '-';
  }

  protected itemInputValue(item: AffirmTargetItem): string {
    if (!item.seq) return '';
    const edited = this.itemInputScores().get(item.seq);
    if (edited != null) return edited;
    return (this.config.level === '2' ? item.evsScore2 : item.evsScore1) || '';
  }

  onItemScoreInput(item: AffirmTargetItem, value: string | number | null): void {
    if (!item.seq) return;
    const map = new Map(this.itemInputScores());
    map.set(item.seq, value == null ? '' : String(value));
    this.itemInputScores.set(map);
  }

  private sectionTotals(items: AffirmTargetItem[]): SectionTotals {
    let itemScoreTotal = 0;
    let selfTotal = 0;
    let readonlyTotal = 0;
    let inputTotal = 0;
    let hasInput = false;
    for (const item of items) {
      const itemScore = Number(item.itemScore) || 0;
      itemScoreTotal += itemScore;
      selfTotal += ((Number(item.evsScore) || 0) * itemScore) / 100;
      if (this.config.level === '2') {
        readonlyTotal += ((Number(item.evsScore1) || 0) * itemScore) / 100;
      }
      const inputVal = this.itemInputValue(item);
      if (inputVal !== '') {
        hasInput = true;
        inputTotal += (Number(inputVal) * itemScore) / 100;
      }
    }
    return {
      itemScoreTotal: Math.round(itemScoreTotal * 100) / 100,
      selfTotal: Math.round(selfTotal * 100) / 100,
      readonlyTotal: Math.round(readonlyTotal * 100) / 100,
      inputTotal: Math.round(inputTotal * 100) / 100,
      hasInput,
    };
  }

  private buildItemScoresPayload(): Record<string, string>[] {
    const field = `evsScore${this.config.level}`;
    return this.items()
      .filter((i) => i.seq)
      .map((i) => ({ seq: i.seq!, [field]: this.itemInputValue(i) }));
  }

  saveDetailDraft(): void {
    this.submitDetail('draft');
  }

  submitDetail(mode: 'draft' | 'confirm'): void {
    const evsObjectSeq = this.detail()?.seq;
    if (!evsObjectSeq) return;
    const title = mode === 'confirm' ? this.t('msg.confirmConfirm', 'Bạn có chắc muốn xác nhận?') : this.t('msg.confirmSave', 'Bạn có chắc muốn lưu tạm thời?');
    this.modal.confirm({
      nzTitle: title,
      nzOnOk: async () => {
        this.dmSaving.set(true);
        try {
          const payload = {
            seq: evsObjectSeq,
            evsPoint: this.grandHasInput() ? this.grandInputTotal() : '',
            evsGrade: this.detailGrade()?.evsGrade || '',
            affirmContent: this.affirmContent(),
            itemScores: this.buildItemScoresPayload(),
          };
          const res = mode === 'confirm' ? await this.service.confirmDetail(this.config.apiBase, payload) : await this.service.saveDetail(this.config.apiBase, payload);
          if (res.success) {
            this.message.success(mode === 'confirm' ? this.t('msg.confirmSuccess', 'Xác nhận thành công!') : this.t('msg.saveSuccess', 'Lưu tạm thời thành công!'));
            this.closeDetail();
            await this.loadList();
          } else {
            this.message.error(res.message || this.t('msg.actionFail', 'Lỗi khi thực hiện.'));
          }
        } catch {
          this.message.error(this.t('msg.actionFail', 'Lỗi khi thực hiện.'));
        } finally {
          this.dmSaving.set(false);
        }
      },
    });
  }

  rejectDetail(): void {
    const evsObjectSeq = this.detail()?.seq;
    if (!evsObjectSeq) return;
    this.modal.confirm({
      nzTitle: this.t('msg.confirmReject', 'Bạn có chắc muốn từ chối?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.rejectDetail(this.config.apiBase, evsObjectSeq);
          if (res.success) {
            this.message.success(this.t('msg.rejectSuccess', 'Từ chối thành công!'));
            this.closeDetail();
            await this.loadList();
          } else {
            this.message.error(res.message || this.t('msg.actionFail', 'Lỗi khi thực hiện.'));
          }
        } catch {
          this.message.error(this.t('msg.actionFail', 'Lỗi khi thực hiện.'));
        }
      },
    });
  }
}
