import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { AbilityItem, AffirmTargetAbilityService } from '../affirm-target-ability/affirm-target-ability.service';
import { AffirmTargetDetail, AffirmTargetItem, AffirmTargetService } from '../affirm-target/affirm-target.service';
import { EvsAffirmorSetupService } from '../evs-affirmor-setup/evs-affirmor-setup.service';
import {
  EvsGradeOption,
  EvsResultRow,
  EvsResultService,
  EvsResumeOption,
  SyCodeOption,
} from './evs-result.service';

const GRADE_KEYS = ['EX', 'VG', 'GD', 'NI', 'UN'];

interface DistRow {
  total: number;
  ex: number;
  vg: number;
  gd: number;
  ni: number;
  un: number;
}

/**
 * Kết quả đánh giá (viewEvsResult) - trang tổng hợp lớn nhất module evs.
 * 2 modal xem chi tiết (performance/ability, chỉ đọc - không có nút Lưu/Xác
 * nhận/Từ chối vì đây là màn hình xem kết quả) dùng lại đúng
 * AffirmTargetService (objectInfo/itemList cho performance, objectInfo dùng
 * chung cho cả 2) và AffirmTargetAbilityService (itemList cho ability) đã
 * xây ở viewAffirmTarget2/viewAffirmTarget2Ability - tránh viết lại ~800
 * dòng logic render chi tiết trùng lặp. Bộ lọc phòng ban dùng lại
 * EvsAffirmorSetupService.getAuthorizedDepartments/buildDeptTree, tìm nhân
 * viên dùng lại EmpSearchService dùng chung của module hrm/empinfo.
 */
@Component({
  selector: 'app-evs-result',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './evs-result.component.html',
  styleUrl: './evs-result.component.scss',
})
export class EvsResultComponent implements OnInit {
  private readonly service = inject(EvsResultService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly empService = inject(EmpSearchService);
  private readonly affirmTargetService = inject(AffirmTargetService);
  private readonly affirmAbilityService = inject(AffirmTargetAbilityService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected evsType = '';

  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchDeptNos = signal<string[]>([]);
  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly searchPersonId = signal<string | null>(null);
  protected readonly statusOptions = signal<SyCodeOption[]>([]);
  protected readonly searchStatus = signal<string | null>(null);
  protected readonly gradeOptions = signal<EvsGradeOption[]>([]);

  protected readonly rows = signal<EvsResultRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly quickFilter = signal('');
  protected readonly stdRate = signal<Record<string, unknown>>({});

  protected readonly ticked = signal<Set<string>>(new Set());
  private readonly editedGrade = new Map<string, string>();
  private readonly editedContent = new Map<string, string>();
  /** Chỉ dùng để ép template re-render sau khi sửa Map (không tự động qua signal). */
  protected readonly editVersion = signal(0);

  protected readonly evaluatingEnd = signal(false);
  protected readonly changingStatus = signal(false);
  protected readonly copyingGrade = signal(false);
  protected readonly saving = signal(false);

  protected readonly filteredRows = computed(() => {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.localName, r.empid, r.deptname, r.postGradeName, r.activityName, r.localName1, r.localName2, r.finalAffirmContent]
        .some((v) => String(v ?? '').toLowerCase().includes(kw)),
    );
  });

  protected readonly totalCount = computed(() => this.filteredRows().length);

  protected readonly standardDist = computed<DistRow>(() => this.rows().reduce(
    (acc, r) => {
      if (r.finalGrade) { acc.total++; this.bump(acc, r.finalGrade); }
      return acc;
    },
    this.emptyDist(),
  ));
  protected readonly l2Dist = computed<DistRow>(() => this.rows().reduce(
    (acc, r) => { if (r.evsGrade2) { acc.total++; this.bump(acc, r.evsGrade2); } return acc; },
    this.emptyDist(),
  ));
  protected readonly l1Dist = computed<DistRow>(() => this.rows().reduce(
    (acc, r) => { if (r.evsGrade1) { acc.total++; this.bump(acc, r.evsGrade1); } return acc; },
    this.emptyDist(),
  ));

  protected readonly progress = computed(() => {
    const all = this.rows();
    let self = 0, l1 = 0, l2 = 0, done = 0, end = 0;
    for (const r of all) {
      if (r.affirmFlagName0 === 'Evaluated') self++;
      const hasL1 = !!r.evsPoint1 && !!r.evsGrade1;
      const hasL2 = !!r.evsPoint2 && !!r.evsGrade2;
      if (hasL1) l1++;
      if (hasL2) l2++;
      if (hasL1 && hasL2) done++;
      if (r.finalGrade) end++;
    }
    return { total: all.length, self, l1, l2, done, end };
  });

  // ── Modal chi tiết (chỉ đọc) ──
  protected readonly detailVisible = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detail = signal<AffirmTargetDetail | null>(null);
  protected readonly perfItems = signal<AffirmTargetItem[]>([]);
  protected readonly abilityItems = signal<AbilityItem[]>([]);

  protected readonly strategicItems = computed(() => this.perfItems().filter((i) => String(i.itemType) === '1'));
  protected readonly operationItems = computed(() => this.perfItems().filter((i) => String(i.itemType) !== '1'));

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const [resumeList, deptList, statusOptions, gradeOptions] = await Promise.all([
        this.service.getResumeOptions(this.evsType),
        this.deptService.getAuthorizedDepartments(),
        this.service.getStatusOptions(),
        this.service.getGradeOptions(),
      ]);
      this.resumeOptions.set(resumeList);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptList) as NzTreeNodeOptions[]);
      this.statusOptions.set(statusOptions);
      this.gradeOptions.set(gradeOptions);
      if (resumeList.length) {
        this.searchResumeSeq.set(resumeList[0].seq ?? null);
        await this.search();
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  private emptyDist(): DistRow {
    return { total: 0, ex: 0, vg: 0, gd: 0, ni: 0, un: 0 };
  }

  private bump(acc: DistRow, grade: string): void {
    const key = grade.toLowerCase() as 'ex' | 'vg' | 'gd' | 'ni' | 'un';
    if (key in acc) (acc as unknown as Record<string, number>)[key]++;
  }

  protected distCount(dist: DistRow, gradeKey: string): number {
    return (dist as unknown as Record<string, number>)[gradeKey.toLowerCase()] || 0;
  }

  protected distPct(dist: DistRow, gradeKey: string): number {
    if (!dist.total) return 0;
    return Math.round((this.distCount(dist, gradeKey) / dist.total) * 1000) / 10;
  }

  protected stdCount(gradeKey: string): number {
    const total = this.rows().length;
    const pct = Number(this.stdRate()[`${gradeKey}_PCT`]) || 0;
    return total > 0 ? Math.round((total * pct) / 100) : 0;
  }

  protected stdPct(gradeKey: string): number {
    return Number(this.stdRate()[`${gradeKey}_PCT`]) || 0;
  }

  async onEmployeeSearch(keyword: string): Promise<void> {
    const kw = keyword.trim();
    if (!kw) {
      this.employeeOptions.set([]);
      return;
    }
    try {
      this.employeeOptions.set(await this.empService.searchEmployees(kw));
    } catch {
      this.employeeOptions.set([]);
    }
  }

  onEmployeeChange(personId: string | null): void {
    this.searchPersonId.set(personId);
    this.search();
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.result.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.ticked.set(new Set());
    this.editedGrade.clear();
    this.editedContent.clear();
    this.loading.set(true);
    try {
      this.rows.set(
        await this.service.getList({
          resumeSeq,
          deptNos: this.searchDeptNos().join(','),
          personId: this.searchPersonId() ?? '',
          statusFilter: this.searchStatus() ?? '',
          evsType: this.evsType,
        }),
      );
      this.stdRate.set(await this.service.getStdRate(resumeSeq));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  protected gradeValue(row: EvsResultRow): string {
    if (!row.seq) return row.finalGrade ?? '';
    return this.editedGrade.get(row.seq) ?? row.finalGrade ?? '';
  }

  protected contentValue(row: EvsResultRow): string {
    if (!row.seq) return row.finalAffirmContent ?? '';
    return this.editedContent.get(row.seq) ?? row.finalAffirmContent ?? '';
  }

  onGradeChange(row: EvsResultRow, value: string | null): void {
    if (!row.seq) return;
    this.editedGrade.set(row.seq, value ?? '');
    this.editVersion.update((v) => v + 1);
    this.tickRow(row.seq, true);
  }

  onContentChange(row: EvsResultRow, value: string): void {
    if (!row.seq) return;
    this.editedContent.set(row.seq, value);
    this.editVersion.update((v) => v + 1);
    this.tickRow(row.seq, true);
  }

  isTicked(seq?: string): boolean {
    return !!seq && this.ticked().has(seq);
  }

  tickRow(seq: string, checked: boolean): void {
    const set = new Set(this.ticked());
    if (checked) set.add(seq);
    else set.delete(seq);
    this.ticked.set(set);
  }

  toggleAll(checked: boolean): void {
    this.ticked.set(checked ? new Set(this.filteredRows().map((r) => r.seq!).filter(Boolean)) : new Set());
  }

  protected gradeClass(grade?: string): string {
    return grade ? `ver-grade-${grade}` : '';
  }

  // ── Hành động ──
  async evaluateEnd(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.result.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('evs.result.msg.confirmEvaluateEnd', 'Bạn có chắc muốn kết thúc đánh giá cho đợt này không?'),
      nzOnOk: async () => {
        this.evaluatingEnd.set(true);
        try {
          const res = await this.service.evaluateEnd(resumeSeq);
          if (res.success) {
            this.message.success(this.i18n.t('evs.result.msg.evaluateEndSuccess', 'Kết thúc đánh giá thành công!'));
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
        } finally {
          this.evaluatingEnd.set(false);
        }
      },
    });
  }

  async changeStatus(): Promise<void> {
    if (!this.ticked().size) {
      this.message.warning(this.i18n.t('evs.result.msg.noRowSelected', 'Chưa chọn dòng nào.'));
      return;
    }
    const status = this.searchStatus();
    if (!status) {
      this.message.warning(this.i18n.t('evs.result.msg.selectStatus', 'Vui lòng chọn trạng thái.'));
      return;
    }
    this.changingStatus.set(true);
    try {
      const res = await this.service.changeStatus(Array.from(this.ticked()), status);
      if (res.success) {
        this.message.success(this.i18n.t('evs.result.msg.changeStatusSuccess', 'Thay đổi trạng thái thành công!'));
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
      }
    } catch {
      this.message.error(this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
    } finally {
      this.changingStatus.set(false);
    }
  }

  copyGrade(): void {
    if (!this.ticked().size) {
      this.message.warning(this.i18n.t('evs.result.msg.noRowSelected', 'Chưa chọn dòng nào.'));
      return;
    }
    const resumeSeq = this.searchResumeSeq();
    this.modal.confirm({
      nzTitle: this.i18n.t('evs.result.msg.confirmCopyGrade', 'Sao chép cấp đánh giá cho các dòng đã chọn?'),
      nzOnOk: async () => {
        this.copyingGrade.set(true);
        try {
          const res = await this.service.copyGrade(resumeSeq ?? '', Array.from(this.ticked()));
          if (res.success) {
            this.message.success(this.i18n.t('evs.result.msg.copyGradeSuccess', 'Sao chép thành công!'));
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
        } finally {
          this.copyingGrade.set(false);
        }
      },
    });
  }

  async save(): Promise<void> {
    if (!this.ticked().size) {
      this.message.warning(this.i18n.t('evs.result.msg.noRowToSave', 'Chưa chọn dòng nào để lưu.'));
      return;
    }
    const items = Array.from(this.ticked()).map((seq) => ({
      seq,
      finalGrade: this.editedGrade.get(seq) ?? this.rows().find((r) => r.seq === seq)?.finalGrade ?? '',
      finalAffirmContent: this.editedContent.get(seq) ?? this.rows().find((r) => r.seq === seq)?.finalAffirmContent ?? '',
    }));
    this.saving.set(true);
    try {
      const res = await this.service.save(items);
      if (res.success) {
        this.message.success(this.i18n.t('evs.result.msg.saveSuccess', 'Lưu thành công!'));
        this.ticked.set(new Set());
        this.editedGrade.clear();
        this.editedContent.clear();
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
      }
    } catch {
      this.message.error(this.i18n.t('evs.result.msg.actionFail', 'Lỗi khi gọi API. Vui lòng thử lại.'));
    } finally {
      this.saving.set(false);
    }
  }

  featureInProgress(): void {
    this.message.info(this.i18n.t('evs.result.msg.featureInProgress', 'Chức năng này đang được phát triển.'));
  }

  exportExcel(): void {
    const rows = this.filteredRows();
    const header = [
      'No', 'Họ tên', 'Mã NV', 'Phòng ban', 'Chức vụ', 'Ngày vào làm', 'Trạng thái',
      'Bản thân - Trạng thái', 'Bản thân - Điểm', 'Bản thân - Cấp',
      'ĐG1 - Họ tên', 'ĐG1 - Chức vụ', 'ĐG1 - Trạng thái', 'ĐG1 - Điểm', 'ĐG1 - Cấp',
      'ĐG2 - Họ tên', 'ĐG2 - Chức vụ', 'ĐG2 - Trạng thái', 'ĐG2 - Điểm', 'ĐG2 - Cấp',
      'Cấp đánh giá (nhân sự)', 'Ý kiến', 'Người thay đổi',
    ];
    const data = rows.map((r, idx) => [
      idx + 1, r.localName ?? '', r.empid ?? '', r.deptname ?? '', r.postGradeName ?? '', r.dateStarted ?? '', r.activityName ?? '',
      r.affirmFlagName0 ?? '', r.evsPoint0 ?? '', r.evsGrade0 ?? '',
      r.localName1 ?? '', r.postGradeName1 ?? '', r.affirmFlagName1 ?? '', r.evsPoint1 ?? '', r.evsGrade1 ?? '',
      r.localName2 ?? '', r.postGradeName2 ?? '', r.affirmFlagName2 ?? '', r.evsPoint2 ?? '', r.evsGrade2 ?? '',
      this.gradeValue(r), this.contentValue(r), `${r.updatedBy ?? ''} ${r.updateDate ?? ''}`.trim(),
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'evs_result.xlsx');
  }

  // ── Modal chi tiết (chỉ đọc) ──
  async openDetail(row: EvsResultRow): Promise<void> {
    if (!row.seq) return;
    this.detail.set(null);
    this.perfItems.set([]);
    this.abilityItems.set([]);
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    try {
      const info = await this.affirmTargetService.getObjectInfo('affirmTarget2', row.seq);
      this.detail.set(info);
      if (this.evsType === 'ability') {
        this.abilityItems.set(await this.affirmAbilityService.getItemList('affirmTarget2Ability', row.seq));
      } else {
        this.perfItems.set(await this.affirmTargetService.getItemList('affirmTarget2', row.seq));
      }
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

  protected sectionItemScoreTotal(items: AffirmTargetItem[]): number {
    return Math.round(items.reduce((acc, i) => acc + (Number(i.itemScore) || 0), 0) * 100) / 100;
  }

  protected abilityTotalItemScore(): number {
    return Math.round(this.abilityItems().reduce((acc, i) => acc + (Number(i.itemScore) || 0), 0) * 100) / 100;
  }
}
