import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNoData,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { AuthService } from '../../auth/auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { AttendanceRow, DashboardWidgetsService } from './dashboard-widgets.service';

export interface AttendanceOtChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  noData: ApexNoData;
  grid: ApexGrid;
  legend: ApexLegend;
  colors: string[];
}

interface StatRow {
  key: 'leave' | 'ot' | 'abnormal';
  labelKey: string;
  labelFallback: string;
  count: number | null;
  isWarning: boolean;
}

const ABSENT_ITEMS = ['141443', '14015448'];

/**
 * Nội dung chính của dashboard (bảng thống kê + biểu đồ chấm công/tăng ca +
 * banner) - port lại từ login/dashboard.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO + ng-apexcharts, gọi lại nguyên vẹn các API JSON sẵn có
 * của module ESS (không đổi backend).
 */
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDatePickerModule,
    NzTableModule,
    NzTagModule,
    NzCardModule,
    NgApexchartsModule,
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  private readonly widgets = inject(DashboardWidgetsService);
  private readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly user = this.authService.currentUser;

  protected readonly dateRange = signal<Date[]>(this.defaultMonthRange());

  protected readonly stats = signal<StatRow[]>([
    {
      key: 'leave',
      labelKey: 'dashboard.leave.detail',
      labelFallback: 'Đơn nghỉ phép tháng này',
      count: null,
      isWarning: false,
    },
    {
      key: 'ot',
      labelKey: 'dashboard.ot.detail',
      labelFallback: 'Đơn tăng ca tháng này',
      count: null,
      isWarning: false,
    },
    {
      key: 'abnormal',
      labelKey: 'dashboard.abnormal.detail',
      labelFallback: 'Nghỉ bất thường tháng này',
      count: null,
      isWarning: true,
    },
  ]);

  protected chartOptions: AttendanceOtChartOptions = this.buildEmptyChartOptions();

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async onDateRangeChange(range: Date[]): Promise<void> {
    if (!range || range.length !== 2) {
      return;
    }
    this.dateRange.set(range);
    await this.reload();
  }

  private defaultMonthRange(): Date[] {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [from, to];
  }

  private async reload(): Promise<void> {
    await Promise.all([this.loadStats(), this.loadChart()]);
  }

  private async loadStats(): Promise<void> {
    const [from, to] = this.dateRange();
    const fromYmd = this.toYmd(from);
    const toYmd = this.toYmd(to);
    const fromDmy = this.toDmy(from);
    const toDmy = this.toDmy(to);

    const [leave, ot, abnormal] = await Promise.all([
      this.widgets.getMyLeaveApplyCount(fromYmd, toYmd).catch(() => null),
      this.widgets.getMyOtApplyCount(fromYmd, toYmd).catch(() => null),
      this.widgets.getMyCwaAbnormalCount(fromDmy, toDmy).catch(() => null),
    ]);

    this.stats.update((rows) =>
      rows.map((row) => {
        if (row.key === 'leave') return { ...row, count: leave?.length ?? null };
        if (row.key === 'ot') return { ...row, count: ot?.length ?? null };
        return { ...row, count: abnormal?.length ?? null };
      }),
    );
  }

  private async loadChart(): Promise<void> {
    const [from, to] = this.dateRange();
    const fromDmy = this.toDmy(from);
    const toDmy = this.toDmy(to);
    const labels = this.buildLabels(from, to);

    const [attRows, otRows] = await Promise.all([
      this.widgets.getAttendancePersonal(fromDmy, toDmy).catch(() => [] as AttendanceRow[]),
      this.widgets.getPersonOt(fromDmy, toDmy).catch(() => [] as AttendanceRow[]),
    ]);

    const { hours: attData, detail: attDetail } = this.groupAttendanceHours(attRows, labels);
    const { hours: otData, detail: otDetail } = this.groupHours(otRows, labels);

    this.chartOptions = this.buildChartOptions(labels, attData, otData, attDetail, otDetail);
  }

  // ── Format helpers (DD/MM/YYYY theo quy ước dự án) ──────────────────
  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private toDmy(d: Date): string {
    return `${this.pad(d.getDate())}/${this.pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  private toYmd(d: Date): string {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }

  private buildLabels(from: Date, to: Date): string[] {
    const labels: string[] = [];
    for (const d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      labels.push(`${d.getFullYear()}/${this.pad(d.getMonth() + 1)}/${this.pad(d.getDate())}`);
    }
    return labels;
  }

  private groupAttendanceHours(
    rows: AttendanceRow[],
    labels: string[],
  ): { hours: number[]; detail: Record<string, { name: string; hours: number; absent: boolean }[]> } {
    const hoursMap: Record<string, number> = {};
    const absentMap: Record<string, boolean> = {};
    const detail: Record<string, { name: string; hours: number; absent: boolean }[]> = {};

    for (const r of rows || []) {
      const key = (r.arDateStr || '').replace(/-/g, '/');
      const hours = parseFloat(String(r.workHour)) || 0;
      if (!detail[key]) detail[key] = [];
      if (ABSENT_ITEMS.includes(r.itemNo)) {
        absentMap[key] = true;
        detail[key].push({ name: r.itemName || r.itemNo, hours, absent: true });
      } else {
        hoursMap[key] = (hoursMap[key] || 0) + hours;
        detail[key].push({ name: r.itemName || r.itemNo, hours, absent: false });
      }
    }

    const hoursArr = labels.map((l) => (absentMap[l] ? 0 : parseFloat((hoursMap[l] || 0).toFixed(2))));
    return { hours: hoursArr, detail };
  }

  private groupHours(
    rows: AttendanceRow[],
    labels: string[],
  ): { hours: number[]; detail: Record<string, { name: string; hours: number }[]> } {
    const map: Record<string, number> = {};
    const detail: Record<string, { name: string; hours: number }[]> = {};

    for (const r of rows || []) {
      const key = (r.arDateStr || '').replace(/-/g, '/');
      const hours = parseFloat(String(r.workHour)) || 0;
      map[key] = (map[key] || 0) + hours;
      if (!detail[key]) detail[key] = [];
      detail[key].push({ name: r.itemName || r.itemNo, hours });
    }

    const hoursArr = labels.map((l) => parseFloat((map[l] || 0).toFixed(2)));
    return { hours: hoursArr, detail };
  }

  private buildEmptyChartOptions(): AttendanceOtChartOptions {
    return this.buildChartOptions([], [], [], {}, {});
  }

  private buildChartOptions(
    labels: string[],
    attData: number[],
    otData: number[],
    attDetail: Record<string, { name: string; hours: number; absent: boolean }[]>,
    otDetail: Record<string, { name: string; hours: number }[]>,
  ): AttendanceOtChartOptions {
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    const displayLabels = labels.map((l) => {
      const p = l.split('/');
      return `${p[2]}/${p[1]}`;
    });
    const hoursUnit = t('dashboard.chart.hours', 'giờ');

    return {
      series: [
        { name: t('dashboard.chart.attendance', 'Chấm công (giờ)'), data: attData, type: 'bar' },
        { name: t('dashboard.chart.attendanceTrend', 'Xu hướng chấm công'), data: attData, type: 'line' },
        { name: t('dashboard.chart.ot', 'Tăng ca (giờ)'), data: otData, type: 'bar' },
        { name: t('dashboard.chart.otTrend', 'Xu hướng tăng ca'), data: otData, type: 'line' },
      ],
      chart: { type: 'line', height: 255, toolbar: { show: false }, animations: { enabled: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 2 } },
      stroke: { width: [0, 2, 0, 2], curve: 'smooth' },
      fill: { opacity: [0.65, 1, 0.65, 1] },
      markers: { size: [0, 3, 0, 3] },
      dataLabels: { enabled: false },
      xaxis: {
        categories: displayLabels,
        labels: { rotate: -45, rotateAlways: true, style: { fontSize: '10px' } },
        tickPlacement: 'on',
      },
      yaxis: {
        title: { text: hoursUnit, style: { fontSize: '11px' } },
        min: 0,
        tickAmount: 4,
        labels: { formatter: (v: number) => (v % 1 === 0 ? String(v) : v.toFixed(1)) },
      },
      colors: ['#4e73df', '#1a3fa0', '#f6a623', '#b87200'],
      legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
      tooltip: {
        custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
          const dateKey = labels[dataPointIndex];
          const dispDate = displayLabels[dataPointIndex];
          const attList = attDetail[dateKey] || [];
          const otList = otDetail[dateKey] || [];
          const attLabel = t('dashboard.chart.attendance', 'Chấm công (giờ)');
          const otLabel = t('dashboard.chart.ot', 'Tăng ca (giờ)');

          let h = '<div style="padding:8px 12px;min-width:160px;font-size:12px;">';
          h += `<div style="font-weight:600;margin-bottom:6px;">${dispDate}</div>`;
          h += `<div style="color:#4e73df;font-weight:500;margin-bottom:2px;">${attLabel}</div>`;
          if (attList.length) {
            for (const it of attList) {
              const style = it.absent ? 'color:#e74a3b;' : '';
              h += `<div style="${style}padding-left:8px;">${it.name}: <b>${it.hours}</b> ${hoursUnit}</div>`;
            }
          } else {
            h += `<div style="padding-left:8px;color:#aaa;">0 ${hoursUnit}</div>`;
          }
          h += `<div style="color:#f6a623;font-weight:500;margin-top:6px;margin-bottom:2px;">${otLabel}</div>`;
          if (otList.length) {
            for (const it of otList) {
              h += `<div style="padding-left:8px;">${it.name}: <b>${it.hours}</b> ${hoursUnit}</div>`;
            }
          } else {
            h += `<div style="padding-left:8px;color:#aaa;">0 ${hoursUnit}</div>`;
          }
          h += '</div>';
          return h;
        },
      },
      noData: {
        text: t('dashboard.chart.noData', 'Không có dữ liệu'),
        align: 'center',
        verticalAlign: 'middle',
        style: { fontSize: '13px', color: '#aaa' },
      },
      grid: { borderColor: '#f1f1f1' },
    };
  }
}
