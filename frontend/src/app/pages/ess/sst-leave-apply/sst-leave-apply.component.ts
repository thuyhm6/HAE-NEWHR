import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { ApproverChainComponent } from '../../../shared/approver-chain/approver-chain.component';
import { ApproverChainItem, ApproverChainService } from '../../../shared/approver-chain/approver-chain.service';
import { EssPersonalHeadComponent } from '../../../shared/ess-personal-head/ess-personal-head.component';
import { EssPersonalHeadInfo } from '../../../shared/ess-personal-head/ess-personal-head.service';
import { essApplyErrorText } from '../../../shared/ess-apply-response';
import { SstLeaveApplyService, SyCodeOption, VacationInfo } from './sst-leave-apply.service';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
/** Danh sách phút đúng như select fromTime_fen / toTime_fen ở JSP gốc */
const MINUTE_OPTIONS = ['00', '03', '10', '20', '30', '33', '40', '45', '50', '58'];
/** Loại nghỉ cần kiểm tra giới tính khi chọn (getLeaveDateSST) */
const SEX_CHECK_TYPES = ['27', '16415', '28', '482', '141474'];
const EPSILON = 1e-10;

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Xin nghỉ phép cho chính nhân viên đăng nhập - /ess/infoApplyAttendance/viewSSTApplyAttendance.
 * Port đúng giao diện/chức năng JSP Hanwha_HAE (viewSSTApplyAttendance.jsp):
 * ngày + giờ + phút rời (danh sách phút như bản gốc, mặc định 07:45 ~ 17:33),
 * thông tin phép năm hiện sau khi chọn loại nghỉ, cách hiển thị thời lượng
 * (ngày/giờ, phút với nghỉ phụ nữ), toàn bộ rule kiểm tra trước khi gửi theo
 * đúng thứ tự bản gốc và bảng người duyệt tự chọn (bản gốc không nạp sẵn dây
 * chuyền duyệt mặc định ở màn hình này).
 */
@Component({
  selector: 'app-sst-leave-apply',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzInputModule,
    NzSelectModule,
    ApproverChainComponent,
    EssPersonalHeadComponent,
  ],
  templateUrl: './sst-leave-apply.component.html',
  styleUrl: './sst-leave-apply.component.scss',
})
export class SstLeaveApplyComponent implements OnInit {
  private readonly service = inject(SstLeaveApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly hourOptions = HOUR_OPTIONS;
  protected readonly minuteOptions = MINUTE_OPTIONS;

  private me: EssPersonalHeadInfo = {};

  protected readonly leaveTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly leaveTypeCode = signal<string | null>(null);
  protected readonly vacInfo = signal<VacationInfo | null>(null);
  /** view_vac_sub: ẩn cho tới khi chọn loại nghỉ lần đầu */
  protected readonly showVacInfo = signal(false);

  protected readonly fromDate = signal<Date | null>(today());
  protected readonly fromHour = signal('07');
  protected readonly fromMinute = signal('45');
  protected readonly toDate = signal<Date | null>(today());
  protected readonly toHour = signal('17');
  protected readonly toMinute = signal('33');

  /** shenqingshichangText / shenqingshichang (giờ) / shenchangFormatHour (ngày) - giá trị khởi tạo như bản gốc */
  protected readonly durationText = signal('');
  private applyLength = 8;
  private applyLengthDay = 1;
  private calcSeq = 0;

  protected readonly reason = signal('');
  protected readonly approvers = signal<ApproverChainItem[]>([]);
  protected readonly submitting = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.durationText.set(`1 ${this.i18n.t('ar.viewitemparameter.title.dayofunit', 'Ngày')}`);
    try {
      this.leaveTypeOptions.set(await this.service.getLeaveTypeOptions());
    } catch {
      this.leaveTypeOptions.set([]);
    }
    try {
      this.vacInfo.set(await this.service.getVacationInfo());
    } catch {
      this.vacInfo.set(null);
    }
  }

  onPersonLoaded(info: EssPersonalHeadInfo): void {
    this.me = info ?? {};
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  protected vacValue(field: keyof VacationInfo): string {
    const v = this.vacInfo()?.[field];
    return v === null || v === undefined || v === '' ? '' : String(v);
  }

  /** VAC_SHENGYU = TOT_VAC_CNT - USE_VAC */
  private get vacRemain(): number {
    const info = this.vacInfo();
    return toNumber(info?.TOT_VAC_CNT) - toNumber(info?.USE_VAC);
  }

  protected get vacRemainText(): string {
    return this.vacInfo() ? String(this.vacRemain) : '';
  }

  // ── Đổi loại nghỉ (APPLY_TYPE_CODE change + composeLeaveTime) ────────────
  async onLeaveTypeChange(code: string | null): Promise<void> {
    this.leaveTypeCode.set(code);
    this.showVacInfo.set(true);
    if (code && SEX_CHECK_TYPES.includes(code) && this.me.personId) {
      try {
        const res = await this.service.checkLeaveSex(this.me.personId, code);
        if (!res.valid && res.messageKey) {
          this.message.error(this.i18n.t(res.messageKey, res.messageKey));
          this.leaveTypeCode.set(null);
        }
      } catch {
        // lỗi kiểm tra không chặn người dùng - backend kiểm tra lại khi lưu
      }
    }
    if (code === '14015956') {
      this.message.info(this.i18n.t('alert.message.ess.changQiBingJia', 'Nghỉ ốm dài ngày'));
    }
    await this.calcLength();
  }

  onFromDateChange(value: Date | null): void {
    this.fromDate.set(value);
    void this.calcLength();
  }

  onToDateChange(value: Date | null): void {
    this.toDate.set(value);
    void this.calcLength();
  }

  onTimeChange(): void {
    void this.calcLength();
  }

  private toApiDateTime(date: Date | null, hour: string, minute: string): string {
    return date ? `${formatDate(date, 'yyyy-MM-dd', 'en-US')} ${hour}:${minute}` : '';
  }

  // ── Tính thời lượng (callength) ──────────────────────────────────────────
  private async calcLength(): Promise<void> {
    const from = this.toApiDateTime(this.fromDate(), this.fromHour(), this.fromMinute());
    let to = this.toApiDateTime(this.toDate(), this.toHour(), this.toMinute());
    if (!from || !to || !this.me.personId) {
      return;
    }
    // Kết thúc không sau bắt đầu -> ngày kết thúc = ngày bắt đầu (như bản gốc)
    if (to <= from) {
      this.toDate.set(this.fromDate());
      to = this.toApiDateTime(this.fromDate(), this.toHour(), this.toMinute());
    }
    const code = this.leaveTypeCode() ?? '';
    const seq = ++this.calcSeq;
    try {
      const res = await this.service.getLeaveLength(this.me.personId, from, to, code);
      if (seq !== this.calcSeq) return;
      const len = toNumber(res.applyLength);
      const dayHour = toNumber(res.dayHours);
      this.applyLength = Number(len.toFixed(1));
      const unitHour = this.i18n.t('ar.viewitemparameter.title.xiaoshi', 'Giờ');
      let text = '';
      if (code === '141474') {
        if (len > 0) text += `${len} ${this.i18n.t('ar.viewitemparameter.title.fenzhong', 'Phút')}`;
      } else if (dayHour > 0) {
        const days = Math.floor(len / dayHour);
        this.applyLengthDay = Number((len / dayHour).toFixed(1));
        if (days > 0) text += `${days} ${this.i18n.t('ar.viewitemparameter.title.dayofunit', 'Ngày')} `;
        const hours = code === '90000803' ? 0 : len % dayHour;
        if (Math.abs(hours) > EPSILON) text += `${hours.toFixed(1)} ${unitHour}`;
      }
      this.durationText.set(text || ` 0 ${unitHour}`);
    } catch {
      // giữ nguyên giá trị cũ giống bản gốc khi ajax lỗi
    }
  }

  // ── Lưu (viewSSTApplyAttendance_save) ────────────────────────────────────
  private validate(): string | null {
    const t = (key: string, fallback: string) => this.i18n.t(key, fallback);
    const code = this.leaveTypeCode() ?? '';
    const len = this.applyLength;
    const days = this.applyLengthDay;
    const remain = this.vacRemain;
    if (!this.reason().trim()) return t('ga.viewApplyCard.APPLY_REASON_NOT_NULL.d', 'Không được để trống lý do đăng ký!');
    if (!this.fromDate()) return t('ess.infoApplyAttendance.PLEASE_ATTENDANCE_SDATE.Z', 'Vui lòng chọn thời gian bắt đầu!');
    if (len === 0) return t('ess.infoApplyAttendance.ATTENDANCE_LONGER_THAN_0.Z', 'Thời lượng phải lớn hơn 0');
    if (!this.toDate()) return t('ess.infoApplyAttendance.PLEASE_ATTENDANCE_EDATE.Z', 'Vui lòng chọn thời gian kết thúc!');
    if (!code) return t('ess.infoApplyAttendance.PLEASE_ATTENDANCE_TYPE.Z', 'Vui lòng chọn loại nghỉ!');
    const from = this.toApiDateTime(this.fromDate(), this.fromHour(), this.fromMinute());
    const to = this.toApiDateTime(this.toDate(), this.toHour(), this.toMinute());
    if (to <= from) return t('ess.infoApplyAttendance.ATTENDANCE_SDATE_THAN_EDATE.Z', 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
    if (code === '22' && days > 5) return t('alert.message.GERENHUNJIAZUIDUOSANTIAN.b', 'Nghỉ kết hôn tối đa 5 ngày!');
    if (code === '124851') return t('ga.affirmApplyGeneralAffairs.businesscancel', 'Chỉ có thể đăng ký đi công tác tại giao diện xin đi công tác!');
    if (code === '27' && days > 180) return t('alert.message.CHANJIAZUIDUOYIBAIBASHITIAN.b', 'Nghỉ thai sản tối đa 180 ngày!');
    if (code === '23' && days > 5) return t('alert.message.YOUXINSANGJIAZUIDUOSANTIAN.b', 'Nghỉ tang có lương tối đa 5 ngày!');
    if (code === '80000229' && days > 1) {
      return `${t('ess.infoApplyAttendance.ATTENDANCE_DAY_CAN_NOT_GREATER_THAN', 'Thời gian nghỉ không được phép lớn hơn')} 1`;
    }
    if (code === '26') {
      if (days > remain) return t('ar.viewApplyAttenanceManagentInfoList.NIANJIASHISHUBUZU.b', 'Số giờ phép năm không đủ');
      if (Math.abs(days % 0.5) > EPSILON) return t('ar.viewApplyAttenanceManagentInfoList.FANGJIAZUIXIAOBANTIAN.b', 'Phép ít nhất là nửa ngày');
    }
    if (code === '90000813') {
      if (remain !== 0) return t('ar.viewApplyAttenanceManagentInfoList.TIAOXIUSHISHUBUZU.b', 'Số giờ nghỉ bù không đủ');
      if (days > 3) return t('ar.viewApplyAttenanceManagentInfoList.TIAOXIUSHISHUBUZU.HAE.b', 'Loại nghỉ này chỉ được xin tối đa 3 ngày!');
    }
    if (code === '18135' && remain >= 0.5) {
      return t('alert.message.ess.infoApply.haveAnnualCannotApplyPersonalLeave', 'Còn phép năm, không thể xin nghỉ việc riêng');
    }
    if (code === '141474' && len > 180) {
      return t('alert.message.ess.infoApply.womenDayCanNotExceedThreeHours', 'Nghỉ phụ nữ không được vượt quá 3 tiếng');
    }
    const approverError = ApproverChainService.validate(this.approvers());
    if (approverError) return t(approverError.key, approverError.fallback);
    return null;
  }

  submit(): void {
    const error = this.validate();
    if (error) {
      this.message.error(error);
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ess.message.confirm_sava', 'Bạn có chắc chắn muốn lưu không?'),
      nzOnOk: () => this.doSave(),
    });
  }

  private async doSave(): Promise<void> {
    this.submitting.set(true);
    try {
      const res = await this.service.save({
        applyNo: '',
        personId: this.me.personId ?? '',
        empId: this.me.empId ?? '',
        localName: this.me.localName ?? '',
        leaveTypeCode: this.leaveTypeCode() ?? '',
        leaveFromTime: this.toApiDateTime(this.fromDate(), this.fromHour(), this.fromMinute()),
        leaveToTime: this.toApiDateTime(this.toDate(), this.toHour(), this.toMinute()),
        applyLength: String(this.applyLength),
        leaveReason: this.reason(),
        approvers: ApproverChainService.toSaveItems(this.approvers()),
      });
      if (res.success) {
        this.message.success(this.i18n.t(res.messageKey || 'alert.message.save_success', 'Lưu thành công'));
        this.resetForm();
        this.vacInfo.set(await this.service.getVacationInfo().catch(() => null));
      } else {
        this.message.error(essApplyErrorText(this.i18n, res));
      }
    } catch {
      this.message.error(this.i18n.t('alert.message.add_fail', 'Lưu thất bại'));
    } finally {
      this.submitting.set(false);
    }
  }

  private resetForm(): void {
    this.leaveTypeCode.set(null);
    this.showVacInfo.set(false);
    this.fromDate.set(today());
    this.fromHour.set('07');
    this.fromMinute.set('45');
    this.toDate.set(today());
    this.toHour.set('17');
    this.toMinute.set('33');
    this.applyLength = 8;
    this.applyLengthDay = 1;
    this.durationText.set(`1 ${this.i18n.t('ar.viewitemparameter.title.dayofunit', 'Ngày')}`);
    this.reason.set('');
    this.approvers.set([]);
  }
}

function toNumber(value: unknown): number {
  const n = parseFloat(String(value ?? ''));
  return isNaN(n) ? 0 : n;
}
