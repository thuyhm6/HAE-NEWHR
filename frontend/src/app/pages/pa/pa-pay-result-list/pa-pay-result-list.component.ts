import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaArSummaryManageService, PaArSummaryScheduleOption } from '../pa-ar-summary-manage/pa-ar-summary-manage.service';
import { PA_RESULT_AMOUNT_COLUMNS, PaResultColumn, formatPaResultCell } from '../shared/pa-result-columns';
import { PaResultRow, PaSalaryResultService } from '../shared/pa-salary-result.service';

/** Cột thông tin nhân viên (9 cột đầu cố định bên trái ở bản gốc - fixedColumns.leftColumns = 9) */
const PPRL_INFO_COLUMNS: PaResultColumn[] = [
  { field: 'EMPID', key: 'ess.infoApply.EMP_ID', fallback: 'Mã nhân viên' },
  { field: 'LOCAL_NAME', key: 'ess.infoApply.NAME', fallback: 'Họ tên' },
  { field: 'DEPT_NAME', key: 'ess.infoApply.DEPT', fallback: 'Phòng ban' },
  { field: 'POST_FAMILY_NAME', key: 'hrm.empinfo.POST_FAMILY', fallback: 'Nhóm nhân viên' },
  { field: 'POST_GRADE_NAME', key: 'hrm.contract.Rank', fallback: 'Chức vụ' },
  { field: 'POSITION_NAME', key: 'ess.trans.title.dutyName', fallback: 'Chức danh' },
  { field: 'DATE_STARTED', key: 'ess.empInfo.date_of_agency', fallback: 'Ngày vào làm' },
  { field: 'DATE_LEFT', key: 'ess.trans.title.resignDate', fallback: 'Ngày thôi việc' },
];

/** DD/MM/YYYY -> YYYYMMDD để sắp xếp */
function pprlSortValue(field: string, v: unknown): string | number {
  if (v === null || v === undefined || v === '') return '';
  if (field === 'DATE_STARTED' || field === 'DATE_LEFT') {
    const [dd, mm, yyyy] = String(v).split('/');
    return `${yyyy ?? ''}${mm ?? ''}${dd ?? ''}`;
  }
  return typeof v === 'number' ? v : String(v);
}

/**
 * Tổng hợp lương (cá nhân) - /pa/workManagement/viewPaResultList, port từ viewPaResultList.jsp
 * (nhánh HAE) của dự án cũ Hanwha_HAE: tra cứu theo kế hoạch trả lương / mã NV - họ tên / nhiều phòng
 * ban, bảng hơn 120 cột có dòng tổng, sắp xếp + lọc nhanh + phân trang 50/100/200/500 thay cho
 * dataTables, xuất Excel qua SQL Master 270 giống bản gốc.
 */
@Component({
  selector: 'app-pa-pay-result-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './pa-pay-result-list.component.html',
  styleUrl: './pa-pay-result-list.component.scss',
})
export class PaPayResultListComponent implements OnInit {
  /** lengthMenu bản gốc */
  protected readonly pageSizeOptions = [50, 100, 200, 500];
  protected readonly infoColumns = PPRL_INFO_COLUMNS;
  protected readonly amountColumns = PA_RESULT_AMOUNT_COLUMNS;
  protected readonly formatCell = formatPaResultCell;

  private readonly service = inject(PaSalaryResultService);
  private readonly scheduleService = inject(PaArSummaryManageService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaArSummaryScheduleOption[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly searchKey = signal('');
  protected readonly searchPayScheduleNo = signal<string | null>(null);
  protected readonly searchDeptNos = signal<string[]>([]);
  protected readonly quickFilter = signal('');

  protected readonly loading = signal(false);
  protected readonly rows = signal<PaResultRow[]>([]);
  protected readonly sum = signal<PaResultRow | null>(null);
  protected readonly selectedRows = signal<Set<PaResultRow>>(new Set());
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);

  /** Lọc nhanh trên mọi cột (searching của dataTables bản gốc) */
  protected readonly displayRows = computed(() => {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) => Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(kw)));
  });

  private readonly sorters = new Map<string, (a: PaResultRow, b: PaResultRow) => number>();

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [schedules, deptFlat] = await Promise.all([
        this.scheduleService.getScheduleList(),
        this.deptService.getAuthorizedDepartments(),
      ]);
      this.scheduleOptions.set(schedules);
      if (schedules.length) this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  scheduleLabel(opt: PaArSummaryScheduleOption): string {
    return (opt.payDate ?? '') + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
  }

  sortFn(field: string): (a: PaResultRow, b: PaResultRow) => number {
    let fn = this.sorters.get(field);
    if (!fn) {
      fn = (a, b) => {
        const va = pprlSortValue(field, a[field]);
        const vb = pprlSortValue(field, b[field]);
        return typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      };
      this.sorters.set(field, fn);
    }
    return fn;
  }

  async search(): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.loading.set(true);
    try {
      const res = await this.service.getPersonResult(payScheduleNo, this.searchKey().trim(), this.searchDeptNos());
      this.rows.set(res.list ?? []);
      this.sum.set(res.sum ?? null);
      this.selectedRows.set(new Set());
      this.pageIndex.set(1);
    } catch {
      this.rows.set([]);
      this.sum.set(null);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Bấm dòng để đánh dấu / bỏ đánh dấu (toggleClass('selected') bản gốc) */
  toggleRow(row: PaResultRow): void {
    const next = new Set(this.selectedRows());
    if (next.has(row)) next.delete(row);
    else next.add(row);
    this.selectedRows.set(next);
  }

  exportExcel(): void {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    const schedule = this.scheduleOptions().find((s) => s.payScheduleNo === payScheduleNo);
    window.location.href = this.service.buildPersonResultExportUrl(
      payScheduleNo,
      this.searchKey().trim(),
      this.searchDeptNos(),
      schedule?.salaryDistinName ?? '',
    );
  }
}
