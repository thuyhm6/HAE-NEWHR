import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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
import { PaSalaryDetailPanelComponent } from '../shared/pa-salary-detail-panel/pa-salary-detail-panel.component';
import { PaSalaryDetailItem, PaSalaryEmpRow, PaSalaryResultService } from '../shared/pa-salary-result.service';

type PdmcSortKey = keyof Pick<PaSalaryEmpRow, 'empId' | 'localName' | 'deptName' | 'postFamilyName' | 'postGradeName' | 'positionName'>;
type PdmcNumKey = keyof Pick<PaSalaryEmpRow, 'incomeBeforeTax' | 'withholdTotal' | 'realWages'>;

/**
 * Lương tháng chi tiết (/pa/workManagement/detailmonthCountInfoLeft) - port từ
 * detailmonthCountInfoLeft.jsp + detailYearCountInfoRight.jsp (pFrom=month) của dự án cũ Hanwha_HAE:
 * bên trái là danh sách nhân viên của 1 kỳ lương, bấm 1 dòng để xem chi tiết hạng mục lương bên phải.
 */
@Component({
  selector: 'app-pa-detail-month-count',
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
    PaSalaryDetailPanelComponent,
  ],
  templateUrl: './pa-detail-month-count.component.html',
  styleUrl: './pa-detail-month-count.component.scss',
})
export class PaDetailMonthCountComponent implements OnInit {
  private readonly service = inject(PaSalaryResultService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly searchKey = signal('');
  protected readonly searchPayScheduleNo = signal<string | null>(null);
  protected readonly searchDeptNo = signal<string | null>(null);

  protected readonly loading = signal(false);
  protected readonly rows = signal<PaSalaryEmpRow[]>([]);
  protected readonly selected = signal<PaSalaryEmpRow | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailItems = signal<PaSalaryDetailItem[]>([]);

  private readonly textSorters = new Map<PdmcSortKey, (a: PaSalaryEmpRow, b: PaSalaryEmpRow) => number>();
  private readonly numSorters = new Map<PdmcNumKey, (a: PaSalaryEmpRow, b: PaSalaryEmpRow) => number>();

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

  scheduleLabel(opt: PaPayScheduleRow): string {
    return (opt.payDate ?? '') + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
  }

  textSort(key: PdmcSortKey): (a: PaSalaryEmpRow, b: PaSalaryEmpRow) => number {
    let fn = this.textSorters.get(key);
    if (!fn) {
      fn = (a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''));
      this.textSorters.set(key, fn);
    }
    return fn;
  }

  numSort(key: PdmcNumKey): (a: PaSalaryEmpRow, b: PaSalaryEmpRow) => number {
    let fn = this.numSorters.get(key);
    if (!fn) {
      fn = (a, b) => (Number(a[key]) || 0) - (Number(b[key]) || 0);
      this.numSorters.set(key, fn);
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
    this.selected.set(null);
    this.detailItems.set([]);
    try {
      this.rows.set(await this.service.getMonthEmpList(payScheduleNo, this.searchKey().trim(), this.searchDeptNo()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Bấm 1 dòng -> chi tiết lương tháng bên phải (changeUrlDetail bản gốc) */
  async selectRow(row: PaSalaryEmpRow): Promise<void> {
    if (!row.personId || !row.payScheduleNo) return;
    this.selected.set(row);
    this.detailLoading.set(true);
    try {
      this.detailItems.set(await this.service.getMonthDetail(row.payScheduleNo, row.personId));
    } catch {
      this.detailItems.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected formatNumber(val: number | string | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    return isNaN(num) ? String(val) : Math.round(num).toLocaleString('en-US');
  }
}
