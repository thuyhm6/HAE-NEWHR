import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexAxisChartSeries,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  ManageCountInfoEmpRow,
  ManageCountInfoFilter,
  ManageCountInfoListService,
  ManageCountInfoSummary,
  ManageCountItem,
  SyCodeOption,
} from './manage-count-info-list.service';

const POST_FAMILY_PARENT_CODE = '14015812';
const EMP_TYPE_PARENT_CODE = '13864';
const EMP_OFFICE_PARENT_CODE = '15118';
const EMP_OFFICE_ACTIVE_CODE = '15119';

export interface DonutChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
}

export interface BarChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  fill: ApexFill;
  colors: string[];
}

/**
 * Thống kê + danh sách chi tiết nhân sự theo phòng ban - port lại từ
 * ess/viewDept/ManageCountInfoList.html (Thymeleaf + DataTables server-side,
 * đã xoá) sang Angular + NG-ZORRO. Trang đầu tiên trong đợt migrate này dùng
 * nz-table phân trang server-side (endpoint /api/manageCountInfo/list vẫn
 * trả về DataTablesResponse - hợp đồng draw/start/length kiểu DataTables cũ,
 * không đổi backend). Biểu đồ dùng lại ng-apexcharts giống dashboard-home.
 */
@Component({
  selector: 'app-manage-count-info-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './manage-count-info-list.component.html',
  styleUrl: './manage-count-info-list.component.scss',
})
export class ManageCountInfoListComponent implements OnInit {
  private readonly service = inject(ManageCountInfoListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly postFamily = signal<string | null>(null);
  protected readonly empTypeCode = signal<string | null>(null);
  protected readonly empOffice = signal<string | null>(EMP_OFFICE_ACTIVE_CODE);
  protected readonly asOfDate = signal<Date | null>(new Date());

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);

  protected readonly summaryLoading = signal(false);
  protected readonly totalCount = signal(0);
  protected readonly genderChart = signal<DonutChartOptions>(this.buildDonutOptions([]));
  protected readonly empTypeChart = signal<DonutChartOptions>(this.buildDonutOptions([]));
  protected readonly postFamilyChart = signal<DonutChartOptions>(this.buildDonutOptions([]));
  protected readonly deptChart = signal<BarChartOptions>(this.buildBarOptions([]));
  protected readonly postGradeChart = signal<BarChartOptions>(this.buildBarOptions([]));
  protected readonly ageChart = signal<BarChartOptions>(this.buildBarOptions([]));

  protected readonly listLoading = signal(false);
  protected readonly empRows = signal<ManageCountInfoEmpRow[]>([]);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(25);
  protected readonly total = signal(0);

  private listBootstrapped = false;
  private drawCounter = 0;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadFilterOptions();
    await this.search();
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, postFamilyList, empTypeList, empOfficeList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getCodeList(POST_FAMILY_PARENT_CODE),
        this.service.getCodeList(EMP_TYPE_PARENT_CODE),
        this.service.getCodeList(EMP_OFFICE_PARENT_CODE),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.empTypeOptions.set(empTypeList);
      this.empOfficeOptions.set(empOfficeList);
    } catch {
      // im lặng bỏ qua - danh sách bộ lọc trống không chặn việc tra cứu chính
    }
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();

    flatList.forEach((item) => {
      nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true });
    });

    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '0' && nodeMap.has(item.parent)) {
        const siblings = childKeys.get(item.parent) ?? [];
        siblings.push(item.id);
        childKeys.set(item.parent, siblings);
      } else {
        const node = nodeMap.get(item.id);
        if (node) {
          roots.push(node);
        }
      }
    });

    nodeMap.forEach((node, id) => {
      const children = childKeys.get(id);
      if (children && children.length) {
        node.isLeaf = false;
        node.children = children.map((childId) => nodeMap.get(childId)!).filter(Boolean);
      }
    });

    return roots;
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await Promise.all([this.loadSummary(), this.loadPage()]);
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.postFamily.set(null);
    this.empTypeCode.set(null);
    this.empOffice.set(EMP_OFFICE_ACTIVE_CODE);
    this.asOfDate.set(new Date());
    this.search();
  }

  private buildFilter(): ManageCountInfoFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      postFamily: this.postFamily() ?? undefined,
      empTypeCode: this.empTypeCode() ?? undefined,
      empOffice: this.empOffice() ?? undefined,
      asOfDate: this.toApiDate(this.asOfDate()),
    };
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : undefined;
  }

  private async loadSummary(): Promise<void> {
    this.summaryLoading.set(true);
    try {
      const summary = await this.service.getSummary(this.buildFilter());
      this.applySummary(summary);
    } catch {
      this.message.error(this.i18n.t('mci.msg.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.summaryLoading.set(false);
    }
  }

  private applySummary(summary: ManageCountInfoSummary): void {
    this.totalCount.set(summary.totalCount ?? 0);
    this.genderChart.set(this.buildDonutOptions(summary.byGender ?? []));
    this.empTypeChart.set(this.buildDonutOptions(summary.byEmpType ?? []));
    this.postFamilyChart.set(this.buildDonutOptions(summary.byPostFamily ?? []));
    this.deptChart.set(this.buildBarOptions(summary.byDept ?? []));
    this.postGradeChart.set(this.buildBarOptions(summary.byPostGrade ?? []));
    this.ageChart.set(this.buildBarOptions(summary.byAge ?? []));
  }

  private buildDonutOptions(items: ManageCountItem[]): DonutChartOptions {
    return {
      series: items.map((item) => item.count ?? 0),
      labels: items.map((item) => item.label || item.code || '?'),
      chart: { type: 'donut', height: 200, toolbar: { show: false } },
      legend: { position: 'bottom', fontSize: '11px' },
      dataLabels: { enabled: true },
      tooltip: { y: { formatter: (val: number) => `${val} NV` } },
      plotOptions: { pie: { donut: { size: '55%' } } },
    };
  }

  private buildBarOptions(items: ManageCountItem[]): BarChartOptions {
    const labels = items.map((item) => item.label || item.code || '?');
    const values = items.map((item) => item.count ?? 0);
    return {
      series: [{ name: this.i18n.t('mci.chart.empCount', 'Số NV'), data: values }],
      chart: { type: 'bar', height: Math.max(220, labels.length * 28 + 60), toolbar: { show: false } },
      xaxis: { categories: labels, labels: { style: { fontSize: '11px' } } },
      yaxis: { labels: { style: { fontSize: '11px' } } },
      plotOptions: { bar: { horizontal: true, borderRadius: 3, dataLabels: { position: 'top' } } },
      dataLabels: { enabled: true, offsetX: 20, style: { fontSize: '11px', colors: ['#333'] } },
      tooltip: { y: { formatter: (val: number) => `${val} NV` } },
      fill: { opacity: 1 },
      colors: ['#4e73df'],
    };
  }

  async onQueryParamsChange(params: NzTableQueryParams): Promise<void> {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    if (!this.listBootstrapped) {
      // Lần gọi đầu tiên đã được nạp sẵn trong ngOnInit qua search(), bỏ qua để tránh gọi API 2 lần.
      this.listBootstrapped = true;
      return;
    }
    await this.loadPage();
  }

  private async loadPage(): Promise<void> {
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getPageList(this.buildFilter(), ++this.drawCounter, start, this.pageSize());
      this.empRows.set(res.data ?? []);
      this.total.set(res.recordsTotal ?? 0);
    } catch {
      this.message.error(this.i18n.t('mci.msg.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.listLoading.set(false);
    }
  }

  async exportExcel(): Promise<void> {
    if (!this.total()) {
      this.message.warning(this.i18n.t('mci.msg.noData', 'Không có dữ liệu'));
      return;
    }
    // Tải toàn bộ dữ liệu khớp bộ lọc (không chỉ trang đang xem) để xuất Excel, giống hành vi
    // mciExportExcel() ở bản Thymeleaf cũ (tạm set page length = tổng số dòng rồi xuất).
    let rows: ManageCountInfoEmpRow[];
    try {
      const full = await this.service.getPageList(this.buildFilter(), ++this.drawCounter, 0, this.total());
      rows = full.data ?? [];
    } catch {
      this.message.error(this.i18n.t('mci.msg.loadFailed', 'Tải dữ liệu thất bại'));
      return;
    }
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('common.empId', 'Mã NV'),
      this.i18n.t('common.empName', 'Họ tên'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('common.empGroup', 'Nhóm NV'),
      this.i18n.t('mci.col.postGrade', 'Chức danh'),
      this.i18n.t('common.empType', 'Loại NV'),
      this.i18n.t('mci.col.dob', 'Ngày sinh'),
      this.i18n.t('mci.col.gender', 'Giới tính'),
      this.i18n.t('common.dateJoined', 'Ngày vào làm'),
      this.i18n.t('common.status', 'Trạng thái'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      data.push([
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.postFamilyName ?? '',
        row.postGradeNo ?? '',
        row.empTypeName ?? '',
        row.dob ?? '',
        row.sexName ?? '',
        row.dateStarted ?? '',
        row.empOfficeName ?? '',
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'manage_count_info_list.xlsx');
  }
}
