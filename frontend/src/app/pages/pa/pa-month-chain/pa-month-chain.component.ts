import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { PaPayScheduleRow, PaPayScheduleService, SyCodeOption } from '../pa-pay-schedule/pa-pay-schedule.service';
import {
  PaMonthChainRow,
  PaSalaryCheckEmpRow,
  PaSalaryCheckService,
  paDisplayDate,
  paExportXlsx,
  paFormatNumber,
  paPayDatesOf,
} from '../shared/pa-salary-check.service';

/** SELECT_TYPE bản gốc - cột số có thể bấm để xem danh sách NV */
type PmchSelectType = 'PERSON_NUM_PRO' | 'PERSON_NUM' | 'COUNT_UP' | 'COUNT_LOW' | 'PERSON_UP' | 'PERSON_LOW';

/**
 * Các khoản chi trả (/pa/paView/viewPaMonthChain) - port từ paView/viewPaMonthChain.jsp của
 * Hanwha_HAE: so sánh số NV / số tiền / bình quân từng hạng mục chi trả giữa tháng trước và tháng
 * này. Bấm các ô số để mở popup danh sách NV (viewResultConfirmList3Right?currentIndex=2&PAGE_TYPE=3
 * bản gốc), popup có xuất Excel (viewResultConfirmList3RightExport bản gốc).
 */
@Component({
  selector: 'app-pa-month-chain',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzModalModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-month-chain.component.html',
  styleUrl: './pa-month-chain.component.scss',
})
export class PaMonthChainComponent implements OnInit {
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
  protected readonly rows = signal<PaMonthChainRow[]>([]);

  protected readonly empVisible = signal(false);
  protected readonly empLoading = signal(false);
  protected readonly empRows = signal<PaSalaryCheckEmpRow[]>([]);
  protected readonly empTitle = signal('');

  protected readonly fmt = paFormatNumber;
  protected readonly displayDate = paDisplayDate;

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
    try {
      this.rows.set(await this.service.getMonthChainList(this.lastQuery));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Bấm ô số -> popup danh sách NV (changeSearcha bản gốc) */
  async openEmpList(row: PaMonthChainRow, selectType: PmchSelectType): Promise<void> {
    if (!this.lastQuery || !row.itemId) return;
    this.empTitle.set(row.itemName ?? '');
    this.empRows.set([]);
    this.empVisible.set(true);
    this.empLoading.set(true);
    try {
      this.empRows.set(
        await this.service.getItemDifEmpList({
          salaryDistinNo: this.lastQuery.salaryDistinNo,
          payDate: this.lastQuery.payDate,
          itemId: row.itemId,
          itemType: row.itemType,
          pageType: '3',
          selectType,
        }),
      );
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.empLoading.set(false);
    }
  }

  dif(row: PaSalaryCheckEmpRow): number {
    return (Number(row.monthNow) || 0) - (Number(row.monthPro) || 0);
  }

  exportEmp(): void {
    const rows = this.empRows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('common.noData', 'Không có dữ liệu'));
      return;
    }
    paExportXlsx(
      'PersonNum',
      [
        'No.',
        this.i18n.t('ess.infoApply.EMP_ID', 'Mã nhân viên'),
        this.i18n.t('ess.infoApply.NAME', 'Họ tên'),
        this.i18n.t('ess.infoApply.DEPT', 'Phòng ban'),
        this.i18n.t('ess.empInfo.zhiqun', 'Nhóm nhân viên'),
        this.i18n.t('ess.infoApply.Rank', 'Chức vụ'),
        this.i18n.t('sys.affirm.title.duty', 'Chức danh'),
        this.i18n.t('org.title.EMP_TYPE', 'Loại nhân viên'),
        this.i18n.t('pa.detailItemDifCountInfo.YIQIANJINE.b', 'Tháng trước'),
        this.i18n.t('pa.detailItemDifCountInfo.DANGYUJINE.b', 'Tháng này'),
        this.i18n.t('ess.infoApply.difference', 'Chênh lệch'),
      ],
      rows.map((r, i) => [
        i + 1,
        r.empId,
        r.localName,
        r.deptName,
        r.postFamilyName,
        r.postGradeName,
        r.positionName,
        r.empTypeName,
        r.monthPro,
        r.monthNow,
        this.dif(r),
      ]),
    );
  }
}
