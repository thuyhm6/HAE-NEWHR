import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { PaPayScheduleRow, PaPayScheduleService, SyCodeOption } from '../pa-pay-schedule/pa-pay-schedule.service';
import {
  PaMonthPersonChangeRow,
  PaMonthPersonCountRow,
  PaSalaryCheckEmpRow,
  PaSalaryCheckService,
  paDisplayDate,
  paExportXlsx,
  paPayDatesOf,
} from '../shared/pa-salary-check.service';

/**
 * NV tham gia tính lương (/pa/workManagement/monthPersonCountInfoList) - port từ
 * monthPersonCountInfoList.jsp + monthPersonCountInfoSonList.jsp (currentIndex=0) của Hanwha_HAE:
 * so sánh số NV tháng trước / tháng này theo phân loại lương, số NV tăng / giảm theo loại; bấm số
 * NV tăng / giảm để xem danh sách nhân viên bên dưới.
 */
@Component({
  selector: 'app-pa-month-person-count',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-month-person-count.component.html',
  styleUrl: './pa-month-person-count.component.scss',
})
export class PaMonthPersonCountComponent implements OnInit {
  private readonly service = inject(PaSalaryCheckService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly salaryDistinOptions = signal<SyCodeOption[]>([]);
  private readonly schedules = signal<PaPayScheduleRow[]>([]);

  protected readonly salaryDistinNo = signal<string | null>(null);
  protected readonly payDatePro = signal<string | null>(null);
  protected readonly payDate = signal<string | null>(null);
  protected readonly payDateOptions = computed(() => paPayDatesOf(this.schedules(), this.salaryDistinNo()));

  protected readonly loading = signal(false);
  protected readonly countList = signal<PaMonthPersonCountRow[]>([]);
  protected readonly increaseList = signal<PaMonthPersonChangeRow[]>([]);
  protected readonly decreaseList = signal<PaMonthPersonChangeRow[]>([]);

  /** Tăng (add) / giảm (delete) đang xem - strFlag bản gốc */
  protected readonly changeFlag = signal<'add' | 'delete' | null>(null);
  protected readonly changeType = signal<string | null>(null);
  protected readonly empLoading = signal(false);
  protected readonly empRows = signal<PaSalaryCheckEmpRow[]>([]);

  protected readonly displayDate = paDisplayDate;

  /** Tham số của lần tra cứu gần nhất - dùng khi bấm số NV tăng / giảm */
  private lastQuery: { salaryDistinNo: string; payDate: string; payDatePro: string } | null = null;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [distins, schedules] = await Promise.all([
        this.payScheduleService.getSalaryDistinOptions(),
        this.payScheduleService.getList('', '', null),
      ]);
      this.salaryDistinOptions.set(distins);
      this.schedules.set(schedules);
      if (distins.length) this.changeSalaryDistin(distins[0].codeNo);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  /** Đổi phân loại lương -> lọc lại ngày trả, mặc định tháng này = kỳ mới nhất, tháng trước = kỳ kế tiếp */
  changeSalaryDistin(value: string | null): void {
    this.salaryDistinNo.set(value);
    const dates = this.payDateOptions();
    this.payDate.set(dates[0]?.payDate ?? null);
    this.payDatePro.set(dates[1]?.payDate ?? dates[0]?.payDate ?? null);
  }

  async search(): Promise<void> {
    const salaryDistinNo = this.salaryDistinNo();
    const payDate = this.payDate();
    const payDatePro = this.payDatePro();
    if (!salaryDistinNo || !payDate || !payDatePro) {
      this.message.warning(this.i18n.t('pa.salaryCheck.msgSelectPayDate', 'Vui lòng chọn phân loại lương và ngày trả lương!'));
      return;
    }
    this.lastQuery = { salaryDistinNo, payDate, payDatePro };
    this.loading.set(true);
    this.changeFlag.set(null);
    this.changeType.set(null);
    this.empRows.set([]);
    try {
      const res = await this.service.getMonthPersonCount(this.lastQuery);
      this.countList.set(res.countList ?? []);
      this.increaseList.set(res.increaseList ?? []);
      this.decreaseList.set(res.decreaseList ?? []);
    } catch {
      this.countList.set([]);
      this.increaseList.set([]);
      this.decreaseList.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Bấm số NV tăng / giảm -> danh sách nhân viên (changeSearcha bản gốc) */
  async showChangeEmp(flag: 'add' | 'delete', row: PaMonthPersonChangeRow): Promise<void> {
    if (!this.lastQuery || !row.changeType) return;
    this.changeFlag.set(flag);
    this.changeType.set(row.changeType);
    this.empLoading.set(true);
    try {
      this.empRows.set(
        await this.service.getMonthPersonChangeEmpList({ ...this.lastQuery, changeFlag: flag, changeType: row.changeType }),
      );
    } catch {
      this.empRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.empLoading.set(false);
    }
  }

  changeTypeLabel(type: string | undefined | null): string {
    const fallback: Record<string, string> = { HIRE: 'Tuyển dụng', RESIGN: 'Thôi việc', OTHER: 'Khác' };
    return type ? this.i18n.t('pa.salaryCheck.changeType.' + type, fallback[type] ?? type) : '';
  }

  diff(row: PaMonthPersonCountRow): number {
    return Math.abs((row.nowCount ?? 0) - (row.preCount ?? 0));
  }

  dateHeader(): string {
    return this.changeFlag() === 'delete'
      ? this.i18n.t('pa.monthPersonCountInfoSonList.TUISHERIQI.b', 'Ngày thôi việc')
      : this.i18n.t('ess.empInfo.date_of_agency', 'Ngày vào làm');
  }

  exportExcel(): void {
    const rows = this.empRows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('common.noData', 'Không có dữ liệu'));
      return;
    }
    const isDelete = this.changeFlag() === 'delete';
    paExportXlsx(
      `monthPersonCountInfo_${this.changeFlag()}_${this.changeType()}`,
      [
        'No.',
        this.i18n.t('ess.infoApply.EMP_ID', 'Mã nhân viên'),
        this.i18n.t('ess.infoApply.NAME', 'Họ tên'),
        this.i18n.t('ess.infoApply.DEPT', 'Phòng ban'),
        this.i18n.t('ess.empInfo.zhiqun', 'Nhóm nhân viên'),
        this.i18n.t('hrm.contract.Rank', 'Chức vụ'),
        this.i18n.t('ess.trans.title.dutyName', 'Chức danh'),
        this.i18n.t('org.title.MAIN_BUSINESS', 'Công việc'),
        this.dateHeader(),
      ],
      rows.map((r, i) => [
        i + 1,
        r.empId,
        r.localName,
        r.deptName,
        r.postFamilyName,
        r.postGradeName,
        r.positionName,
        r.mainBusiness,
        isDelete ? r.dateLeft : r.dateStarted,
      ]),
    );
  }
}
