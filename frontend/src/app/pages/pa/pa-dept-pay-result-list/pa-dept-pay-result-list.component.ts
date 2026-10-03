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
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PA_RESULT_AMOUNT_COLUMNS, formatPaResultCell } from '../shared/pa-result-columns';
import { PaResultRow, PaSalaryResultService } from '../shared/pa-salary-result.service';

/**
 * Tổng hợp lương (phòng ban) - /pa/workManagement/viewDeptPaResultList, port từ
 * viewDeptPaResultList.jsp (nhánh HAE) của dự án cũ Hanwha_HAE: tổng hợp các cột lương theo phòng
 * ban của 1 kỳ lương (kèm số người), có dòng tổng, xuất Excel qua SQL Master 271 giống bản gốc.
 */
@Component({
  selector: 'app-pa-dept-pay-result-list',
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
  templateUrl: './pa-dept-pay-result-list.component.html',
  styleUrl: './pa-dept-pay-result-list.component.scss',
})
export class PaDeptPayResultListComponent implements OnInit {
  /** lengthMenu bản gốc */
  protected readonly pageSizeOptions = [50, 100, 200, 500];
  protected readonly amountColumns = PA_RESULT_AMOUNT_COLUMNS;
  protected readonly formatCell = formatPaResultCell;

  private readonly service = inject(PaSalaryResultService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

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
        this.payScheduleService.getList('', '', null),
        this.deptService.getAuthorizedDepartments(),
      ]);
      this.scheduleOptions.set(schedules);
      if (schedules.length) this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  /** Bản gốc hiển thị "PAY_DATE--SALARY_DISTIN" */
  scheduleLabel(opt: PaPayScheduleRow): string {
    return (opt.payDate ?? '') + (opt.salaryDistinName ? '--' + opt.salaryDistinName : '');
  }

  sortFn(field: string): (a: PaResultRow, b: PaResultRow) => number {
    let fn = this.sorters.get(field);
    if (!fn) {
      fn = (a, b) => {
        const va = a[field];
        const vb = b[field];
        return typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''));
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
      const res = await this.service.getDeptResult(payScheduleNo, this.searchDeptNos());
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
    window.location.href = this.service.buildDeptResultExportUrl(payScheduleNo, this.searchDeptNos(), schedule?.salaryDistinName ?? '');
  }
}
