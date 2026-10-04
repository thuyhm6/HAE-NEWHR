import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import {
  APPROV_TYPE_APPROVAL,
  APPROV_TYPE_NOTICE,
  ApproverChainItem,
  ApproverChainService,
  newApproverKey,
} from '../../../shared/approver-chain/approver-chain.service';
import { RowApproversComponent } from '../../../shared/approver-chain/row-approvers.component';
import { EssApplyResponse, essApplyErrorText } from '../../../shared/ess-apply-response';
import { AttBatchAffirmor, ApplyAttBatchApproverService } from '../apply-att-batch-approver/apply-att-batch-approver.service';
import { ApplyOtBatchService, DOWNLOAD_TEMPLATE_URL } from '../apply-ot-batch/apply-ot-batch.service';
import { AttendanceExForBatchService, AuthorizedDeptNode, ShiftOption } from '../attendance-ex-for-batch/attendance-ex-for-batch.service';
import { CAR_ADDRESS_PARENT_CODE, EmployeeSearchResult, OT_TYPE_PARENT_CODE, SstOtApplyService, SyCodeOption } from '../sst-ot-apply/sst-ot-apply.service';
import {
  ApplyOtBatchApproverService,
  OtBatchApproverRow,
  OtBatchApproverSaveItem,
  OtValidateInfo,
} from './apply-ot-batch-approver.service';

interface RowVm {
  rowKey: string;
  isNew: boolean;
  checked: boolean;
  applyNo: string;
  personId: string;
  empId: string;
  localName: string;
  deptName: string;
  postFamily: string;
  shiftName: string;
  shiftTime: string;
  applyOtDate: Date | null;
  indoorTime: string;
  outdoorTime: string;
  otFromDate: Date | null;
  otFromTime: string;
  otToDate: Date | null;
  otToTime: string;
  otApplyHour: string;
  deductYn: boolean;
  offsetYn: boolean;
  usecarYn: boolean;
  carAddress: string;
  carAddressDetail: string;
  otTypeCode: string;
  otTypeCodeName: string;
  applyOtRemark: string;
  otTotail: string;
  otTotailMonth: string;
  weekdayOtTotail: string;
  saturdayOtTotail: string;
  weekendOtTotail: string;
  hoildayOtTotail: string;
  otLimitMonth: string;
  otLimitYear: string;
  arShiftEndTime: string;
  affirmFlag: string;
  affirmFlagName: string;
  createdBy: string;
  approvers: ApproverChainItem[];
  /** true khi dây chuyền duyệt lấy từ đơn đã lưu (không tự nạp lại mặc định) */
  storedApprovers: boolean;
}

/** Mã loại đơn tăng ca khi lấy dây chuyền duyệt mặc định (viewAffirmorByPersonIdListForOt) */
const OT_APPLY_TYPE_NO = '31';
/** Mã trạng thái phê duyệt (parent 14014304) */
const AFFIRM_FLAG_PARENT_CODE = '14014304';
const AFFIRM_FLAG_APPROVED = '14014308';
const DISABLED_AFFIRM_FLAGS = ['14014309', '14014310'];
/** Loại ngày (GET_AR_DATETYPE) -> loại tăng ca mặc định ở thanh nhập nhanh (getDefaultOtTimeSST) */
const DATE_TYPE_WEEKDAY = '1440';
const DATE_TYPE_PAID_HOLIDAY = '90000425';
const DATE_TYPE_WEEKEND = '1441';
const OT_TYPE_WEEKDAY = '32';
const OT_TYPE_WEEKEND = '33';
const OT_TYPE_PAID_HOLIDAY = '218181';
const OT_TYPE_HOLIDAY = '34';
/** Nhóm chức danh (POST_FAMILY): quản lý tối thiểu 1h, sản xuất tối thiểu 0.5h */
const POST_FAMILY_MANAGER = ['14015813', '14015814'];
const POST_FAMILY_PRODUCTION = '14015815';
/** Các personId đặc biệt giữ nguyên từ JSP gốc */
const PERSON_CANNOT_APPLY = '35450227';
const PERSON_SKIP_OVER_LIMIT = '35452578';
const HR_DIRECTOR_AFTER_SHIFT = '35455053';
const HR_DIRECTOR_AFTER_20H = '35451890';
/** Giờ mặc định khi thêm dòng mới (addOtApplyAffirm) */
const DEFAULT_FROM_TIME = '17:33';
const DEFAULT_TO_TIME = '19:45';
/** Mốc giờ đặc biệt chèn thêm vào danh sách giờ (TIME_STR ở controller cũ) */
const SPECIAL_TIMES = ['04:58', '15:33', '16:33', '17:33', '18:33', '19:03'];

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

/** YYYY/MM/DD HH:mm -> Date */
function parseApiDateTime(value: string): Date | null {
  const m = value.match(/^(\d{4})[/.-](\d{2})[/.-](\d{2})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : d;
}

function toNumber(value: string | number | undefined | null): number {
  const n = parseFloat(String(value ?? ''));
  return isNaN(n) ? 0 : n;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Tăng ca hàng loạt (chọn người duyệt tùy ý) - port giao diện + chức năng từ
 * WEB-INF/view/ess/infoApply/viewApplyOtLBatchByAnyApproverList.jsp (route data
 * over = false, ESS_APPLY_OT) và viewApplyOTBatchInfoHAE.jsp (over = true,
 * ESS_APPLY_OT_OVER) của dự án Hanwha_HAE sang Angular + NG-ZORRO. Hai JSP gốc
 * gần như giống hệt nhau, chỉ khác bảng dữ liệu, rule kiểm tra giờ tăng ca và số
 * cột lũy kế -> dùng chung 1 component.
 * - Bảng DataTables + editable cell -> nz-table nhập trực tiếp, sửa ô nào tự tick dòng đó.
 * - "Thêm mới" thêm dòng ở client thay vì chèn dòng rỗng vào DB như bản cũ.
 * - Các câu SQL qua /hrm/recruitManage/doSql được thay bằng endpoint riêng.
 * Tái sử dụng: RowApproversComponent + ApproverChainService (dây chuyền duyệt),
 * ApplyAttBatchApproverService#getAffirmors (người duyệt đã lưu), SstOtApplyService
 * (mã code, tuyến xe, tìm nhân viên), AttendanceExForBatchService (cây phòng ban,
 * ca làm), ApplyOtBatchService (import Excel/file mẫu), ApplyDetailModalComponent.
 */
@Component({
  selector: 'app-apply-ot-batch-approver',
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
    NzTooltipModule,
    NzTreeSelectModule,
  ],
  templateUrl: './apply-ot-batch-approver.component.html',
  styleUrl: './apply-ot-batch-approver.component.scss',
})
export class ApplyOtBatchApproverComponent implements OnInit {
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;
  /** Danh sách giờ trong bảng: cách 15 phút + mốc đặc biệt; thanh nhập nhanh: cách 15 phút */
  protected readonly rowTimeOptions = buildTimeOptions(15, true);
  protected readonly fillTimeOptions = buildTimeOptions(15, false);

  @ViewChild('aobaDetailModal') detailModal!: ApplyDetailModalComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ApplyOtBatchApproverService);
  private readonly affirmorService = inject(ApplyAttBatchApproverService);
  private readonly approverService = inject(ApproverChainService);
  private readonly importService = inject(ApplyOtBatchService);
  private readonly deptService = inject(AttendanceExForBatchService);
  private readonly codeService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  /** true = tăng ca vượt (viewApplyOTBatchInfoHAE) */
  protected readonly over: boolean = !!this.route.snapshot.data['over'];

  // ── Điều kiện tìm kiếm ──
  protected readonly searchKeyword = signal('');
  protected readonly searchDeptNo = signal<string | null>(null);
  protected readonly searchStartDate = signal<Date | null>(new Date());
  protected readonly searchEndDate = signal<Date | null>(new Date());
  protected readonly searchShiftNo = signal<string | null>(null);
  protected readonly searchOtTypeCode = signal<string | null>(null);
  protected readonly searchAffirmFlag = signal<string | null>(null);

  // ── Thanh "Thực hiện tất cả" ──
  protected readonly fillOtTypeCode = signal<string | null>(null);
  protected readonly fillDate = signal<Date | null>(null);
  protected readonly fillFromTime = signal<string | null>(null);
  protected readonly fillToTime = signal<string | null>(null);
  protected readonly fillReason = signal('');

  // ── Danh mục ──
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);
  protected readonly otTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly affirmFlagOptions = signal<SyCodeOption[]>([]);
  protected readonly carAddressOptions = signal<SyCodeOption[]>([]);
  private readonly carDetailMap = signal<Map<string, SyCodeOption[]>>(new Map());
  protected readonly allCarDetailOptions = computed(() => Array.from(this.carDetailMap().values()).flat());

  // ── Dữ liệu bảng ──
  protected readonly rows = signal<RowVm[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);

  // ── Popup tìm nhân viên (mã NV dòng mới) ──
  protected readonly pickerVisible = signal(false);
  protected readonly pickerResults = signal<EmployeeSearchResult[]>([]);
  protected readonly pickerSearching = signal(false);
  private pickerRowKey: string | null = null;
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
  protected readonly allDeduct = computed(() => {
    const list = this.selectableRows();
    return list.length > 0 && list.every((r) => r.deductYn);
  });
  protected readonly allUsecar = computed(() => {
    const list = this.selectableRows();
    return list.length > 0 && list.every((r) => r.usecarYn);
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadOptions();
    await this.search();
  }

  private async loadOptions(): Promise<void> {
    const [depts, shifts, otTypes, affirmFlags, carAddresses] = await Promise.all([
      this.deptService.getAuthorizedDepartments().catch(() => [] as AuthorizedDeptNode[]),
      this.deptService.getShiftOptions().catch(() => [] as ShiftOption[]),
      this.codeService.getCodeOptions(OT_TYPE_PARENT_CODE).catch(() => [] as SyCodeOption[]),
      this.codeService.getCodeOptions(AFFIRM_FLAG_PARENT_CODE).catch(() => [] as SyCodeOption[]),
      this.codeService.getCodeOptions(CAR_ADDRESS_PARENT_CODE).catch(() => [] as SyCodeOption[]),
    ]);
    this.deptTreeNodes.set(this.buildDeptTree(depts));
    this.shiftOptions.set(shifts);
    this.otTypeOptions.set(otTypes);
    this.affirmFlagOptions.set(affirmFlags);
    this.carAddressOptions.set(carAddresses);
    // Chi tiết điểm đón theo từng tuyến xe
    const details = await Promise.all(
      carAddresses.map((c) => this.codeService.getCarAddressDetailOptions(c.codeNo).catch(() => [] as SyCodeOption[])),
    );
    const map = new Map<string, SyCodeOption[]>();
    carAddresses.forEach((c, i) => map.set(c.codeNo, details[i]));
    this.carDetailMap.set(map);
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

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  carDetailOptionsFor(row: RowVm): SyCodeOption[] {
    return row.carAddress ? (this.carDetailMap().get(row.carAddress) ?? []) : this.allCarDetailOptions();
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

  shiftText(row: RowVm): string {
    return row.shiftName || row.shiftTime ? `${row.shiftName} (${row.shiftTime})` : '';
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

  // ── Dòng dữ liệu ─────────────────────────────────────────────────────────
  private toRowVm(r: OtBatchApproverRow): RowVm {
    return {
      rowKey: r.applyNo ? `A${r.applyNo}` : newKey(),
      isNew: false,
      checked: false,
      applyNo: r.applyNo ?? '',
      personId: r.personId ?? '',
      empId: r.empId ?? '',
      localName: r.localName ?? '',
      deptName: r.deptName ?? '',
      postFamily: r.postFamily ?? '',
      shiftName: r.shiftName ?? '',
      shiftTime: r.shiftTime ?? '',
      applyOtDate: parseDisplayDate(r.applyOtDate),
      indoorTime: r.indoorTime ?? '',
      outdoorTime: r.outdoorTime ?? '',
      otFromDate: parseDisplayDate(r.otFromDate),
      otFromTime: r.otFromTime ?? '',
      otToDate: parseDisplayDate(r.otToDate),
      otToTime: r.otToTime ?? '',
      otApplyHour: r.otApplyHour ?? '0',
      deductYn: r.deductYn === '1',
      offsetYn: r.offsetYn === '1',
      usecarYn: r.usecarYn === '1',
      carAddress: r.carAddress ?? '',
      carAddressDetail: r.carAddressDetail ?? '',
      otTypeCode: r.otTypeCode ?? '',
      otTypeCodeName: r.otTypeCodeName ?? '',
      applyOtRemark: r.applyOtRemark ?? '',
      otTotail: r.otTotail ?? '',
      otTotailMonth: r.otTotailMonth ?? '',
      weekdayOtTotail: r.weekdayOtTotail ?? '',
      saturdayOtTotail: r.saturdayOtTotail ?? '',
      weekendOtTotail: r.weekendOtTotail ?? '',
      hoildayOtTotail: r.hoildayOtTotail ?? '',
      otLimitMonth: r.otLimitMonth ?? '',
      otLimitYear: r.otLimitYear ?? '',
      arShiftEndTime: r.arShiftEndTime ?? '',
      affirmFlag: r.affirmFlag ?? '',
      affirmFlagName: r.affirmFlagName ?? '',
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
      applyOtDate: today,
      otFromDate: today,
      otFromTime: DEFAULT_FROM_TIME,
      otToDate: today,
      otToTime: DEFAULT_TO_TIME,
    };
  }

  private toApproverItem(a: AttBatchAffirmor): ApproverChainItem {
    return {
      key: newApproverKey(),
      personId: a.affirmPersonId || a.affirmorId || '',
      empId: a.empId ?? '',
      localName: a.localName ?? '',
      deptName: a.deptName ?? '',
      positionName: a.positionName ?? '',
      approvType: a.affirmType === APPROV_TYPE_NOTICE ? APPROV_TYPE_NOTICE : APPROV_TYPE_APPROVAL,
      fromDefault: false,
    };
  }

  private getRow(rowKey: string): RowVm | undefined {
    return this.rows().find((r) => r.rowKey === rowKey);
  }

  patchRow(rowKey: string, patch: Partial<RowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
  }

  /** Sửa bất kỳ ô nào -> tự tick dòng đó (updateChecked / modifyFlag ở bản cũ) */
  private patchRowModified(rowKey: string, patch: Partial<RowVm>): void {
    const row = this.getRow(rowKey);
    this.patchRow(rowKey, { ...patch, checked: row && !this.isRowDisabled(row) ? true : row?.checked ?? false });
  }

  // ── Tìm kiếm ─────────────────────────────────────────────────────────────
  async search(): Promise<void> {
    const token = ++this.loadToken;
    this.loading.set(true);
    try {
      const list = await this.service.getList(
        {
          keyword: this.searchKeyword().trim() || undefined,
          deptNo: this.searchDeptNo() ?? undefined,
          shiftNo: this.searchShiftNo() ?? undefined,
          otTypeCode: this.searchOtTypeCode() ?? undefined,
          affirmFlag: this.searchAffirmFlag() ?? undefined,
          startDate: this.toApiDate(this.searchStartDate()) || undefined,
          endDate: this.toApiDate(this.searchEndDate()) || undefined,
        },
        this.over,
      );
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

  /** Dây chuyền duyệt đã lưu (getAffirmorByApplyNoList), đơn chưa có thì lấy mặc định (viewAffirmorByPersonIdListForOt) */
  private async loadStoredApprovers(token: number): Promise<void> {
    const applyNos = this.rows().map((r) => r.applyNo).filter(Boolean);
    if (!applyNos.length) return;
    let map: Record<string, AttBatchAffirmor[]> = {};
    try {
      map = await this.affirmorService.getAffirmors(applyNos);
    } catch {
      map = {};
    }
    if (token !== this.loadToken) return;
    this.rows.update((rows) =>
      rows.map((r) => {
        const list = map[r.applyNo];
        return list?.length ? { ...r, approvers: list.map((a) => this.toApproverItem(a)), storedApprovers: true } : r;
      }),
    );
    for (const row of this.rows().filter((r) => !r.storedApprovers && !this.isRowDisabled(r))) {
      if (token !== this.loadToken) return;
      await this.loadDefaultApprovers(row.rowKey);
    }
  }

  private async loadDefaultApprovers(rowKey: string): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row?.personId) return;
    try {
      const list = await this.approverService.getDefaultApprovers(OT_APPLY_TYPE_NO, row.personId, row.otTypeCode, row.otApplyHour || '0');
      this.patchRow(rowKey, { approvers: list.map((a) => ({ ...a, fromDefault: false })) });
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

  /** Tick "Trừ giờ ăn" cho tất cả dòng rồi tính lại thời lượng (batchCheckedAndCallength) */
  async toggleAllDeduct(checked: boolean): Promise<void> {
    for (const row of this.selectableRows()) {
      this.patchRowModified(row.rowKey, { deductYn: checked });
      await this.calcLength(row.rowKey, false);
    }
  }

  /** Tick "Đặt xe" cho tất cả dòng (batchChecked) */
  toggleAllUsecar(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => (this.isRowDisabled(r) ? r : { ...r, usecarYn: checked, checked: true })));
  }

  /** Chọn ngày ở thanh nhập nhanh -> loại tăng ca + giờ mặc định theo ca (getDefaultOtTimeSST) */
  async onFillDateChange(value: Date | null): Promise<void> {
    this.fillDate.set(value);
    if (!value) return;
    try {
      const info = await this.service.getDayDefault(this.toApiDate(value));
      if (info.dateType === DATE_TYPE_WEEKDAY) {
        this.fillOtTypeCode.set(OT_TYPE_WEEKDAY);
        this.fillFromTime.set(info.shiftEndTime || null);
        this.fillToTime.set(info.shiftEndTime2 || null);
      } else {
        const type = info.dateType === DATE_TYPE_PAID_HOLIDAY ? OT_TYPE_PAID_HOLIDAY : info.dateType === DATE_TYPE_WEEKEND ? OT_TYPE_WEEKEND : OT_TYPE_HOLIDAY;
        this.fillOtTypeCode.set(type);
        this.fillFromTime.set(info.shiftStartTime || null);
        this.fillToTime.set(info.shiftEndTime || null);
      }
    } catch {
      // Người dùng tự chọn giờ
    }
  }

  /** "Thực hiện tất cả" - áp ngày/giờ/lý do cho các dòng đã chọn (otAffirm_fillItem) */
  async fillAll(): Promise<void> {
    const date = this.fillDate();
    if (!date) {
      this.message.error(this.i18n.t('ar.viewArOvertimeManagentFast.QINGXUANZEZHENGQUERIQI.b', 'Xin chọn đúng ngày'));
      return;
    }
    const checked = this.rows().filter((r) => r.checked && !this.isRowDisabled(r));
    if (!checked.length) {
      this.message.error(this.i18n.t('ar.viewApplyAttenanceManagentInfoList.QINGXUANZEXIUGAINEIRONG.b', 'Xin chọn nội dung sửa'));
      return;
    }
    const fromTime = this.fillFromTime() ?? '';
    const toTime = this.fillToTime() ?? '';
    const reason = this.fillReason().trim();
    const offset = !!fromTime && !!toTime && fromTime > toTime;
    for (const row of checked) {
      const patch: Partial<RowVm> = {
        applyOtDate: date,
        otFromDate: date,
        otFromTime: fromTime,
        otToDate: offset ? addDays(date, 1) : date,
        otToTime: toTime,
        offsetYn: offset,
        deductYn: false,
        usecarYn: false,
      };
      if (reason) patch.applyOtRemark = reason;
      this.patchRow(row.rowKey, patch);
      await this.calcLength(row.rowKey, false);
      await this.loadRowInfo(row.rowKey);
    }
  }

  // ── Sửa ô trong bảng ─────────────────────────────────────────────────────
  async onDateChange(rowKey: string, field: 'applyOtDate' | 'otFromDate' | 'otToDate', value: Date | null): Promise<void> {
    this.patchRowModified(rowKey, { [field]: value } as Partial<RowVm>);
    await this.calcLength(rowKey, false);
    if (field === 'applyOtDate') await this.loadRowInfo(rowKey);
  }

  async onTimeChange(rowKey: string, field: 'otFromTime' | 'otToTime', value: string | null): Promise<void> {
    this.patchRowModified(rowKey, { [field]: value ?? '' } as Partial<RowVm>);
    await this.calcLength(rowKey, false);
  }

  async onDeductChange(rowKey: string, checked: boolean): Promise<void> {
    this.patchRowModified(rowKey, { deductYn: checked });
    await this.calcLength(rowKey, false);
  }

  onFieldChange(rowKey: string, patch: Partial<RowVm>): void {
    this.patchRowModified(rowKey, patch);
  }

  onCarAddressChange(rowKey: string, value: string | null): void {
    this.patchRowModified(rowKey, { carAddress: value ?? '', carAddressDetail: '' });
  }

  onApproversChange(rowKey: string, approvers: ApproverChainItem[]): void {
    this.patchRowModified(rowKey, { approvers });
  }

  /**
   * Tính lại thời lượng + loại tăng ca (otAffirm_callength). employeeChanged = true
   * (FLAG = 1 ở bản cũ): ngày không phải ngày thường thì lấy giờ theo ca làm.
   */
  private async calcLength(rowKey: string, employeeChanged: boolean): Promise<void> {
    let row = this.getRow(rowKey);
    if (!row?.personId) return;
    if (!row.applyOtDate) {
      this.message.error(this.i18n.t('ar.viewArOvertimeManagentFast.QINGXUANZEZHENGQUERIQI.b', 'Xin chọn đúng ngày'));
      return;
    }
    const token = (this.calcTokens.get(rowKey) ?? 0) + 1;
    this.calcTokens.set(rowKey, token);

    // Giờ kết thúc nhỏ hơn giờ bắt đầu -> qua ngày (OFFSET_YN)
    const from = this.toApiDateTime(row.otFromDate, row.otFromTime);
    const to = this.toApiDateTime(row.otToDate, row.otToTime);
    if (from && to && from !== to) this.patchRow(rowKey, { offsetYn: to < from });

    try {
      const info: OtValidateInfo = await this.service.getValidateInfo(
        row.personId,
        this.toApiDate(row.applyOtDate),
        from,
        to,
        row.deductYn ? '1' : '0',
      );
      if (this.calcTokens.get(rowKey) !== token) return;
      const patch: Partial<RowVm> = {
        otTypeCode: info.otTypeCode ?? '',
        otTypeCodeName: info.otTypeCodeName ?? '',
        otApplyHour: info.otLength ?? '0',
      };
      if (employeeChanged) {
        patch.indoorTime = info.indoorTime ?? '';
        patch.outdoorTime = info.outdoorTime ?? '';
        if (info.dateType !== DATE_TYPE_WEEKDAY && info.shiftStartTime && info.shiftEndTime) {
          const date = row.applyOtDate;
          patch.otFromDate = date;
          patch.otFromTime = info.shiftStartTime;
          patch.otToDate = info.shiftEndTime < info.shiftStartTime ? addDays(date, 1) : date;
          patch.otToTime = info.shiftEndTime;
          patch.otApplyHour = info.otShiftLength ?? '0';
        }
      }
      this.patchRow(rowKey, patch);
    } catch {
      if (this.calcTokens.get(rowKey) === token) this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
      return;
    }
    row = this.getRow(rowKey);
    if (row && !row.storedApprovers) await this.loadDefaultApprovers(rowKey);
  }

  /** Ca làm + tăng ca lũy kế/giới hạn tại ngày tăng ca (getOt_Totail) */
  private async loadRowInfo(rowKey: string): Promise<void> {
    const row = this.getRow(rowKey);
    if (!row?.personId || !row.applyOtDate) return;
    try {
      const info = await this.service.getRowInfo(row.personId, this.toApiDate(row.applyOtDate));
      this.patchRow(rowKey, {
        deptName: info.deptName ?? row.deptName,
        postFamily: info.postFamily ?? row.postFamily,
        shiftName: info.shiftName ?? '',
        shiftTime: info.shiftTime ?? '',
        otTotail: info.otTotail ?? '',
        otTotailMonth: info.otTotailMonth ?? '',
        weekdayOtTotail: info.weekdayOtTotail ?? '',
        saturdayOtTotail: info.saturdayOtTotail ?? '',
        weekendOtTotail: info.weekendOtTotail ?? '',
        hoildayOtTotail: info.hoildayOtTotail ?? '',
        otLimitMonth: info.otLimitMonth ?? '',
        otLimitYear: info.otLimitYear ?? '',
        arShiftEndTime: info.arShiftEndTime ?? '',
      });
    } catch {
      // Không chặn thao tác
    }
  }

  // ── Mã nhân viên ở dòng mới (submitKeyClick_OtAffirm) ────────────────────
  async onRowEmpEnter(rowKey: string, event: Event): Promise<void> {
    event.preventDefault();
    const keyword = (event.target as HTMLInputElement).value.trim();
    if (!keyword) {
      this.patchRow(rowKey, { personId: '', empId: '', localName: '', deptName: '' });
      return;
    }
    try {
      const results = await this.codeService.searchEmployees(keyword);
      if (results.length === 1) {
        await this.selectRowEmployee(rowKey, results[0]);
      } else {
        this.openPicker(rowKey, results);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  openPicker(rowKey: string, results: EmployeeSearchResult[]): void {
    this.pickerRowKey = rowKey;
    this.pickerResults.set(results);
    this.pickerVisible.set(true);
  }

  closePicker(): void {
    this.pickerVisible.set(false);
    this.pickerRowKey = null;
  }

  onPickerSearch(keyword: string): void {
    if (this.pickerTimer) clearTimeout(this.pickerTimer);
    const kw = keyword.trim();
    if (!kw) return;
    this.pickerTimer = setTimeout(async () => {
      this.pickerSearching.set(true);
      try {
        this.pickerResults.set(await this.codeService.searchEmployees(kw));
      } catch {
        this.pickerResults.set([]);
      } finally {
        this.pickerSearching.set(false);
      }
    }, 300);
  }

  async onPickerSelected(personId: string | null): Promise<void> {
    const emp = this.pickerResults().find((e) => e.personId === personId);
    const rowKey = this.pickerRowKey;
    if (!emp || !rowKey) return;
    this.closePicker();
    await this.selectRowEmployee(rowKey, emp);
  }

  private async selectRowEmployee(rowKey: string, emp: EmployeeSearchResult): Promise<void> {
    this.patchRowModified(rowKey, {
      personId: emp.personId ?? '',
      empId: emp.empId ?? '',
      localName: emp.localName ?? '',
      deptName: emp.deptName ?? '',
    });
    await this.loadRowInfo(rowKey);
    await this.calcLength(rowKey, true);
  }

  // ── Xem chi tiết đơn (changeURL_ess3470 / viewApprovaledOt(Over)Info) ────
  openDetail(row: RowVm): void {
    if (row.isNew || !row.applyNo) return;
    this.detailModal.open(row.applyNo, row.otTypeCode, null);
  }

  // ── Lưu (saveOtApplyAffirm / saveApplyOTBatchInfo) ───────────────────────
  private validateRow(row: RowVm): string | null {
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    if (!row.personId) return t('ar.viewarcardrecord.title.empidnotnull', 'Mã nhân viên không được trống!');
    if (!row.applyOtDate) return t('ar.viewArOvertimeManagentFast.QINGXUANZEZHENGQUERIQI.b', 'Xin chọn đúng ngày');
    if (!row.approvers.some((a) => a.personId)) return t('alert.message.pleaseFirstSetRuler.b', 'Xin thiết lập người duyệt');
    if (!row.applyOtRemark.trim()) return t('ga.viewApplyCard.APPLY_REASON_NOT_NULL.d', 'Không được để trống lý do đăng ký!');
    if (row.affirmFlag && row.affirmFlag !== AFFIRM_FLAG_APPROVED) {
      return t('ar.viewArOvertimeManagentFast.QINGXUANZEZHENGQUEXUANXIANG.b', 'Xin chọn đúng hạng mục');
    }
    if (!this.over && row.personId === PERSON_CANNOT_APPLY) {
      return t('alert.message.ess.infoApply.applyFailed_cannotApply', 'Không thể đăng ký');
    }
    const hours = toNumber(row.otApplyHour);
    if (hours === 0) return t('ar.viewArOvertimeManagentFast.JIABANSHIJIANBUNENGLING.b', 'Thời gian tăng ca không thể bằng 0');
    if (POST_FAMILY_MANAGER.includes(row.postFamily) && hours < 1) {
      return t('alert.message.GUANLIZHIZUISHAOJIABANYIXIAOSHI.b', 'Chức quản lý tăng ca tối thiểu 1 giờ');
    }
    if (row.postFamily === POST_FAMILY_PRODUCTION && hours < 0.5) {
      return t('alert.message.SHENGCHANZHIZUISHAOJIABANBANXIAOSHI.b', 'Chức sản xuất tăng ca tối thiểu 0.5 giờ');
    }
    const month = toNumber(row.otTotailMonth);
    const year = toNumber(row.otTotail);
    if (this.over) {
      // Tăng ca vượt chỉ áp dụng khi đã vượt giới hạn tháng/năm
      if (month + hours < 40 && row.otLimitMonth === '1' && year + hours < 300 && row.personId !== PERSON_SKIP_OVER_LIMIT) {
        return t('ess.viewSSTOtApplyInfo.OVERTIMELIMIT40HOUR.b', 'Bạn chưa vượt quá giờ làm thêm trong tháng (40h)!');
      }
    } else {
      if (month + hours - toNumber(row.saturdayOtTotail) > 40) {
        return t('ess.viewSSTOtApplyInfo.JIABANCHAOGUOYUESHANGXIAN.b', 'Thời gian tăng ca vượt quá giới hạn tháng!');
      }
      if (hours > 4 && row.otTypeCode === OT_TYPE_WEEKDAY) {
        return t('ess.viewSSTOtApplyInfo.PINGRIJIABANSHANGXIANSIXIAOSHI.b', 'Tăng ca ngày thường tối đa 4 tiếng, xin lựa chọn lại!');
      }
      if (hours > 12 && (row.otTypeCode === OT_TYPE_WEEKEND || row.otTypeCode === OT_TYPE_PAID_HOLIDAY)) {
        return t('ess.viewSSTOtApplyInfo.PAINDLEAVE.b', 'Tăng ca ngày nghỉ tối đa 12 tiếng, xin lựa chọn lại!');
      }
      if (year + hours >= 300 && row.otLimitYear === '1') {
        return t('ess.viewSSTOtApplyInfo.JIABANCHAOGUONIANSHANGXIAN.a', 'Tăng ca vượt quá thời gian tối đa trong năm (300h)!');
      }
    }
    const approverIds = row.approvers.map((a) => a.personId);
    // Xin tăng ca sau giờ kết thúc ca -> bắt buộc có Giám đốc HR trong dây chuyền duyệt
    const shiftEnd = parseApiDateTime(row.arShiftEndTime);
    if (shiftEnd && Date.now() > shiftEnd.getTime() && !approverIds.includes(HR_DIRECTOR_AFTER_SHIFT)) {
      return t('ar.viewArOvertimeManaget_fast.Apply_closed.Ad_HR_Director.b', 'Đã vượt quá thời gian xin tăng ca, bạn cần phải thêm giám đốc bộ phận HR vào phê duyệt!');
    }
    const [toHour, toMinute] = row.otToTime.split(':').map((v) => toNumber(v));
    if (toHour >= 20 && toMinute > 0 && !approverIds.includes(HR_DIRECTOR_AFTER_20H)) {
      return t('ar.viewArOvertimeManaget_fast.Apply_closed.Ad_HR_Director.b1', 'Tăng ca sau 20h cần thêm người phê duyệt của bộ phận HR!');
    }
    return null;
  }

  /** Cảnh báo không chặn: sắp vượt giới hạn tháng (30h ~ 40h) */
  private warnRow(row: RowVm): void {
    if (this.over) return;
    const total = toNumber(row.otTotailMonth) + toNumber(row.otApplyHour);
    if (total >= 30 && total < 40) {
      this.message.warning(
        `${this.i18n.t('ess.viewSSTOtApplyInfo.JIABANCHAOGUOYUESHANGXIAN.a', '30h: Sắp vượt quá giờ làm thêm trong tháng (40h)!')} (${row.localName})`,
      );
    }
  }

  private toSaveItem(row: RowVm): OtBatchApproverSaveItem {
    return {
      applyNo: row.isNew ? '' : row.applyNo,
      personId: row.personId,
      empId: row.empId,
      localName: row.localName,
      applyOtDate: this.toApiDate(row.applyOtDate),
      otFromTime: this.toApiDateTime(row.otFromDate, row.otFromTime),
      otToTime: this.toApiDateTime(row.otToDate, row.otToTime),
      otApplyHour: String(row.otApplyHour ?? ''),
      otTypeCode: row.otTypeCode,
      applyOtRemark: row.applyOtRemark.trim(),
      offsetYn: row.offsetYn ? '1' : '0',
      deductYn: row.deductYn ? '1' : '0',
      usecarYn: row.usecarYn ? '1' : '0',
      carAddress: row.carAddress,
      carAddressDetail: row.carAddressDetail,
      approvers: ApproverChainService.toSaveItems(row.approvers.filter((a) => a.personId)),
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
    checked.forEach((r) => this.warnRow(r));
    this.modal.confirm({
      nzTitle: this.i18n.t('ess.infoApply.title.otConfirm', 'Bạn đã ghi rõ lý do, công đoạn làm việc mà bạn đăng ký tăng ca chưa?'),
      nzOnOk: () => this.doSave(checked),
    });
  }

  private async doSave(rows: RowVm[]): Promise<void> {
    this.saving.set(true);
    try {
      const res = await this.service.save(
        rows.map((r) => this.toSaveItem(r)),
        this.over,
      );
      if (res.success) {
        this.message.success(this.responseText(res, 'Lưu thành công!'));
        await this.search();
      } else {
        this.message.error(essApplyErrorText(this.i18n, res));
      }
    } catch {
      this.message.error(this.i18n.t('alert.message.add_fail', 'Lưu thất bại!'));
    } finally {
      this.saving.set(false);
    }
  }

  // ── Xóa (delOtApplyCallback) ─────────────────────────────────────────────
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
      const res = await this.service.delete(applyNos, this.over);
      if (res.success) {
        this.message.success(this.responseText(res, 'Xóa thành công!'));
        await this.search();
      } else {
        this.message.error(essApplyErrorText(this.i18n, res));
      }
    } catch {
      this.message.error(this.i18n.t('alert.message.delete_fail', 'Xóa thất bại!'));
    } finally {
      this.deleting.set(false);
    }
  }

  private responseText(res: EssApplyResponse, fallback: string): string {
    return res.messageKey ? this.i18n.t(res.messageKey, fallback) : fallback;
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
      // Mở màn hình kết quả nhập (viewImportOtTempList) giống bản cũ
      window.open('/ar/attendanceMintenance/viewImportOtTempList', '_blank');
      await this.search();
    } catch {
      this.message.error(this.i18n.t('alert.message.add_fail', 'Lưu thất bại!'));
    } finally {
      this.importing.set(false);
    }
  }

  private yesNo(value: boolean): string {
    return value ? 'Y' : 'N';
  }

  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('ess.message.NOT_FOUND_DATA_FROM_TABLE', 'Không có dữ liệu!'));
      return;
    }
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    const header = [
      'NO',
      t('ess.infoApply.NAME', 'Họ tên'),
      t('ess.infoApply.EMPID', 'Mã nhân viên'),
      t('ess.infoApply.DEPT', 'Phòng ban'),
      t('hr.viewPersonalInfo.title.banzu', 'Ca'),
      t('ess.infoApply.attendance_date', 'Ngày'),
      t('ess.infoApply.in_door_time', 'Giờ vào'),
      t('ess.infoApply.out_door_time', 'Giờ ra'),
      t('public.title.startDate', 'Ngày bắt đầu'),
      t('ess.infoApply.title.startTime', 'Thời gian bắt đầu'),
      t('public.title.endDate', 'Ngày kết thúc'),
      t('ess.infoApply.end_time', 'Thời gian kết thúc'),
      t('ess.infoApply.overtime_hours', 'Thời gian tăng ca'),
      t('ess.viewPiciOtAffirmLBatchList.DEDUCT_MEAL_TIME.b', 'Trừ giờ ăn'),
      t('ess.title.KUATIAN', 'Qua ngày'),
      t('ess.title.USE_CAR', 'Đặt xe'),
      t('ess.title.NAME_CAR', 'Tuyến xe'),
      t('ess.title.ADDRESS_CAR', 'Điểm đón'),
      t('ess.title.JIABANZHUANGTAI', 'Loại tăng ca'),
      t('ess.infoApply.Reason', 'Lý do'),
      t('ess.viewPiciOtAffirmBatchList.BENNIAN.b', 'Năm nay'),
      t('ess.viewPiciOtAffirmBatchList.BENYUE.b', 'Tháng này'),
      ...(this.over
        ? []
        : [
            t('ar.viewitemparameter.title.pingshi', 'Ngày thường'),
            t('ar.viewComanyCalendar.DAIXINJIA.b', 'Nghỉ có lương'),
            t('ar.viewitemparameter.title.zhoumo', 'Cuối tuần'),
            t('ar.viewitemparameter.title.jiejiari', 'Ngày lễ'),
          ]),
      t('hrm.contractInfo.APPROVAL_PERSON', 'Người duyệt'),
      t('ess.infoApply.approval_status', 'Trạng thái duyệt'),
      t('hrm.contract.creator', 'Người tạo'),
    ];
    const carName = (code: string) => {
      const opt = this.carAddressOptions().find((o) => o.codeNo === code);
      return opt ? this.codeLabel(opt) : '';
    };
    const carDetailName = (code: string) => {
      const opt = this.allCarDetailOptions().find((o) => o.codeNo === code);
      return opt ? this.codeLabel(opt) : '';
    };
    const data = rows.map((r, idx) => [
      idx + 1,
      r.localName,
      r.empId,
      r.deptName,
      this.shiftText(r),
      this.displayDate(r.applyOtDate),
      r.indoorTime,
      r.outdoorTime,
      this.displayDate(r.otFromDate),
      r.otFromTime,
      this.displayDate(r.otToDate),
      r.otToTime,
      r.otApplyHour,
      this.yesNo(r.deductYn),
      this.yesNo(r.offsetYn),
      this.yesNo(r.usecarYn),
      carName(r.carAddress),
      carDetailName(r.carAddressDetail),
      r.otTypeCodeName,
      r.applyOtRemark,
      r.otTotail,
      r.otTotailMonth,
      ...(this.over ? [] : [r.weekdayOtTotail, r.saturdayOtTotail, r.weekendOtTotail, r.hoildayOtTotail]),
      r.approvers
        .filter((a) => a.personId)
        .map((a) => a.localName)
        .join(' → '),
      r.affirmFlagName,
      r.createdBy,
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, this.over ? 'apply_ot_over_batch_by_any_approver.xlsx' : 'apply_ot_batch_by_any_approver.xlsx');
  }
}
