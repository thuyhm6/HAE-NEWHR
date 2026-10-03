import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  APPROV_TYPE_APPROVAL,
  APPROV_TYPE_NOTICE,
  ApproverInput,
  EmployeeSearchResult,
  MyInfo,
  OtDateInfo,
  SstOtApplyService,
  SyCodeOption,
} from '../sst-ot-apply/sst-ot-apply.service';

const SAVE_URL = '/ar/attendanceMintenance/api/overtime/saveOver';
const OT_TYPE_NO = '310';
const WEEKEND_HOLIDAY_OT_TYPE = '32';

function todayApiDate(): string {
  return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
}

/**
 * Form tạo đơn xin tăng ca VƯỢT (không giới hạn giờ/tháng/năm, lưu vào
 * ESS_APPLY_OT_OVER) - port lại từ ess/infoApply/viewSSTOtApplyInfoTx.html
 * (đã xoá) sang Angular + NG-ZORRO. Tách riêng khỏi SstOtApplyComponent
 * (tăng ca thường) vì trang này KHÔNG áp dụng các rule chỉ dành cho tăng ca
 * thường: giới hạn 40h/tháng - 300h/năm, min duration theo nhóm nhân viên,
 * max 3h (ngày lễ/cuối tuần)/12h (ngày thường), tự động thêm Trưởng bộ phận
 * nhân sự khi nộp đơn sau giờ làm - đúng theo rule nghiệp vụ gốc (trang
 * "vượt" không có các rule này). Vẫn dùng chung SstOtApplyService (chỉ là
 * các API GET/POST thuần dùng chung cho cả 2 trang, không chứa rule nghiệp
 * vụ khác biệt) để tránh viết lại code gọi API. Thay EmployeeSearchModal
 * (jQuery) bằng nz-select tìm kiếm server-side chọn người phê duyệt. Khối
 * "Thông tin nhân viên" tái dùng API myInfo() sẵn có, render bằng
 * nz-descriptions theo đúng pattern đã dùng ở SstLeaveApplyComponent.
 */
@Component({
  selector: 'app-sst-ot-apply-over',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './sst-ot-apply-over.component.html',
  styleUrl: './sst-ot-apply-over.component.scss',
})
export class SstOtApplyOverComponent implements OnInit {
  private readonly service = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  private personId = '';
  private localName = '';
  private empId = '';
  protected readonly myInfo = signal<MyInfo | null>(null);

  private readonly otLimitMonth = 40;
  private readonly otLimitYear = 300;
  private otLimitEnabled = false;
  private otLimit100Enabled = false;
  private otLength = 0;
  private calcTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly applyDate = signal<Date | null>(new Date());
  protected readonly otFromTime = signal<Date | null>(null);
  protected readonly otToTime = signal<Date | null>(null);
  protected readonly reason = signal('');
  protected readonly mealChecked = signal(false);
  protected readonly usecarChecked = signal(false);
  protected readonly carAddress = signal<string | null>(null);
  protected readonly carAddressDetail = signal<string | null>(null);

  protected readonly shiftName = signal('--');
  protected readonly workTime = signal('--');
  protected readonly indoorTime = signal('**:**');
  protected readonly outdoorTime = signal('**:**');
  protected readonly otTypeName = signal('--');
  protected readonly otTypeCode = signal('');
  protected readonly durationText = signal('--');
  protected readonly monthInfoText = signal('');
  protected readonly yearInfoText = signal('');

  protected readonly carAddressOptions = signal<SyCodeOption[]>([]);
  protected readonly carAddressDetailOptions = signal<SyCodeOption[]>([]);

  protected readonly approverList = signal<ApproverInput[]>([]);
  protected readonly approverSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly approverSearching = signal(false);
  protected readonly addingApprover = signal(false);
  protected readonly selectedApproverPersonId = signal<string | null>(null);
  protected readonly newApproverApprovType = signal<string>(APPROV_TYPE_APPROVAL);

  protected readonly submitting = signal(false);

  protected readonly APPROV_TYPE_APPROVAL = APPROV_TYPE_APPROVAL;
  protected readonly APPROV_TYPE_NOTICE = APPROV_TYPE_NOTICE;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();

    try {
      this.carAddressOptions.set(await this.service.getCarAddressOptions());
    } catch {
      this.carAddressOptions.set([]);
    }

    try {
      const info = await this.service.getMyInfo();
      this.personId = info.personId ?? '';
      this.localName = info.localName ?? '';
      this.empId = info.empId ?? '';
      this.myInfo.set(info);
    } catch {
      // im lặng bỏ qua - form vẫn dùng được, chỉ thiếu thông tin cá nhân mặc định
    }

    await this.loadDateInfo(todayApiDate());
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
  }

  private toApiDateTime(value: Date | null): string {
    // Mapper Oracle backend dùng TO_DATE(..., 'YYYY-MM-DD HH24:MI') - đã xác
    // nhận qua Batch E, giữ nhất quán cho toàn bộ endpoint tăng ca/nghỉ phép.
    return value ? formatDate(value, 'yyyy-MM-dd HH:mm', 'en-US') : '';
  }

  private parseServerDateTime(value?: string): Date | null {
    if (!value) {
      return null;
    }
    const normalized = value.trim().replace(' ', 'T');
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  }

  private extractTime(dtStr?: string): string {
    if (!dtStr) {
      return '';
    }
    const idx = dtStr.indexOf(' ');
    return idx > -1 ? dtStr.substring(idx + 1) : dtStr;
  }

  async onDateChange(value: Date | null): Promise<void> {
    this.applyDate.set(value);
    if (!value) {
      return;
    }
    await this.loadDateInfo(this.toApiDate(value));
  }

  private async loadDateInfo(dateApi: string): Promise<void> {
    this.shiftName.set(this.i18n.t('common.loading', 'Đang tải...'));
    this.workTime.set('');
    this.indoorTime.set('**:**');
    this.outdoorTime.set('**:**');
    this.otTypeName.set('...');
    this.otTypeCode.set('');
    this.monthInfoText.set('...');
    this.yearInfoText.set('');

    try {
      const d: OtDateInfo = await this.service.getOtDateInfo(dateApi);

      this.shiftName.set(d.SHIFT_NAME || '--');
      const shiftStartDisp = this.extractTime(d.SHIFT_START_TIME);
      const shiftEndDisp = this.extractTime(d.SHIFT_END_TIME);
      this.workTime.set(shiftStartDisp && shiftEndDisp ? `${shiftStartDisp}~${shiftEndDisp}` : '--');

      this.indoorTime.set(d.INDOOR_TIME || '**:**');
      this.outdoorTime.set(d.OUTDOOR_TIME || '**:**');

      const otTypeCode = String(d.OT_TYPE_CODE ?? '');
      this.otTypeName.set(d.OT_TYPE_NAME || '--');
      this.otTypeCode.set(otTypeCode);

      if (otTypeCode === WEEKEND_HOLIDAY_OT_TYPE) {
        if (d.SHIFT_END_TIME) {
          const from = this.parseServerDateTime(d.SHIFT_END_TIME);
          this.otFromTime.set(from);
          if (from) {
            const to = new Date(from);
            to.setHours(to.getHours() + 2);
            this.otToTime.set(to);
          }
        }
      } else {
        if (d.SHIFT_START_TIME) this.otFromTime.set(this.parseServerDateTime(d.SHIFT_START_TIME));
        if (d.SHIFT_END_TIME) this.otToTime.set(this.parseServerDateTime(d.SHIFT_END_TIME));
      }

      this.otLimitEnabled = String(d.OT_LIMIT) === '1';
      this.otLimit100Enabled = String(d.OT_LIMIT_100) === '1';

      const fmt = (v: unknown) => (v === null || v === undefined || v === '' ? '0' : String(v));
      this.monthInfoText.set(
        `${this.i18n.t('essOt.stat.thisMonth', 'Tháng này:')} ${fmt(d.OT_TOTAIL_MONTH)}h　${this.i18n.t('essOt.stat.weekday', 'Ngày thường:')} ${fmt(d.WEEKDAY_OT_TOTAIL)}h　` +
          (this.otLimitEnabled
            ? `${this.i18n.t('essOt.stat.maxOt', 'Tối đa:')} ${this.otLimitMonth}h ${this.i18n.t('essOt.limited', '(có giới hạn)')}`
            : this.i18n.t('essOt.unlimitedMonth', '(không giới hạn tháng)')),
      );
      this.yearInfoText.set(
        `${this.i18n.t('essOt.stat.thisYear', 'Năm nay:')} ${fmt(d.OT_TOTAIL)}h　` +
          (this.otLimit100Enabled
            ? `${this.i18n.t('essOt.stat.maxOt', 'Tối đa:')} ${this.otLimitYear}h ${this.i18n.t('essOt.limited', '(có giới hạn)')}`
            : this.i18n.t('essOt.unlimitedYear', '(không giới hạn năm)')),
      );

      this.calcDuration();
    } catch {
      this.clearDateInfo();
    }
  }

  private clearDateInfo(): void {
    this.shiftName.set('--');
    this.workTime.set('--');
    this.indoorTime.set('**:**');
    this.outdoorTime.set('**:**');
    this.otTypeName.set('--');
    this.otTypeCode.set('');
    this.monthInfoText.set('--');
    this.yearInfoText.set('');
    this.otLimitEnabled = false;
    this.otLimit100Enabled = false;
    this.otLength = 0;
  }

  onTimeChange(): void {
    this.calcDuration();
  }

  onMealCheckChange(): void {
    this.calcDuration();
  }

  private calcDuration(): void {
    if (this.calcTimer) {
      clearTimeout(this.calcTimer);
    }
    this.calcTimer = setTimeout(() => this.doCalcDuration(), 300);
  }

  private async doCalcDuration(): Promise<void> {
    const dateApi = this.toApiDate(this.applyDate());
    const fromVal = this.toApiDateTime(this.otFromTime());
    const toVal = this.toApiDateTime(this.otToTime());
    if (!dateApi || !fromVal || !toVal) {
      this.otLength = 0;
      this.durationText.set('--');
      return;
    }
    try {
      const d = await this.service.getOtDuration(dateApi, fromVal, toVal, this.mealChecked() ? '1' : '0');
      const len = d.OT_LENGTH != null ? parseFloat(String(d.OT_LENGTH)) : 0;
      this.otLength = isNaN(len) ? 0 : len;
      this.durationText.set(this.otLength > 0 ? `${this.otLength} h` : '--');
    } catch {
      this.otLength = 0;
      this.durationText.set('--');
    }
  }

  async onUsecarChange(checked: boolean): Promise<void> {
    this.usecarChecked.set(checked);
    if (!checked) {
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

  async onApproverSearch(keyword: string): Promise<void> {
    const trimmed = keyword?.trim();
    if (!trimmed) {
      this.approverSearchResults.set([]);
      return;
    }
    this.approverSearching.set(true);
    try {
      this.approverSearchResults.set(await this.service.searchEmployees(trimmed));
    } catch {
      this.approverSearchResults.set([]);
    } finally {
      this.approverSearching.set(false);
    }
  }

  showAddApproverRow(): void {
    this.addingApprover.set(true);
    this.selectedApproverPersonId.set(null);
    this.newApproverApprovType.set(APPROV_TYPE_APPROVAL);
    this.approverSearchResults.set([]);
  }

  cancelAddApprover(): void {
    this.addingApprover.set(false);
    this.selectedApproverPersonId.set(null);
  }

  /** Thêm ngay khi chọn xong - xem ghi chú tương tự ở SstLeaveApplyComponent. */
  onApproverSelected(personId: string | null): void {
    this.selectedApproverPersonId.set(personId);
    if (!personId) {
      return;
    }
    const emp = this.approverSearchResults().find((e) => e.personId === personId);
    if (emp) {
      this.approverList.set([
        ...this.approverList(),
        {
          personId: emp.personId ?? '',
          localName: emp.localName ?? '',
          empId: emp.empId ?? '',
          approvType: this.newApproverApprovType(),
        },
      ]);
    }
    this.addingApprover.set(false);
    this.selectedApproverPersonId.set(null);
  }

  removeApprover(idx: number): void {
    const list = [...this.approverList()];
    list.splice(idx, 1);
    this.approverList.set(list);
  }

  changeApproverType(idx: number, approvType: string): void {
    const list = [...this.approverList()];
    if (!list[idx]) {
      return;
    }
    list[idx] = { ...list[idx], approvType };
    this.approverList.set(list);
  }

  private resetForm(): void {
    this.applyDate.set(null);
    this.otFromTime.set(null);
    this.otToTime.set(null);
    this.reason.set('');
    this.mealChecked.set(false);
    this.usecarChecked.set(false);
    this.carAddress.set(null);
    this.carAddressDetail.set(null);
    this.carAddressDetailOptions.set([]);
    this.clearDateInfo();
    this.durationText.set('--');
    this.approverList.set([]);
  }

  async submit(): Promise<void> {
    const dateApi = this.toApiDate(this.applyDate());
    if (!dateApi) {
      this.message.warning(this.i18n.t('essOt.msg.selectDate', 'Vui lòng chọn ngày tăng ca.'));
      return;
    }
    if (!this.personId) {
      this.message.warning(this.i18n.t('essOt.msg.empNotLoaded', 'Chưa tải thông tin nhân viên.'));
      return;
    }
    const fromVal = this.toApiDateTime(this.otFromTime());
    const toVal = this.toApiDateTime(this.otToTime());
    if (!fromVal || !toVal) {
      this.message.warning(this.i18n.t('essOt.msg.enterTime', 'Vui lòng nhập thời gian tăng ca.'));
      return;
    }
    if (toVal <= fromVal) {
      this.message.warning(this.i18n.t('essOt.msg.endTimeBeforeStart', 'Thời gian kết thúc phải sau thời gian bắt đầu.'));
      return;
    }
    if (this.durationText() === '--') {
      this.message.warning(this.i18n.t('essOt.msg.invalidDuration', 'Thời lượng không hợp lệ.'));
      return;
    }

    const otTypeCode = this.otTypeCode();
    if (!otTypeCode) {
      this.message.warning(this.i18n.t('essOt.msg.otTypeMissing', 'Chưa xác định loại tăng ca. Vui lòng chọn lại ngày tăng ca.'));
      return;
    }

    const otApplyHour = this.otLength > 0 ? String(this.otLength) : '0';
    if (parseFloat(otApplyHour) <= 0) {
      this.message.warning(this.i18n.t('essOt.msg.hourMustBePositive', 'Số giờ tăng ca phải lớn hơn 0.'));
      return;
    }

    if (!this.reason().trim()) {
      this.message.warning(this.i18n.t('essOt.msg.reasonRequired', 'Vui lòng nhập lý do tăng ca.'));
      return;
    }

    if (!this.approverList().length) {
      this.message.warning(this.i18n.t('sa.msg.requireApprover', 'Vui lòng thêm ít nhất một người phê duyệt!'));
      return;
    }

    this.submitting.set(true);
    try {
      const res = await this.service.save(SAVE_URL, {
        applyNo: '',
        personId: this.personId,
        localName: this.localName,
        empId: this.empId,
        otTypeNo: OT_TYPE_NO,
        otTypeCode,
        applyOtDate: dateApi,
        otFromTime: fromVal,
        otToTime: toVal,
        otApplyHour,
        applyOtRemark: this.reason(),
        deductYn: this.mealChecked() ? '1' : '0',
        usecarYn: this.usecarChecked() ? '1' : '0',
        carAddress: this.carAddress() ?? '',
        carAddressDetail: this.carAddressDetail() ?? '',
        approvers: this.approverList(),
      });
      if (res.success) {
        this.message.success(res.message || this.i18n.t('essOt.msg.submitSuccess', 'Xin tăng ca thành công!'));
        this.resetForm();
      } else {
        this.message.error(res.error || this.i18n.t('essOt.msg.submitError', 'Lỗi khi gửi đơn!'));
      }
    } catch {
      this.message.error(this.i18n.t('essOt.msg.submitConnError', 'Lỗi kết nối khi gửi đơn!'));
    } finally {
      this.submitting.set(false);
    }
  }
}
