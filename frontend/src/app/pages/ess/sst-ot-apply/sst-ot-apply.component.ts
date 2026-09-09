import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ApproverInput,
  EmployeeSearchResult,
  OtDateInfo,
  SstOtApplyService,
  SyCodeOption,
} from './sst-ot-apply.service';

const WEEKEND_HOLIDAY_OT_TYPE = '32';
const MIN_1H_POST_FAMILIES = ['14015813', '14015814'];
const MIN_HALF_H_POST_FAMILY = '14015815';

function todayApiDate(): string {
  return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
}

/**
 * Form tạo đơn xin tăng ca mới cho bản thân - port lại từ 2 trang gần như
 * trùng lặp: ess/infoApply/viewSSTOtApplyInfo.html (tăng ca thường) và
 * viewSSTOtApplyInfoTx.html (tăng ca vượt), cả 2 đã xoá, sang 1 component
 * Angular + NG-ZORRO dùng chung. Route data (`saveUrl`, `otTypeNo`,
 * `extraValidation`) chọn đúng hành vi - xem app.routes.ts. Thay
 * EmployeeSearchModal (jQuery) bằng nz-select tìm kiếm server-side chọn
 * người phê duyệt. Giữ nguyên toàn bộ rule nghiệp vụ validate của bản gốc
 * (chỉ áp dụng thêm rule min/max theo nhóm nhân viên + tự động thêm Trưởng
 * bộ phận nhân sự khi `extraValidation=true`, đúng như trang "thường" gốc).
 * Không kèm khối "Thông tin nhân viên" (essEmpInfoCard) vì chưa có component
 * Angular tương đương, theo tiền lệ đã áp dụng ở YearUseInfoComponent.
 */
@Component({
  selector: 'app-sst-ot-apply',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './sst-ot-apply.component.html',
  styleUrl: './sst-ot-apply.component.scss',
})
export class SstOtApplyComponent implements OnInit {
  private readonly service = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private saveUrl = '';
  private otTypeNo = '';
  private extraValidation = false;

  private personId = '';
  private localName = '';
  private empId = '';
  private postFamily = '';
  private shiftEndTime = '';
  private hrDeptManager: ApproverInput | null = null;

  private otTotalMonth = 0;
  private otTotalYear = 0;
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

  protected readonly submitting = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const data = this.route.snapshot.data;
    this.saveUrl = data['saveUrl'];
    this.otTypeNo = data['otTypeNo'];
    this.extraValidation = !!data['extraValidation'];

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
      this.postFamily = info.postFamily ?? '';
    } catch {
      // im lặng bỏ qua - form vẫn dùng được, chỉ thiếu thông tin cá nhân mặc định
    }

    if (this.extraValidation) {
      try {
        const mgr = await this.service.getHrDeptManager();
        if (mgr.PERSON_ID) {
          this.hrDeptManager = {
            personId: mgr.PERSON_ID,
            localName: mgr.LOCAL_NAME ?? '',
            empId: mgr.EMP_ID ?? '',
          };
        }
      } catch {
        this.hrDeptManager = null;
      }
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
      this.shiftEndTime = d.SHIFT_END_TIME ?? '';

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

      this.otTotalMonth = parseFloat(String(d.OT_TOTAIL_MONTH ?? '')) || 0;
      this.otTotalYear = parseFloat(String(d.OT_TOTAIL ?? '')) || 0;
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
    this.otTotalMonth = 0;
    this.otTotalYear = 0;
    this.otLimitEnabled = false;
    this.otLimit100Enabled = false;
    this.otLength = 0;
    this.shiftEndTime = '';
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

    if (this.extraValidation) {
      if (MIN_1H_POST_FAMILIES.includes(this.postFamily) && this.otLength < 1) {
        this.message.warning(
          this.i18n.t('essOt.msg.minDurationGroup1', 'Nhóm nhân viên của bạn yêu cầu thời lượng tăng ca tối thiểu là 1 tiếng (60 phút).'),
        );
        return;
      }
      if (this.postFamily === MIN_HALF_H_POST_FAMILY && this.otLength < 0.5) {
        this.message.warning(
          this.i18n.t('essOt.msg.minDurationGroup2', 'Nhóm nhân viên của bạn yêu cầu thời lượng tăng ca tối thiểu là 30 phút.'),
        );
        return;
      }

      if (otTypeCode === WEEKEND_HOLIDAY_OT_TYPE) {
        if (this.otLength > 3) {
          this.message.warning(this.i18n.t('essOt.msg.maxDurationWeekday', 'Ngày thường không được tăng ca quá 3 tiếng (180 phút).'));
          return;
        }
      } else if (this.otLength > 12) {
        this.message.warning(this.i18n.t('essOt.msg.maxDurationOther', 'Thời lượng tăng ca không được quá 12 tiếng (720 phút).'));
        return;
      }

      const todayStr = todayApiDate();
      const isPastOrToday = dateApi <= todayStr;
      if (isPastOrToday && this.shiftEndTime && this.hrDeptManager) {
        const shiftEndDt = this.parseServerDateTime(this.shiftEndTime);
        if (shiftEndDt && new Date() > shiftEndDt) {
          const alreadyIn = this.approverList().some((a) => a.personId === this.hrDeptManager?.personId);
          if (!alreadyIn) {
            this.approverList.set([...this.approverList(), this.hrDeptManager]);
            this.message.info(
              this.i18n.t(
                'essOt.msg.autoAddHrManager',
                'Đã tự động thêm Trưởng bộ phận nhân sự vào danh sách phê duyệt do nộp đơn sau giờ làm.',
              ),
            );
          }
        }
      }
    }

    if (!this.approverList().length) {
      this.message.warning(this.i18n.t('sa.msg.requireApprover', 'Vui lòng thêm ít nhất một người phê duyệt!'));
      return;
    }

    const applyHourNum = parseFloat(otApplyHour) || 0;
    if (this.extraValidation) {
      if (this.otLimitEnabled && applyHourNum + this.otTotalMonth > this.otLimitMonth) {
        this.message.warning(
          this.i18n
            .t('essOt.msg.exceedMonthLimit', 'Tổng tăng ca tháng này sẽ là {0}h, vượt quá giới hạn {1}h!')
            .replace('{0}', (applyHourNum + this.otTotalMonth).toFixed(1))
            .replace('{1}', String(this.otLimitMonth)),
        );
        return;
      }
      if (this.otLimit100Enabled && applyHourNum + this.otTotalYear > this.otLimitYear) {
        this.message.warning(
          this.i18n
            .t('essOt.msg.exceedYearLimit', 'Tổng tăng ca năm nay sẽ là {0}h, vượt quá giới hạn {1}h!')
            .replace('{0}', (applyHourNum + this.otTotalYear).toFixed(1))
            .replace('{1}', String(this.otLimitYear)),
        );
        return;
      }
    }

    this.submitting.set(true);
    try {
      const res = await this.service.save(this.saveUrl, {
        applyNo: '',
        personId: this.personId,
        localName: this.localName,
        empId: this.empId,
        otTypeNo: this.otTypeNo,
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
