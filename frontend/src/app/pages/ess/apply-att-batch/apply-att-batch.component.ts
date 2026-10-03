import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { ApplyDetailModalComponent } from '../../../shared/apply-detail-modal/apply-detail-modal.component';
import { EmployeeSearchResult, SstOtApplyService } from '../sst-ot-apply/sst-ot-apply.service';
import { LEAVE_TYPE_PARENT_CODE, MyLeaveApplyListService, SyCodeOption } from '../my-leave-apply-list/my-leave-apply-list.service';
import {
  ApplyAttBatchService,
  ApproverInput,
  AttBatchFilter,
  AttBatchRow,
  AttBatchSavePayload,
  DOWNLOAD_TEMPLATE_URL,
} from './apply-att-batch.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface AttRowVm {
  rowKey: string;
  isNew: boolean;
  checked: boolean;
  applyNo: string | number;
  personId: string;
  empId: string;
  localName: string;
  deptName: string;
  annualLeaveCount: string;
  shiftName: string;
  leaveTypeCode: string;
  leaveFromTime: Date | null;
  leaveToTime: Date | null;
  applyLength: string;
  dayHours: string;
  leaveReason: string;
  affirmFlag: string;
  affirmStr: string;
  sexCode: string;
  createdBy: string;
  createDate: string;
  updatedBy: string;
  updateDate: string;
  approvers: ApproverInput[];
}

type PickerTarget = 'searchFilter' | 'rowEmployee' | 'approver';

const FEMALE_ONLY_LEAVE_TYPES = ['141474', '27'];
const WOMEN_LEAVE_TYPE = '141474';
const ANNUAL_LEAVE_TYPE = '26';
const FEMALE_SEX_CODE = '1325';
const APPROVED_FLAG = '14014308';

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
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : d;
}

function newRowId(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function formatDuration(applyLength: string, dayHours: string, i18n: I18nService): string {
  const len = parseFloat(applyLength);
  const dh = parseFloat(dayHours);
  if (isNaN(len) || isNaN(dh) || dh === 0) {
    return applyLength || '';
  }
  const days = Math.floor(len / dh);
  const hours = len - days * dh;
  let text = '';
  if (days > 0) text += `${days} ${i18n.t('al.js.day', 'Ngày')}`;
  if (hours > 0) text += (text ? ' ' : '') + `${hours} ${i18n.t('al.js.hour', 'Giờ')}`;
  return text || String(len);
}

/**
 * HR/quản lý xem+xin nghỉ phép hàng loạt thay bất kỳ nhân viên nào - port lại
 * từ ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList.html (đã xoá)
 * sang Angular + NG-ZORRO, dùng nz-table thay jQuery DataTables. Cấu trúc
 * gần giống Batch K (ApplyOtBatchComponent) nhưng đơn giản hơn (không có
 * auto-fill theo ca/tổng tăng ca/xe đưa đón). LƯU Ý: mapper
 * `selectLeaveLengthForPerson` chỉ trả về LEAVE_LENGTH, không có DAY_HOURS -
 * giống hệt bản gốc, nghĩa là 2 validate "vượt quá số ngày phép còn lại" và
 * "phải là bội số nửa ngày" (chỉ áp dụng khi dayHours>0) không bao giờ thực
 * sự kích hoạt được ở trang này - giữ nguyên hành vi này (lỗi có sẵn ở bản
 * gốc, không tự ý sửa vì cần đổi API mới đúng ý đồ, ngoài phạm vi migrate).
 * Tìm nhân viên/xem chi tiết đơn tái sử dụng SstOtApplyService/
 * ApplyDetailModalComponent (variant="leave"); danh sách loại nghỉ tái sử
 * dụng MyLeaveApplyListService.
 */
@Component({
  selector: 'app-apply-att-batch',
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
    NzTagModule,
  ],
  templateUrl: './apply-att-batch.component.html',
  styleUrl: './apply-att-batch.component.scss',
})
export class ApplyAttBatchComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  @ViewChild('detailModal') detailModal!: ApplyDetailModalComponent;

  private readonly service = inject(ApplyAttBatchService);
  private readonly leaveTypeService = inject(MyLeaveApplyListService);
  private readonly otService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpKeyword = signal('');
  protected readonly searchFromDate = signal<Date | null>(null);
  protected readonly searchToDate = signal<Date | null>(null);
  protected readonly searchAffirmFlag = signal<string | null>(null);
  protected readonly searchConfirmFlag = signal<string | null>(null);
  protected readonly searchLeaveTypeCode = signal<string | null>(null);

  protected readonly leaveTypeOptions = signal<SyCodeOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly cancelling = signal(false);
  protected readonly rows = signal<AttRowVm[]>([]);

  protected readonly pickerVisible = signal(false);
  protected readonly pickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly pickerSearching = signal(false);
  private pickerTarget: PickerTarget = 'searchFilter';
  private activeRowKey: string | null = null;
  private pickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  private calcTokens = new Map<string, number>();

  protected readonly allChecked = computed(() => {
    const cancelable = this.rows().filter((r) => this.isCancelable(r));
    return cancelable.length > 0 && cancelable.every((r) => r.checked);
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const { from, to } = currentWeekRange();
    this.searchFromDate.set(from);
    this.searchToDate.set(to);
    try {
      this.leaveTypeOptions.set(await this.leaveTypeService.getCodeList(LEAVE_TYPE_PARENT_CODE));
    } catch {
      this.leaveTypeOptions.set([]);
    }
    await this.search();
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  isCancelable(row: AttRowVm): boolean {
    return !row.isNew && row.affirmFlag === APPROVED_FLAG;
  }

  formatDuration(row: AttRowVm): string {
    return formatDuration(row.applyLength, row.dayHours, this.i18n);
  }

  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
  }

  private toApiDateTime(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd HH:mm', 'en-US') : '';
  }

  private toRowVm(r: AttBatchRow): AttRowVm {
    return {
      rowKey: String(r.applyNo ?? ''),
      isNew: false,
      checked: false,
      applyNo: r.applyNo ?? '',
      personId: r.personId ?? '',
      empId: r.empId ?? '',
      localName: r.localName ?? '',
      deptName: r.deptName ?? '',
      annualLeaveCount: r.annualLeaveCount ?? '0',
      shiftName: r.shiftName ?? '',
      leaveTypeCode: r.leaveTypeCode ?? '',
      leaveFromTime: parseApiDateTime(r.leaveFromTime),
      leaveToTime: parseApiDateTime(r.leaveToTime),
      applyLength: r.applyLength ?? '0',
      dayHours: r.dayHours ?? '0',
      leaveReason: r.leaveReason ?? '',
      affirmFlag: r.affirmFlag ?? '',
      affirmStr: r.affirmStr ?? '',
      sexCode: r.sexCode ?? '',
      createdBy: r.createdBy ?? '',
      createDate: r.createDate ?? '',
      updatedBy: r.updatedBy ?? '',
      updateDate: r.updateDate ?? '',
      approvers: [],
    };
  }

  private newEmptyRow(): AttRowVm {
    return {
      rowKey: newRowId(),
      isNew: true,
      checked: false,
      applyNo: '',
      personId: '',
      empId: '',
      localName: '',
      deptName: '',
      annualLeaveCount: '0',
      shiftName: '',
      leaveTypeCode: '',
      leaveFromTime: null,
      leaveToTime: null,
      applyLength: '0',
      dayHours: '0',
      leaveReason: '',
      affirmFlag: '',
      affirmStr: '',
      sexCode: '',
      createdBy: '',
      createDate: '',
      updatedBy: '',
      updateDate: '',
      approvers: [],
    };
  }

  updateRow(rowKey: string, patch: Partial<AttRowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
  }

  private getRow(rowKey: string): AttRowVm | undefined {
    return this.rows().find((r) => r.rowKey === rowKey);
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const filter: AttBatchFilter = {
        keyword: this.searchEmpKeyword() || undefined,
        fromDate: this.toApiDate(this.searchFromDate()),
        toDate: this.toApiDate(this.searchToDate()),
        affirmFlag: this.searchAffirmFlag() ?? undefined,
        confirmFlag: this.searchConfirmFlag() ?? undefined,
        leaveTypeCode: this.searchLeaveTypeCode() ?? undefined,
      };
      const rows = await this.service.getList(filter);
      this.rows.set(rows.map((r) => this.toRowVm(r)));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.searchEmpKeyword.set('');
    const { from, to } = currentWeekRange();
    this.searchFromDate.set(from);
    this.searchToDate.set(to);
    this.searchAffirmFlag.set(null);
    this.searchConfirmFlag.set(null);
    this.searchLeaveTypeCode.set(null);
    this.search();
  }

  addEmptyRow(): void {
    this.rows.update((rows) => [this.newEmptyRow(), ...rows]);
  }

  removeNewRow(rowKey: string): void {
    this.rows.update((rows) => rows.filter((r) => r.rowKey !== rowKey));
  }

  // ── Employee picker (dùng chung cho lọc tìm kiếm / chọn NV dòng mới / thêm người duyệt) ──
  openSearchEmployeePicker(): void {
    this.pickerTarget = 'searchFilter';
    this.activeRowKey = null;
    this.pickerSearchResults.set([]);
    this.pickerVisible.set(true);
  }

  openRowEmployeePicker(rowKey: string): void {
    this.pickerTarget = 'rowEmployee';
    this.activeRowKey = rowKey;
    this.pickerSearchResults.set([]);
    this.pickerVisible.set(true);
  }

  openApproverModal(rowKey: string): void {
    this.pickerTarget = 'approver';
    this.activeRowKey = rowKey;
    this.pickerSearchResults.set([]);
    this.pickerVisible.set(true);
  }

  closePicker(): void {
    this.pickerVisible.set(false);
    this.activeRowKey = null;
  }

  onPickerSearch(keyword: string): void {
    if (this.pickerSearchTimer) {
      clearTimeout(this.pickerSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.pickerSearchResults.set([]);
      return;
    }
    this.pickerSearchTimer = setTimeout(async () => {
      this.pickerSearching.set(true);
      try {
        this.pickerSearchResults.set(await this.otService.searchEmployees(kw));
      } catch {
        this.pickerSearchResults.set([]);
      } finally {
        this.pickerSearching.set(false);
      }
    }, 300);
  }

  async onPickerSelected(personId: string | null): Promise<void> {
    if (!personId) return;
    const emp = this.pickerSearchResults().find((e) => e.personId === personId);
    if (!emp) return;

    if (this.pickerTarget === 'searchFilter') {
      this.searchEmpKeyword.set(emp.empId ?? '');
      this.closePicker();
      return;
    }

    if (this.pickerTarget === 'rowEmployee' && this.activeRowKey) {
      const rowKey = this.activeRowKey;
      this.closePicker();
      await this.selectRowEmployee(rowKey, emp);
      return;
    }

    if (this.pickerTarget === 'approver' && this.activeRowKey) {
      const rowKey = this.activeRowKey;
      this.rows.update((rows) =>
        rows.map((r) =>
          r.rowKey === rowKey
            ? { ...r, approvers: [...r.approvers, { personId: emp.personId ?? '', localName: emp.localName ?? '', empId: emp.empId ?? '' }] }
            : r,
        ),
      );
      this.closePicker();
    }
  }

  private async selectRowEmployee(rowKey: string, emp: EmployeeSearchResult): Promise<void> {
    this.updateRow(rowKey, { personId: emp.personId ?? '', empId: emp.empId ?? '', localName: emp.localName ?? '' });
    await this.loadEmpDefaultInfo(rowKey, emp.personId ?? '');
  }

  async onRowEmpKeywordEnter(rowKey: string, event: Event): Promise<void> {
    event.preventDefault();
    const keyword = (event.target as HTMLInputElement).value.trim();
    if (!keyword) return;
    try {
      const results = await this.otService.searchEmployees(keyword);
      if (results.length === 1) {
        await this.selectRowEmployee(rowKey, results[0]);
      } else if (results.length === 0) {
        this.message.warning(this.i18n.t('vpie.search.noResult', 'Không tìm thấy nhân viên phù hợp.'));
      } else {
        this.pickerTarget = 'rowEmployee';
        this.activeRowKey = rowKey;
        this.pickerSearchResults.set(results);
        this.pickerVisible.set(true);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  removeApprover(rowKey: string, index: number): void {
    this.rows.update((rows) =>
      rows.map((r) => (r.rowKey === rowKey ? { ...r, approvers: r.approvers.filter((_, i) => i !== index) } : r)),
    );
  }

  private async loadEmpDefaultInfo(rowKey: string, personId: string): Promise<void> {
    if (!personId) return;
    try {
      const data = await this.service.getEmpDefaultInfo(personId);
      const patch: Partial<AttRowVm> = {
        deptName: data.DEPT_NAME ?? '',
        annualLeaveCount: data.VAC_COUNT ?? '0',
        shiftName: data.SHIFT_NAME ?? '',
        sexCode: data.SEXCODE ?? '',
      };
      if (data.START_TIME) patch.leaveFromTime = parseApiDateTime(data.START_TIME);
      if (data.END_TIME) patch.leaveToTime = parseApiDateTime(data.END_TIME);
      this.updateRow(rowKey, patch);
      await this.calcLeaveLength(rowKey);
    } catch {
      // Bỏ qua - người dùng vẫn có thể tự nhập tay.
    }
  }

  private async calcLeaveLength(rowKey: string): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row || !row.personId || !row.leaveFromTime || !row.leaveToTime || !row.leaveTypeCode) return;
    const token = (this.calcTokens.get(rowKey) ?? 0) + 1;
    this.calcTokens.set(rowKey, token);
    try {
      const res = await this.service.calcLeaveLength(
        row.personId,
        this.toApiDateTime(row.leaveFromTime),
        this.toApiDateTime(row.leaveToTime),
        row.leaveTypeCode,
      );
      if (this.calcTokens.get(rowKey) !== token) return;
      this.updateRow(rowKey, { applyLength: String(res.LEAVE_LENGTH ?? '0') });
    } catch {
      if (this.calcTokens.get(rowKey) !== token) return;
    }
  }

  async onLeaveTypeChange(rowKey: string, value: string | null): Promise<void> {
    this.updateRow(rowKey, { leaveTypeCode: value ?? '' });
    await this.calcLeaveLength(rowKey);
  }

  async onFromTimeChange(rowKey: string, value: Date | null): Promise<void> {
    this.updateRow(rowKey, { leaveFromTime: value });
    await this.calcLeaveLength(rowKey);
  }

  async onToTimeChange(rowKey: string, value: Date | null): Promise<void> {
    this.updateRow(rowKey, { leaveToTime: value });
    await this.calcLeaveLength(rowKey);
  }

  toggleAll(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => (this.isCancelable(r) ? { ...r, checked } : r)));
  }

  openDetail(row: AttRowVm): void {
    if (row.isNew || !row.applyNo) return;
    this.detailModal.open(String(row.applyNo), row.leaveTypeCode, null);
  }

  // ── Validate ─────────────────────────────────────────────────────────────
  private validateLeaveRow(row: AttRowVm): string | null {
    const len = parseFloat(row.applyLength);
    if (isNaN(len) || len <= 0) {
      return this.i18n.t('sa.msg.durationZero', 'Thời lượng phải lớn hơn 0!');
    }
    if (FEMALE_ONLY_LEAVE_TYPES.includes(row.leaveTypeCode) && row.sexCode !== FEMALE_SEX_CODE) {
      return this.i18n.t('sa.msg.womenOnlyLeave', 'Chỉ nhân viên nữ mới được chọn loại nghỉ phép này!');
    }
    if (row.leaveTypeCode === WOMEN_LEAVE_TYPE && len >= 3) {
      return this.i18n.t('sa.msg.womenLeaveMax3h', 'Nghỉ phụ nữ không được vượt quá 3 tiếng (180 phút)!');
    }
    const dh = parseFloat(row.dayHours);
    if (row.leaveTypeCode === ANNUAL_LEAVE_TYPE && !isNaN(dh) && dh > 0) {
      const durationDays = len / dh;
      const remainVac = parseFloat(row.annualLeaveCount);
      if (!isNaN(remainVac) && durationDays > remainVac) {
        return this.i18n.t('sa.msg.durationExceedsRemain', 'Thời lượng vượt quá số ngày phép còn lại!');
      }
      const halfDayRem = (durationDays * 2) % 1;
      if (halfDayRem > 0.01 && halfDayRem < 0.99) {
        return this.i18n.t('sa.msg.annualLeaveHalfDay', 'Thời lượng nghỉ phép năm phải là bội số của nửa ngày (0.5, 1, 1.5, ...)!');
      }
    }
    return null;
  }

  private buildPayload(row: AttRowVm, includeApprovers: boolean): AttBatchSavePayload {
    const payload: AttBatchSavePayload = {
      personId: row.personId,
      localName: row.localName,
      leaveTypeCode: row.leaveTypeCode,
      leaveFromTime: this.toApiDateTime(row.leaveFromTime),
      leaveToTime: this.toApiDateTime(row.leaveToTime),
      applyLength: row.applyLength,
      leaveReason: row.leaveReason,
    };
    if (row.applyNo) payload.applyNo = row.applyNo;
    if (includeApprovers) payload.approvers = row.approvers.map((a) => ({ personId: a.personId, localName: a.localName, empId: a.empId }));
    return payload;
  }

  private hasTimeOverlap(rows: AttRowVm[]): boolean {
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i];
        const b = rows[j];
        if (a.personId !== b.personId) continue;
        if (!a.leaveFromTime || !a.leaveToTime || !b.leaveFromTime || !b.leaveToTime) continue;
        if (a.leaveFromTime.getTime() < b.leaveToTime.getTime() && b.leaveFromTime.getTime() < a.leaveToTime.getTime()) {
          return true;
        }
      }
    }
    return false;
  }

  async saveAll(): Promise<void> {
    const newRows = this.rows().filter((r) => r.isNew);
    const resubmitRows = this.rows().filter((r) => this.isCancelable(r) && r.checked);

    for (const row of newRows) {
      if (!row.personId) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingEmp', 'Chưa chọn nhân viên!'));
        return;
      }
      if (!row.leaveTypeCode) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingType', 'Chưa chọn loại nghỉ!'));
        return;
      }
      if (!row.leaveFromTime) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingFrom', 'Chưa chọn Từ lúc!'));
        return;
      }
      if (!row.leaveToTime) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingTo', 'Chưa chọn Đến lúc!'));
        return;
      }
      if (!row.approvers.length) {
        this.message.warning(this.i18n.t('sa.msg.requireApprover', 'Vui lòng thêm ít nhất một người phê duyệt!'));
        return;
      }
      const err = this.validateLeaveRow(row);
      if (err) {
        this.message.warning(err);
        return;
      }
    }
    for (const row of resubmitRows) {
      if (!row.personId) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingEmp', 'Chưa chọn nhân viên!'));
        return;
      }
      if (!row.leaveTypeCode) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingType', 'Chưa chọn loại nghỉ!'));
        return;
      }
      if (!row.leaveFromTime) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingFrom', 'Chưa chọn Từ lúc!'));
        return;
      }
      if (!row.leaveToTime) {
        this.message.warning(this.i18n.t('applyAtt.msg.missingTo', 'Chưa chọn Đến lúc!'));
        return;
      }
    }

    if (!newRows.length && !resubmitRows.length) {
      this.message.info(this.i18n.t('applyAtt.msg.noRowsToSave', 'Không có dòng mới và không có đơn đã duyệt nào được chọn để lưu!'));
      return;
    }

    if (this.hasTimeOverlap([...newRows, ...resubmitRows])) {
      this.message.error(this.i18n.t('arOtf.msg.timeOverlap', 'Các dòng dữ liệu bị trùng nhau về thời gian, xin kiểm tra lại!'));
      return;
    }

    if (resubmitRows.length > 0) {
      const ok = await this.confirmAsync(
        this.i18n
          .t('applyAtt.msg.confirmResubmitBatch', 'Bạn có chắc chắn muốn lưu lại {n} đơn đã duyệt? Hệ thống sẽ xóa đơn cũ và tạo mới đơn với thông tin đã chỉnh sửa.')
          .replace('{n}', String(resubmitRows.length)),
      );
      if (!ok) return;
    }

    this.saving.set(true);
    try {
      const errors: string[] = [];
      for (const row of newRows) {
        const res = await this.service.save(this.buildPayload(row, true));
        if (!res.success) errors.push(res.error || this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
      }
      for (const row of resubmitRows) {
        const res = await this.service.resubmit(this.buildPayload(row, false));
        if (!res.success) errors.push(res.error || this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
      }
      if (errors.length) {
        errors.forEach((e) => this.message.error(e));
      } else {
        this.message.success(this.i18n.t('applyAtt.msg.saveAllSuccess', 'Lưu tất cả thành công!'));
        await this.search();
      }
    } finally {
      this.saving.set(false);
    }
  }

  cancelSelected(): void {
    const checked = this.rows().filter((r) => this.isCancelable(r) && r.checked);
    if (!checked.length) {
      this.message.warning(this.i18n.t('applyAtt.msg.selectCancelRow', 'Vui lòng chọn đơn cần hủy!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('applyAtt.msg.confirmCancelSelected', 'Bạn có chắc chắn muốn hủy đơn đã chọn không?'),
      nzOnOk: () => this.doCancelSelected(checked.map((r) => r.applyNo)),
    });
  }

  private async doCancelSelected(applyNos: (string | number)[]): Promise<void> {
    this.cancelling.set(true);
    try {
      const errors: string[] = [];
      for (const applyNo of applyNos) {
        const res = await this.service.cancel(applyNo);
        if (!res.success) errors.push(res.error || this.i18n.t('arOtf.msg.cancelError', 'Lỗi khi gửi yêu cầu hủy đơn'));
      }
      if (errors.length) {
        errors.forEach((e) => this.message.error(e));
      } else {
        this.message.success(this.i18n.t('applyAtt.msg.cancelAllSuccess', 'Hủy đơn thành công!'));
        await this.search();
      }
    } finally {
      this.cancelling.set(false);
    }
  }

  resubmitLine(rowKey: string): void {
    const row = this.getRow(rowKey);
    if (!row) return;
    if (!row.personId) {
      this.message.warning(this.i18n.t('applyAtt.msg.missingEmp', 'Chưa chọn nhân viên!'));
      return;
    }
    if (!row.leaveTypeCode) {
      this.message.warning(this.i18n.t('applyAtt.msg.missingType', 'Chưa chọn loại nghỉ!'));
      return;
    }
    if (!row.leaveFromTime) {
      this.message.warning(this.i18n.t('applyAtt.msg.missingFrom', 'Chưa chọn Từ lúc!'));
      return;
    }
    if (!row.leaveToTime) {
      this.message.warning(this.i18n.t('applyAtt.msg.missingTo', 'Chưa chọn Đến lúc!'));
      return;
    }
    const err = this.validateLeaveRow(row);
    if (err) {
      this.message.warning(err);
      return;
    }

    this.modal.confirm({
      nzTitle: this.i18n.t('applyAtt.msg.confirmResubmitLine', 'Bạn có chắc chắn muốn lưu lại đơn này? Hệ thống sẽ xóa đơn cũ và tạo mới đơn với thông tin đã chỉnh sửa.'),
      nzOnOk: () => this.doResubmitLine(rowKey),
    });
  }

  private async doResubmitLine(rowKey: string): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row) return;
    try {
      const res = await this.service.resubmit(this.buildPayload(row, false));
      if (res.success) {
        this.message.success(res.message || this.i18n.t('applyAtt.msg.resubmitLineSuccess', 'Lưu lại đơn thành công!'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
      }
    } catch {
      this.message.error(this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
    }
  }

  private confirmAsync(title: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: title,
        nzOnOk: () => resolve(true),
        nzOnCancel: () => resolve(false),
      });
    });
  }

  // ── Import / export Excel ───────────────────────────────────────────────
  downloadTemplate(): void {
    window.location.href = DOWNLOAD_TEMPLATE_URL;
  }

  openImportModal(): void {
    this.importFile.set(null);
    this.importModalVisible.set(true);
  }

  closeImportModal(): void {
    this.importModalVisible.set(false);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile.set(input.files && input.files.length ? input.files[0] : null);
  }

  async submitImport(): Promise<void> {
    const file = this.importFile();
    if (!file) return;
    this.importing.set(true);
    try {
      const res = await this.service.importTemplate(file);
      this.importModalVisible.set(false);
      if (res.success) {
        this.message.success(res.message || 'Import thành công!');
      } else {
        this.message.warning(res.message || 'Import hoàn tất nhưng có lỗi.');
      }
      window.open('/ar/attendanceMintenance/viewImportAttendanceTempList', '_blank');
      await this.search();
    } catch {
      this.message.error(this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
    } finally {
      this.importing.set(false);
    }
  }
}
