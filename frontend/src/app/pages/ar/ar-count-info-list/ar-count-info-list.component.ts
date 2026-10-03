import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { AttendanceExForBatchService, SyCodeOption } from '../../ess/attendance-ex-for-batch/attendance-ex-for-batch.service';
import {
  AR_PERSONAL_LIST_ITEM_GROUP,
  ArPersonalListFilter,
  ArPersonalListItem,
  ArPersonalListService,
  ArPersonalListSummaryRow,
  AuthorizedDeptNode,
} from '../../ess/ar-personal-list/ar-personal-list.service';
import { ArCountInfoListOtFilter, ArCountInfoListOtRow, ArCountInfoListService } from './ar-count-info-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const EMP_TYPE_PARENT_CODE = '13864';

/** 1 tháng trong tab "Tăng ca" - key khớp hậu tố field otM{n}... của ArCountInfoListOtRow. */
interface OtMonthColumn {
  num: number;
  field: string;
}

const OT_MONTHS: OtMonthColumn[] = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, field: `otM${i + 1}` }));

/** 5 cột con của mỗi tháng trong tab "Tăng ca". */
interface OtSubColumn {
  suffix: string;
  labelKey: string;
  labelDefault: string;
}

const OT_SUB_COLUMNS: OtSubColumn[] = [
  { suffix: 'Total', labelKey: 'acil.col.total', labelDefault: 'Tổng' },
  { suffix: 'NormalWork', labelKey: 'acil.col.normalWork', labelDefault: 'Ngày thường' },
  { suffix: 'Saturday', labelKey: 'acil.col.saturday', labelDefault: 'Thứ 7' },
  { suffix: 'WeeklyHoliday', labelKey: 'acil.col.weeklyHoliday', labelDefault: 'Ngày nghỉ tuần' },
  { suffix: 'PublicHoliday', labelKey: 'acil.col.publicHoliday', labelDefault: 'Ngày lễ' },
];

/**
 * Hiện trạng chấm công của nhân viên (/ar/countAttendance/arCountInfoList) -
 * 2 tab dùng chung 1 bộ lọc (phòng ban/mã NV-họ tên/loại NV/khoảng ngày):
 * - "Nghỉ phép": tái sử dụng nguyên vẹn ArPersonalListService (API
 *   arPersonalList/items + /summary), hiển thị giống hệt ArPersonalListComponent.
 * - "Tăng ca": tổng hợp theo tháng (API otSummary mới), mỗi tháng 5 cột
 *   (Tổng/Ngày thường/Thứ 7/Nghỉ tuần/Lễ) lấy từ GET_AR_OT_TOTAIL.
 * Mỗi tab chỉ tải dữ liệu khi được active lần đầu hoặc sau khi bấm Tra cứu
 * (tránh gọi API nặng của tab đang ẩn).
 */
@Component({
  selector: 'app-ar-count-info-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
    NzTreeSelectModule,
  ],
  templateUrl: './ar-count-info-list.component.html',
  styleUrl: './ar-count-info-list.component.scss',
})
export class ArCountInfoListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly leaveService = inject(ArPersonalListService);
  private readonly otService = inject(ArCountInfoListService);
  private readonly codeService = inject(AttendanceExForBatchService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly activeTabIndex = signal(0);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly empTypeCode = signal<string | null>(null);
  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);

  protected readonly leaveLoading = signal(false);
  protected readonly leaveItems = signal<ArPersonalListItem[]>([]);
  protected readonly leaveRows = signal<ArPersonalListSummaryRow[]>([]);

  protected readonly otLoading = signal(false);
  protected readonly otRows = signal<ArCountInfoListOtRow[]>([]);

  protected readonly otMonths = OT_MONTHS;
  protected readonly otSubColumns = OT_SUB_COLUMNS;

  private leaveDirty = true;
  private otDirty = true;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.setDefaultDateRange();
    try {
      const [deptList, empTypeList, items] = await Promise.all([
        this.leaveService.getAuthorizedDepartments(),
        this.codeService.getCodeList(EMP_TYPE_PARENT_CODE),
        this.leaveService.getItems(AR_PERSONAL_LIST_ITEM_GROUP),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.empTypeOptions.set(empTypeList);
      this.leaveItems.set(items);
    } catch {
      // Danh sách bộ lọc trống không chặn việc tra cứu chính.
    }
    await this.search();
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    this.startDate.set(new Date(now.getFullYear(), now.getMonth() - 1, 25));
    this.endDate.set(new Date(now.getFullYear(), now.getMonth(), 24));
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
        if (node) roots.push(node);
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
    this.leaveDirty = true;
    this.otDirty = true;
    await this.loadActiveTab();
  }

  async onTabChange(index: number): Promise<void> {
    this.activeTabIndex.set(index);
    await this.loadActiveTab();
  }

  private async loadActiveTab(): Promise<void> {
    if (this.activeTabIndex() === 0 && this.leaveDirty) {
      await this.loadLeave();
      this.leaveDirty = false;
    } else if (this.activeTabIndex() === 1 && this.otDirty) {
      await this.loadOt();
      this.otDirty = false;
    }
  }

  private async loadLeave(): Promise<void> {
    this.leaveLoading.set(true);
    try {
      const filter: ArPersonalListFilter = {
        keyword: this.keyword() || undefined,
        deptNos: this.selectedDeptCodes().join(',') || undefined,
        empTypeCode: this.empTypeCode() ?? undefined,
        startDate: this.toApiDateSlash(this.startDate()),
        endDate: this.toApiDateSlash(this.endDate()),
        itemGroup: AR_PERSONAL_LIST_ITEM_GROUP,
      };
      this.leaveRows.set(await this.leaveService.getSummary(filter));
    } catch {
      this.leaveRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.leaveLoading.set(false);
    }
  }

  private async loadOt(): Promise<void> {
    this.otLoading.set(true);
    try {
      const filter: ArCountInfoListOtFilter = {
        keyword: this.keyword() || undefined,
        deptNos: this.selectedDeptCodes().join(',') || undefined,
        empTypeCode: this.empTypeCode() ?? undefined,
        startTime: this.toApiDateDot(this.startDate()),
      };
      this.otRows.set(await this.otService.getOtSummary(filter));
    } catch {
      this.otRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.otLoading.set(false);
    }
  }

  private toApiDateSlash(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : undefined;
  }

  private toApiDateDot(value: Date | null): string | undefined {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : undefined;
  }

  quantityOf(row: ArPersonalListSummaryRow, itemId: string): number {
    return parseFloat(String(row[itemId] ?? '0')) || 0;
  }

  formatQty(value: number): string {
    if (!value) {
      return '0';
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
  }

  otValue(row: ArCountInfoListOtRow, field: string): string {
    return String((row as unknown as Record<string, string | undefined>)[field] ?? '0');
  }

  exportExcel(): void {
    if (this.activeTabIndex() === 0) {
      this.exportLeaveExcel();
    } else {
      this.exportOtExcel();
    }
  }

  private exportLeaveExcel(): void {
    const rows = this.leaveRows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('vapl.msg.stt', 'STT'),
      this.i18n.t('vapl.msg.empId', 'Mã NV'),
      this.i18n.t('vapl.msg.empName', 'Họ tên'),
      this.i18n.t('vapl.msg.deptName', 'Phòng ban'),
      this.i18n.t('vapl.msg.position', 'Chức vụ'),
      this.i18n.t('vapl.msg.normalWork', 'Tổng giờ công'),
      this.i18n.t('vapl.msg.lateEarlyGoTotal', 'Tổng (muộn/sớm/ra ngoài)'),
      ...this.leaveItems().map((item) => item.itemName ?? ''),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      data.push([
        idx + 1,
        String(row['EMPID'] ?? ''),
        String(row['LOCAL_NAME'] ?? ''),
        String(row['DEPT_NAME'] ?? ''),
        String(row['POSITION_NAME'] ?? ''),
        this.formatQty(this.quantityOf(row, 'NORMAL_WORK')),
        this.formatQty(this.quantityOf(row, 'LATE_EARLY_GO_TOTAL')),
        ...this.leaveItems().map((item) => this.formatQty(this.quantityOf(row, item.itemId ?? ''))),
      ]);
    });
    this.writeExcel(data, 'ar_count_info_list_leave.xlsx');
  }

  private exportOtExcel(): void {
    const rows = this.otRows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const monthLabel = this.i18n.t('ar.viewVacEmpList.col.month', 'Tháng');
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('common.empId', 'Mã nhân viên'),
      this.i18n.t('common.empName', 'Họ tên'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('acil.col.team', 'Tổ/Nhóm'),
      this.i18n.t('common.position', 'Chức vụ'),
      this.i18n.t('common.empType', 'Loại nhân viên'),
      this.i18n.t('common.shift', 'Ca làm việc'),
      this.i18n.t('acil.col.otTotal', 'Tổng tăng ca'),
    ];
    this.otMonths.forEach((m) => {
      const label = `${monthLabel} ${m.num}`;
      header.push(
        `${label} - ${this.i18n.t('acil.col.total', 'Tổng')}`,
        `${label} - ${this.i18n.t('acil.col.normalWork', 'Ngày thường')}`,
        `${label} - ${this.i18n.t('acil.col.saturday', 'Thứ 7')}`,
        `${label} - ${this.i18n.t('acil.col.weeklyHoliday', 'Ngày nghỉ tuần')}`,
        `${label} - ${this.i18n.t('acil.col.publicHoliday', 'Ngày lễ')}`,
      );
    });
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      const line: (string | number)[] = [
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.teamName ?? '',
        row.postGradeNo ?? '',
        row.empTypeName ?? '',
        row.shiftName ?? '',
        row.otTotal ?? '0',
      ];
      this.otMonths.forEach((m) => {
        line.push(
          this.otValue(row, `${m.field}Total`),
          this.otValue(row, `${m.field}NormalWork`),
          this.otValue(row, `${m.field}Saturday`),
          this.otValue(row, `${m.field}WeeklyHoliday`),
          this.otValue(row, `${m.field}PublicHoliday`),
        );
      });
      data.push(line);
    });
    this.writeExcel(data, 'ar_count_info_list_overtime.xlsx');
  }

  private writeExcel(data: (string | number)[][], fileName: string): void {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, fileName);
  }
}
