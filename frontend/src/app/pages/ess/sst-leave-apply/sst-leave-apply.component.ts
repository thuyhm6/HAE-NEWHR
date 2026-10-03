import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
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
  LEAVE_TYPE_PARENT_CODE,
  MyInfo,
  SstLeaveApplyService,
  SyCodeOption,
  VacationInfo,
} from './sst-leave-apply.service';

const FEMALE_SEX_CODE = '1325';
const FEMALE_ONLY_LEAVE_TYPES = ['141474', '27'];
const WOMEN_LEAVE_TYPE = '141474';
const ANNUAL_LEAVE_TYPE = '26';

function defaultFromTime(): Date {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d;
}

function defaultToTime(): Date {
  const d = new Date();
  d.setHours(17, 0, 0, 0);
  return d;
}

/**
 * Form tạo đơn xin nghỉ phép mới cho bản thân - port lại từ
 * ess/infoApplyAttendance/viewSSTApplyAttendance.html (Thymeleaf, đã xoá)
 * sang Angular + NG-ZORRO. Thay EmployeeSearchModal (jQuery) bằng nz-select
 * tìm kiếm server-side chọn người phê duyệt (giống ChangeUserComponent). Giữ
 * nguyên toàn bộ rule nghiệp vụ validate trước khi gửi (giới tính, thời
 * lượng tối đa nghỉ phụ nữ, bội số nửa ngày cho phép năm...) đúng như bản
 * gốc. Khối "Thông tin nhân viên" tái dùng luôn API myInfo() sẵn có (đã gọi
 * để lấy personId/sexCode) và render bằng nz-descriptions theo đúng pattern
 * đã dùng ở personal-info-ess.component.html. Không port phần đính kèm file
 * vì bản gốc không có UI cho việc này (chỉ còn dead code trong script,
 * không có input file/nút hiển thị trong HTML).
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
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './sst-leave-apply.component.html',
  styleUrl: './sst-leave-apply.component.scss',
})
export class SstLeaveApplyComponent implements OnInit {
  private readonly service = inject(SstLeaveApplyService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  private personId = '';
  private localName = '';
  private sexCode = '';
  protected readonly myInfo = signal<MyInfo | null>(null);
  private vacData: VacationInfo | null = null;
  private durationDays: number | null = null;
  private durationHours: number | null = null;
  private calcTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly leaveTypeOptionsAll = signal<SyCodeOption[]>([]);
  protected readonly leaveTypeCode = signal<string | null>(null);
  protected readonly vacInfoText = signal('');
  protected readonly fromTime = signal<Date | null>(defaultFromTime());
  protected readonly toTime = signal<Date | null>(defaultToTime());
  protected readonly durationText = signal('-');
  protected readonly reason = signal('');

  protected readonly approverList = signal<ApproverInput[]>([]);
  protected readonly approverSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly approverSearching = signal(false);
  protected readonly addingApprover = signal(false);
  protected readonly selectedApproverPersonId = signal<string | null>(null);
  protected readonly newApproverApprovType = signal<string>(APPROV_TYPE_APPROVAL);

  protected readonly submitting = signal(false);

  protected readonly APPROV_TYPE_APPROVAL = APPROV_TYPE_APPROVAL;
  protected readonly APPROV_TYPE_NOTICE = APPROV_TYPE_NOTICE;

  protected get leaveTypeOptions(): SyCodeOption[] {
    if (this.sexCode === FEMALE_SEX_CODE) {
      return this.leaveTypeOptionsAll();
    }
    return this.leaveTypeOptionsAll().filter((opt) => !FEMALE_ONLY_LEAVE_TYPES.includes(opt.codeNo));
  }

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.leaveTypeOptionsAll.set(await this.service.getLeaveTypeOptions());
    } catch {
      this.leaveTypeOptionsAll.set([]);
    }
    try {
      const info = await this.service.getMyInfo();
      this.personId = info.personId ?? '';
      this.localName = info.localName ?? '';
      this.sexCode = info.sexCode ?? '';
      this.myInfo.set(info);
    } catch {
      // im lặng bỏ qua - form vẫn dùng được, chỉ thiếu thông tin cá nhân mặc định
    }
    this.calcDuration();
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  async onLeaveTypeChange(): Promise<void> {
    await this.loadVacationInfo();
    this.calcDuration();
  }

  private async loadVacationInfo(): Promise<void> {
    try {
      this.vacData = await this.service.getVacationInfo();
      this.vacInfoText.set(this.formatVacInfo(this.vacData));
    } catch {
      this.vacData = null;
      this.vacInfoText.set('');
    }
  }

  private formatVacInfo(d: VacationInfo | null): string {
    if (!d) {
      return '';
    }
    const f = (v?: string | number) => (v !== null && v !== undefined && v !== '' ? v : '0');
    return (
      `${this.i18n.t('sa.vac.totalYear', 'Tổng phép năm:')} ${f(d.TOT_VAC_CNT)}/  ` +
      `${this.i18n.t('sa.vac.yearVac', 'Tạo phép năm:')} ${f(d.YEAR_VAC_CNT)}/  ` +
      `${this.i18n.t('sa.vac.lastYear', 'Còn lại năm ngoái:')} ${f(d.LAST_YEAR_VAC)}/  ` +
      `${this.i18n.t('sa.vac.special', 'Đặc biệt:')} ${f(d.ADD_VAC)}/  ` +
      `${this.i18n.t('sa.vac.used', 'Số ngày đã sử dụng:')} ${f(d.USE_VAC)}/  ` +
      `${this.i18n.t('sa.vac.remain', 'Số ngày còn lại:')} ${f(d.REMAIN_VAC)}`
    );
  }

  private toApiDateTime(value: Date | null): string {
    // Mapper Oracle backend dùng TO_DATE(..., 'YYYY-MM-DD HH24:MI') nên cần
    // khoảng trắng giữa ngày và giờ, không phải 'T' như input datetime-local
    // gốc gửi thẳng (đã xác nhận qua lỗi ORA khi test với dấu 'T').
    return value ? formatDate(value, 'yyyy-MM-dd HH:mm', 'en-US') : '';
  }

  onTimeChange(): void {
    this.calcDuration();
  }

  private calcDuration(): void {
    if (this.calcTimer) {
      clearTimeout(this.calcTimer);
    }
    this.calcTimer = setTimeout(() => this.doCalcDuration(), 300);
  }

  private async doCalcDuration(): Promise<void> {
    const leaveTypeCode = this.leaveTypeCode();
    const fromDt = this.toApiDateTime(this.fromTime());
    const toDt = this.toApiDateTime(this.toTime());

    if (!fromDt || !toDt || !leaveTypeCode) {
      this.durationText.set('-');
      this.durationDays = null;
      this.durationHours = null;
      return;
    }

    this.durationText.set(this.i18n.t('sa.msg.calculating', 'Đang tính...'));
    try {
      const res = await this.service.getLeaveLength(fromDt, toDt, leaveTypeCode);
      const leaveLen = parseFloat(String(res.LEAVE_LENGTH ?? ''));
      const dayHour = parseFloat(String(res.DAY_HOUR ?? ''));
      if (isNaN(leaveLen) || isNaN(dayHour) || dayHour === 0) {
        this.durationText.set('-');
        this.durationDays = null;
        this.durationHours = null;
        return;
      }
      this.durationHours = leaveLen;
      this.durationDays = leaveLen / dayHour;
      const days = Math.floor(leaveLen / dayHour);
      const hours = leaveLen - days * dayHour;
      let text = '';
      if (days > 0) text += `${days} ${this.i18n.t('sa.unit.days', 'Ngày')}`;
      if (hours > 0) text += (text ? ' ' : '') + `${hours} ${this.i18n.t('sa.unit.hours', 'Giờ')}`;
      this.durationText.set(text || '0');
    } catch {
      this.durationText.set('-');
      this.durationDays = null;
      this.durationHours = null;
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

  /**
   * Thêm ngay khi chọn xong (không đợi nút "xác nhận" riêng) - tra cứu
   * `approverSearchResults()` phải làm NGAY tại thời điểm chọn, vì nz-select
   * có thể phát lại `nzOnSearch` (làm rỗng danh sách) trước khi người dùng
   * kịp bấm 1 nút xác nhận riêng biệt, khiến tra cứu theo personId sau đó
   * thất bại âm thầm.
   */
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
    this.leaveTypeCode.set(null);
    this.vacInfoText.set('');
    this.vacData = null;
    this.durationDays = null;
    this.durationHours = null;
    this.fromTime.set(defaultFromTime());
    this.toTime.set(defaultToTime());
    this.reason.set('');
    this.approverList.set([]);
    this.durationText.set('-');
  }

  async submit(): Promise<void> {
    const leaveTypeCode = this.leaveTypeCode();
    if (!leaveTypeCode) {
      this.message.warning(this.i18n.t('sa.msg.selectLeaveType', 'Vui lòng chọn loại nghỉ phép!'));
      return;
    }

    const fromTime = this.toApiDateTime(this.fromTime());
    const toTime = this.toApiDateTime(this.toTime());
    if (!fromTime) {
      this.message.warning(this.i18n.t('sa.msg.enterStartTime', 'Vui lòng nhập thời gian bắt đầu!'));
      return;
    }
    if (!toTime) {
      this.message.warning(this.i18n.t('sa.msg.enterEndTime', 'Vui lòng nhập thời gian kết thúc!'));
      return;
    }
    if (toTime <= fromTime) {
      this.message.warning(this.i18n.t('sa.msg.endTimeBeforeStart', 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu!'));
      return;
    }

    if (this.durationDays === null) {
      this.message.warning(this.i18n.t('sa.msg.calculating', 'Đang tính...'));
      return;
    }
    if (this.durationDays <= 0) {
      this.message.warning(this.i18n.t('sa.msg.durationZero', 'Thời lượng phải lớn hơn 0!'));
      return;
    }

    if (FEMALE_ONLY_LEAVE_TYPES.includes(leaveTypeCode) && this.sexCode !== FEMALE_SEX_CODE) {
      this.message.warning(this.i18n.t('sa.msg.womenOnlyLeave', 'Chỉ nhân viên nữ mới được chọn loại nghỉ phép này!'));
      return;
    }

    if (leaveTypeCode === WOMEN_LEAVE_TYPE && this.durationHours !== null && this.durationHours >= 3) {
      this.message.warning(this.i18n.t('sa.msg.womenLeaveMax3h', 'Nghỉ phụ nữ không được vượt quá 3 tiếng (180 phút)!'));
      return;
    }

    if (leaveTypeCode === ANNUAL_LEAVE_TYPE) {
      const remainVac = this.vacData ? parseFloat(String(this.vacData.REMAIN_VAC ?? '')) : NaN;
      const durationDays = this.durationDays ?? NaN;
      if (!isNaN(remainVac) && !isNaN(durationDays) && durationDays > remainVac) {
        this.message.warning(this.i18n.t('sa.msg.durationExceedsRemain', 'Thời lượng vượt quá số ngày phép còn lại!'));
        return;
      }
      if (!isNaN(durationDays)) {
        const halfDayRemainder = (durationDays * 2) % 1;
        if (halfDayRemainder > 0.01 && halfDayRemainder < 0.99) {
          this.message.warning(
            this.i18n.t('sa.msg.annualLeaveHalfDay', 'Thời lượng nghỉ phép năm phải là bội số của nửa ngày (0.5, 1, 1.5, ...)!'),
          );
          return;
        }
      }
    }

    if (!this.reason().trim()) {
      this.message.warning(this.i18n.t('sa.msg.enterReason', 'Vui lòng nhập lý do!'));
      return;
    }

    if (!this.approverList().length) {
      this.message.warning(this.i18n.t('sa.msg.requireApprover', 'Vui lòng thêm ít nhất một người phê duyệt!'));
      return;
    }

    this.submitting.set(true);
    try {
      const res = await this.service.save({
        applyNo: '',
        personId: this.personId,
        localName: this.localName,
        leaveTypeCode,
        leaveFromTime: fromTime,
        leaveToTime: toTime,
        applyLength: null,
        leaveReason: this.reason(),
        approvers: this.approverList(),
      });
      if (res.success) {
        this.message.success(res.message || this.i18n.t('sa.msg.submitSuccess', 'Xin phép thành công!'));
        this.resetForm();
      } else {
        this.message.error(res.error || this.i18n.t('sa.msg.submitError', 'Lỗi khi gửi đơn!'));
      }
    } catch {
      this.message.error(this.i18n.t('sa.msg.submitConnError', 'Lỗi kết nối khi gửi đơn!'));
    } finally {
      this.submitting.set(false);
    }
  }
}
