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
import {
  ApproverInput,
  ApplyOtBatchService,
  DOWNLOAD_TEMPLATE_URL,
  OtBatchFilter,
  OtBatchRow,
  OtBatchSavePayload,
} from './apply-ot-batch.service';
import { EmployeeSearchResult, SstOtApplyService, SyCodeOption } from '../sst-ot-apply/sst-ot-apply.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface OtRowVm {
  rowKey: string;
  isNew: boolean;
  checked: boolean;
  applyNo: string;
  personId: string;
  empId: string;
  localName: string;
  deptName: string;
  otTypeCode: string;
  otTypeName: string;
  applyOtDate: Date | null;
  otFromTime: Date | null;
  otToTime: Date | null;
  indoorTime: string;
  outdoorTime: string;
  otApplyHour: string;
  deductYn: boolean;
  applyOtRemark: string;
  usecarYn: boolean;
  carAddress: string;
  carAddressName: string;
  carAddressDetail: string;
  carAddressDetailName: string;
  carAddressDetailOptions: SyCodeOption[];
  otTotalMonth: string;
  otTotalYear: string;
  affirmFlag: string;
  affirmStr: string;
  createdBy: string;
  createDate: string;
  updatedBy: string;
  updateDate: string;
  postFamily: string;
  shiftEndTime: string;
  approvers: ApproverInput[];
}

type PickerTarget = 'searchFilter' | 'rowEmployee' | 'approver';

const CANCELABLE_FLAGS = ['14014306', '14014307', '14014308'];

function currentWeekRange(): { from: Date; to: Date } {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day + 7);
  return { from: monday, to: sunday };
}

function parseApiDate(value: string | undefined): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d.getTime()) ? null : d;
}

function parseApiDateTime(value: string | undefined): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : d;
}

function calcApplyHour(from: Date | null, to: Date | null): string {
  if (!from || !to) return '';
  let end = to;
  if (end.getTime() < from.getTime()) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }
  const diffMinutes = Math.round((end.getTime() - from.getTime()) / 60000);
  if (diffMinutes < 0) return '';
  const hours = diffMinutes / 60;
  return hours.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0$/, '$1');
}

function newRowId(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/**
 * HR/quản lý xem+xin tăng ca hàng loạt thay bất kỳ nhân viên nào - port lại
 * từ ess/infoApply/viewApplyOtLBatchByAnyApproverList.html (đã xoá) sang
 * Angular + NG-ZORRO, dùng nz-table thay jQuery DataTables. LƯU Ý: 2 bộ lọc
 * "Trạng thái đơn tăng ca"/"Trạng thái xác nhận" (affirmFlag/confirmFlag)
 * tồn tại y hệt ở bản gốc nhưng KHÔNG có tác dụng thực sự - endpoint
 * `/api/overtime/list` (ArOvertimeManagentController) chỉ nhận
 * empId/localName/fromDate/toDate, 2 tham số kia bị bỏ qua âm thầm. Đây là
 * lỗi có sẵn ở backend (ngoài phạm vi sửa), giữ nguyên UI để không đổi hành
 * vi hiển thị, chỉ ghi chú lại. Modal chi tiết dòng đã lưu tái sử dụng
 * ApplyDetailModalComponent (variant="ot"); tìm nhân viên/tuyến xe/HR dept
 * manager tái sử dụng nguyên vẹn SstOtApplyService.
 */
@Component({
  selector: 'app-apply-ot-batch',
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
  templateUrl: './apply-ot-batch.component.html',
  styleUrl: './apply-ot-batch.component.scss',
})
export class ApplyOtBatchComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  @ViewChild('detailModal') detailModal!: ApplyDetailModalComponent;

  private readonly service = inject(ApplyOtBatchService);
  private readonly otService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchFromDate = signal<Date | null>(null);
  protected readonly searchToDate = signal<Date | null>(null);
  protected readonly searchAffirmFlag = signal<string | null>(null);
  protected readonly searchConfirmFlag = signal<string | null>(null);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly rows = signal<OtRowVm[]>([]);

  protected readonly pickerVisible = signal(false);
  protected readonly pickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly pickerSearching = signal(false);
  private pickerTarget: PickerTarget = 'searchFilter';
  private activeRowKey: string | null = null;
  private pickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  protected readonly carAddressOptions = signal<SyCodeOption[]>([]);

  private hrDeptManager: ApproverInput | null = null;
  private resolveTokens = new Map<string, number>();

  protected readonly allChecked = computed(() => {
    const selectable = this.rows().filter((r) => this.isSelectable(r));
    return selectable.length > 0 && selectable.every((r) => r.checked);
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const { from, to } = currentWeekRange();
    this.searchFromDate.set(from);
    this.searchToDate.set(to);
    try {
      this.carAddressOptions.set(await this.otService.getCarAddressOptions());
    } catch {
      this.carAddressOptions.set([]);
    }
    try {
      const mgr = await this.otService.getHrDeptManager();
      if (mgr.PERSON_ID) {
        this.hrDeptManager = { personId: mgr.PERSON_ID, localName: mgr.LOCAL_NAME ?? '', empId: mgr.EMP_ID ?? '' };
      }
    } catch {
      this.hrDeptManager = null;
    }
    await this.search();
  }

  isSelectable(row: OtRowVm): boolean {
    return row.isNew || CANCELABLE_FLAGS.includes(row.affirmFlag);
  }

  private toRowVm(r: OtBatchRow): OtRowVm {
    return {
      rowKey: r.applyNo ?? '',
      isNew: false,
      checked: false,
      applyNo: r.applyNo ?? '',
      personId: r.personId ?? '',
      empId: r.empId ?? '',
      localName: r.localName ?? '',
      deptName: r.deptName ?? '',
      otTypeCode: r.otTypeCode ?? '',
      otTypeName: r.otTypeName ?? '',
      applyOtDate: parseApiDate(r.applyOtDate),
      otFromTime: parseApiDateTime(r.otFromTime),
      otToTime: parseApiDateTime(r.otToTime),
      indoorTime: r.indoorTime ?? '',
      outdoorTime: r.outdoorTime ?? '',
      otApplyHour: r.otApplyHour ?? '',
      deductYn: r.deductYn === '1',
      applyOtRemark: r.applyOtRemark ?? '',
      usecarYn: r.usecarYn === '1',
      carAddress: r.carAddress ?? '',
      carAddressName: r.carAddressName ?? '',
      carAddressDetail: r.carAddressDetail ?? '',
      carAddressDetailName: r.carAddressDetailName ?? '',
      carAddressDetailOptions: [],
      otTotalMonth: r.otTotalMonth ?? '',
      otTotalYear: r.otTotalYear ?? '',
      affirmFlag: r.affirmFlag ?? '',
      affirmStr: r.affirmStr ?? '',
      createdBy: r.createdBy ?? '',
      createDate: r.createDate ?? '',
      updatedBy: r.updatedBy ?? '',
      updateDate: r.updateDate ?? '',
      postFamily: r.postFamily ?? '',
      shiftEndTime: r.shiftEndTime ?? '',
      approvers: [],
    };
  }

  private newEmptyRow(): OtRowVm {
    return {
      rowKey: newRowId(),
      isNew: true,
      checked: true,
      applyNo: '',
      personId: '',
      empId: '',
      localName: '',
      deptName: '',
      otTypeCode: '',
      otTypeName: '',
      applyOtDate: new Date(),
      otFromTime: null,
      otToTime: null,
      indoorTime: '',
      outdoorTime: '',
      otApplyHour: '',
      deductYn: false,
      applyOtRemark: '',
      usecarYn: false,
      carAddress: '',
      carAddressName: '',
      carAddressDetail: '',
      carAddressDetailName: '',
      carAddressDetailOptions: [],
      otTotalMonth: '',
      otTotalYear: '',
      affirmFlag: '',
      affirmStr: '',
      createdBy: '',
      createDate: '',
      updatedBy: '',
      updateDate: '',
      postFamily: '',
      shiftEndTime: '',
      approvers: [],
    };
  }

  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
  }

  private toApiDateTime(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd HH:mm', 'en-US') : '';
  }

  updateRow(rowKey: string, patch: Partial<OtRowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
  }

  private getRow(rowKey: string): OtRowVm | undefined {
    return this.rows().find((r) => r.rowKey === rowKey);
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const filter: OtBatchFilter = {
        empId: this.searchEmpId() || undefined,
        localName: this.searchLocalName() || undefined,
        fromDate: this.toApiDate(this.searchFromDate()),
        toDate: this.toApiDate(this.searchToDate()),
        affirmFlag: this.searchAffirmFlag() ?? undefined,
        confirmFlag: this.searchConfirmFlag() ?? undefined,
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
    this.searchKeyword.set('');
    this.searchEmpId.set('');
    this.searchLocalName.set('');
    const { from, to } = currentWeekRange();
    this.searchFromDate.set(from);
    this.searchToDate.set(to);
    this.searchAffirmFlag.set(null);
    this.searchConfirmFlag.set(null);
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
      this.searchEmpId.set(emp.empId ?? '');
      this.searchLocalName.set(emp.localName ?? '');
      this.searchKeyword.set(`${emp.empId ?? ''} - ${emp.localName ?? ''}`);
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
    this.updateRow(rowKey, {
      personId: emp.personId ?? '',
      empId: emp.empId ?? '',
      localName: emp.localName ?? '',
      deptName: emp.deptName ?? '',
    });
    const row = this.getRow(rowKey);
    if (row) {
      const applyOtDate = this.toApiDate(row.applyOtDate) || this.toApiDate(new Date());
      await this.autoFillByEmp(rowKey, emp.personId ?? '', applyOtDate);
      await this.fetchOtTotals(rowKey, emp.personId ?? '', applyOtDate);
    }
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

  // ── Auto-fill / tính toán theo dòng ─────────────────────────────────────
  private async autoFillByEmp(rowKey: string, personId: string, applyOtDate: string): Promise<void> {
    if (!personId || !applyOtDate) return;
    const row = this.getRow(rowKey);
    if (!row) return;
    try {
      const data = await this.service.getAutoFillByEmp(personId, applyOtDate, row.deductYn ? '1' : '0');
      const otFromTime = parseApiDateTime(data.otFromTime);
      const otToTime = parseApiDateTime(data.otToTime);
      const otApplyHour = data.otApplyHour || calcApplyHour(otFromTime, otToTime);
      this.updateRow(rowKey, {
        deptName: data.deptName || row.deptName,
        otTypeCode: data.otTypeCode ?? '',
        otTypeName: data.otTypeName ?? '',
        postFamily: data.postFamily ?? '',
        shiftEndTime: data.shiftEndTime ?? '',
        otFromTime: otFromTime ?? row.otFromTime,
        otToTime: otToTime ?? row.otToTime,
        otApplyHour,
      });
    } catch {
      // Bỏ qua - người dùng vẫn có thể tự nhập tay.
    }
  }

  private async fetchOtTotals(rowKey: string, personId: string, applyOtDate: string): Promise<void> {
    if (!personId || !applyOtDate) return;
    try {
      const data = await this.service.getOtTotals(personId, applyOtDate);
      this.updateRow(rowKey, { otTotalMonth: data.otTotalMonth ?? '', otTotalYear: data.otTotalYear ?? '' });
    } catch {
      // im lặng bỏ qua
    }
  }

  private async resolveDefaultOtInfo(rowKey: string): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row || !row.personId || !row.otFromTime || !row.otToTime) return;
    const applyOtDate = this.toApiDate(row.applyOtDate) || this.toApiDate(row.otFromTime);
    // Đánh dấu yêu cầu bằng token, chỉ áp dụng kết quả nếu đây vẫn là yêu cầu
    // mới nhất cho dòng này - tránh phản hồi cũ (chậm hơn) ghi đè lên giá trị
    // người dùng vừa sửa sau đó (giống pioabResolveKey ở bản gốc).
    const token = (this.resolveTokens.get(rowKey) ?? 0) + 1;
    this.resolveTokens.set(rowKey, token);
    try {
      const data = await this.service.getDefaultOtInfo(
        row.personId,
        applyOtDate,
        this.toApiDateTime(row.otFromTime),
        this.toApiDateTime(row.otToTime),
        row.deductYn ? '1' : '0',
      );
      if (this.resolveTokens.get(rowKey) !== token) return;
      const otApplyHour = data.otApplyHour || calcApplyHour(row.otFromTime, row.otToTime);
      this.updateRow(rowKey, { otTypeCode: data.otTypeCode ?? '', otTypeName: data.otTypeName ?? '', otApplyHour });
    } catch {
      if (this.resolveTokens.get(rowKey) !== token) return;
      this.updateRow(rowKey, { otApplyHour: calcApplyHour(row.otFromTime, row.otToTime) });
    }
  }

  async onRowDateChange(rowKey: string, newDate: Date | null): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row) return;
    this.updateRow(rowKey, { applyOtDate: newDate });
    const applyOtDate = this.toApiDate(newDate);
    if (row.isNew && row.personId) {
      await this.autoFillByEmp(rowKey, row.personId, applyOtDate);
      await this.fetchOtTotals(rowKey, row.personId, applyOtDate);
      return;
    }
    this.updateRow(rowKey, { otApplyHour: calcApplyHour(row.otFromTime, row.otToTime) });
    await this.resolveDefaultOtInfo(rowKey);
    if (row.personId && applyOtDate) {
      await this.fetchOtTotals(rowKey, row.personId, applyOtDate);
    }
  }

  async onFromTimeChange(rowKey: string, value: Date | null): Promise<void> {
    // applyOtDate phải luôn theo phần ngày của otFromTime (giống pioabSyncRowData
    // ở bản gốc) - nếu không, applyOtDate lệch ngày với otFromTime/otToTime gửi
    // lên server khiến default-info tính sai/không ra giờ tăng ca.
    const patch: Partial<OtRowVm> = { otFromTime: value };
    if (value) {
      patch.applyOtDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    this.updateRow(rowKey, patch);
    const row = this.getRow(rowKey);
    if (row) {
      this.updateRow(rowKey, { otApplyHour: calcApplyHour(value, row.otToTime) });
    }
    await this.resolveDefaultOtInfo(rowKey);
  }

  async onToTimeChange(rowKey: string, value: Date | null): Promise<void> {
    this.updateRow(rowKey, { otToTime: value });
    const row = this.getRow(rowKey);
    if (row) {
      this.updateRow(rowKey, { otApplyHour: calcApplyHour(row.otFromTime, value) });
    }
    await this.resolveDefaultOtInfo(rowKey);
  }

  async onDeductChange(rowKey: string, checked: boolean): Promise<void> {
    this.updateRow(rowKey, { deductYn: checked });
    await this.resolveDefaultOtInfo(rowKey);
  }

  async onCarAddressChange(rowKey: string, parentCode: string | null): Promise<void> {
    this.updateRow(rowKey, { carAddress: parentCode ?? '', carAddressDetail: '', carAddressDetailOptions: [] });
    if (!parentCode) return;
    try {
      const options = await this.otService.getCarAddressDetailOptions(parentCode);
      this.updateRow(rowKey, { carAddressDetailOptions: options });
    } catch {
      this.updateRow(rowKey, { carAddressDetailOptions: [] });
    }
  }

  // ── Chọn dòng ────────────────────────────────────────────────────────────
  toggleAll(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => (this.isSelectable(r) ? { ...r, checked } : r)));
  }

  openDetail(row: OtRowVm): void {
    if (row.isNew || !row.applyNo) return;
    this.detailModal.open(row.applyNo, row.otTypeCode, null);
  }

  // ── Lưu / hủy ────────────────────────────────────────────────────────────
  private buildPayload(row: OtRowVm): OtBatchSavePayload {
    return {
      applyNo: row.applyNo,
      personId: row.personId,
      localName: row.localName,
      empId: row.empId,
      otTypeNo: '31',
      otTypeCode: row.otTypeCode,
      applyOtDate: this.toApiDate(row.applyOtDate) || this.toApiDate(row.otFromTime),
      otFromTime: this.toApiDateTime(row.otFromTime),
      otToTime: this.toApiDateTime(row.otToTime),
      otApplyHour: row.otApplyHour || calcApplyHour(row.otFromTime, row.otToTime),
      applyOtRemark: row.applyOtRemark,
      deductYn: row.deductYn ? '1' : '0',
      usecarYn: row.usecarYn ? '1' : '0',
      carAddress: row.carAddress,
      carAddressDetail: row.carAddressDetail,
      approvers: row.approvers.map((a) => ({ personId: a.personId, localName: a.localName, empId: a.empId })),
    };
  }

  private maybeAddHrManager(row: OtRowVm): OtRowVm {
    if (!this.hrDeptManager || !row.shiftEndTime) return row;
    const shiftEndDt = parseApiDateTime(row.shiftEndTime) ?? new Date(row.shiftEndTime);
    if (isNaN(shiftEndDt.getTime()) || new Date() <= shiftEndDt) return row;
    if (row.approvers.some((a) => a.personId === this.hrDeptManager!.personId)) return row;
    this.message.info(this.i18n.t('essOt.msg.autoAddHrManager', 'Đã tự động thêm Trưởng bộ phận nhân sự vào danh sách phê duyệt do nộp đơn sau giờ làm.'));
    const updated = { ...row, approvers: [...row.approvers, this.hrDeptManager] };
    this.updateRow(row.rowKey, { approvers: updated.approvers });
    return updated;
  }

  private validateRow(row: OtRowVm): boolean {
    if (!row.personId) {
      this.message.warning(this.i18n.t('arOtf.msg.notSelectEmp', 'Chưa chọn nhân viên'));
      return false;
    }
    if (!row.applyOtDate && !row.otFromTime) {
      this.message.warning(this.i18n.t('arOtf.msg.notSelectDate', 'Chưa chọn ngày tăng ca'));
      return false;
    }
    if (!row.otFromTime || !row.otToTime) {
      this.message.warning(this.i18n.t('arOtf.msg.notEnterTime', 'Chưa nhập giờ tăng ca'));
      return false;
    }
    const hour = parseFloat(row.otApplyHour || calcApplyHour(row.otFromTime, row.otToTime));
    if (!hour) {
      this.message.warning(this.i18n.t('arOtf.msg.noHour', 'Không tính được số giờ tăng ca'));
      return false;
    }
    if (!row.applyOtRemark.trim()) {
      this.message.warning(this.i18n.t('essOt.msg.reasonRequired', 'Vui lòng nhập lý do tăng ca.'));
      return false;
    }
    if (row.postFamily === '14015813' || row.postFamily === '14015814') {
      if (hour < 1) {
        this.message.warning(this.i18n.t('arOtf.msg.minDurationGroup1', 'Nhóm nhân viên này yêu cầu thời lượng tăng ca tối thiểu là 1 tiếng (60 phút).'));
        return false;
      }
    } else if (row.postFamily === '14015815') {
      if (hour < 0.5) {
        this.message.warning(this.i18n.t('arOtf.msg.minDurationGroup2', 'Nhóm nhân viên này yêu cầu thời lượng tăng ca tối thiểu là 30 phút.'));
        return false;
      }
    }
    if (row.otTypeCode === '32') {
      if (hour > 3) {
        this.message.warning(this.i18n.t('essOt.msg.maxDurationWeekday', 'Ngày thường không được tăng ca quá 3 tiếng (180 phút).'));
        return false;
      }
    } else if (row.otTypeCode) {
      if (hour > 12) {
        this.message.warning(this.i18n.t('essOt.msg.maxDurationOther', 'Thời lượng tăng ca không được quá 12 tiếng (720 phút).'));
        return false;
      }
    }
    if (!row.approvers.length) {
      this.message.warning(this.i18n.t('sa.msg.requireApprover', 'Vui lòng thêm ít nhất một người phê duyệt!'));
      return false;
    }
    return true;
  }

  private hasTimeOverlap(rows: OtRowVm[]): boolean {
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i];
        const b = rows[j];
        if (a.personId !== b.personId) continue;
        if (!a.otFromTime || !a.otToTime || !b.otFromTime || !b.otToTime) continue;
        if (a.otFromTime.getTime() < b.otToTime.getTime() && b.otFromTime.getTime() < a.otToTime.getTime()) {
          return true;
        }
      }
    }
    return false;
  }

  async saveChecked(): Promise<void> {
    const checked = this.rows().filter((r) => r.checked);
    if (!checked.length) {
      this.message.warning(this.i18n.t('arOtf.msg.noCheckedRows', 'Vui lòng chọn ít nhất một dòng để lưu'));
      return;
    }

    const resolvedRows: OtRowVm[] = [];
    for (const row of checked) {
      const resolved = this.maybeAddHrManager(row);
      if (!this.validateRow(resolved)) return;
      resolvedRows.push(resolved);
    }

    if (this.hasTimeOverlap(resolvedRows)) {
      this.message.error(this.i18n.t('arOtf.msg.timeOverlap', 'Các dòng dữ liệu bị trùng nhau về thời gian, xin kiểm tra lại!'));
      return;
    }

    const saveRows = resolvedRows.filter((r) => !(!r.isNew && r.affirmFlag === '14014308'));
    const resubmitRows = resolvedRows.filter((r) => !r.isNew && r.affirmFlag === '14014308');

    this.saving.set(true);
    try {
      const errors: string[] = [];
      const tasks: Promise<void>[] = [];

      if (saveRows.length) {
        tasks.push(
          this.service.saveBatch(saveRows.map((r) => this.buildPayload(r))).then((res) => {
            if (!res.success) errors.push(res.error || this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
          }).catch(() => {
            errors.push(this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
          }),
        );
      }
      resubmitRows.forEach((r) => {
        tasks.push(
          this.service.resubmit(this.buildPayload(r)).then((res) => {
            if (!res.success) errors.push(res.error || this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
          }).catch(() => {
            errors.push(this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
          }),
        );
      });

      await Promise.all(tasks);

      if (errors.length) {
        errors.forEach((e) => this.message.error(e));
      } else {
        this.message.success(
          this.i18n.t('arOtf.msg.saveBatchSuccess', 'Lưu thành công {n} dòng').replace('{n}', String(resolvedRows.length)),
        );
        await this.search();
      }
    } finally {
      this.saving.set(false);
    }
  }

  cancelBatch(): void {
    const applyNos = this.rows()
      .filter((r) => r.checked && !r.isNew && r.applyNo)
      .map((r) => r.applyNo);
    if (!applyNos.length) {
      this.message.warning(this.i18n.t('arOtf.msg.noCancelSelected', 'Vui lòng chọn ít nhất một đơn tăng ca để hủy'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('arOtf.msg.confirmCancelBatch', 'Bạn có chắc chắn muốn hủy {n} đơn tăng ca đã chọn không?').replace('{n}', String(applyNos.length)),
      nzOnOk: () => this.doCancelBatch(applyNos),
    });
  }

  private async doCancelBatch(applyNos: string[]): Promise<void> {
    try {
      const res = await this.service.cancelBatch(applyNos);
      if (res.success) {
        this.message.success(
          this.i18n.t('arOtf.msg.cancelBatchSuccess', 'Đã hủy thành công {n} đơn tăng ca').replace('{n}', String(res.count ?? applyNos.length)),
        );
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('arOtf.msg.cancelError', 'Lỗi khi gửi yêu cầu hủy đơn'));
      }
    } catch {
      this.message.error(this.i18n.t('arOtf.msg.cancelError', 'Lỗi khi gửi yêu cầu hủy đơn'));
    }
  }

  resubmitLine(rowKey: string): void {
    const row = this.getRow(rowKey);
    if (!row) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('arOtf.msg.confirmResubmit', 'Đơn này đã được duyệt. Lưu sẽ xóa đơn hiện tại và tạo lại đơn mới. Bạn có muốn tiếp tục không?'),
      nzOnOk: () => this.doResubmitLine(rowKey),
    });
  }

  private async doResubmitLine(rowKey: string): Promise<void> {
    let row = this.getRow(rowKey);
    if (!row) return;
    row = this.maybeAddHrManager(row);
    if (!this.validateRow(row)) return;
    try {
      const res = await this.service.resubmit(this.buildPayload(row));
      if (res.success) {
        this.message.success(res.message || this.i18n.t('arOtf.msg.resubmitSuccess', 'Đã lưu lại đơn tăng ca thành công'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
      }
    } catch {
      this.message.error(this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
    }
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
      window.open('/ar/attendanceMintenance/viewImportOtTempList', '_blank');
      await this.search();
    } catch {
      this.message.error(this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
    } finally {
      this.importing.set(false);
    }
  }
}
