import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { AffirmTargetDetail, AffirmTargetRow, AffirmTargetService, EvsGradeOption, EvsResumeOption } from '../affirm-target/affirm-target.service';
import { AbilityItem, AffirmTargetAbilityService, EvsScoreOption } from './affirm-target-ability.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
export interface AffirmTargetAbilityConfig {
  /** API dùng cho objectList/gradeSummary/standardRate/resume - dùng chung với AffirmTarget. */
  apiBase: 'affirmTarget1' | 'affirmTarget2';
  /** API riêng cho itemList/saveDetail/confirmDetail/rejectDetail (đánh giá năng lực). */
  abilityApiBase: 'affirmTarget1Ability' | 'affirmTarget2Ability';
  i18nPrefix: string;
  level: '1' | '2';
  evsLevel: string;
  editableActivity: string;
}

/**
 * Component dùng chung cho viewAffirmTarget1Ability và
 * viewAffirmTarget2Ability (đánh giá năng lực - điểm chọn từ dropdown
 * EVS_PARAM). Xem ghi chú trong affirm-target-ability.service.ts.
 */
@Component({
  selector: 'app-affirm-target-ability',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTableModule],
  templateUrl: './affirm-target-ability.component.html',
  styleUrl: './affirm-target-ability.component.scss',
})
export class AffirmTargetAbilityComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly listService = inject(AffirmTargetService);
  private readonly service = inject(AffirmTargetAbilityService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected config!: AffirmTargetAbilityConfig;
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

  protected readonly gradeList = signal<EvsGradeOption[]>([]);
  protected readonly gradeMapByCode = computed(() => {
    const map = new Map<string, EvsGradeOption>();
    this.gradeList().forEach((g) => g.evsGrade && map.set(g.evsGrade, g));
    return map;
  });
  protected readonly stdRate = signal<Record<string, unknown>>({});
  protected readonly gradeSummary = signal<Record<string, unknown>[]>([]);
  protected readonly distributionVisible = signal(false);

  protected readonly scoreOptions = signal<EvsScoreOption[]>([]);
  protected readonly maxScore = computed(() => this.scoreOptions().reduce((m, o) => Math.max(m, Number(o.evsScore) || 0), 0));

  protected readonly readonlyLevels = computed<number[]>(() => (this.config.level === '2' ? [0, 1, 2] : [0, 1]));

  protected readonly filteredRows = computed(() => {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(kw)));
  });

  // ── Modal chi tiết ──
  protected readonly detailVisible = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detail = signal<AffirmTargetDetail | null>(null);
  protected readonly items = signal<AbilityItem[]>([]);
  protected readonly canInputDetail = signal(false);
  protected readonly affirmContent = signal('');
  protected readonly dmSaving = signal(false);
  /** itemSeq -> điểm chọn ở cấp đang đánh giá, trong modal chi tiết. */
  protected readonly itemInputScores = signal<Map<string, string>>(new Map());

  protected readonly detailTotals = computed(() => {
    const max = this.maxScore();
    let totalItem = 0;
    let totalSelf = 0;
    let totalInput = 0;
    let hasInput = false;
    for (const item of this.items()) {
      const itemScore = Number(item.itemScore) || 0;
      totalItem += itemScore;
      const selfVal = Number(item.evsScore0);
      if (!isNaN(selfVal) && max > 0) totalSelf += (selfVal * itemScore) / max;
      const inputVal = this.itemScoreValue(item);
      if (inputVal !== '' && max > 0) {
        hasInput = true;
        totalInput += (Number(inputVal) * itemScore) / max;
      }
    }
    return {
      totalItem: Math.round(totalItem * 100) / 100,
      totalSelf: Math.round(totalSelf * 100) / 100,
      totalInput: Math.round(totalInput * 100) / 100,
      hasInput,
    };
  });
  protected readonly detailGrade = computed(() => (this.detailTotals().hasInput ? this.calcGradeFromScore(this.detailTotals().totalInput) : null));

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.config = this.route.snapshot.data['affirmTargetAbilityConfig'] as AffirmTargetAbilityConfig;
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';

    try {
      const resumeList = await this.listService.getResumeOptions(this.evsType, this.config.evsLevel);
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

  protected gradeNameFor(code?: string): string {
    if (!code) return '-';
    return this.gradeMapByCode().get(code)?.evsGradeName || code;
  }

  private calcGradeFromScore(score: string | number | null | undefined): EvsGradeOption | null {
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

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.t('msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.pageIndex.set(1);
    this.quickFilter.set('');
    await this.listService.getGradeList(resumeSeq, this.evsType).then((grades) => {
      this.gradeList.set(grades);
      this.distributionVisible.set(true);
    });
    await this.listService.getStandardRate(this.config.apiBase, resumeSeq).then((rate) => this.stdRate.set(rate));
    this.scoreOptions.set(await this.service.getScoreOptions(resumeSeq));
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.listService.getObjectList(this.config.apiBase, resumeSeq, this.evsType, this.pageIndex(), start, this.pageSize());
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.recordsFiltered.set(resp.data?.length || 0);
      this.rows.set(resp.data || []);
      this.gradeSummary.set(await this.listService.getGradeSummary(this.config.apiBase, resumeSeq));
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

  protected rowScore(row: AffirmTargetRow, level: number): string {
    return (row[`evsPoint${level}` as 'evsPoint0'] as string) || '';
  }

  protected rowGradeName(row: AffirmTargetRow, level: number): string {
    const code = row[`evsGrade${level}` as 'evsGrade0'] as string | undefined;
    return code ? this.gradeMapByCode().get(code)?.evsGradeName || code : '';
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
      const info = await this.listService.getObjectInfo(this.config.apiBase, row.seq);
      if (!info?.seq) {
        this.detailVisible.set(false);
        return;
      }
      this.detail.set(info);
      this.canInputDetail.set(info.activity === this.config.editableActivity);
      this.affirmContent.set(info[`affirmContent${this.config.level}` as 'affirmContent1' | 'affirmContent2'] || '');
      this.items.set(await this.service.getItemList(this.config.abilityApiBase, row.seq));
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

  protected itemReadonlyScore(item: AbilityItem): string {
    return (this.config.level === '2' ? item.evsScore1 : undefined) || '-';
  }

  protected itemScoreValue(item: AbilityItem): string {
    if (!item.itemSeq) return '';
    const edited = this.itemInputScores().get(item.itemSeq);
    if (edited != null) return edited;
    return (this.config.level === '2' ? item.evsScore2 : item.evsScore1) || '';
  }

  onItemScoreChange(item: AbilityItem, value: string | null): void {
    if (!item.itemSeq) return;
    const map = new Map(this.itemInputScores());
    map.set(item.itemSeq, value == null ? '' : value);
    this.itemInputScores.set(map);
  }

  private buildItemsPayload(): { itemSeq: string; [key: string]: string | null }[] {
    const field = `evsScore${this.config.level}`;
    return this.items()
      .filter((i) => i.itemSeq)
      .map((i) => ({ itemSeq: i.itemSeq!, [field]: this.itemScoreValue(i) || null }));
  }

  submitDetail(mode: 'draft' | 'confirm'): void {
    const evsObjectSeq = this.detail()?.seq;
    const resumeSeq = this.searchResumeSeq();
    if (!evsObjectSeq || !resumeSeq) return;
    const title = mode === 'confirm' ? this.t('msg.confirmConfirm', 'Bạn có chắc muốn xác nhận?') : this.t('msg.confirmSave', 'Bạn có chắc muốn lưu tạm thời?');
    this.modal.confirm({
      nzTitle: title,
      nzOnOk: async () => {
        this.dmSaving.set(true);
        try {
          const payload = {
            seq: evsObjectSeq,
            resumeSeq,
            affirmContent: this.affirmContent(),
            items: this.buildItemsPayload(),
          };
          const res =
            mode === 'confirm'
              ? await this.service.confirmDetail(this.config.abilityApiBase, payload)
              : await this.service.saveDetail(this.config.abilityApiBase, payload);
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
          const res = await this.service.rejectDetail(this.config.abilityApiBase, evsObjectSeq);
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
