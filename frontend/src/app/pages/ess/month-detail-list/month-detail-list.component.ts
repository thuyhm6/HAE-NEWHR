import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { TABLE_DEFAULT_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
import { I18nService } from '../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  MonthDetailDate,
  MonthDetailFilter,
  MonthDetailListService,
  MonthDetailRow,
} from './month-detail-list.service';

/** Mã báo cáo theo bản gốc: 306 = Xuất Excel, 367 = Xuất Excel Days (SQL Master), 314 = Công tính lương */
const EXCEL_REPORT_CODE = '306';
const EXCEL_DAYS_SQL_SEQ = '367';
const REPORT_TYPE_OPTIONS = [
  { code: '314', labelKey: 'ess.viewMonthDetailList.reportType.salary', fallback: 'Công tính lương' },
] as const;

/** TYPEID của ngày làm việc trong AR_CALENDER - các ngày khác tô xám */
const WORKING_DAY_TYPE = '1440';

/** Cột thông tin cơ bản - 4 cột đầu cố định bên trái (giống fixedColumns: leftColumns 4 bản gốc) */
interface BasicColumn {
  key: string;
  labelKey: string;
  fallback: string;
  width: number;
  align?: 'center';
  sortable: boolean;
}

/** Cột tổng hợp - giá trị tính từ các cột SQL giống biểu thức EL trong JSP gốc */
interface SummaryColumn {
  key: string;
  labelKey: string;
  fallback: string;
  suffix?: string;
  width: number;
  calc: (row: MonthDetailRow) => number;
}

/** Nhóm header dòng 1: có cols -> colspan, không có cols -> rowspan 2 (1 cột) */
interface SummaryGroup {
  labelKey: string;
  fallback: string;
  cols: SummaryColumn[];
  single?: boolean;
}

interface ViewRow {
  raw: MonthDetailRow;
  values: Record<string, number>;
  searchText: string;
}

const num = (row: MonthDetailRow, key: string): number => {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
};
const sum = (row: MonthDetailRow, ...keys: string[]): number => keys.reduce((acc, key) => acc + num(row, key), 0);
/** Ngày công thực tế = giờ làm/8 + ngày nghỉ hưởng lương (thử việc + chính thức) */
const workDays = (row: MonthDetailRow): number =>
  num(row, 'PROB_WORK_DAYS') / 8 + num(row, 'REG_WORK_DAYS') / 8 + sum(row, 'PROB_REST_PAY_DAYS', 'REG_REST_PAY_DAYS');

const DAY_OT = { labelKey: 'ess.viewMonthDetailList.DAY_OT.b', fallback: 'TC NGÀY' };
const NIGHT_OT = { labelKey: 'ess.viewMonthDetailList.NIGHT_OT.b', fallback: 'TC ĐÊM' };
const DURATION = { labelKey: 'ess.infoApply.duration', fallback: 'Thời lượng' };
const COUNT = { labelKey: 'ess.viewMonthDetailList.COUNT_NUMBER.b', fallback: 'Số ngày' };

const BASIC_FIXED_COLUMNS: BasicColumn[] = [
  { key: 'EMPID', labelKey: 'ess.infoApply.EMPID', fallback: 'Mã nhân viên', width: 90, align: 'center', sortable: true },
  { key: 'LOCAL_NAME', labelKey: 'ess.infoApply.NAME', fallback: 'Họ tên', width: 160, align: 'center', sortable: true },
  { key: 'DEPT_NAME', labelKey: 'ess.infoApply.DEPT', fallback: 'Phòng ban', width: 200, sortable: true },
];
const BASIC_OTHER_COLUMNS: BasicColumn[] = [
  { key: 'DOB', labelKey: 'hr.viewPersonalInfo.title.DOB', fallback: 'Ngày sinh', width: 90, sortable: true },
  { key: 'POST_GRADE_NAME', labelKey: 'ess.trans.title.postGradeName', fallback: 'Chức vụ', width: 90, sortable: true },
  { key: 'DATE_STARTED', labelKey: 'ess.trans.title.entryJobDate', fallback: 'Ngày vào làm', width: 90, align: 'center', sortable: true },
  {
    key: 'END_PROBATION_DATE',
    labelKey: 'hr.enpinfo.title.EMP.PROBATION_END_DATE',
    fallback: 'Ngày kết thúc thử việc',
    width: 100,
    align: 'center',
    sortable: false,
  },
];

const SUMMARY_GROUPS: SummaryGroup[] = [
  {
    labelKey: 'ess.viewMonthDetailList.OT_ON_WEEKDAY.b',
    fallback: 'HÀNH CHÍNH',
    cols: [
      { key: 'WD_DAY_OT', ...DAY_OT, width: 70, calc: (r) => sum(r, 'PROB_DAY_OT_WEEKDAY', 'REG_DAY_OT_WEEKDAY') },
      { key: 'WD_NIGHT_OT', ...NIGHT_OT, width: 70, calc: (r) => sum(r, 'PROB_NIGHT_OT_WEEKDAY', 'REG_NIGHT_OT_WEEKDAY') },
      {
        key: 'WD_NIGHT_OT_210',
        ...NIGHT_OT,
        suffix: '(210%)',
        width: 80,
        calc: (r) => sum(r, 'PROB_NIGHT_OT_WEEKDAY_210', 'REG_NIGHT_OT_WEEKDAY_210'),
      },
    ],
  },
  {
    labelKey: 'ess.viewMonthDetailList.OT_ON_SATURDAY.b',
    fallback: 'NGHỈ HƯỞNG LƯƠNG',
    cols: [
      { key: 'SAT_DAY_OT', ...DAY_OT, width: 70, calc: (r) => sum(r, 'PROB_DAY_OT_SATURDAY', 'REG_DAY_OT_SATURDAY') },
      { key: 'SAT_NIGHT_OT', ...NIGHT_OT, width: 70, calc: (r) => sum(r, 'PROB_NIGHT_OT_SATURDAY', 'REG_NIGHT_OT_SATURDAY') },
    ],
  },
  {
    labelKey: 'ess.viewMonthDetailList.OT_ON_WEEKEND.b',
    fallback: 'NGÀY NGHỈ',
    cols: [
      { key: 'WE_DAY_OT', ...DAY_OT, width: 70, calc: (r) => sum(r, 'PROB_DAY_OT_WEEKEND', 'REG_DAY_OT_WEEKEND') },
      { key: 'WE_NIGHT_OT', ...NIGHT_OT, width: 70, calc: (r) => sum(r, 'PROB_NIGHT_OT_WEEKEND', 'REG_NIGHT_OT_WEEKEND') },
    ],
  },
  {
    labelKey: 'ess.viewMonthDetailList.OT_ON_HOLIDAY.b',
    fallback: 'LỄ TẾT',
    cols: [
      { key: 'HOL_DAY_OT', ...DAY_OT, width: 70, calc: (r) => sum(r, 'PROB_DAY_OT_HOLIDAY', 'REG_DAY_OT_HOLIDAY') },
      { key: 'HOL_NIGHT_OT', ...NIGHT_OT, width: 70, calc: (r) => sum(r, 'PROB_NIGHT_OT_HOLIDAY', 'REG_NIGHT_OT_HOLIDAY') },
    ],
  },
  {
    labelKey: 'ess.viewMonthDetailList.WORK_DAYS.b',
    fallback: 'Số ngày làm việc',
    cols: [
      {
        key: 'NORMAL_SHIFT_DAYS',
        labelKey: 'ar.viewArShiftMonthCheckList.ZHENGCHANGBAN.b',
        fallback: 'Ca hành chính',
        width: 80,
        calc: workDays,
      },
      {
        key: 'NIGHT_SHIFT_DAYS',
        labelKey: 'ess.viewMonthDetailList.NIGHT_SHIFT.b',
        fallback: 'CA ĐÊM',
        width: 70,
        calc: (r) => sum(r, 'PROB_NIGHT_WORK_DAYS', 'REG_NIGHT_WORK_DAYS'),
      },
    ],
  },
  {
    labelKey: 'ess.infoApply.yingchuqintianshu',
    fallback: 'Ngày công chuẩn',
    single: true,
    cols: [
      {
        key: 'WORK_SCHEDULE_DAYS',
        labelKey: 'ess.infoApply.yingchuqintianshu',
        fallback: 'Ngày công chuẩn',
        width: 80,
        calc: (r) => num(r, 'WORK_SCHEDULE_DAYS'),
      },
    ],
  },
  {
    labelKey: 'ess.viewMonthDetailList.MONTH_WORK_DAYS.b',
    fallback: 'Ngày LV trong tháng',
    single: true,
    cols: [
      {
        key: 'MONTH_WORK_DAYS',
        labelKey: 'ess.viewMonthDetailList.MONTH_WORK_DAYS.b',
        fallback: 'Ngày LV trong tháng',
        width: 90,
        calc: (r) => workDays(r) + sum(r, 'PROB_LEAVE_PAY_DAYS', 'REG_LEAVE_PAY_DAYS'),
      },
    ],
  },
  {
    labelKey: 'ar.monthwork.title.Lateness',
    fallback: 'Đến muộn',
    cols: [
      { key: 'LATE_ARRIVE_HOURS', ...DURATION, width: 70, calc: (r) => num(r, 'LATE_ARRIVE_HOURS') },
      { key: 'LATE_ARRIVE_COUNT', ...COUNT, width: 70, calc: (r) => num(r, 'LATE_ARRIVE_COUNT') },
    ],
  },
  {
    labelKey: 'ar.monthwork.title.EarlyLeave',
    fallback: 'Về sớm',
    cols: [
      { key: 'EARLY_LEAVE_HOURS', ...DURATION, width: 70, calc: (r) => num(r, 'EARLY_LEAVE_HOURS') },
      { key: 'EARLY_LEAVE_COUNT', ...COUNT, width: 70, calc: (r) => num(r, 'EARLY_LEAVE_COUNT') },
    ],
  },
  ...(
    [
      ['ANNUAL_LEAVE_DAYS', 'ar.viewArAnnualStandard.title.ninjia', 'Nghỉ phép năm', 80],
      ['UNPAID_LEAVE_RAESON_DAYS', 'ess.viewMonthDetailList.UNPAID_LEAVE_RESON.b', 'Nghỉ có phép', 100],
      ['UNPAID_LEAVE_UNRAESON_DAYS', 'ess.viewMonthDetailList.UNPAID_LEAVE_UNRESON.b', 'Nghỉ không phép', 100],
      ['MATERNITYLEAVE_DAYS', 'ar.menu.title.chanjia', 'Nghỉ thai sản', 80],
      ['HUNSANGJIA_DAYS', 'ess.viewMonthDetailList.HUNSANGJIA.b', 'Nghỉ hiếu, hỉ', 80],
    ] as const
  ).map(([key, labelKey, fallback, width]) => ({
    labelKey,
    fallback,
    single: true,
    cols: [{ key, labelKey, fallback, width, calc: (r: MonthDetailRow) => num(r, key) }],
  })),
];

const SUMMARY_COLUMNS: SummaryColumn[] = SUMMARY_GROUPS.flatMap((g) => g.cols);
const DAY_COLUMN_WIDTH = 46;
const NO_COLUMN_WIDTH = 50;

/**
 * Chi tiết chấm công tháng - port từ ess/tempEmp/viewMonthDetailList.jsp (Hanwha_HAE) sang
 * Angular + NG-ZORRO. Giống bản gốc: tải toàn bộ danh sách 1 lần (không phân trang server),
 * lọc nhanh / sắp xếp phía client, cố định 4 cột đầu, 3 nhóm cột chi tiết theo ngày trong tháng
 * (chấm công, tăng ca ngày, tăng ca đêm) với ngày nghỉ/lễ tô xám.
 */
@Component({
  selector: 'app-month-detail-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './month-detail-list.component.html',
  styleUrl: './month-detail-list.component.scss',
})
export class MonthDetailListComponent implements OnInit {
  private readonly service = inject(MonthDetailListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly basicFixedColumns = BASIC_FIXED_COLUMNS;
  protected readonly basicOtherColumns = BASIC_OTHER_COLUMNS;
  protected readonly summaryGroups = SUMMARY_GROUPS;
  protected readonly summaryColumns = SUMMARY_COLUMNS;
  protected readonly reportTypeOptions = REPORT_TYPE_OPTIONS;
  protected readonly noColumnWidth = NO_COLUMN_WIDTH;

  // Điều kiện tìm kiếm - mặc định tháng trước (giống DateUtil.getLastMonthMYStr bản gốc)
  protected readonly arMonth = signal<Date | null>(this.lastMonth());
  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly dateRange = signal<Date[]>([]);
  protected readonly reportType = signal<string | null>(null);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly loading = signal(false);
  protected readonly dates = signal<MonthDetailDate[]>([]);
  private readonly rows = signal<ViewRow[]>([]);
  protected readonly quickFilter = signal('');
  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortOrder = signal<NzTableSortOrder>(null);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(TABLE_DEFAULT_PAGE_SIZE);

  /** Offset nzLeft cho 4 cột cố định (NO, mã NV, họ tên, phòng ban) */
  protected readonly fixedLeftOffsets = (() => {
    const offsets = [0];
    BASIC_FIXED_COLUMNS.forEach((c, i) => offsets.push(offsets[i] + (i === 0 ? NO_COLUMN_WIDTH : BASIC_FIXED_COLUMNS[i - 1].width)));
    return offsets.map((o) => `${o}px`);
  })();

  /**
   * Độ rộng từng cột lá (colgroup) - header 2 dòng có colspan/rowspan nên phải khai báo tường minh
   * để header/body và các cột cố định căn khớp nhau.
   */
  protected readonly widthConfig = computed(() => {
    const dayWidths = this.dates().map(() => `${DAY_COLUMN_WIDTH}px`);
    return [
      `${NO_COLUMN_WIDTH}px`,
      ...BASIC_FIXED_COLUMNS.map((c) => `${c.width}px`),
      ...BASIC_OTHER_COLUMNS.map((c) => `${c.width}px`),
      ...SUMMARY_COLUMNS.map((c) => `${c.width}px`),
      ...dayWidths,
      ...dayWidths,
      ...dayWidths,
    ];
  });

  /** Lọc nhanh (giống ô "快速筛选" của DataTables) + sắp xếp phía client */
  protected readonly displayRows = computed(() => {
    const keyword = this.quickFilter().trim().toLowerCase();
    let list = keyword ? this.rows().filter((r) => r.searchText.includes(keyword)) : this.rows();
    const key = this.sortKey();
    const order = this.sortOrder();
    if (key && order) {
      const factor = order === 'ascend' ? 1 : -1;
      list = [...list].sort((a, b) => factor * this.compareValue(this.sortValue(a, key), this.sortValue(b, key)));
    }
    return list;
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const deptList = await this.service.getAuthorizedDepartments();
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
    } catch {
      // im lặng bỏ qua - danh sách phòng ban trống không chặn việc tra cứu chính
    }
    // Bản gốc vào màn hình lần đầu (firstFlag=Y) không truy vấn - người dùng bấm Tra cứu
  }

  async search(): Promise<void> {
    const filter = this.buildFilter();
    if (!filter.month || !filter.year) {
      this.message.warning(this.i18n.t('ess.viewMonthDetailList.msg.selectMonth', 'Vui lòng chọn tháng'));
      return;
    }
    this.loading.set(true);
    try {
      const res = await this.service.getMonthDetail(filter);
      this.dates.set(res.dates ?? []);
      this.rows.set((res.rows ?? []).map((row) => this.toViewRow(row, res.dates ?? [])));
      this.pageIndex.set(1);
    } catch {
      this.message.error(this.i18n.t('ess.viewMonthDetailList.msg.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.loading.set(false);
    }
  }

  exportExcel(): void {
    window.location.href = this.service.buildExportUrl(this.buildFilter(), EXCEL_REPORT_CODE);
  }

  exportExcelDays(): void {
    window.location.href = this.service.buildSqlMasterExportUrl(this.buildFilter(), EXCEL_DAYS_SQL_SEQ);
  }

  /** XUẤT BÁO CÁO - xuất theo loại báo cáo đang chọn (reportDowload() bản gốc) */
  exportSelectedReport(): void {
    const type = this.reportType();
    if (!type) {
      this.message.info(this.i18n.t('ess.viewMonthDetailList.msg.selectReportType', 'Vui lòng chọn loại báo cáo'));
      return;
    }
    window.location.href = this.service.buildExportUrl(this.buildFilter(), type);
  }

  onSortChange(key: string, order: NzTableSortOrder): void {
    this.sortKey.set(order ? key : null);
    this.sortOrder.set(order);
  }

  sortOrderOf(key: string): NzTableSortOrder {
    return this.sortKey() === key ? this.sortOrder() : null;
  }

  onQuickFilterChange(value: string): void {
    this.quickFilter.set(value);
    this.pageIndex.set(1);
  }

  isOffDay(date: MonthDetailDate): boolean {
    return String(date.typeId) !== WORKING_DAY_TYPE;
  }

  cellText(row: MonthDetailRow, key: string): string {
    const value = row[key];
    return value === null || value === undefined ? '' : String(value);
  }

  /** Làm tròn 2 chữ số thập phân, bỏ số 0 thừa */
  formatNumber(value: number): string {
    return String(Math.round(value * 100) / 100);
  }

  private toViewRow(row: MonthDetailRow, dates: MonthDetailDate[]): ViewRow {
    const values: Record<string, number> = {};
    SUMMARY_COLUMNS.forEach((c) => (values[c.key] = c.calc(row)));
    const texts = [
      ...[...BASIC_FIXED_COLUMNS, ...BASIC_OTHER_COLUMNS].map((c) => this.cellText(row, c.key)),
      ...SUMMARY_COLUMNS.map((c) => this.formatNumber(values[c.key])),
      ...dates.flatMap((d) => [this.cellText(row, d.dateKey), this.cellText(row, d.dayOtKey), this.cellText(row, d.nightOtKey)]),
    ];
    return { raw: row, values, searchText: texts.join(' ').toLowerCase() };
  }

  private sortValue(row: ViewRow, key: string): string | number {
    return key in row.values ? row.values[key] : this.cellText(row.raw, key);
  }

  private compareValue(a: string | number, b: string | number): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a).localeCompare(String(b), 'vi');
  }

  private buildFilter(): MonthDetailFilter {
    const month = this.arMonth();
    const [start, end] = this.dateRange() ?? [];
    return {
      keyword: this.keyword().trim() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      month: month ? formatDate(month, 'MM', 'en-US') : undefined,
      year: month ? formatDate(month, 'yyyy', 'en-US') : undefined,
      startDate: start ? formatDate(start, 'yyyy/MM/dd', 'en-US') : undefined,
      endDate: end ? formatDate(end, 'yyyy/MM/dd', 'en-US') : undefined,
    };
  }

  private lastMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    flatList.forEach((item) => nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true }));

    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      const node = nodeMap.get(item.id)!;
      const parent = item.parent && item.parent !== '0' ? nodeMap.get(item.parent) : undefined;
      if (parent) {
        parent.isLeaf = false;
        parent.children = [...(parent.children ?? []), node];
      } else {
        roots.push(node);
      }
    });
    return roots;
  }
}
