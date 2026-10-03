import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableFilterList, NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { PaWorkFlowService } from '../pa-work-flow/pa-work-flow.service';
import {
  PaArSummaryItemOption,
  PaArSummaryManageService,
  PaArSummaryRow,
  PaArSummaryScheduleOption,
  PaArSummarySearchParams,
} from './pa-ar-summary-manage.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
type SortableKey = keyof Pick<
  PaArSummaryRow,
  'empId' | 'localName' | 'deptName' | 'postGrade' | 'itemName' | 'remark' | 'updatedBy'
>;

/** DD/MM/YYYY [HH24:MI] -> YYYYMMDD[HHMI] để so sánh khi sắp xếp. */
function dateSortKey(v?: string): string {
  if (!v) return '';
  const [d, t] = v.split(' ');
  const [dd, mm, yyyy] = d.split('/');
  return `${yyyy ?? ''}${mm ?? ''}${dd ?? ''}${(t ?? '').replace(':', '')}`;
}

function toNumber(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

/**
 * Quản lý tổng hợp chấm công (viewPaArSummaryForManageList) - port từ JSP cũ (DWZ + dataTables):
 *  - Tìm kiếm theo NV / kế hoạch trả lương / hạng mục / phòng ban / ngoại lệ (bắt buộc chọn ít nhất
 *    NV, hạng mục, phòng ban hoặc ngoại lệ để tránh truy vấn quá nhiều dữ liệu - giống bản gốc).
 *  - Sửa trực tiếp "Giá trị ngoại lệ" và "Ghi chú" trên bảng, sửa dòng nào tự tick dòng đó.
 *  - "Xem đã chọn" / "Xem tất cả" thay cho bộ lọc cột ẩn @willBeCommit@ của dataTables.
 *  - Lọc theo cột Phòng ban / Chức vụ / Hạng mục thay cho dropdown lọc trên header của dataTables.
 *  - Nút "Tổng hợp chấm công" dùng lại API quy trình tính lương (type=arMonthCal).
 */
@Component({
  selector: 'app-pa-ar-summary-manage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzSpinModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './pa-ar-summary-manage.component.html',
  styleUrl: './pa-ar-summary-manage.component.scss',
})
export class PaArSummaryManageComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(PaArSummaryManageService);
  private readonly workFlowService = inject(PaWorkFlowService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly empService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaArSummaryScheduleOption[]>([]);
  protected readonly itemOptions = signal<PaArSummaryItemOption[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly searchKey = signal('');
  protected readonly searchEmpInfo = signal('');
  protected readonly searchPayScheduleNo = signal<string | null>(null);
  protected readonly searchItemNos = signal<string[]>([]);
  protected readonly searchDeptNo = signal<string | null>(null);
  protected readonly searchIsSpecialFlag = signal('');

  protected readonly empPickerVisible = signal(false);
  protected readonly empOptions = signal<EmployeeSearchResult[]>([]);

  protected readonly rows = signal<PaArSummaryRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly calculating = signal(false);
  protected readonly checkedIds = signal<Set<number>>(new Set());
  protected readonly onlyChecked = signal(false);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);

  protected readonly displayRows = computed(() => {
    const all = this.rows();
    if (!this.onlyChecked()) return all;
    const ids = this.checkedIds();
    return all.filter((r) => r.arSummaryManageNo != null && ids.has(r.arSummaryManageNo));
  });

  protected readonly allChecked = computed(() => {
    const list = this.displayRows();
    const ids = this.checkedIds();
    return list.length > 0 && list.every((r) => r.arSummaryManageNo != null && ids.has(r.arSummaryManageNo));
  });

  protected readonly deptFilters = computed(() => this.buildFilters((r) => r.deptName));
  protected readonly postGradeFilters = computed(() => this.buildFilters((r) => r.postGrade));
  protected readonly itemFilters = computed(() => this.buildFilters((r) => r.itemName));

  readonly deptFilterFn = (list: string[], row: PaArSummaryRow): boolean => list.some((v) => (row.deptName ?? '') === v);
  readonly postGradeFilterFn = (list: string[], row: PaArSummaryRow): boolean => list.some((v) => (row.postGrade ?? '') === v);
  readonly itemFilterFn = (list: string[], row: PaArSummaryRow): boolean => list.some((v) => (row.itemName ?? '') === v);

  readonly sortDateStarted = (a: PaArSummaryRow, b: PaArSummaryRow): number =>
    dateSortKey(a.dateStarted).localeCompare(dateSortKey(b.dateStarted));
  readonly sortArStartDate = (a: PaArSummaryRow, b: PaArSummaryRow): number =>
    dateSortKey(a.arStartDate).localeCompare(dateSortKey(b.arStartDate));
  readonly sortUpdateDate = (a: PaArSummaryRow, b: PaArSummaryRow): number =>
    dateSortKey(a.updateDate).localeCompare(dateSortKey(b.updateDate));
  readonly sortCalValue = (a: PaArSummaryRow, b: PaArSummaryRow): number =>
    (toNumber(a.calValue) ?? -Infinity) - (toNumber(b.calValue) ?? -Infinity);
  readonly sortFinalValue = (a: PaArSummaryRow, b: PaArSummaryRow): number =>
    (toNumber(a.finalValue) ?? -Infinity) - (toNumber(b.finalValue) ?? -Infinity);
  private readonly textSorters = new Map<SortableKey, (a: PaArSummaryRow, b: PaArSummaryRow) => number>();

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [schedules, items, deptFlat] = await Promise.all([
        this.service.getScheduleList(),
        this.service.getItemList(),
        this.service.getAuthorizedDepartments(),
      ]);
      this.scheduleOptions.set(schedules);
      this.itemOptions.set(items);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
      if (schedules.length) {
        this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  scheduleLabel(opt: PaArSummaryScheduleOption): string {
    return (opt.payDate ?? '') + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
  }

  textSort(key: SortableKey): (a: PaArSummaryRow, b: PaArSummaryRow) => number {
    let fn = this.textSorters.get(key);
    if (!fn) {
      fn = (a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''));
      this.textSorters.set(key, fn);
    }
    return fn;
  }

  private buildFilters(pick: (r: PaArSummaryRow) => string | undefined): NzTableFilterList {
    const values = Array.from(new Set(this.rows().map((r) => pick(r) ?? ''))).sort();
    return values.map((v) => ({ text: v, value: v }));
  }

  private selectedSchedule(): PaArSummaryScheduleOption | undefined {
    const no = this.searchPayScheduleNo();
    return this.scheduleOptions().find((s) => s.payScheduleNo === no);
  }

  private buildSearchParams(): PaArSummarySearchParams {
    return {
      payScheduleNo: this.searchPayScheduleNo() ?? '',
      key: this.searchKey().trim(),
      deptNo: this.searchDeptNo(),
      itemNos: this.searchItemNos(),
      isSpecialFlag: this.searchIsSpecialFlag(),
    };
  }

  // ── Tra cứu nhân viên (thay cho popup viewEmpForPopList) ───────────────────

  async lookupEmployee(): Promise<void> {
    const kw = this.searchKey().trim();
    if (!kw) {
      this.searchEmpInfo.set('');
      return;
    }
    try {
      const results = await this.empService.searchEmployees(kw);
      if (!results.length) {
        this.searchEmpInfo.set('');
        this.message.warning(this.i18n.t('esscal.msg.empNotFound', 'Không tìm thấy thông tin nhân viên.'));
      } else if (results.length === 1) {
        this.selectEmployee(results[0]);
      } else {
        this.empOptions.set(results);
        this.empPickerVisible.set(true);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  selectEmployee(emp: EmployeeSearchResult): void {
    this.empPickerVisible.set(false);
    this.searchKey.set(emp.empId ?? '');
    this.searchEmpInfo.set([emp.empId, emp.localName, emp.deptName].filter((v) => !!v).join(' '));
  }

  clearItems(): void {
    this.searchItemNos.set([]);
  }

  // ── Tìm kiếm ──────────────────────────────────────────────────────────────

  async search(): Promise<void> {
    if (!this.searchPayScheduleNo()) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    // Tránh truy vấn quá nhiều dữ liệu: bắt buộc chọn NV / hạng mục / phòng ban / ngoại lệ (giống bản gốc)
    if (!this.searchKey().trim() && !this.searchDeptNo() && !this.searchItemNos().length && !this.searchIsSpecialFlag()) {
      this.message.warning(
        this.i18n.t('ar.viewPaArSummaryForManageList.QINGXUANZERENYUANXIANGMUBUMEN.b', 'Xin chọn nhân viên, hạng mục hoặc phòng ban'),
      );
      return;
    }
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.service.getList(this.buildSearchParams());
      this.rows.set(list);
      this.checkedIds.set(new Set());
      this.onlyChecked.set(false);
      this.pageIndex.set(1);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  // ── Chọn dòng ─────────────────────────────────────────────────────────────

  isChecked(row: PaArSummaryRow): boolean {
    return row.arSummaryManageNo != null && this.checkedIds().has(row.arSummaryManageNo);
  }

  toggleChecked(row: PaArSummaryRow, checked: boolean): void {
    if (row.arSummaryManageNo == null) return;
    const set = new Set(this.checkedIds());
    if (checked) set.add(row.arSummaryManageNo);
    else set.delete(row.arSummaryManageNo);
    this.checkedIds.set(set);
  }

  /** Chọn tất cả: áp dụng cho mọi dòng (mọi trang) - giống bản gốc. */
  toggleAll(checked: boolean): void {
    const set = new Set(this.checkedIds());
    for (const r of this.displayRows()) {
      if (r.arSummaryManageNo == null) continue;
      if (checked) set.add(r.arSummaryManageNo);
      else set.delete(r.arSummaryManageNo);
    }
    this.checkedIds.set(set);
  }

  /** Sửa giá trị ngoại lệ / ghi chú thì tự động tick dòng đó. */
  onRowEdited(row: PaArSummaryRow): void {
    this.toggleChecked(row, true);
  }

  viewChecked(): void {
    this.onlyChecked.set(true);
    this.pageIndex.set(1);
  }

  viewAll(): void {
    this.onlyChecked.set(false);
    this.pageIndex.set(1);
  }

  // ── Lưu ───────────────────────────────────────────────────────────────────

  save(): void {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.viewChecked();
    const selected = this.displayRows();
    if (!selected.length) {
      this.message.error(this.i18n.t('ar.viewPaArSummaryForManageList.QINGXUANZEBAOCUNSHUJU.b', 'Xin chọn dữ liệu cần lưu'));
      return;
    }
    const schedule = this.selectedSchedule();
    if (schedule?.paConfirmFlag === 1) {
      this.message.warning(
        this.scheduleLabel(schedule) + ' ' + this.i18n.t('pa.arSummaryManage.msgConfirmedCannotEdit', 'Lương đã xác nhận, không thể sửa!'),
      );
      return;
    }
    const items: PaArSummaryRow[] = [];
    for (const r of selected) {
      const raw = r.finalValue == null ? '' : String(r.finalValue).trim();
      const num = toNumber(raw);
      if (raw !== '' && (num == null || num < -9999)) {
        this.message.warning(
          `${r.empId} - ${r.itemName}: ${this.i18n.t('pa.arSummaryManage.msgInvalidValue', 'Giá trị ngoại lệ không hợp lệ (số, tối thiểu -9999)!')}`,
        );
        return;
      }
      items.push({ arSummaryManageNo: r.arSummaryManageNo, finalValue: num, remark: r.remark ?? '' });
    }

    this.modal.confirm({
      nzTitle: this.i18n.t('ess.message.confirm_sava', 'Đồng ý lưu không?'),
      nzOnOk: async () => {
        this.saving.set(true);
        try {
          const res = await this.service.save(payScheduleNo, items);
          this.message.success(res.message || this.i18n.t('alert.message.update_success', 'Sửa thành công!'));
          await this.loadList();
        } catch (err: unknown) {
          const e = err as { error?: { error?: string } };
          this.message.error(e?.error?.error || this.i18n.t('alert.message.update_fail', 'Sửa thất bại!'));
        } finally {
          this.saving.set(false);
        }
      },
    });
  }

  // ── Tổng hợp chấm công ────────────────────────────────────────────────────

  arMonthCal(): void {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    const schedule = this.selectedSchedule();
    if (schedule?.paConfirmFlag === 1) {
      this.message.warning(
        this.scheduleLabel(schedule) +
          ' ' +
          this.i18n.t('ar.viewPaArSummaryForManageList.GONGZIYIQUERENBUNENGJISUAN.b', 'Lương đã xác nhận, không thể tính!'),
      );
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('org.title.IS_SELECT_EXECUTE', 'Đồng ý thực hiện không?'),
      nzOnOk: async () => {
        this.calculating.set(true);
        try {
          const res = await this.workFlowService.execute(payScheduleNo, 'arMonthCal');
          this.message.success(res.message || this.i18n.t('pa.workFlow.msgExecuteSuccess', 'Thực hiện thành công'));
          if (this.rows().length) await this.loadList();
        } catch (err: unknown) {
          const e = err as { error?: { error?: string } };
          this.message.error(e?.error?.error || this.i18n.t('common.error', 'Lỗi'));
        } finally {
          this.calculating.set(false);
        }
      },
    });
  }

  // ── Xuất Excel ────────────────────────────────────────────────────────────

  exportExcel(): void {
    const p = this.buildSearchParams();
    if (!p.payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    window.location.href = this.service.buildExportUrl(p.payScheduleNo, p.key, p.deptNo);
  }

  exportException(): void {
    const p = this.buildSearchParams();
    if (!p.payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    window.location.href = this.service.buildExceptionExportUrl(p);
  }
}
