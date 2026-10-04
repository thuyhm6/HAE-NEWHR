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
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { TABLE_DEFAULT_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
import { I18nService } from '../../../i18n/i18n.service';
import { ApplyDetailModalComponent } from '../../../shared/apply-detail-modal/apply-detail-modal.component';
import { ApplyAttBatchService, DOWNLOAD_TEMPLATE_URL } from '../apply-att-batch/apply-att-batch.service';
import { AttendanceExForBatchService, AuthorizedDeptNode } from '../attendance-ex-for-batch/attendance-ex-for-batch.service';
import {
  AFFIRM_FLAG_PARENT_CODE,
  LEAVE_TYPE_PARENT_CODE,
  MyLeaveApplyListService,
  SyCodeOption,
} from '../my-leave-apply-list/my-leave-apply-list.service';
import { APPROV_TYPE_APPROVAL, APPROV_TYPE_NOTICE, EmployeeSearchResult, SstOtApplyService } from '../sst-ot-apply/sst-ot-apply.service';
import {
  ApplyAttBatchApproverService,
  AttBatchAffirmor,
  AttBatchApproverResponse,
  AttBatchApproverRow,
  AttBatchApproverSaveItem,
} from './apply-att-batch-approver.service';

interface ApproverVm {
  key: string;
  personId: string;
  empId: string;
  /** Họ tên/Chức vụ/Phòng ban */
  info: string;
  localName: string;
  approvType: string;
}

interface RowVm {
  rowKey: string;
  isNew: boolean;
  checked: boolean;
  applyNo: string;
  personId: string;
  empId: string;
  localName: string;
  deptName: string;
  shiftNoName: string;
  applyTime: string;
  totVacCnt: string;
  shengyuVacCnt: string;
  leaveTypeCode: string;
  leaveTypeCodeName: string;
  fromDate: Date | null;
  fromTime: string;
  toDate: Date | null;
  toTime: string;
  applyLength: string;
  dayHours: string;
  leaveReason: string;
  affirmFlag: string;
  affirmFlagName: string;
  confirmFlag: string;
  createdBy: string;
  approvers: ApproverVm[];
  /** true khi dây chuyền duyệt lấy từ đơn đã lưu (không tự nạp lại mặc định) */
  storedApprovers: boolean;
}

type PickerTarget = 'searchFilter' | 'rowEmployee' | 'approver';

/** Mã trạng thái phê duyệt (parent 14014304) */
const AFFIRM_FLAG_APPROVED = '14014308';
const DISABLED_AFFIRM_FLAGS = ['14014309', '14014310'];
/** Mã trạng thái nhân sự xác nhận */
const CONFIRM_FLAG_ADOPT = '1';
const CONFIRM_FLAG_VETO = '2';
/** Loại ca làm (班组类型) */
const SHIFT_TYPE_PARENT_CODE = '400223';
/** Mã loại nghỉ dùng trong validate - giữ nguyên từ JSP gốc */
const LEAVE_ANNUAL = '26';
const LEAVE_WOMEN = '141474';
const LEAVE_LONG_SICK = '14015956';
const LEAVE_BREASTFEED = '16415';
const LEAVE_SEX_CHECK_TYPES = ['27', '16415', '28', '482', '141474'];
const LEAVE_MAX_1_DAY = '80000229';
const LEAVE_FUNERAL = '23';
const LEAVE_MARRIAGE = '22';
/** Giờ mặc định khi thêm dòng mới (addAttendanceApplyInfoForBatch) */
const DEFAULT_FROM_TIME = '07:45';
const DEFAULT_TO_TIME = '17:33';
/** Các mốc giờ đặc biệt được chèn thêm vào danh sách giờ (TIME_STR ở controller cũ) */
const SPECIAL_TIMES = ['04:58', '07:45', '15:33', '16:33', '17:33', '19:45'];
const EPSILON = 1e-10;

function newKey(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

function buildTimeOptions(spacingMinutes: number, includeSpecial: boolean): string[] {
  const set = new Set<string>();
  for (let m = 0; m < 24 * 60; m += spacingMinutes) {
    set.add(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  if (includeSpecial) SPECIAL_TIMES.forEach((t) => set.add(t));
  return Array.from(set).sort();
}

/** DD/MM/YYYY -> Date */
function parseDisplayDate(value: string | undefined): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return isNaN(d.getTime()) ? null : d;
}

function toNumber(value: string | number | undefined | null): number {
  const n = parseFloat(String(value ?? ''));
  return isNaN(n) ? 0 : n;
}

/**
 * Xin nghỉ phép hàng loạt (chọn người duyệt tùy ý) - port giao diện + chức năng
 * từ WEB-INF/view/ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList.jsp
 * (dự án Hanwha_HAE) sang Angular + NG-ZORRO.
 * - Bảng jQuery DataTables + editable cell -> nz-table với ô nhập trực tiếp,
 *   sửa ô nào thì tự tick chọn dòng đó (giống modifyFlag ở bản cũ).
 * - "Thêm mới" không còn chèn dòng rỗng vào DB như bản cũ mà thêm dòng ở client.
 * - Các câu SQL gọi qua /hrm/recruitManage/doSql được thay bằng endpoint riêng.
 * Tái sử dụng: SstOtApplyService (tìm nhân viên), MyLeaveApplyListService (mã code),
 * AttendanceExForBatchService (cây phòng ban được phân quyền), ApplyAttBatchService
 * (import Excel/tải file mẫu), ApplyDetailModalComponent (xem chi tiết đơn).
 */
@Component({
  selector: 'app-apply-att-batch-approver',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ApplyDetailModalComponent,
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
    NzTooltipModule,
    NzTreeSelectModule,
  ],
  templateUrl: './apply-att-batch-approver.component.html',
  styleUrl: './apply-att-batch-approver.component.scss',
})
export class ApplyAttBatchApproverComponent implements OnInit {
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;
  protected readonly APPROV_TYPE_APPROVAL = APPROV_TYPE_APPROVAL;
  protected readonly APPROV_TYPE_NOTICE = APPROV_TYPE_NOTICE;
  /** Danh sách giờ trong bảng: cách 10 phút + mốc đặc biệt; thanh "Thực hiện tất cả": cách 30 phút */
  protected readonly rowTimeOptions = buildTimeOptions(10, true);
  protected readonly fillTimeOptions = buildTimeOptions(30, false);

  @ViewChild('aabaDetailModal') detailModal!: ApplyDetailModalComponent;

  private readonly service = inject(ApplyAttBatchApproverService);
  private readonly importService = inject(ApplyAttBatchService);
  private readonly codeService = inject(MyLeaveApplyListService);
  private readonly deptService = inject(AttendanceExForBatchService);
  private readonly empService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  // ── Điều kiện tìm kiếm ──
  protected readonly searchKeyword = signal('');
  protected readonly searchDeptNo = signal<string | null>(null);
  protected readonly searchStartDate = signal<Date | null>(new Date());
  protected readonly searchEndDate = signal<Date | null>(new Date());
  protected readonly searchShiftNo = signal<string | null>(null);
  protected readonly searchLeaveTypeCode = signal<string | null>(null);
  protected readonly searchAffirmFlag = signal<string | null>(null);
  protected readonly searchConfirmFlag = signal<string>('');

  // ── Thanh "Thực hiện tất cả" ──
  protected readonly fillLeaveTypeCode = signal<string | null>(null);
  protected readonly fillFromDate = signal<Date | null>(null);
  protected readonly fillFromTime = signal<string | null>(null);
  protected readonly fillReason = signal('');
  protected readonly fillToDate = signal<Date | null>(null);
  protected readonly fillToTime = signal<string | null>(null);

  // ── Danh mục ──
  protected readonly leaveTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly shiftTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly affirmFlagOptions = signal<SyCodeOption[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  // ── Dữ liệu bảng ──
  protected readonly rows = signal<RowVm[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);

  // ── Popup tìm nhân viên (dùng chung: ô tìm kiếm / mã NV dòng mới / người duyệt) ──
  protected readonly pickerVisible = signal(false);
  protected readonly pickerResults = signal<EmployeeSearchResult[]>([]);
  protected readonly pickerSearching = signal(false);
  private pickerTarget: PickerTarget = 'searchFilter';
  private pickerRowKey: string | null = null;
  private pickerApproverKey: string | null = null;
  private pickerTimer: ReturnType<typeof setTimeout> | undefined;

  // ── Import Excel ──
  protected readonly importVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  private readonly calcTokens = new Map<string, number>();
  private readonly timeOptionsCache = new Map<string, string[]>();
  private loadToken = 0;

  protected readonly selectableRows = computed(() => this.rows().filter((r) => !this.isRowDisabled(r)));
  protected readonly allChecked = computed(() => {
    const list = this.selectableRows();
    return list.length > 0 && list.every((r) => r.checked);
  });
  protected readonly someChecked = computed(() => !this.allChecked() && this.selectableRows().some((r) => r.checked));

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadOptions();
    await this.search();
  }

  private async loadOptions(): Promise<void> {
    const [leaveTypes, shiftTypes, affirmFlags, depts] = await Promise.all([
      this.codeService.getCodeList(LEAVE_TYPE_PARENT_CODE).catch(() => [] as SyCodeOption[]),
      this.codeService.getCodeList(SHIFT_TYPE_PARENT_CODE).catch(() => [] as SyCodeOption[]),
      this.codeService.getCodeList(AFFIRM_FLAG_PARENT_CODE).catch(() => [] as SyCodeOption[]),
      this.deptService.getAuthorizedDepartments().catch(() => [] as AuthorizedDeptNode[]),
    ]);
    this.leaveTypeOptions.set(leaveTypes);
    this.shiftTypeOptions.set(shiftTypes);
    this.affirmFlagOptions.set(affirmFlags);
    this.deptTreeNodes.set(this.buildDeptTree(depts));
  }

  /**
   * Dựng cây phòng ban từ danh sách phẳng {id, text, parent}. Viết lại (giống
   * AttendanceExForBatchComponent#buildDeptTree) vì hàm gốc là private trong
   * component khác, chưa có tiện ích dùng chung.
   */
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

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  leaveTypeName(code: string): string {
    const opt = this.leaveTypeOptions().find((o) => o.codeNo === code);
    return opt ? this.codeLabel(opt) : '';
  }

  /** Danh sách giờ có chứa giá trị hiện tại (giờ lẻ từ dữ liệu cũ vẫn hiển thị được) */
  timeOptionsFor(value: string): string[] {
    if (!value || this.rowTimeOptions.includes(value)) return this.rowTimeOptions;
    let cached = this.timeOptionsCache.get(value);
    if (!cached) {
      cached = [...this.rowTimeOptions, value].sort();
      this.timeOptionsCache.set(value, cached);
    }
    return cached;
  }

  isRowDisabled(row: RowVm): boolean {
    return DISABLED_AFFIRM_FLAGS.includes(row.affirmFlag);
  }

  // ── Định dạng ─────────────────────────────────────────────────────────────
  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
  }

  private toApiDateTime(date: Date | null, time: string): string {
    return date && time ? `${this.toApiDate(date)} ${time}` : '';
  }

  private displayDate(value: Date | null): string {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : '';
  }

  /** Hiển thị thời lượng giống callength(): x Ngày y Tiếng / x Phút (nghỉ phụ nữ) */
  durationText(row: RowVm): string {
    const len = toNumber(row.applyLength);
    const hourUnit = this.i18n.t('ar.viewitemparameter.title.xiaoshi', 'Tiếng');
    let text = '';
    if (row.leaveTypeCode === LEAVE_WOMEN) {
      if (len > 0) text = `${len} ${this.i18n.t('ar.viewitemparameter.title.fenzhong', 'Phút')}`;
    } else {
      const dayHours = toNumber(row.dayHours);
      if (dayHours > 0) {
        const days = Math.floor(len / dayHours);
        if (days > 0) text += `${days} ${this.i18n.t('ar.viewitemparameter.title.dayofunit', 'Ngày')} `;
        const hours = len % dayHours;
        if (Math.abs(hours) > EPSILON) text += `${hours.toFixed(1)} ${hourUnit}`;
      } else if (len > 0) {
        text = `${len} ${hourUnit}`;
      }
    }
    return text.trim() || `0 ${hourUnit}`;
  }

  private applyLengthDay(row: RowVm): number {
    const dayHours = toNumber(row.dayHours);
    return dayHours > 0 ? toNumber(row.applyLength) / dayHours : 0;
  }

  confirmText(row: RowVm): string {
    if (row.confirmFlag === CONFIRM_FLAG_ADOPT) return this.i18n.t('ess.title.RENSHITONGGUO', 'Nhân sự phê duyệt');
    if (row.confirmFlag === CONFIRM_FLAG_VETO) return this.i18n.t('ess.infoApply.veto', 'Từ chối');
    return this.i18n.t('ess.title.WEIQUEREN', 'Chưa xác nhận');
  }

  approversText(row: RowVm): string {
    return row.approvers
      .filter((a) => a.personId)
      .map((a) => a.localName || a.info)
      .join(' → ');
  }

  // ── Dòng dữ liệu ─────────────────────────────────────────────────────────
  private toRowVm(r: AttBatchApproverRow): RowVm {
    return {
      rowKey: r.applyNo ? `A${r.applyNo}` : newKey(),
      isNew: false,
      checked: false,
      applyNo: r.applyNo ?? '',
      personId: r.personId ?? '',
      empId: r.empId ?? '',
      localName: r.localName ?? '',
      deptName: r.deptName ?? '',
      shiftNoName: r.shiftNoName ?? '',
      applyTime: r.applyTime ?? '',
      totVacCnt: r.totVacCnt ?? '',
      shengyuVacCnt: r.shengyuVacCnt ?? '',
      leaveTypeCode: r.leaveTypeCode ?? '',
      leaveTypeCodeName: r.leaveTypeCodeName ?? '',
      fromDate: parseDisplayDate(r.fromDate),
      fromTime: r.fromTime ?? '',
      toDate: parseDisplayDate(r.toDate),
      toTime: r.toTime ?? '',
      applyLength: r.applyLength ?? '0',
      dayHours: r.dayHours ?? '',
      leaveReason: r.leaveReason ?? '',
      affirmFlag: r.affirmFlag ?? '',
      affirmFlagName: r.affirmFlagName ?? '',
      confirmFlag: r.confirmFlag ?? '',
      createdBy: r.createdBy ?? '',
      approvers: [],
      storedApprovers: false,
    };
  }

  private newEmptyRow(): RowVm {
    const today = new Date();
    return {
      ...this.toRowVm({}),
      rowKey: newKey(),
      isNew: true,
      fromDate: today,
      fromTime: DEFAULT_FROM_TIME,
      toDate: today,
      toTime: DEFAULT_TO_TIME,
      applyTime: this.displayDate(today),
    };
  }

  private toApproverVm(a: AttBatchAffirmor): ApproverVm {
    const info = [a.localName, a.positionName, a.deptName].map((v) => v ?? '').join('/');
    return {
      key: newKey(),
      personId: a.affirmPersonId || a.affirmorId || '',
      empId: a.empId ?? '',
      info,
      localName: a.localName ?? '',
      approvType: a.affirmType === APPROV_TYPE_NOTICE ? APPROV_TYPE_NOTICE : APPROV_TYPE_APPROVAL,
    };
  }

  private emptyApprover(): ApproverVm {
    return { key: newKey(), personId: '', empId: '', info: '', localName: '', approvType: APPROV_TYPE_APPROVAL };
  }

  private getRow(rowKey: string): RowVm | undefined {
    return this.rows().find((r) => r.rowKey === rowKey);
  }

  private patchRow(rowKey: string, patch: Partial<RowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
  }

  /** Sửa bất kỳ ô nào -> tự tick dòng đó (giống modifyFlag ở bản cũ) */
  private patchRowModified(rowKey: string, patch: Partial<RowVm>): void {
    this.patchRow(rowKey, { ...patch, checked: true });
  }

  // ── Tìm kiếm ─────────────────────────────────────────────────────────────
  async search(): Promise<void> {
    const token = ++this.loadToken;
    this.loading.set(true);
    try {
      const list = await this.service.getList({
        keyword: this.searchKeyword().trim() || undefined,
        deptNo: this.searchDeptNo() ?? undefined,
        shiftNo: this.searchShiftNo() ?? undefined,
        leaveTypeCode: this.searchLeaveTypeCode() ?? undefined,
        affirmFlag: this.searchAffirmFlag() ?? undefined,
        confirmFlag: this.searchConfirmFlag() || undefined,
        startDate: this.toApiDate(this.searchStartDate()) || undefined,
        endDate: this.toApiDate(this.searchEndDate()) || undefined,
      });
      if (token !== this.loadToken) return;
      this.rows.set(list.map((r) => this.toRowVm(r)));
      void this.loadStoredApprovers(token);
    } catch {
      if (token !== this.loadToken) return;
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      if (token === this.loadToken) this.loading.set(false);
    }
  }

  /** Nạp dây chuyền duyệt đã lưu của toàn bộ đơn (1 request), đơn chưa có thì lấy mặc định */
  private async loadStoredApprovers(token: number): Promise<void> {
    const applyNos = this.rows().map((r) => r.applyNo).filter(Boolean);
    if (!applyNos.length) return;
    let map: Record<string, AttBatchAffirmor[]> = {};
    try {
      map = await this.service.getAffirmors(applyNos);
    } catch {
      map = {};
    }
    if (token !== this.loadToken) return;
    this.rows.update((rows) =>
      rows.map((r) => {
        const list = map[r.applyNo];
        return list?.length ? { ...r, approvers: list.map((a) => this.toApproverVm(a)), storedApprovers: true } : r;
      }),
    );
    // Đơn chưa có người duyệt -> lấy dây chuyền mặc định (tuần tự để tránh dồn request)
    for (const row of this.rows().filter((r) => !r.storedApprovers && !this.isRowDisabled(r))) {
      if (token !== this.loadToken) return;
      await this.loadDefaultApprovers(row.rowKey);
    }
  }

  private async loadDefaultApprovers(rowKey: string): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row?.personId) return;
    try {
      const list = await this.service.getDefaultAffirmors(row.personId, row.leaveTypeCode, row.applyLength);
      this.patchRow(rowKey, { approvers: list.map((a) => this.toApproverVm(a)) });
    } catch {
      // Người dùng vẫn có thể tự thêm người duyệt
    }
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────
  addRow(): void {
    this.rows.update((rows) => [this.newEmptyRow(), ...rows]);
  }

  toggleAll(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => (this.isRowDisabled(r) ? r : { ...r, checked })));
  }

  toggleRow(rowKey: string, checked: boolean): void {
    this.patchRow(rowKey, { checked });
  }

  /** "Thực hiện tất cả" - áp giá trị ở thanh nhập nhanh cho các dòng đã chọn (fillItem) */
  async fillAll(): Promise<void> {
    const checked = this.rows().filter((r) => r.checked && !this.isRowDisabled(r));
    if (!checked.length) {
      this.message.error(this.i18n.t('ar.viewApplyAttenanceManagentInfoList.QINGXUANZEXIUGAINEIRONG.b', 'Xin chọn nội dung sửa'));
      return;
    }
    const leaveTypeCode = this.fillLeaveTypeCode();
    const reason = this.fillReason().trim();
    const fromDate = this.fillFromDate();
    const toDate = this.fillToDate();
    for (const row of checked) {
      const patch: Partial<RowVm> = {};
      if (leaveTypeCode) {
        patch.leaveTypeCode = leaveTypeCode;
        patch.leaveTypeCodeName = this.leaveTypeName(leaveTypeCode);
      }
      if (reason) patch.leaveReason = reason;
      if (fromDate && toDate) {
        patch.fromDate = fromDate;
        patch.toDate = toDate;
        patch.fromTime = this.fillFromTime() ?? '';
        patch.toTime = this.fillToTime() ?? '';
      }
      this.patchRow(row.rowKey, patch);
      await this.calcLength(row.rowKey);
    }
  }

  // ── Sửa ô trong bảng ─────────────────────────────────────────────────────
  async onLeaveTypeChange(rowKey: string, value: string | null): Promise<void> {
    const code = value ?? '';
    this.patchRowModified(rowKey, { leaveTypeCode: code, leaveTypeCodeName: this.leaveTypeName(code) });
    await this.calcLength(rowKey);
    const row = this.getRow(rowKey);
    if (row && !row.storedApprovers) await this.loadDefaultApprovers(rowKey);
  }

  async onFromDateChange(rowKey: string, value: Date | null): Promise<void> {
    this.patchRowModified(rowKey, { fromDate: value });
    await this.calcLength(rowKey);
    await this.loadEmpInfo(rowKey);
  }

  async onToDateChange(rowKey: string, value: Date | null): Promise<void> {
    this.patchRowModified(rowKey, { toDate: value });
    await this.calcLength(rowKey);
  }

  async onTimeChange(rowKey: string, field: 'fromTime' | 'toTime', value: string | null): Promise<void> {
    this.patchRowModified(rowKey, { [field]: value ?? '' } as Partial<RowVm>);
    await this.calcLength(rowKey);
  }

  onReasonChange(rowKey: string, value: string): void {
    this.patchRowModified(rowKey, { leaveReason: value });
  }

  /**
   * Tính lại thời lượng (callength): cảnh báo phép bệnh dài ngày, kiểm tra giới
   * tính theo loại nghỉ (getLeaveDateSST), rồi GET_AR_LEAVE_LENGTH + AR_GET_DAY_HOURS.
   */
  private async calcLength(rowKey: string): Promise<void> {
    let row = this.getRow(rowKey);
    if (!row?.personId) return;
    const token = (this.calcTokens.get(rowKey) ?? 0) + 1;
    this.calcTokens.set(rowKey, token);

    if (row.leaveTypeCode === LEAVE_LONG_SICK) {
      this.message.info(this.i18n.t('alert.message.ess.changQiBingJia', 'Lưu ý: Phép bệnh dài ngày chỉ áp dụng cho các bệnh nằm trong danh mục bệnh cần điều trị dài ngày'));
    }
    if (LEAVE_SEX_CHECK_TYPES.includes(row.leaveTypeCode)) {
      try {
        const res = await this.service.checkLeaveSex(row.personId, row.leaveTypeCode);
        if (this.calcTokens.get(rowKey) !== token) return;
        if (!res.valid && res.messageKey) {
          this.message.error(this.i18n.t(res.messageKey));
          this.patchRow(rowKey, { leaveTypeCode: '', leaveTypeCodeName: '' });
        }
      } catch {
        // Bỏ qua - backend kiểm tra lại khi lưu
      }
    }

    row = this.getRow(rowKey);
    if (!row?.fromDate || !row.toDate || !row.fromTime || !row.toTime) return;
    try {
      const res = await this.service.getLeaveLength(
        row.personId,
        this.toApiDateTime(row.fromDate, row.fromTime),
        this.toApiDateTime(row.toDate, row.toTime),
        row.leaveTypeCode,
      );
      if (this.calcTokens.get(rowKey) !== token) return;
      this.patchRow(rowKey, { applyLength: res.applyLength ?? '0', dayHours: res.dayHours ?? row.dayHours });
    } catch {
      if (this.calcTokens.get(rowKey) === token) this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  /** Phòng ban, ca, phép năm (tổng/còn lại) theo ngày bắt đầu (getAttendanceInformation) */
  private async loadEmpInfo(rowKey: string): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row?.personId || !row.fromDate) return;
    try {
      const info = await this.service.getEmpInfo(row.personId, this.toApiDate(row.fromDate));
      this.patchRow(rowKey, {
        deptName: info.deptName ?? row.deptName,
        shiftNoName: info.shiftNoName ?? '',
        totVacCnt: info.totVacCnt ?? '',
        shengyuVacCnt: info.shengyuVacCnt ?? '',
        dayHours: info.dayHours ?? row.dayHours,
      });
    } catch {
      // Không chặn thao tác
    }
  }

  // ── Mã nhân viên ở dòng mới (lookUp + getPersonCntByEmpid) ───────────────
  async onRowEmpEnter(rowKey: string, event: Event): Promise<void> {
    event.preventDefault();
    const keyword = (event.target as HTMLInputElement).value.trim();
    if (!keyword) {
      this.patchRow(rowKey, { personId: '', empId: '', localName: '', deptName: '' });
      return;
    }
    await this.lookupEmployee(keyword, (emp) => this.selectRowEmployee(rowKey, emp), 'rowEmployee', rowKey, null);
  }

  openRowEmployeePicker(rowKey: string): void {
    this.openPicker('rowEmployee', rowKey, null, []);
  }

  private async selectRowEmployee(rowKey: string, emp: EmployeeSearchResult): Promise<void> {
    this.patchRowModified(rowKey, {
      personId: emp.personId ?? '',
      empId: emp.empId ?? '',
      localName: emp.localName ?? '',
      deptName: emp.deptName ?? '',
    });
    await this.loadEmpInfo(rowKey);
    await this.calcLength(rowKey);
    await this.loadDefaultApprovers(rowKey);
  }

  // ── Dây chuyền duyệt ─────────────────────────────────────────────────────
  addApprover(rowKey: string, afterKey: string | null): void {
    const row = this.getRow(rowKey);
    if (!row) return;
    const list = [...row.approvers];
    const idx = afterKey ? list.findIndex((a) => a.key === afterKey) : -1;
    list.splice(idx + 1, 0, this.emptyApprover());
    this.patchRowModified(rowKey, { approvers: list });
  }

  removeApprover(rowKey: string, key: string): void {
    const row = this.getRow(rowKey);
    if (!row) return;
    this.patchRowModified(rowKey, { approvers: row.approvers.filter((a) => a.key !== key) });
  }

  private patchApprover(rowKey: string, key: string, patch: Partial<ApproverVm>): void {
    const row = this.getRow(rowKey);
    if (!row) return;
    this.patchRowModified(rowKey, { approvers: row.approvers.map((a) => (a.key === key ? { ...a, ...patch } : a)) });
  }

  onApproverTypeChange(rowKey: string, key: string, approvType: string): void {
    this.patchApprover(rowKey, key, { approvType });
  }

  onApproverEmpChange(rowKey: string, key: string, empId: string): void {
    // Đổi mã -> xóa người duyệt cũ cho tới khi Enter tra cứu lại
    this.patchApprover(rowKey, key, { empId, personId: '', info: '', localName: '' });
  }

  async onApproverEnter(rowKey: string, key: string, event: Event): Promise<void> {
    event.preventDefault();
    const keyword = (event.target as HTMLInputElement).value.trim();
    if (!keyword) {
      this.openPicker('approver', rowKey, key, []);
      return;
    }
    await this.lookupEmployee(keyword, async (emp) => this.selectApprover(rowKey, key, emp), 'approver', rowKey, key);
  }

  openApproverPicker(rowKey: string, key: string): void {
    this.openPicker('approver', rowKey, key, []);
  }

  private selectApprover(rowKey: string, key: string, emp: EmployeeSearchResult): void {
    this.patchApprover(rowKey, key, {
      personId: emp.personId ?? '',
      empId: emp.empId ?? '',
      localName: emp.localName ?? '',
      info: [emp.localName, emp.positionName, emp.deptName].map((v) => v ?? '').join('/'),
    });
  }

  // ── Popup tìm nhân viên ──────────────────────────────────────────────────
  openSearchEmployeePicker(): void {
    this.openPicker('searchFilter', null, null, []);
  }

  private openPicker(target: PickerTarget, rowKey: string | null, approverKey: string | null, results: EmployeeSearchResult[]): void {
    this.pickerTarget = target;
    this.pickerRowKey = rowKey;
    this.pickerApproverKey = approverKey;
    this.pickerResults.set(results);
    this.pickerVisible.set(true);
  }

  closePicker(): void {
    this.pickerVisible.set(false);
    this.pickerRowKey = null;
    this.pickerApproverKey = null;
  }

  /** Tìm theo mã/tên: đúng 1 kết quả -> chọn luôn, nhiều kết quả -> mở popup chọn */
  private async lookupEmployee(
    keyword: string,
    onSingle: (emp: EmployeeSearchResult) => Promise<void> | void,
    target: PickerTarget,
    rowKey: string | null,
    approverKey: string | null,
  ): Promise<void> {
    try {
      const results = await this.empService.searchEmployees(keyword);
      if (results.length === 1) {
        await onSingle(results[0]);
      } else if (!results.length) {
        this.message.warning(this.i18n.t('vpie.search.noResult', 'Không tìm thấy nhân viên phù hợp.'));
      } else {
        this.openPicker(target, rowKey, approverKey, results);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  onPickerSearch(keyword: string): void {
    if (this.pickerTimer) clearTimeout(this.pickerTimer);
    const kw = keyword.trim();
    if (!kw) return;
    this.pickerTimer = setTimeout(async () => {
      this.pickerSearching.set(true);
      try {
        this.pickerResults.set(await this.empService.searchEmployees(kw));
      } catch {
        this.pickerResults.set([]);
      } finally {
        this.pickerSearching.set(false);
      }
    }, 300);
  }

  async onPickerSelected(personId: string | null): Promise<void> {
    const emp = this.pickerResults().find((e) => e.personId === personId);
    if (!emp) return;
    const target = this.pickerTarget;
    const rowKey = this.pickerRowKey;
    const approverKey = this.pickerApproverKey;
    this.closePicker();
    if (target === 'searchFilter') {
      this.searchKeyword.set(emp.empId ?? '');
    } else if (target === 'rowEmployee' && rowKey) {
      await this.selectRowEmployee(rowKey, emp);
    } else if (target === 'approver' && rowKey && approverKey) {
      this.selectApprover(rowKey, approverKey, emp);
    }
  }

  // ── Xem chi tiết đơn (changeURL_ess3469) ─────────────────────────────────
  openDetail(row: RowVm): void {
    if (row.isNew || !row.applyNo) return;
    this.detailModal.open(row.applyNo, row.leaveTypeCode, null);
  }

  // ── Lưu (saveApplyAttenanceBatchInfo) ────────────────────────────────────
  private validateRow(row: RowVm): string | null {
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    if (!row.personId) return t('ar.viewarcardrecord.title.empidnotnull', 'Mã nhân viên không được trống!');
    if (row.affirmFlag && row.affirmFlag !== AFFIRM_FLAG_APPROVED) {
      return t('ar.viewApplyAttenanceManagentInfoList.SHENPIZHUANGTAIWEITONGGUO.b', 'Chỉ có thể lưu khi trạng thái phê duyệt là duyệt');
    }
    const len = toNumber(row.applyLength);
    if (len === 0) return t('ar.viewApplyAttenanceManagentInfoList.SHICHANGBUNENGDENGYULING.b', 'Thời lượng không được bằng 0');
    if (!row.fromDate || !row.fromTime) return t('ar.viewApplyAttenanceManagentInfoList.QINGQUEDINGKAISHIRIQI.b', 'Xin xác nhận ngày bắt đầu');
    if (!row.toDate || !row.toTime) return t('ar.viewApplyAttenanceManagentInfoList.QINGQUEDINGJIESHURIQI.b', 'Xin xác nhận ngày kết thúc');
    if (!row.approvers.some((a) => a.personId)) return t('alert.message.pleaseFirstSetRuler.b', 'Xin thiết lập người duyệt');
    if (!row.leaveTypeCode) return t('ar.viewApplyAttenanceManagentInfoList.KAOQINBUNENGWEIKONG.b', 'Trạng thái chấm công không được trống');
    if (row.leaveTypeCode === LEAVE_ANNUAL && len > toNumber(row.shengyuVacCnt) * toNumber(row.dayHours)) {
      return t('ar.viewApplyAttenanceManagentInfoList.NIANJIATIANSHUBUZU.b', 'Số ngày phép năm không đủ');
    }
    if (!row.leaveReason.trim()) return t('ga.viewApplyCard.APPLY_REASON_NOT_NULL.d', 'Không được để trống lý do đăng ký!');
    const lenDay = this.applyLengthDay(row);
    if (row.leaveTypeCode === LEAVE_WOMEN && len > 180) {
      return t('alert.message.ess.infoApply.womenDayCanNotExceedThreeHours', 'Nghỉ phụ nữ không được vượt quá 3 tiếng');
    }
    if (row.leaveTypeCode === LEAVE_MAX_1_DAY && lenDay > 1) {
      return `${t('ess.infoApplyAttendance.ATTENDANCE_DAY_CAN_NOT_GREATER_THAN', 'Thời gian nghỉ không được phép lớn hơn')} 1`;
    }
    if (row.leaveTypeCode === LEAVE_FUNERAL && lenDay > 5) {
      return t('alert.message.YOUXINSANGJIAZUIDUOSANTIAN.b', 'Nghỉ hiếu có lương tối đa 3 ngày!');
    }
    if (row.leaveTypeCode === LEAVE_BREASTFEED && lenDay < 8) {
      return t('ar.viewApplyAttenanceManagentInfoList.FANGJIAZUIXIAOYITIAN.b', 'Phép ít nhất là 1 ngày');
    }
    if (row.leaveTypeCode === LEAVE_MARRIAGE && lenDay > 5) {
      return t('alert.message.GERENHUNJIAZUIDUOSANTIAN.b', 'Nghỉ kết hôn tối đa 3 ngày!');
    }
    return null;
  }

  private toSaveItem(row: RowVm): AttBatchApproverSaveItem {
    return {
      applyNo: row.isNew ? '' : row.applyNo,
      personId: row.personId,
      empId: row.empId,
      localName: row.localName,
      leaveTypeCode: row.leaveTypeCode,
      leaveFromTime: this.toApiDateTime(row.fromDate, row.fromTime),
      leaveToTime: this.toApiDateTime(row.toDate, row.toTime),
      applyLength: String(row.applyLength ?? ''),
      leaveReason: row.leaveReason,
      approvers: row.approvers
        .filter((a) => a.personId)
        .map((a) => ({ personId: a.personId, empId: a.empId, localName: a.localName, approvType: a.approvType })),
    };
  }

  save(): void {
    const checked = this.rows().filter((r) => r.checked && !this.isRowDisabled(r));
    if (!checked.length) {
      this.message.error(this.i18n.t('ar.alert.message.viewardetail.choosetoadd', 'Xin chọn dữ liệu cần thêm'));
      return;
    }
    for (const row of checked) {
      const err = this.validateRow(row);
      if (err) {
        this.message.error(row.localName ? `${err} (${row.localName})` : err);
        return;
      }
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.alert.message.viewArAnnualStandard.consubmit', 'Đồng ý lưu không?'),
      nzOnOk: () => this.doSave(checked),
    });
  }

  private async doSave(rows: RowVm[]): Promise<void> {
    this.saving.set(true);
    try {
      const res = await this.service.save(rows.map((r) => this.toSaveItem(r)));
      if (res.success) {
        this.message.success(this.responseText(res, 'Lưu thành công!'));
        await this.search();
      } else {
        this.message.error(this.responseText(res, 'Lưu thất bại!'));
      }
    } catch {
      this.message.error(this.i18n.t('alert.message.add_fail', 'Lưu thất bại!'));
    } finally {
      this.saving.set(false);
    }
  }

  // ── Xóa (delLeaveApplyCallbackBatch) ─────────────────────────────────────
  delete(): void {
    const checked = this.rows().filter((r) => r.checked && !this.isRowDisabled(r));
    if (!checked.length) {
      this.message.error(this.i18n.t('alert.message.ess.affirmApply.chooseApplyRecordFirstForBatch', 'Lựa chọn danh sách đăng ký sau đó thực hiện hàng loạt!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewApplyAttenanceManagentInfoList.QUEDINGPILIANGQUXIAOMA.b', 'Đồng ý hủy bỏ không?'),
      nzOnOk: () => this.doDelete(checked),
    });
  }

  private async doDelete(rows: RowVm[]): Promise<void> {
    const newKeys = new Set(rows.filter((r) => r.isNew).map((r) => r.rowKey));
    const applyNos = rows.filter((r) => !r.isNew && r.applyNo).map((r) => r.applyNo);
    // Dòng chưa lưu chỉ cần bỏ khỏi bảng
    if (newKeys.size) this.rows.update((list) => list.filter((r) => !newKeys.has(r.rowKey)));
    if (!applyNos.length) return;
    this.deleting.set(true);
    try {
      const res = await this.service.delete(applyNos);
      if (res.success) {
        this.message.success(this.responseText(res, 'Xóa thành công!'));
        await this.search();
      } else {
        this.message.error(this.responseText(res, 'Xóa thất bại!'));
      }
    } catch {
      this.message.error(this.i18n.t('alert.message.delete_fail', 'Xóa thất bại!'));
    } finally {
      this.deleting.set(false);
    }
  }

  private responseText(res: AttBatchApproverResponse, fallback: string): string {
    let text = res.messageKey ? this.i18n.t(res.messageKey, fallback) : fallback;
    if (res.suffix) text += ` (${res.suffix})`;
    if (res.message) text += `: ${res.message}`;
    return text;
  }

  // ── Excel ────────────────────────────────────────────────────────────────
  downloadTemplate(): void {
    window.location.href = DOWNLOAD_TEMPLATE_URL;
  }

  openImport(): void {
    this.importFile.set(null);
    this.importVisible.set(true);
  }

  closeImport(): void {
    this.importVisible.set(false);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile.set(input.files?.length ? input.files[0] : null);
  }

  async submitImport(): Promise<void> {
    const file = this.importFile();
    if (!file) return;
    this.importing.set(true);
    try {
      const res = await this.importService.importTemplate(file);
      this.importVisible.set(false);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('ess.title.DAORUJIEGUO', 'Kết quả nhập'));
      } else {
        this.message.warning(res.message || this.i18n.t('ess.title.DAORUJIEGUO', 'Kết quả nhập'));
      }
      // Mở màn hình kết quả nhập (viewImportAttendanceTempList) giống bản cũ
      window.open('/ar/attendanceMintenance/viewImportAttendanceTempList', '_blank');
      await this.search();
    } catch {
      this.message.error(this.i18n.t('alert.message.add_fail', 'Lưu thất bại!'));
    } finally {
      this.importing.set(false);
    }
  }

  exportExcel(): void {
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    const header = [
      'NO',
      t('ess.infoApply.NAME', 'Họ tên'),
      t('ess.infoApply.EMPID', 'Mã nhân viên'),
      t('ess.infoApply.DEPT', 'Phòng ban'),
      t('hr.viewPersonalInfo.title.banzu', 'Ca'),
      t('ess.empInfo.date_application', 'Thời gian'),
      t('ess.infoApply.sum_year_leave_days', 'Tổng phép năm'),
      t('ess.infoApply.nianjiashengyu', 'Còn lại'),
      t('ess.infoApply.attendState', 'Phân loại'),
      t('org.title.STARTDATE', 'Ngày bắt đầu'),
      t('ess.infoApply.title.startTime', 'Thời gian bắt đầu'),
      t('hr.viewTranslate.title.PUBLIC_END_DATE', 'Ngày kết thúc'),
      t('ess.infoApply.end_time', 'Thời gian kết thúc'),
      t('ess.infoApply.duration', 'Thời lượng'),
      t('ess.infoApply.Reason', 'Lý do'),
      t('hrm.contractInfo.APPROVAL_PERSON', 'Người duyệt'),
      t('ess.infoApply.approval_status', 'Trạng thái duyệt'),
      t('hrm.contract.creator', 'Người tạo'),
    ];
    const data = this.rows().map((r, idx) => [
      idx + 1,
      r.localName,
      r.empId,
      r.deptName,
      r.shiftNoName,
      r.applyTime,
      r.totVacCnt,
      r.shengyuVacCnt,
      r.leaveTypeCodeName || this.leaveTypeName(r.leaveTypeCode),
      this.displayDate(r.fromDate),
      r.fromTime,
      this.displayDate(r.toDate),
      r.toTime,
      this.durationText(r),
      r.leaveReason,
      this.approversText(r),
      r.isNew ? '' : `${r.affirmFlagName} ${this.confirmText(r)}`.trim(),
      r.createdBy,
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'apply_att_batch_by_any_approver.xlsx');
  }
}
