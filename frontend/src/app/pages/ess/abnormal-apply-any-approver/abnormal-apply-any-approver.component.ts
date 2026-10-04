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
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
import { I18nService } from '../../../i18n/i18n.service';
import { ApproverChainComponent } from '../../../shared/approver-chain/approver-chain.component';
import { ApproverChainItem, ApproverChainService } from '../../../shared/approver-chain/approver-chain.service';
import { essApplyErrorText } from '../../../shared/ess-apply-response';
import { EssPersonalHeadComponent } from '../../../shared/ess-personal-head/ess-personal-head.component';
import { EssPersonalHeadInfo } from '../../../shared/ess-personal-head/ess-personal-head.service';
import { CwaAbnormalApplyService, CwaAbnormalRow } from '../cwa-abnormal-apply/cwa-abnormal-apply.service';
import { AbnormalApplyAnyApproverService, AbnormalApplyItem } from './abnormal-apply-any-approver.service';

const APPLY_TYPE_NO = '218197';
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
/** Phút của thanh "Toàn bộ phản ánh" (fromTime_fen / toTime_fen ở bản gốc) */
const BATCH_MINUTE_OPTIONS = ['00', '30'];
/** Nghỉ không phép -> chuyển thành quên quẹt thẻ khi xin phép (HMT 2023/06/05 ở bản gốc) */
const ITEM_ABSENT = '141443';
const ITEM_FORGET_CARD = '14015448';

interface RowVm {
  pkNo: string;
  personId: string;
  empId: string;
  itemNo: string;
  itemName: string;
  /** DD/MM/YYYY */
  arDateStr: string;
  indoorTime: string;
  outdoorTime: string;
  locked: boolean;
  checked: boolean;
  inDate: Date | null;
  inHour: string;
  inMinute: string;
  outDate: Date | null;
  outHour: string;
  outMinute: string;
  reason: string;
}

function parseDmy(dmy?: string): Date | null {
  const p = (dmy ?? '').split('/');
  if (p.length !== 3) return null;
  const d = new Date(+p[2], +p[1] - 1, +p[0]);
  return isNaN(d.getTime()) ? null : d;
}

function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function lastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

function isValidMinute(value: string): boolean {
  return /^\d{1,2}$/.test(value) && +value >= 0 && +value <= 59;
}

/**
 * Xin phép chấm công bất thường của chính nhân viên đăng nhập, người duyệt tự chọn -
 * /ess/infoApply/viewAbnormalApplyByAnyApprover. Port đúng JSP Hanwha_HAE
 * (viewAbnormalApplyByAnyApprover.jsp): tra cứu theo khoảng ngày (mặc định tháng hiện
 * tại), thanh "Toàn bộ phản ánh" gán giờ vào/ra cho các dòng đã chọn, mỗi dòng nhập
 * ngày + giờ (select) + phút (ô nhập 0-59), lý do bắt buộc, dòng đã khóa không có ô chọn,
 * và 1 bảng dây chuyền duyệt chung (nạp mặc định theo loại 218197, cho sửa/thêm/xóa).
 */
@Component({
  selector: 'app-abnormal-apply-any-approver',
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
    NzSelectModule,
    NzTableModule,
    ApproverChainComponent,
    EssPersonalHeadComponent,
  ],
  templateUrl: './abnormal-apply-any-approver.component.html',
  styleUrl: './abnormal-apply-any-approver.component.scss',
})
export class AbnormalApplyAnyApproverComponent implements OnInit {
  private readonly listService = inject(CwaAbnormalApplyService);
  private readonly service = inject(AbnormalApplyAnyApproverService);
  private readonly approverService = inject(ApproverChainService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly hourOptions = HOUR_OPTIONS;
  protected readonly batchMinuteOptions = BATCH_MINUTE_OPTIONS;

  private me: EssPersonalHeadInfo = {};

  protected readonly startDate = signal<Date | null>(firstDayOfMonth());
  protected readonly endDate = signal<Date | null>(lastDayOfMonth());

  protected readonly batchInDate = signal<Date | null>(null);
  protected readonly batchInHour = signal('08');
  protected readonly batchInMinute = signal('00');
  protected readonly batchOutDate = signal<Date | null>(null);
  protected readonly batchOutHour = signal('17');
  protected readonly batchOutMinute = signal('00');

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly rows = signal<RowVm[]>([]);
  protected readonly quickFilter = signal('');
  protected readonly approvers = signal<ApproverChainItem[]>([]);

  protected readonly filteredRows = computed(() => {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.itemName, r.arDateStr, r.indoorTime, r.outdoorTime, r.reason].some((v) => v && v.toLowerCase().includes(kw)),
    );
  });

  protected readonly allChecked = computed(() => {
    const selectable = this.filteredRows().filter((r) => !r.locked);
    return selectable.length > 0 && selectable.every((r) => r.checked);
  });

  protected readonly sortItem = (a: RowVm, b: RowVm) => a.itemName.localeCompare(b.itemName);
  protected readonly sortDate = (a: RowVm, b: RowVm) =>
    (parseDmy(a.arDateStr)?.getTime() ?? 0) - (parseDmy(b.arDateStr)?.getTime() ?? 0);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  onPersonLoaded(info: EssPersonalHeadInfo): void {
    this.me = info ?? {};
    void this.loadDefaultApprovers();
  }

  private async loadDefaultApprovers(): Promise<void> {
    if (!this.me.personId) return;
    try {
      this.approvers.set(await this.approverService.getDefaultApprovers(APPLY_TYPE_NO, this.me.personId, APPLY_TYPE_NO, '0'));
    } catch {
      this.approvers.set([]);
    }
  }

  private toDmy(value: Date | null): string {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : '';
  }

  private toRowVm(r: CwaAbnormalRow): RowVm {
    const dateStr = r.arDateStr ?? '';
    return {
      pkNo: r.pkNo ?? '',
      personId: r.personId ?? '',
      empId: r.empId ?? '',
      itemNo: r.itemNo ?? '',
      itemName: r.itemName || r.itemNo || '',
      arDateStr: dateStr,
      indoorTime: r.indoorTime ?? '',
      outdoorTime: r.outdoorTime ?? '',
      locked: r.lockYn !== 'N',
      checked: false,
      inDate: parseDmy(r.shiftStartYyyy || dateStr),
      inHour: r.shiftStartHh || '',
      inMinute: '',
      outDate: parseDmy(r.shiftEndYyyy || dateStr),
      outHour: r.shiftEndHh || '',
      outMinute: '',
      reason: '',
    };
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.listService.getList(this.toDmy(this.startDate()), this.toDmy(this.endDate()));
      this.rows.set((list ?? []).map((r) => this.toRowVm(r)));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  updateRow(pkNo: string, patch: Partial<RowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.pkNo === pkNo ? { ...r, ...patch } : r)));
  }

  toggleAll(checked: boolean): void {
    const keys = new Set(this.filteredRows().filter((r) => !r.locked).map((r) => r.pkNo));
    this.rows.update((rows) => rows.map((r) => (keys.has(r.pkNo) ? { ...r, checked } : r)));
  }

  /** "Toàn bộ phản ánh" (check_all): gán giờ vào/ra cho các dòng đang chọn */
  applyAll(): void {
    if (!this.rows().some((r) => r.checked)) {
      this.message.error(this.i18n.t('ess.infoApply.PLEASE_SELECT_OPERTE.Z', 'Vui lòng chọn đối tượng cần thao tác'));
      return;
    }
    this.rows.update((rows) =>
      rows.map((r) =>
        r.checked
          ? {
              ...r,
              inDate: this.batchInDate(),
              inHour: this.batchInHour(),
              inMinute: this.batchInMinute(),
              outDate: this.batchOutDate(),
              outHour: this.batchOutHour(),
              outMinute: this.batchOutMinute(),
            }
          : r,
      ),
    );
  }

  private toApiDateTime(date: Date | null, hour: string, minute: string): string {
    return date ? `${formatDate(date, 'yyyy/MM/dd', 'en-US')} ${hour}:${minute.padStart(2, '0')}` : '';
  }

  private calcWorkHour(row: RowVm): string {
    const from = new Date(this.toApiDateTime(row.inDate, row.inHour, row.inMinute));
    const to = new Date(this.toApiDateTime(row.outDate, row.outHour, row.outMinute));
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || to <= from) return '0';
    return ((to.getTime() - from.getTime()) / 3600000).toFixed(2);
  }

  /** DD/MM/YYYY -> YYYY/MM/DD (định dạng AR_DATE_STR trong DB) */
  private toArDateStr(dmy: string): string {
    const p = dmy.split('/');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dmy;
  }

  private validate(selected: RowVm[]): string | null {
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    const timeError = t('ess.infoApply.PLEASE_SELECT_CORRECT_TIME.Z', 'Vui lòng chọn thời gian chính xác');
    for (const r of selected) {
      if (!r.reason.trim()) return t('ga.viewApplyCard.APPLY_REASON_NOT_NULL.d', 'Không được để trống lý do đăng ký!');
      if (!r.inDate || !r.inHour || !isValidMinute(r.inMinute)) return timeError;
      if (!r.outDate || !r.outHour || !isValidMinute(r.outMinute)) return timeError;
    }
    if (!selected.length) return t('ess.infoApply.PLEASE_SELECT_OPERTE.Z', 'Vui lòng chọn đối tượng cần thao tác');
    const approverError = ApproverChainService.validate(this.approvers());
    if (approverError) return t(approverError.key, approverError.fallback);
    return null;
  }

  submit(): void {
    const selected = this.rows().filter((r) => r.checked && !r.locked);
    const error = this.validate(selected);
    if (error) {
      this.message.error(error);
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.alert.message.viewArAnnualStandard.consubmit', 'Đồng ý lưu không?'),
      nzOnOk: () => this.doSubmit(selected),
    });
  }

  private async doSubmit(selected: RowVm[]): Promise<void> {
    const items: AbnormalApplyItem[] = selected.map((r) => ({
      applyNo: r.pkNo,
      personId: r.personId || this.me.personId || '',
      empId: r.empId || this.me.empId || '',
      localName: this.me.localName ?? '',
      itemNo: r.itemNo === ITEM_ABSENT ? ITEM_FORGET_CARD : r.itemNo,
      arDateStr: this.toArDateStr(r.arDateStr),
      fromDateTime: this.toApiDateTime(r.inDate, r.inHour, r.inMinute),
      toDateTime: this.toApiDateTime(r.outDate, r.outHour, r.outMinute),
      workHour: this.calcWorkHour(r),
      remark: r.reason,
    }));
    this.submitting.set(true);
    try {
      const res = await this.service.apply(items, ApproverChainService.toSaveItems(this.approvers()));
      if (res.success) {
        this.message.success(this.i18n.t(res.messageKey || 'alert.message.save_success', 'Lưu thành công'));
        await this.search();
      } else {
        this.message.error(essApplyErrorText(this.i18n, res));
      }
    } catch {
      this.message.error(this.i18n.t('alert.message.add_fail', 'Lưu thất bại'));
    } finally {
      this.submitting.set(false);
    }
  }
}
