import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { AuthService } from '../../auth/auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { HrmWidgetsService } from './hrm-widgets.service';

interface PersonnelChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
  legend: ApexLegend;
  grid: ApexGrid;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);

/**
 * Nội dung dashboard HRM (banner chào mừng + bảng cảnh báo + biểu đồ tình
 * hình nhân sự) - port lại từ login/hrm.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO + ng-apexcharts, gọi lại nguyên vẹn API JSON sẵn có.
 */
@Component({
  selector: 'app-hrm-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzSelectModule,
    NzButtonModule,
    NgApexchartsModule,
  ],
  templateUrl: './hrm-home.component.html',
  styleUrl: './hrm-home.component.scss',
})
export class HrmHomeComponent implements OnInit {
  private readonly widgets = inject(HrmWidgetsService);
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly expiringContractsCount = signal<number | null>(null);

  protected readonly currentYear = new Date().getFullYear();
  protected readonly yearOptions = Array.from({ length: 5 }, (_, i) => this.currentYear - i);
  protected readonly selectedYear = signal(this.currentYear);

  protected chartOptions: PersonnelChartOptions = this.buildChartOptions([], [], []);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadExpiringContracts(), this.loadChart(this.selectedYear())]);
  }

  async onYearChange(year: number): Promise<void> {
    this.selectedYear.set(year);
    await this.loadChart(year);
  }

  get exportUrl(): string {
    return `/hrm/api/empMonthlyStats/export?year=${this.selectedYear()}`;
  }

  private async loadExpiringContracts(): Promise<void> {
    try {
      this.expiringContractsCount.set(await this.widgets.getExpiringContractsCount());
    } catch {
      this.expiringContractsCount.set(null);
    }
  }

  private async loadChart(year: number): Promise<void> {
    try {
      const data = await this.widgets.getEmpMonthlyStats(year);
      const empCounts = new Array(12).fill(0);
      const joinerCounts = new Array(12).fill(0);
      const leaverCounts = new Array(12).fill(0);
      for (const d of data || []) {
        const idx = d.monthNum - 1;
        empCounts[idx] = d.empCount;
        joinerCounts[idx] = d.newJoinerCount;
        leaverCounts[idx] = d.leaverCount;
      }
      this.chartOptions = this.buildChartOptions(empCounts, joinerCounts, leaverCounts);
    } catch {
      this.chartOptions = this.buildChartOptions([], [], []);
    }
  }

  private buildChartOptions(
    empCounts: number[],
    joinerCounts: number[],
    leaverCounts: number[],
  ): PersonnelChartOptions {
    return {
      series: [
        { name: this.i18n.t('hrm.chart.personnel.totalEmp', 'Tổng nhân viên'), data: empCounts },
        { name: this.i18n.t('hrm.chart.personnel.newJoiner', 'Nhân viên mới'), data: joinerCounts },
        { name: this.i18n.t('hrm.chart.personnel.leaver', 'Nhân viên nghỉ việc'), data: leaverCounts },
      ],
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '60%', borderRadius: 2 } },
      dataLabels: { enabled: false },
      xaxis: { categories: MONTH_LABELS, labels: { style: { fontSize: '10px' } } },
      yaxis: { labels: { formatter: (v: number) => (Number.isInteger(v) ? String(v) : '') } },
      colors: ['#4a90e2', '#28a745', '#dc3545'],
      legend: { position: 'top', fontSize: '12px' },
      grid: { borderColor: '#f1f1f1' },
    };
  }
}
