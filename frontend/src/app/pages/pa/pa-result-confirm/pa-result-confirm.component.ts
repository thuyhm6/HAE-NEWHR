import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexTitleSubtitle, ApexXAxis, ApexYAxis, NgApexchartsModule } from 'ng-apexcharts';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaPayScheduleRow, PaPayScheduleService, SyCodeOption } from '../pa-pay-schedule/pa-pay-schedule.service';
import {
  PaArDetailRow,
  PaResultConfirmSummary,
  PaSalaryCheckAmountRow,
  PaSalaryCheckEmpRow,
  PaSalaryCheckService,
  paDisplayDate,
  paFormatNumber,
  paPayDatesOf,
} from '../shared/pa-salary-check.service';
import { PrcItemDifComponent } from './prc-item-dif/prc-item-dif.component';

/** Thứ tự tab giống bản gốc: 1 biến động, 2 đối chiếu hạng mục chi trả, 3 tăng ca, 4 đối chiếu BH, 5 chi tiết BH, 6 thuế */
type PrcTab = 'summary' | 'payItem' | 'overtime' | 'insItem' | 'insDetail' | 'tax';
const PRC_TABS: PrcTab[] = ['summary', 'payItem', 'overtime', 'insItem', 'insDetail', 'tax'];

interface PrcChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
}

interface PrcQuery {
  salaryDistinNo: string;
  payDate: string;
  payDatePro: string;
  deptNo: string | null;
}

/**
 * Đối chiếu kết quả (/pa/workManagement/viewResultConfirmList) - port từ viewResultConfirmList.jsp +
 * viewResultConfirmSonList.jsp + viewResultConfirmList2Bottom.jsp + viewResultConfirmList3Right.jsp
 * của Hanwha_HAE. Mỗi tab chỉ tải dữ liệu khi được mở sau lần Tra cứu gần nhất (bản gốc tải lại tab
 * hiện tại mỗi lần bấm Tra cứu). Biểu đồ highcharts bản gốc thay bằng ng-apexcharts.
 */
@Component({
  selector: 'app-pa-result-confirm',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
    NzTreeSelectModule,
    PrcItemDifComponent,
  ],
  templateUrl: './pa-result-confirm.component.html',
  styleUrl: './pa-result-confirm.component.scss',
})
export class PaResultConfirmComponent implements OnInit {
  private readonly service = inject(PaSalaryCheckService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  private readonly payItemTab = viewChild<PrcItemDifComponent>('prcPayItem');
  private readonly insItemTab = viewChild<PrcItemDifComponent>('prcInsItem');

  protected readonly salaryDistinOptions = signal<SyCodeOption[]>([]);
  private readonly schedules = signal<PaPayScheduleRow[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly salaryDistinNo = signal<string | null>(null);
  protected readonly payDatePro = signal<string | null>(null);
  protected readonly payDate = signal<string | null>(null);
  protected readonly deptNo = signal<string | null>(null);
  protected readonly payDateOptions = computed(() => paPayDatesOf(this.schedules(), this.salaryDistinNo()));

  protected readonly tabIndex = signal(0);
  protected readonly loading = signal(false);
  private query: PrcQuery | null = null;
  /** Các tab đã tải dữ liệu cho lần Tra cứu hiện tại */
  private readonly loadedTabs = new Set<PrcTab>();

  // Tab 1 - Biến động chi tiết
  protected readonly summary = signal<PaResultConfirmSummary | null>(null);
  protected readonly personChart = computed(() => this.buildChart('person'));
  protected readonly amountChart = computed(() => this.buildChart('amount'));

  // Tab 3 - Thống kê tăng ca
  protected readonly overtimeRows = signal<PaSalaryCheckEmpRow[]>([]);
  protected readonly overtimeSelected = signal<PaSalaryCheckEmpRow | null>(null);
  protected readonly arLoading = signal(false);
  protected readonly arRows = signal<PaArDetailRow[]>([]);

  // Tab 5 / 6 - Chi tiết bảo hiểm / Thuế
  protected readonly insuranceRows = signal<PaSalaryCheckAmountRow[]>([]);
  protected readonly taxRows = signal<PaSalaryCheckAmountRow[]>([]);

  protected readonly fmt = paFormatNumber;
  protected readonly displayDate = paDisplayDate;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [distins, schedules, deptFlat] = await Promise.all([
        this.payScheduleService.getSalaryDistinOptions(),
        this.payScheduleService.getList('', '', null),
        this.deptService.getAuthorizedDepartments(),
      ]);
      this.salaryDistinOptions.set(distins);
      this.schedules.set(schedules);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
      if (distins.length) this.changeSalaryDistin(distins[0].codeNo);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  changeSalaryDistin(value: string | null): void {
    this.salaryDistinNo.set(value);
    const dates = this.payDateOptions();
    this.payDate.set(dates[0]?.payDate ?? null);
    this.payDatePro.set(dates[1]?.payDate ?? dates[0]?.payDate ?? null);
  }

  /** Tra cứu (navTabSearcha bản gốc) -> tải lại tab đang mở */
  async search(): Promise<void> {
    const salaryDistinNo = this.salaryDistinNo();
    const payDate = this.payDate();
    const payDatePro = this.payDatePro();
    if (!salaryDistinNo || !payDate || !payDatePro) {
      this.message.warning(this.i18n.t('pa.salaryCheck.msgSelectPayDate', 'Vui lòng chọn phân loại lương và ngày trả lương!'));
      return;
    }
    this.query = { salaryDistinNo, payDate, payDatePro, deptNo: this.deptNo() };
    this.loadedTabs.clear();
    await this.loadTab(PRC_TABS[this.tabIndex()]);
  }

  async changeTab(index: number): Promise<void> {
    this.tabIndex.set(index);
    if (this.query) await this.loadTab(PRC_TABS[index]);
  }

  private async loadTab(tab: PrcTab): Promise<void> {
    const q = this.query;
    if (!q || this.loadedTabs.has(tab)) return;
    this.loadedTabs.add(tab);
    if (tab === 'payItem') {
      await this.payItemTab()?.load(q.salaryDistinNo, q.payDate);
      return;
    }
    if (tab === 'insItem') {
      await this.insItemTab()?.load(q.salaryDistinNo, q.payDate);
      return;
    }
    this.loading.set(true);
    try {
      switch (tab) {
        case 'summary':
          this.summary.set(await this.service.getResultSummary(q));
          break;
        case 'overtime':
          this.overtimeSelected.set(null);
          this.arRows.set([]);
          this.overtimeRows.set(await this.service.getOvertimeList(q));
          break;
        case 'insDetail':
          this.insuranceRows.set(await this.service.getInsuranceList(q));
          break;
        case 'tax':
          this.taxRows.set(await this.service.getTaxList(q));
          break;
      }
    } catch {
      this.loadedTabs.delete(tab);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Tab 3: bấm 1 dòng -> chi tiết tăng ca theo ngày (viewResultConfirmList2Bottom bản gốc) */
  async selectOvertime(row: PaSalaryCheckEmpRow): Promise<void> {
    if (!row.personId) return;
    this.overtimeSelected.set(row);
    this.arLoading.set(true);
    try {
      this.arRows.set(await this.service.getArDetailList(row.personId, row.arStartDate ?? '', row.arEndDate ?? ''));
    } catch {
      this.arRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.arLoading.set(false);
    }
  }

  /** Giảm trừ người phụ thuộc = mức giảm trừ x số người (bản gốc tính trên JSP) */
  familyDeduct(row: PaSalaryCheckAmountRow): number {
    return (Number(row.taxFamilyDeductStd) || 0) * (Number(row.taxFamilyDeductCount) || 0);
  }

  /** 2 biểu đồ đường tháng trước -> tháng này giống highcharts bản gốc */
  private buildChart(kind: 'person' | 'amount'): PrcChart | null {
    const s = this.summary();
    if (!s) return null;
    const categories = [s.payDatePro ?? '', s.payDateCur ?? ''];
    const num = (v: number | undefined) => Number(v) || 0;
    const series: ApexAxisChartSeries =
      kind === 'person'
        ? [{ name: this.i18n.t('sys.rights.title.employee', 'Nhân viên'), data: [num(s.personNumPro), num(s.personNumCur)] }]
        : [
            { name: this.i18n.t('pa.viewResultConfirmSonList.GONGZIZONGE.b', 'Tổng thu nhập'), data: [num(s.salaryTotalPro), num(s.salaryTotalCur)] },
            { name: this.i18n.t('pa.viewResultConfirmSonList.KOUCHUHEJI.b', 'Tổng khoản trừ'), data: [num(s.withholdTotalPro), num(s.withholdTotalCur)] },
            { name: this.i18n.t('pa.viewResultConfirmSonList.SHIDEGONGZI.b', 'Lương thực lĩnh'), data: [num(s.netPayPro), num(s.netPayCur)] },
          ];
    return {
      series,
      chart: { type: 'line', height: 320, toolbar: { show: false } },
      xaxis: { categories },
      yaxis: {
        title: { text: kind === 'person' ? this.i18n.t('pa.viewResultConfirmSonList.REN.b', 'Người') : 'VND' },
        labels: { formatter: (v: number) => paFormatNumber(v) },
      },
      title: {
        text:
          kind === 'person'
            ? this.i18n.t('pa.title.pa.excel.thecountnumberofemployee', 'Số người')
            : this.i18n.t('ess.empInfo.amount_of_money', 'Số tiền'),
        align: 'center',
      },
      stroke: { curve: 'straight', width: 2 },
      dataLabels: { enabled: true, formatter: (v) => paFormatNumber(v as number) },
    };
  }
}
