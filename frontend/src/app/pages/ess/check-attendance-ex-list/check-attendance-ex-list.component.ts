import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { ApplyDetailModalComponent } from '../../../shared/apply-detail-modal/apply-detail-modal.component';
import {
  AuthorizedDeptNode,
  CheckAttendanceExFilter,
  CheckAttendanceExListService,
  CheckAttendanceExRow,
  ShiftOption,
  SyCodeOption,
} from './check-attendance-ex-list.service';

interface ItemNoOption {
  value: string;
  labelKey: string;
  labelFallback: string;
}

const ITEM_NO_OPTIONS: ItemNoOption[] = [
  { value: '141443', labelKey: 'ck.itemNo.unauthorized', labelFallback: 'Nghỉ không phép' },
  { value: '141442', labelKey: 'ck.itemNo.leaveEarly', labelFallback: 'Về sớm' },
  { value: '141441', labelKey: 'ck.itemNo.lateComing', labelFallback: 'Đến muộn' },
  { value: '14015448', labelKey: 'ck.itemNo.forgotSwipe', labelFallback: 'Quên quẹt thẻ' },
];

function firstDayOfBillingCycle(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 25);
}

function lastDayOfBillingCycle(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 24);
}

/**
 * Tra cứu (chỉ xem) đơn xin phép chấm công ngoại lệ đã tạo, xem chi tiết
 * duyệt - port lại từ
 * ess/infoApplyAttendance/viewCheckAttencetanceExForBatchList.html (Thymeleaf
 * + DataTables client-side, đã xoá) sang Angular + NG-ZORRO, dùng nz-table
 * thay cho bảng dựng tay bằng jQuery. Modal chi tiết tái sử dụng
 * ApplyDetailModalComponent (variant="attendanceEx", xem shared/) thay vì
 * viết lại fragment gốc đã port ở Batch A. Gọi lại nguyên vẹn API JSON sẵn
 * có.
 */
@Component({
  selector: 'app-check-attendance-ex-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ApplyDetailModalComponent,
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
  templateUrl: './check-attendance-ex-list.component.html',
  styleUrl: './check-attendance-ex-list.component.scss',
})
export class CheckAttendanceExListComponent implements OnInit {
  @ViewChild('detailModal') detailModal!: ApplyDetailModalComponent;

  private readonly service = inject(CheckAttendanceExListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly itemNoOptions = ITEM_NO_OPTIONS;

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(firstDayOfBillingCycle());
  protected readonly toDate = signal<Date | null>(lastDayOfBillingCycle());
  protected readonly postFamily = signal<string | null>(null);
  protected readonly shiftNo = signal<string | null>(null);
  protected readonly itemNo = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly rows = signal<CheckAttendanceExRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadFilterOptions();
    await this.search();
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, postFamilyList, shiftList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getPostFamilyOptions(),
        this.service.getShiftOptions(),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.shiftOptions.set(shiftList);
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

  shiftLabel(opt: ShiftOption): string {
    return opt.nameVi || opt.shiftName || opt.shiftNo || '';
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : undefined;
  }

  private buildFilter(): CheckAttendanceExFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      postFamily: this.postFamily() ?? undefined,
      shiftNo: this.shiftNo() ?? undefined,
      itemNo: this.itemNo() ?? undefined,
    };
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(this.buildFilter()));
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.postFamily.set(null);
    this.shiftNo.set(null);
    this.itemNo.set(null);
    this.fromDate.set(firstDayOfBillingCycle());
    this.toDate.set(lastDayOfBillingCycle());
    this.search();
  }

  openDetail(row: CheckAttendanceExRow): void {
    this.detailModal.open(row.applyNo, row.itemNo, null);
  }

  exportExcel(): void {
    const header = [
      this.i18n.t('ck.col.no', 'No.'),
      this.i18n.t('ck.col.empId', 'Mã nhân viên'),
      this.i18n.t('ck.col.localName', 'Họ tên'),
      this.i18n.t('ck.col.deptName', 'Phòng ban'),
      this.i18n.t('ck.col.postGradeName', 'Chức vụ'),
      this.i18n.t('ck.col.postFamilyName', 'Nhóm nhân viên'),
      this.i18n.t('ck.col.shiftName', 'Ca làm việc'),
      this.i18n.t('ck.col.itemNoName', 'Loại nghỉ phép'),
      this.i18n.t('ck.col.arDate', 'Ngày công'),
      this.i18n.t('ck.col.fromDateTime', 'Từ thời gian'),
      this.i18n.t('ck.col.toDateTime', 'Đến thời gian'),
      this.i18n.t('ck.col.remark', 'Lý do'),
      this.i18n.t('ck.col.createdName', 'Người tạo'),
      this.i18n.t('ck.col.createDate', 'Ngày tạo'),
    ];
    const data = [
      header,
      ...this.rows().map((row, idx) => [
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.postGradeName ?? '',
        row.postFamilyName ?? '',
        row.shiftName ?? '',
        row.itemNoName ?? '',
        row.arDateStr ?? '',
        row.fromDateTime ?? '',
        row.toDateTime ?? '',
        row.remark ?? '',
        row.createdName ?? '',
        row.createDate ?? '',
      ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'check_attendance_ex_for_batch_export.xlsx');
  }
}
