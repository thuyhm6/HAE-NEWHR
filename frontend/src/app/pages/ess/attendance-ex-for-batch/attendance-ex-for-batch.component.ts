import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ApproverInput,
  AttendanceExApplyItem,
  AttendanceExForBatchService,
  AttendanceExRow,
  AuthorizedDeptNode,
  EmployeeSearchResult,
  POST_FAMILY_PARENT_CODE,
  ShiftOption,
  SyCodeOption,
} from './attendance-ex-for-batch.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface ExRowVm {
  raw: AttendanceExRow;
  rowKey: string;
  checked: boolean;
  inDateTime: Date | null;
  outDateTime: Date | null;
  remark: string;
  approvers: ApproverInput[];
}

function currentWeekRange(): { from: Date; to: Date } {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day + 7);
  return { from: monday, to: sunday };
}

function parseApiDateTime(value: string | undefined): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * HR/quản lý tra cứu chấm công bất thường theo phòng ban được phân quyền và
 * xin phép hàng loạt thay nhân viên - port lại từ
 * ess/infoApplyAttendance/viewAttendanceExForBatchInfoList.html (đã xoá)
 * sang Angular + NG-ZORRO, dùng nz-table thay jQuery DataTables. Tái sử dụng
 * pattern dept-tree (ArPersonalListComponent) và tìm kiếm nhân viên thêm
 * người phê duyệt theo dòng (giống SstOtApplyComponent/SstLeaveApplyComponent
 * - chọn ngay khi (ngModelChange) bắn ra, tránh bug nzOnSearch xoá kết quả
 * trước khi xác nhận đã phát hiện ở Batch E). Giữ state từng dòng trong
 * signal `rows` nên không mất dữ liệu khi đổi trang nz-table (khác bản gốc
 * DataTables render lại theo trang).
 */
@Component({
  selector: 'app-attendance-ex-for-batch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './attendance-ex-for-batch.component.html',
  styleUrl: './attendance-ex-for-batch.component.scss',
})
export class AttendanceExForBatchComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(AttendanceExForBatchService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);
  protected readonly postFamily = signal<string | null>(null);
  protected readonly shiftNo = signal<string | null>(null);
  protected readonly itemNo = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly rows = signal<ExRowVm[]>([]);

  protected readonly bulkInDateTime = signal<Date | null>(null);
  protected readonly bulkOutDateTime = signal<Date | null>(null);

  protected readonly approverModalVisible = signal(false);
  protected readonly approverSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly approverSearching = signal(false);
  private activeRowKey: string | null = null;
  private approverSearchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly allChecked = computed(() => {
    const rows = this.rows();
    return rows.length > 0 && rows.every((r) => r.checked);
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const { from, to } = currentWeekRange();
    this.fromDate.set(from);
    this.toDate.set(to);
    await this.loadFilterOptions();
    await this.search();
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, postFamilyList, shiftList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getCodeList(POST_FAMILY_PARENT_CODE),
        this.service.getShiftOptions(),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.shiftOptions.set(shiftList);
    } catch {
      // Danh sách bộ lọc trống không chặn việc tra cứu chính.
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

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : undefined;
  }

  private toApiDateTime(value: Date | null): string {
    return value ? formatDate(value, 'yyyy/MM/dd HH:mm', 'en-US') : '';
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const rows = await this.service.getList({
        keyword: this.keyword() || undefined,
        deptNos: this.selectedDeptCodes().join(',') || undefined,
        fromDate: this.toApiDate(this.fromDate()),
        toDate: this.toApiDate(this.toDate()),
        postFamily: this.postFamily() ?? undefined,
        shiftNo: this.shiftNo() ?? undefined,
        itemNo: this.itemNo() ?? undefined,
      });
      this.rows.set(rows.map((r) => this.toRowVm(r)));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  private toRowVm(r: AttendanceExRow): ExRowVm {
    return {
      raw: r,
      rowKey: r.applyNo ?? '',
      checked: false,
      inDateTime: parseApiDateTime(r.shiftStartTime),
      outDateTime: parseApiDateTime(r.shiftEndTime),
      remark: r.remark ?? '',
      approvers: [],
    };
  }

  updateRow(rowKey: string, patch: Partial<ExRowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
  }

  toggleAll(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => ({ ...r, checked })));
  }

  applyAll(): void {
    const inDt = this.bulkInDateTime();
    const outDt = this.bulkOutDateTime();
    if (!inDt && !outDt) {
      this.message.warning(this.i18n.t('ex.msg.enterBatchTime', 'Vui lòng nhập thời gian vào hoặc thời gian ra.'));
      return;
    }
    const hasChecked = this.rows().some((r) => r.checked);
    if (!hasChecked) {
      this.message.warning(this.i18n.t('ex.msg.selectMinOneBatch', 'Vui lòng chọn ít nhất một dòng để thực hiện.'));
      return;
    }
    this.rows.update((rows) =>
      rows.map((r) =>
        r.checked ? { ...r, inDateTime: inDt ?? r.inDateTime, outDateTime: outDt ?? r.outDateTime } : r,
      ),
    );
    this.message.success(this.i18n.t('ex.msg.batchApplied', 'Đã áp dụng thời gian cho các dòng đã chọn.'));
  }

  openApproverModal(rowKey: string): void {
    this.activeRowKey = rowKey;
    this.approverSearchResults.set([]);
    this.approverModalVisible.set(true);
  }

  closeApproverModal(): void {
    this.approverModalVisible.set(false);
    this.activeRowKey = null;
  }

  onApproverSearch(keyword: string): void {
    if (this.approverSearchTimer) {
      clearTimeout(this.approverSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.approverSearchResults.set([]);
      return;
    }
    this.approverSearchTimer = setTimeout(async () => {
      this.approverSearching.set(true);
      try {
        this.approverSearchResults.set(await this.service.searchEmployees(kw));
      } catch {
        this.approverSearchResults.set([]);
      } finally {
        this.approverSearching.set(false);
      }
    }, 300);
  }

  onApproverSelected(personId: string | null): void {
    if (!personId || !this.activeRowKey) {
      return;
    }
    const emp = this.approverSearchResults().find((e) => e.personId === personId);
    if (emp) {
      const rowKey = this.activeRowKey;
      this.rows.update((rows) =>
        rows.map((r) =>
          r.rowKey === rowKey
            ? {
                ...r,
                approvers: [
                  ...r.approvers,
                  { personId: emp.personId ?? '', localName: emp.localName ?? '', empId: emp.empId ?? '' },
                ],
              }
            : r,
        ),
      );
    }
    this.closeApproverModal();
  }

  removeApprover(rowKey: string, index: number): void {
    this.rows.update((rows) =>
      rows.map((r) => (r.rowKey === rowKey ? { ...r, approvers: r.approvers.filter((_, i) => i !== index) } : r)),
    );
  }

  async submit(): Promise<void> {
    const selected = this.rows().filter((r) => r.checked);
    if (!selected.length) {
      this.message.warning(this.i18n.t('ex.msg.selectMinOne', 'Vui lòng tick chọn ít nhất một dòng.'));
      return;
    }
    if (selected.some((r) => !r.raw.personId || !r.raw.itemNo || !r.raw.arDateStr)) {
      this.message.warning(
        this.i18n.t('ex.msg.missingData', 'Thiếu dữ liệu bắt buộc ở dòng đã chọn: nhân viên/loại nghỉ/ngày công.'),
      );
      return;
    }
    if (selected.some((r) => !r.inDateTime || !r.outDateTime)) {
      this.message.warning(
        this.i18n.t('ex.msg.fillTimeRequired', 'Vui lòng nhập đầy đủ thời gian vào/ra cho tất cả dòng đã chọn.'),
      );
      return;
    }
    if (selected.some((r) => !r.approvers.length)) {
      this.message.warning(
        this.i18n.t('ex.msg.missingApprovers', 'Vui lòng thêm người phê duyệt cho tất cả dòng đã chọn.'),
      );
      return;
    }

    const items: AttendanceExApplyItem[] = selected.map((row) => ({
      applyNo: row.raw.applyNo ?? '',
      personId: row.raw.personId ?? '',
      empId: row.raw.empId ?? '',
      localName: row.raw.localName ?? '',
      itemNo: row.raw.itemNo ?? '',
      // Khác Batch I: mapper này trả arDateStr ở dạng gốc yyyy/MM/dd, không
      // reformat hiển thị, nên gửi nguyên vẹn không convert lại.
      arDateStr: row.raw.arDateStr ?? '',
      fromDateTime: this.toApiDateTime(row.inDateTime),
      toDateTime: this.toApiDateTime(row.outDateTime),
      workHour: row.raw.workHour ?? '',
      remark: row.remark,
      approvers: row.approvers,
    }));

    this.submitting.set(true);
    try {
      const res = await this.service.apply(items);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('ex.msg.submitSuccess', 'Xin phép thành công.'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('ex.msg.submitFailed', 'Xin phép thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('ex.msg.submitError', 'Lỗi khi gửi dữ liệu xin phép.'));
    } finally {
      this.submitting.set(false);
    }
  }

  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('ex.col.no', 'No.'),
      this.i18n.t('ex.col.empId', 'Mã nhân viên'),
      this.i18n.t('ex.col.fullName', 'Họ tên'),
      this.i18n.t('ex.col.dept', 'Phòng ban'),
      this.i18n.t('ex.col.position', 'Chức vụ'),
      this.i18n.t('ex.col.workDate', 'Ngày công'),
      this.i18n.t('ex.col.absenceType', 'Phân loại'),
      `${this.i18n.t('ex.js.in', 'Vào')} (${this.i18n.t('ex.col.swipeTime', 'Thời gian quẹt thẻ')})`,
      `${this.i18n.t('ex.js.out', 'Ra')} (${this.i18n.t('ex.col.swipeTime', 'Thời gian quẹt thẻ')})`,
      this.i18n.t('ex.col.reason', 'Lý do'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      data.push([
        idx + 1,
        row.raw.empId ?? '',
        row.raw.localName ?? '',
        row.raw.deptName ?? '',
        row.raw.postGradeName ?? '',
        row.raw.arDateStr ?? '',
        row.raw.itemNoName ?? '',
        row.raw.inDoorTime ?? '',
        row.raw.outDoorTime ?? '',
        row.remark,
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'attendance_ex_for_batch_export.xlsx');
  }
}
