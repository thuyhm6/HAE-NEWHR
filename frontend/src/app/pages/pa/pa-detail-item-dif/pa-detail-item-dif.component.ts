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
  PA_ITEM_TYPE_OPTIONS,
  PaPayItemOption,
  PaSalaryCheckEmpRow,
  PaSalaryCheckService,
  paDisplayDate,
  paExportXlsx,
  paFormatNumber,
  paPayDatesOf,
} from '../shared/pa-salary-check.service';

/** Bản gốc loại 3 hạng mục lương OT khỏi danh sách chọn (so theo tên hiển thị) */
const PDID_EXCLUDED_ITEM_KEYS = [
  { key: 'pa.viewPaResultList.PINGRIJIABANFEI.C', fallback: 'Lương OT ngày thường' },
  { key: 'pa.viewPaResultList.ZHOUMOJIABANFEI.C', fallback: 'Lương OT cuối tuần' },
  { key: 'pa.viewPaResultList.JIERIJIABANFEI.C', fallback: 'Lương OT ngày lễ' },
];

/**
 * Khoản tiền thay đổi (/pa/workManagement/detailItemDifCountInfo) - port từ
 * detailItemDifCountInfo.jsp của Hanwha_HAE: gọi procedure PA_MONTH_DIF_ITEM_VIEW (PAGE_TYPE = 1) rồi
 * liệt kê NV có hạng mục thay đổi so với tháng trước; có xuất Excel (detailItemDifCountInfoExport).
 * Ngày trả lương được lọc theo phân loại lương (bản gốc liệt kê tất cả).
 */
@Component({
  selector: 'app-pa-detail-item-dif',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-detail-item-dif.component.html',
  styleUrl: './pa-detail-item-dif.component.scss',
})
export class PaDetailItemDifComponent implements OnInit {
  private readonly service = inject(PaSalaryCheckService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly itemTypeOptions = PA_ITEM_TYPE_OPTIONS;
  protected readonly salaryDistinOptions = signal<SyCodeOption[]>([]);
  private readonly schedules = signal<PaPayScheduleRow[]>([]);
  private readonly itemOptions = signal<PaPayItemOption[]>([]);

  protected readonly salaryDistinNo = signal<string | null>(null);
  protected readonly payDate = signal<string | null>(null);
  protected readonly itemType = signal('1');
  /** '' = tất cả hạng mục (option "Lựa chọn" bản gốc) */
  protected readonly itemId = signal<string>('');
  protected readonly payDateOptions = computed(() => paPayDatesOf(this.schedules(), this.salaryDistinNo()));
  protected readonly filteredItems = computed(() => {
    const excluded = new Set(PDID_EXCLUDED_ITEM_KEYS.map((e) => this.i18n.t(e.key, e.fallback)));
    return this.itemOptions().filter((o) => String(o.itemType) === this.itemType() && !excluded.has(o.itemName ?? ''));
  });

  protected readonly loading = signal(false);
  protected readonly rows = signal<PaSalaryCheckEmpRow[]>([]);

  protected readonly fmt = paFormatNumber;
  protected readonly displayDate = paDisplayDate;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [distins, schedules, items] = await Promise.all([
        this.payScheduleService.getSalaryDistinOptions(),
        this.payScheduleService.getList('', '', null),
        this.service.getPayItemOptions(),
      ]);
      this.salaryDistinOptions.set(distins);
      this.schedules.set(schedules);
      this.itemOptions.set(items);
      if (distins.length) this.changeSalaryDistin(distins[0].codeNo);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  changeSalaryDistin(value: string | null): void {
    this.salaryDistinNo.set(value);
    this.payDate.set(this.payDateOptions()[0]?.payDate ?? null);
  }

  changeItemType(value: string): void {
    this.itemType.set(value);
    this.itemId.set('');
  }

  async search(): Promise<void> {
    const salaryDistinNo = this.salaryDistinNo();
    const payDate = this.payDate();
    if (!salaryDistinNo || !payDate) {
      this.message.warning(this.i18n.t('pa.salaryCheck.msgSelectPayDate', 'Vui lòng chọn phân loại lương và ngày trả lương!'));
      return;
    }
    this.loading.set(true);
    try {
      this.rows.set(
        await this.service.getItemDifList({
          salaryDistinNo,
          payDate,
          itemType: this.itemType(),
          itemId: this.itemId() || null,
          pageType: '1',
        }),
      );
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('common.noData', 'Không có dữ liệu'));
      return;
    }
    paExportXlsx(
      'changeProject_check',
      [
        'No.',
        this.i18n.t('ess.infoApply.EMP_ID', 'Mã nhân viên'),
        this.i18n.t('ess.infoApply.NAME', 'Họ tên'),
        this.i18n.t('ess.infoApply.DEPT', 'Phòng ban'),
        this.i18n.t('ess.empInfo.zhiqun', 'Nhóm nhân viên'),
        this.i18n.t('ess.infoApply.Rank', 'Chức vụ'),
        this.i18n.t('ess.infoApply.title.dutyName', 'Chức danh'),
        this.i18n.t('ess.empInfo.entry_date', 'Ngày vào làm'),
        this.i18n.t('ess.empInfo.leaveDate', 'Ngày thôi việc'),
        this.i18n.t('pa.insurance.title.projectName', 'Tên hạng mục'),
        this.i18n.t('pa.detailItemDifCountInfo.YIQIANJINE.b', 'Tháng trước'),
        this.i18n.t('pa.detailItemDifCountInfo.DANGYUJINE.b', 'Tháng này'),
      ],
      rows.map((r, i) => [
        i + 1,
        r.empId,
        r.localName,
        r.deptName,
        r.postFamilyName,
        r.postGradeName,
        r.positionName,
        r.dateStarted,
        r.dateLeft,
        r.itemName,
        r.monthPro,
        r.monthNow,
      ]),
    );
  }
}
