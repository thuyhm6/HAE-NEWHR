import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { ApproverChainComponent } from '../../../shared/approver-chain/approver-chain.component';
import { ApproverChainItem, ApproverChainService } from '../../../shared/approver-chain/approver-chain.service';
import { essApplyErrorText } from '../../../shared/ess-apply-response';
import { EssPersonalHeadComponent } from '../../../shared/ess-personal-head/ess-personal-head.component';
import { EssPersonalHeadInfo } from '../../../shared/ess-personal-head/ess-personal-head.service';
import { CAR_ADDRESS_PARENT_CODE, OT_TYPE_PARENT_CODE, SstOtApplyService, SyCodeOption } from './sst-ot-apply.service';

/** Giới hạn hiển thị cố định ở JSP gốc (OT_TOTAIL_MONTH_LIMIT / OT_TOTAIL_LIMIT) */
const OT_MONTH_LIMIT = 40;
const OT_YEAR_LIMIT = 300;
/** Trưởng bộ phận nhân sự cố định ở JSP gốc (HRAffirmID) - dùng khi API không trả về */
const HR_AFFIRM_ID = '35455053';
const MIN_1H_POST_FAMILIES = ['14015813', '14015814'];
const MIN_HALF_H_POST_FAMILY = '14015815';

/**
 * Danh sách giờ giống tag <ait:time spacing="15"> của bản cũ: 00:00 ~ 23:45 cách 15 phút,
 * chèn thêm 04:58, 15:33, 16:33, 17:33 ngay trước 05:00, 15:45, 16:45, 17:45.
 */
function buildOtTimeOptions(): string[] {
  const extras: Record<string, string> = { '05:00': '04:58', '15:45': '15:33', '16:45': '16:33', '17:45': '17:33' };
  const result: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      if (extras[t]) result.push(extras[t]);
      result.push(t);
    }
  }
  return result;
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toNumber(value: unknown): number {
  const n = parseFloat(String(value ?? ''));
  return isNaN(n) ? 0 : n;
}

/**
 * Xin tăng ca cho chính nhân viên đăng nhập - port đúng giao diện/chức năng 2 JSP
 * Hanwha_HAE gần như giống hệt nhau nên dùng chung 1 component, chọn biến thể qua
 * route data `otOver`:
 *  - /ess/infoApply/viewSSTOtApplyInfo   (tăng ca thường, OT_TYPE_NO 31, ESS_APPLY_OT)
 *  - /ess/infoApply/viewSSTOtApplyInfoTx (tăng ca vượt, OT_TYPE_NO 310, ESS_APPLY_OT_OVER)
 * Khác biệt giữ đúng bản gốc: rule giới hạn 40h/300h (thường chặn khi vượt, vượt chặn
 * khi CHƯA vượt), hàm kiểm tra trùng (AR_GET_OT_CLASH / AR_GET_OT_OVER_CLASH), giới hạn
 * giờ theo loại tăng ca chỉ áp dụng cho tăng ca thường, đổi ngày chấm công ở trang tăng
 * ca vượt thì gán luôn ngày bắt đầu/kết thúc.
 */
@Component({
  selector: 'app-sst-ot-apply',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzInputModule,
    NzRadioModule,
    NzSelectModule,
    ApproverChainComponent,
    EssPersonalHeadComponent,
  ],
  templateUrl: './sst-ot-apply.component.html',
  styleUrl: './sst-ot-apply.component.scss',
})
export class SstOtApplyComponent implements OnInit {
  private readonly service = inject(SstOtApplyService);
  private readonly approverService = inject(ApproverChainService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  /** true = tăng ca vượt (viewSSTOtApplyInfoTx) */
  protected readonly over: boolean = !!this.route.snapshot.data['otOver'];
  private readonly applyTypeNo = this.over ? '310' : '31';

  protected readonly OT_MONTH_LIMIT = OT_MONTH_LIMIT;
  protected readonly OT_YEAR_LIMIT = OT_YEAR_LIMIT;

  private me: EssPersonalHeadInfo = {};
  private hrAffirmIds: string[] = [HR_AFFIRM_ID];

  protected readonly timeOptions = signal<string[]>(buildOtTimeOptions());
  protected readonly otTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly carAddressOptions = signal<SyCodeOption[]>([]);
  protected readonly carAddressDetailOptions = signal<SyCodeOption[]>([]);

  protected readonly applyDate = signal<Date | null>(today());
  protected readonly otFromDate = signal<Date | null>(today());
  protected readonly otFromTime = signal('17:33');
  protected readonly otToDate = signal<Date | null>(today());
  protected readonly otToTime = signal('19:45');
  protected readonly otTypeCode = signal<string | null>(null);

  protected readonly shiftName = signal('');
  protected readonly shiftTime = signal('');
  private shiftEndTime = '';
  protected readonly indoorTime = signal('');
  protected readonly outdoorTime = signal('');
  protected readonly otTotalMonth = signal('');
  protected readonly otTotalYear = signal('');

  protected readonly offsetYn = signal('0');
  protected readonly deductYn = signal('0');
  protected readonly usecarYn = signal('0');
  protected readonly carAddress = signal<string | null>(null);
  protected readonly carAddressDetail = signal<string | null>(null);

  protected readonly otLength = signal(0);
  private otLimitMonth = '0';
  private otLimitYear = '0';
  private lengthSeq = 0;

  protected readonly reason = signal('');
  protected readonly approvers = signal<ApproverChainItem[]>([]);
  protected readonly submitting = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.service.getCodeOptions(OT_TYPE_PARENT_CODE).then((l) => this.otTypeOptions.set(l), () => this.otTypeOptions.set([]));
    this.service.getCodeOptions(CAR_ADDRESS_PARENT_CODE).then((l) => this.carAddressOptions.set(l), () => this.carAddressOptions.set([]));
    this.service.getHrDeptManager().then(
      (mgr) => {
        if (mgr?.PERSON_ID) this.hrAffirmIds = [HR_AFFIRM_ID, mgr.PERSON_ID];
      },
      () => undefined,
    );
  }

  /** Khi đã có thông tin user -> nạp ca làm việc ngày hôm nay (getDefaultOtTimeSST lúc mở trang) */
  onPersonLoaded(info: EssPersonalHeadInfo): void {
    this.me = info ?? {};
    void this.loadShiftTime();
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
  }

  private toApiDateTime(date: Date | null, time: string): string {
    return date && time ? `${this.toApiDate(date)} ${time}` : '';
  }

  /** Giá trị giờ server trả về có thể không nằm trong danh sách -> thêm vào để select hiển thị được */
  private ensureTimeOption(time: string): void {
    if (time && !this.timeOptions().includes(time)) {
      this.timeOptions.set([...this.timeOptions(), time].sort());
    }
  }

  // ── Đổi ngày ─────────────────────────────────────────────────────────────
  onApplyDateChange(value: Date | null): void {
    this.applyDate.set(value);
    if (this.over) {
      // getDefaultOtTimeSSTOver(1): gán ngày bắt đầu/kết thúc = ngày chấm công
      this.otFromDate.set(value);
      this.otToDate.set(value);
    }
    void this.loadShiftTime();
  }

  onOtFromDateChange(value: Date | null): void {
    this.otFromDate.set(value);
    void this.loadShiftTime();
  }

  onOtToDateChange(value: Date | null): void {
    this.otToDate.set(value);
    void this.loadShiftTime();
  }

  onTimeChange(): void {
    void this.loadOtLength(true);
  }

  onDeductChange(value: string): void {
    this.deductYn.set(value);
    void this.loadOtLength(false);
  }

  // ── getDefaultOtTimeSST: ca làm việc, loại tăng ca, giờ mặc định ─────────
  private async loadShiftTime(): Promise<void> {
    const applyDate = this.toApiDate(this.applyDate());
    if (!applyDate) return;
    try {
      const d = await this.service.getShiftTime(applyDate);
      const start = d.shiftStartTime ?? '';
      const end = d.shiftEndTime ?? '';
      let type = '34';
      if (d.dateType === '1440') {
        type = '32';
      } else if (d.dateType === '90000425') {
        type = '218181';
      } else if (d.dateType === '1441') {
        type = '33';
      }
      this.otTypeCode.set(type);
      // Ngày thường giữ nguyên giờ đang chọn, ngày nghỉ/lễ lấy theo giờ ca
      if (type !== '32') {
        this.ensureTimeOption(start);
        this.ensureTimeOption(end);
        if (start) this.otFromTime.set(start);
        if (end) this.otToTime.set(end);
      }
      this.offsetYn.set('0');
      this.shiftName.set(d.shiftName ?? '');
      this.shiftTime.set(`${start}~${end}`);
      this.shiftEndTime = d.arShiftEndTime ?? '';
      this.indoorTime.set(d.indoorTime ?? '');
      this.outdoorTime.set(d.outdoorTime ?? '');
      this.otTotalMonth.set(d.otTotailMonth ?? '');
      this.otTotalYear.set(d.otTotail ?? '');
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
    await this.loadOtLength(true);
  }

  // ── getOtLengthSST: thời lượng + cờ giới hạn, tự xác định qua ngày, nạp người duyệt mặc định ──
  private async loadOtLength(detectOffset: boolean): Promise<void> {
    const applyDate = this.toApiDate(this.applyDate());
    const from = this.toApiDateTime(this.otFromDate(), this.otFromTime());
    const to = this.toApiDateTime(this.otToDate(), this.otToTime());
    if (!applyDate || !from || !to) return;
    const seq = ++this.lengthSeq;
    void this.loadDefaultApprovers();
    try {
      const d = await this.service.getOtLength(applyDate, this.otTypeCode() ?? '', from, to, this.deductYn());
      if (seq !== this.lengthSeq) return;
      this.otLength.set(toNumber(d.otLength));
      this.otLimitMonth = String(d.otLimitMonth ?? '0');
      this.otLimitYear = String(d.otLimitYear ?? '0');
      if (detectOffset) {
        this.offsetYn.set(this.otToTime() < this.otFromTime() ? '1' : '0');
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  /** getAffirmor_OT: bản gốc gọi với applyLength = 0 và nạp lại toàn bộ bảng mỗi lần tính lại thời lượng */
  private async loadDefaultApprovers(): Promise<void> {
    if (!this.me.personId) return;
    try {
      this.approvers.set(
        await this.approverService.getDefaultApprovers(this.applyTypeNo, this.me.personId, this.otTypeCode() ?? '', '0'),
      );
    } catch {
      this.approvers.set([]);
    }
  }

  // ── Đặt xe ───────────────────────────────────────────────────────────────
  onUsecarChange(value: string): void {
    this.usecarYn.set(value);
    if (value === '0') {
      this.carAddress.set(null);
      this.carAddressDetail.set(null);
      this.carAddressDetailOptions.set([]);
    }
  }

  async onCarAddressChange(value: string | null): Promise<void> {
    this.carAddress.set(value);
    this.carAddressDetail.set(null);
    if (!value) {
      this.carAddressDetailOptions.set([]);
      return;
    }
    try {
      this.carAddressDetailOptions.set(await this.service.getCarAddressDetailOptions(value));
    } catch {
      this.carAddressDetailOptions.set([]);
    }
  }

  // ── Lưu (viewSSTOtApplyInfo_save / viewSSTOtApplyInfoTx_save) ─────────────
  private t(key: string, fallback: string): string {
    return this.i18n.t(key, fallback);
  }

  /** Kiểm tra phía client trước khi gọi AR_GET_OT_CLASH */
  private validateBeforeClash(): string | null {
    const len = this.otLength();
    const month = toNumber(this.otTotalMonth());
    const year = toNumber(this.otTotalYear());
    const postFamily = this.me.postFamily ?? '';
    if (!this.reason().trim()) return this.t('ga.viewApplyCard.APPLY_REASON_NOT_NULL.d', 'Không được để trống lý do đăng ký!');
    if (len === 0) return this.t('ess.infoApply.JIABAN_LONGER_THAN_0.Z', 'Thời lượng tăng ca phải lớn hơn 0');
    if (MIN_1H_POST_FAMILIES.includes(postFamily) && len < 1) {
      return this.t('alert.message.GUANLIZHIZUISHAOJIABANYIXIAOSHI.b', 'Chức quản lý tăng ca tối thiểu 1 giờ');
    }
    if (postFamily === MIN_HALF_H_POST_FAMILY && len < 0.5) {
      return this.t('alert.message.SHENGCHANZHIZUISHAOJIABANBANXIAOSHI.b', 'Chức sản xuất tăng ca tối thiểu 0.5 giờ');
    }
    if (this.over) {
      if (month + len < OT_MONTH_LIMIT && year + len < OT_YEAR_LIMIT) {
        return this.t('ess.viewSSTOtApplyInfo.OVERTIMELIMIT40HOUR.b', 'Bạn chưa vượt quá giờ làm thêm trong tháng (40h)!');
      }
      return null;
    }
    if (month + len >= 30 && month + len < OT_MONTH_LIMIT) {
      // Bản gốc chỉ cảnh báo (alert) rồi vẫn cho tiếp tục
      this.message.warning(this.t('ess.viewSSTOtApplyInfo.JIABANCHAOGUOYUESHANGXIAN.a', '30h: Sắp vượt quá giờ làm thêm trong tháng (40h)!'));
    }
    if ((month + len > OT_MONTH_LIMIT && this.otLimitMonth === '1') || month + len > OT_MONTH_LIMIT) {
      return this.t('ess.viewSSTOtApplyInfo.JIABANCHAOGUOYUESHANGXIAN.b', 'Thời gian tăng ca vượt giới hạn tháng, không thể xin!');
    }
    if (year + len > OT_YEAR_LIMIT && this.otLimitYear === '1') {
      return this.t('ess.viewSSTOtApplyInfo.JIABANCHAOGUONIANSHANGXIAN.a', 'Tăng ca vượt quá thời gian tối đa trong năm (300h)!');
    }
    return null;
  }

  private clashError(flag: number): string | null {
    if (flag > 0) return this.t('ar.viewArOvertimeManagentFast.JIABANSHIJIANCHONGTUQINGJIANCHA.b', 'Trùng với tăng ca đã có, xin kiểm tra!');
    switch (flag) {
      case -1:
        return this.t('ar.viewApplyAttenanceManagentInfoList.BAOHANKAOQINGUANBIDESHIJIAN.b', 'Bao gồm thời gian đã đóng chấm công');
      case -2:
        return this.t('ar.viewArOvertimeManaget_fast.Include_apply_closed.b', 'Bao gồm thời gian đã khóa đăng ký');
      case -3:
        return this.t('ess.viewSSTOtApplyInfo.JIABANCHAOGUOYUESHANGXIAN.b', 'Thời gian tăng ca vượt giới hạn tháng, không thể xin!');
      case -4:
        return this.t('ess.viewSSTOtApplyInfo.JIABANCHAOGUONIANSHANGXIAN.b', 'Thời gian tăng ca vượt giới hạn năm, không thể xin!');
      case -5:
        return this.t('alert.message.ess.trans.passAgentTransInBatch_fail', 'Không thể tăng ca!');
      default:
        return null;
    }
  }

  private validateAfterClash(): string | null {
    const len = this.otLength();
    const type = this.otTypeCode() ?? '';
    if (!this.over) {
      if (type === '32' && len > 4) {
        return this.t('ess.viewSSTOtApplyInfo.PINGRIJIABANSHANGXIANSIXIAOSHI.b', 'Ngày thường tăng ca tối đa 4 giờ, xin chọn lại!');
      }
      if ((type === '33' || type === '218181') && len > 12) {
        return this.t('ess.viewSSTOtApplyInfo.PAINDLEAVE.b', 'Tăng ca ngày nghỉ tối đa 12 tiếng, xin lựa chọn lại!');
      }
    }
    const approverError = ApproverChainService.validate(this.approvers());
    if (approverError) return this.t(approverError.key, approverError.fallback);
    // Nộp sau giờ kết thúc ca -> bắt buộc có Trưởng bộ phận nhân sự trong dây chuyền duyệt
    const shiftEnd = new Date(this.shiftEndTime);
    if (this.shiftEndTime && !isNaN(shiftEnd.getTime()) && Date.now() > shiftEnd.getTime()) {
      if (!this.approvers().some((a) => this.hrAffirmIds.includes(a.personId))) {
        return this.t('ar.viewArOvertimeManaget_fast.Apply_closed.Ad_HR_Director.b', 'Đã vượt quá thời gian xin tăng ca, bạn cần phải thêm giám đốc bộ phận HR vào phê duyệt!');
      }
    }
    return null;
  }

  async submit(): Promise<void> {
    let error = this.validateBeforeClash();
    if (error) {
      this.message.error(error);
      return;
    }
    const from = this.toApiDateTime(this.otFromDate(), this.otFromTime());
    const to = this.toApiDateTime(this.otToDate(), this.otToTime());
    try {
      const res = await this.service.checkClash(from, to, this.offsetYn(), this.over);
      error = this.clashError(toNumber(res.flag));
    } catch {
      error = this.t('common.loadError', 'Lỗi tải dữ liệu');
    }
    error = error ?? this.validateAfterClash();
    if (error) {
      this.message.error(error);
      return;
    }
    this.modal.confirm({
      nzTitle: this.t('ess.infoApply.title.otConfirm', 'Bạn đã ghi rõ lý do, công đoạn làm việc mà bạn đăng ký tăng ca chưa?'),
      nzOnOk: () => this.doSave(from, to),
    });
  }

  private async doSave(from: string, to: string): Promise<void> {
    this.submitting.set(true);
    try {
      const res = await this.service.save(
        {
          applyOtDate: this.toApiDate(this.applyDate()),
          otFromTime: from,
          otToTime: to,
          otTypeCode: this.otTypeCode() ?? '',
          otApplyHour: String(this.otLength()),
          applyOtRemark: this.reason(),
          offsetYn: this.offsetYn(),
          deductYn: this.deductYn(),
          usecarYn: this.usecarYn(),
          carAddress: this.carAddress() ?? '',
          carAddressDetail: this.carAddressDetail() ?? '',
          localName: this.me.localName ?? '',
          empId: this.me.empId ?? '',
          approvers: ApproverChainService.toSaveItems(this.approvers()),
        },
        this.over,
      );
      if (res.success) {
        this.message.success(this.t(res.messageKey || 'alert.message.save_success', 'Lưu thành công'));
        this.resetForm();
      } else {
        this.message.error(essApplyErrorText(this.i18n, res));
      }
    } catch {
      this.message.error(this.t('alert.message.add_fail', 'Lưu thất bại'));
    } finally {
      this.submitting.set(false);
    }
  }

  private resetForm(): void {
    this.applyDate.set(today());
    this.otFromDate.set(today());
    this.otToDate.set(today());
    this.otFromTime.set('17:33');
    this.otToTime.set('19:45');
    this.deductYn.set('0');
    this.onUsecarChange('0');
    this.reason.set('');
    void this.loadShiftTime();
  }
}
