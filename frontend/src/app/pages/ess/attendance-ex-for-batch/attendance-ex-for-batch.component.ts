import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { TABLE_DEFAULT_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
import { I18nService } from '../../../i18n/i18n.service';
import { ApplyDetailModalComponent } from '../../../shared/apply-detail-modal/apply-detail-modal.component';
import { ApproverChainItem, ApproverChainService } from '../../../shared/approver-chain/approver-chain.service';
import { RowApproversComponent } from '../../../shared/approver-chain/row-approvers.component';
import { essApplyErrorText } from '../../../shared/ess-apply-response';
import {
  AttendanceExApproverApplyItem,
  AttendanceExForBatchService,
  AttendanceExRow,
  AuthorizedDeptNode,
} from './attendance-ex-for-batch.service';

interface ExRowVm {
  raw: AttendanceExRow;
  rowKey: string;
  /** LOCK_YN = 'N' mới cho chọn (bản cũ chỉ render checkbox khi chưa khóa) */
  selectable: boolean;
  checked: boolean;
  /** DD/MM/YYYY */
  arDateDisplay: string;
  inDate: Date | null;
  inHour: string;
  inMinute: string;
  outDate: Date | null;
  outHour: string;
  outMinute: string;
  remark: string;
  approvers: ApproverChainItem[];
}

/** Mã đơn xin phép chấm công bất thường (APPLY_TYPE / applyTypeCode khi lấy dây chuyền duyệt) */
const APPLY_TYPE_NO = '218197';
/** Nghỉ không phép -> khi xin phép đổi thành Quên quẹt thẻ (HMT 2023/06/05 ở bản cũ) */
const ITEM_ABSENT = '141443';
const ITEM_FORGOT_SWIPE = '14015448';
/** Bản cũ: tháng hiện tại > 2000 dòng thì chỉ lấy ngày hôm qua */
const MAX_DEFAULT_ROWS = 2000;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

/** YYYY/MM/DD [HH:mm] -> Date (chỉ phần ngày) */
function parseApiDate(value: string | undefined): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})[/.-](\d{2})[/.-](\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d.getTime()) ? null : d;
}

function isIntInRange(value: string, min: number, max: number): boolean {
  if (!/^\d{1,2}$/.test(value)) return false;
  const n = +value;
  return n >= min && n <= max;
}

/**
 * Xin phép chấm công bất thường hàng loạt thay nhân viên - port giao diện + chức
 * năng từ WEB-INF/view/ess/infoApplyAttendance/viewAttendanceExForBatchInfoList.jsp
 * (dự án Hanwha_HAE) sang Angular + NG-ZORRO.
 * - Dây chuyền duyệt từng dòng: RowApproversComponent (dùng chung), mặc định nạp
 *   theo viewAffirmorByPersonIdList (applyTypeNo = applyTypeCode = 218197).
 * - Kiểm tra AR_GET_ATT_EX_CLASH thực hiện ở backend khi lưu (bản cũ gọi doSql).
 * - Tên NV có đơn nghỉ phép trùng ngày -> bấm xem chi tiết (ApplyDetailModalComponent).
 */
@Component({
  selector: 'app-attendance-ex-for-batch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ApplyDetailModalComponent,
    RowApproversComponent,
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
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;
  protected readonly hourOptions = HOURS;
  protected readonly minuteOptions = ['00', '30'];

  @ViewChild('exbDetailModal') detailModal!: ApplyDetailModalComponent;

  private readonly service = inject(AttendanceExForBatchService);
  private readonly approverService = inject(ApproverChainService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  // ── Điều kiện tìm kiếm ──
  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);
  protected readonly itemNo = signal<string>('');
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  // ── Thanh "Thực hiện tất cả" (Thẻ vào / Thẻ ra) ──
  protected readonly fillInDate = signal<Date | null>(null);
  protected readonly fillInHour = signal('08');
  protected readonly fillInMinute = signal('00');
  protected readonly fillOutDate = signal<Date | null>(null);
  protected readonly fillOutHour = signal('17');
  protected readonly fillOutMinute = signal('00');

  // ── Dữ liệu bảng ──
  protected readonly rows = signal<ExRowVm[]>([]);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  private loadToken = 0;

  protected readonly selectableRows = computed(() => this.rows().filter((r) => r.selectable));
  protected readonly allChecked = computed(() => {
    const list = this.selectableRows();
    return list.length > 0 && list.every((r) => r.checked);
  });
  protected readonly someChecked = computed(() => !this.allChecked() && this.selectableRows().some((r) => r.checked));

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    // Mặc định: ngày đầu tháng -> ngày cuối tháng hiện tại
    const today = new Date();
    this.startDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.endDate.set(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    await this.loadDeptTree();
    await this.search(true);
  }

  private async loadDeptTree(): Promise<void> {
    try {
      this.deptTreeNodes.set(this.buildDeptTree(await this.service.getAuthorizedDepartments()));
    } catch {
      this.deptTreeNodes.set([]);
    }
  }

  /** Dựng cây phòng ban từ danh sách phẳng {id, text, parent} */
  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();
    flatList.forEach((item) => nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true }));
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
      if (children?.length) {
        node.isLeaf = false;
        node.children = children.map((childId) => nodeMap.get(childId)!).filter(Boolean);
      }
    });
    return roots;
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : undefined;
  }

  private displayDate(value: Date | null): string {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : '';
  }

  // ── Tìm kiếm ─────────────────────────────────────────────────────────────
  async search(firstLoad = false): Promise<void> {
    const token = ++this.loadToken;
    this.loading.set(true);
    try {
      let list = await this.fetchList();
      if (token !== this.loadToken) return;
      // Lần đầu vào trang: tháng hiện tại quá nhiều dòng -> chỉ lấy ngày hôm qua (giống bản cũ)
      if (firstLoad && list.length > MAX_DEFAULT_ROWS) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.startDate.set(yesterday);
        this.endDate.set(yesterday);
        list = await this.fetchList();
        if (token !== this.loadToken) return;
      }
      this.rows.set(list.map((r, idx) => this.toRowVm(r, idx)));
      void this.loadDefaultApprovers(token);
    } catch {
      if (token !== this.loadToken) return;
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      if (token === this.loadToken) this.loading.set(false);
    }
  }

  private fetchList(): Promise<AttendanceExRow[]> {
    return this.service.getList({
      keyword: this.keyword().trim() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.startDate()),
      toDate: this.toApiDate(this.endDate()),
      itemNo: this.itemNo() || undefined,
    });
  }

  private toRowVm(r: AttendanceExRow, idx: number): ExRowVm {
    return {
      raw: r,
      rowKey: `${r.applyNo ?? ''}_${idx}`,
      selectable: r.lockYn === 'N',
      checked: false,
      arDateDisplay: this.displayDate(parseApiDate(r.arDateStr)),
      inDate: parseApiDate(r.shiftStartTime),
      inHour: '',
      inMinute: '',
      outDate: parseApiDate(r.shiftEndTime),
      outHour: '',
      outMinute: '',
      remark: '',
      approvers: [],
    };
  }

  /** Dây chuyền duyệt mặc định của từng nhân viên (getAffirmor_ess3434) - gom theo personId */
  private async loadDefaultApprovers(token: number): Promise<void> {
    const personIds = Array.from(new Set(this.rows().map((r) => r.raw.personId).filter((p): p is string => !!p)));
    for (const personId of personIds) {
      if (token !== this.loadToken) return;
      let list: ApproverChainItem[] = [];
      try {
        list = await this.approverService.getDefaultApprovers(APPLY_TYPE_NO, personId, APPLY_TYPE_NO, '0');
      } catch {
        // Người dùng vẫn có thể tự thêm người duyệt
      }
      if (token !== this.loadToken) return;
      this.rows.update((rows) =>
        rows.map((r) =>
          r.raw.personId === personId && !r.approvers.length
            ? { ...r, approvers: list.map((a) => ({ ...a, key: `${a.key}_${r.rowKey}` })) }
            : r,
        ),
      );
    }
  }

  // ── Sửa dòng ─────────────────────────────────────────────────────────────
  updateRow(rowKey: string, patch: Partial<ExRowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
  }

  /** Sửa lý do -> tự tick dòng (onblur editable ở bản cũ) */
  onRemarkChange(row: ExRowVm, remark: string): void {
    this.updateRow(row.rowKey, { remark, checked: row.selectable ? true : row.checked });
  }

  toggleAll(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => (r.selectable ? { ...r, checked } : r)));
  }

  /** "Thực hiện tất cả" - áp thẻ vào/ra cho các dòng đã chọn (ex_fillItem) */
  fillAll(): void {
    const checked = this.rows().filter((r) => r.checked);
    if (!checked.length) {
      this.message.error(this.i18n.t('ess.infoApply.PLEASE_SELECT_OPERTE.Z', 'Xin chọn đối tượng cần thao tác'));
      return;
    }
    const keys = new Set(checked.map((r) => r.rowKey));
    this.rows.update((rows) =>
      rows.map((r) =>
        keys.has(r.rowKey)
          ? {
              ...r,
              inDate: this.fillInDate(),
              inHour: this.fillInHour(),
              inMinute: this.fillInMinute(),
              outDate: this.fillOutDate(),
              outHour: this.fillOutHour(),
              outMinute: this.fillOutMinute(),
            }
          : r,
      ),
    );
  }

  openLeaveDetail(row: ExRowVm): void {
    if (row.raw.leaveApplyNo) this.detailModal.open(row.raw.leaveApplyNo, undefined, null);
  }

  shiftText(row: ExRowVm): string {
    const time = (row.raw.shiftTime ?? '').substring(0, 9);
    return `${row.raw.shiftName ?? ''} (${time})`;
  }

  // ── Xin phép (saveAttenanceExBatchInfo) ──────────────────────────────────
  private validateRow(row: ExRowVm): string | null {
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    if (!row.remark.trim()) return t('ga.viewApplyCard.APPLY_REASON_NOT_NULL.d', 'Không được để trống lý do đăng ký!');
    const timeError = t('ess.infoApply.PLEASE_SELECT_CORRECT_TIME.Z', 'Xin chọn thời gian chính xác');
    if (!row.inDate || !isIntInRange(row.inHour, 0, 23) || !isIntInRange(row.inMinute, 0, 59)) return timeError;
    if (!row.outDate || !isIntInRange(row.outHour, 0, 23) || !isIntInRange(row.outMinute, 0, 59)) return timeError;
    if (!row.approvers.some((a) => a.personId)) return t('alert.message.pleaseFirstSetRuler.b', 'Xin thiết lập người duyệt');
    return null;
  }

  private toDateTime(date: Date | null, hour: string, minute: string): string {
    return `${this.toApiDate(date) ?? ''} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }

  submit(): void {
    const checked = this.rows().filter((r) => r.checked && r.selectable);
    if (!checked.length) {
      this.message.error(this.i18n.t('ar.alert.message.viewardetail.choosetoadd', 'Xin chọn dữ liệu cần thêm'));
      return;
    }
    for (const row of checked) {
      const err = this.validateRow(row);
      if (err) {
        this.message.error(row.raw.localName ? `${err} (${row.raw.localName})` : err);
        return;
      }
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.alert.message.viewArAnnualStandard.consubmit', 'Đồng ý lưu không?'),
      nzOnOk: () => this.doSubmit(checked),
    });
  }

  private async doSubmit(rows: ExRowVm[]): Promise<void> {
    const items: AttendanceExApproverApplyItem[] = rows.map((row) => ({
      applyNo: row.raw.applyNo ?? '',
      personId: row.raw.personId ?? '',
      empId: row.raw.empId ?? '',
      localName: row.raw.localName ?? '',
      itemNo: row.raw.itemNo === ITEM_ABSENT ? ITEM_FORGOT_SWIPE : (row.raw.itemNo ?? ''),
      arDateStr: row.raw.arDateStr ?? '',
      fromDateTime: this.toDateTime(row.inDate, row.inHour, row.inMinute),
      toDateTime: this.toDateTime(row.outDate, row.outHour, row.outMinute),
      workHour: row.raw.workHour ?? '',
      remark: row.remark.trim(),
      approvers: ApproverChainService.toSaveItems(row.approvers.filter((a) => a.personId)),
    }));
    this.submitting.set(true);
    try {
      const res = await this.service.applyByApprover(items);
      if (res.success) {
        this.message.success(this.i18n.t(res.messageKey ?? 'ar.alert.message.addempshift.success', 'Lưu thành công!'));
        await this.search();
      } else {
        this.message.error(essApplyErrorText(this.i18n, res));
      }
    } catch {
      this.message.error(this.i18n.t('alert.message.add_fail', 'Lưu thất bại!'));
    } finally {
      this.submitting.set(false);
    }
  }

  // ── Xuất Excel ───────────────────────────────────────────────────────────
  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('ess.message.NOT_FOUND_DATA_FROM_TABLE', 'Không có dữ liệu!'));
      return;
    }
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    const inLabel = t('ess.infoApply.in_door_card', 'Thẻ vào');
    const outLabel = t('ess.infoApply.out_door_card', 'Thẻ ra');
    const header = [
      'NO',
      t('ess.infoApply.EMPID', 'Mã nhân viên'),
      t('ess.infoApply.NAME', 'Họ tên'),
      t('ess.infoApply.DEPT', 'Phòng ban'),
      t('ess.infoApply.attendance_date', 'Ngày'),
      t('ar.viewArBaseEmpInfoList.BANZULEIXING.b', 'Loại ca'),
      t('ess.infoApply.yichangleixing', 'Loại bất thường'),
      `${t('ess.infoApply.card_clock_time', 'Thời gian quẹt thẻ')} - ${inLabel}`,
      `${t('ess.infoApply.card_clock_time', 'Thời gian quẹt thẻ')} - ${outLabel}`,
      t('ar.viewarcardrecord.title.beizhu', 'Ghi chú'),
    ];
    const data = rows.map((r, idx) => [
      idx + 1,
      r.raw.empId ?? '',
      r.raw.localName ?? '',
      r.raw.deptName ?? '',
      r.arDateDisplay,
      this.shiftText(r),
      r.raw.itemNoName ?? '',
      r.raw.inDoorTime ?? '',
      r.raw.outDoorTime ?? '',
      r.raw.leaveContent ?? '',
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'attendance_ex_for_batch_export.xlsx');
  }
}
