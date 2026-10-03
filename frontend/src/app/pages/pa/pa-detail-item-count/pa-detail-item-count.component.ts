import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import {
  PA_ITEM_TYPE_OPTIONS,
  PaPayItemOption,
  PaSalaryCheckEmpRow,
  PaSalaryCheckService,
  paFormatNumber,
  paScheduleLabel,
} from '../shared/pa-salary-check.service';

/**
 * Đối chiếu hạng mục (/pa/workManagement/detailItemCountInfo) - port từ detailItemCountInfo.jsp của
 * Hanwha_HAE: chọn kế hoạch trả lương + loại hạng mục + hạng mục -> danh sách NV có số tiền > 0 của
 * hạng mục đó kèm công thức áp dụng và ghi chú.
 */
@Component({
  selector: 'app-pa-detail-item-count',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-detail-item-count.component.html',
  styleUrl: './pa-detail-item-count.component.scss',
})
export class PaDetailItemCountComponent implements OnInit {
  private readonly service = inject(PaSalaryCheckService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly itemTypeOptions = PA_ITEM_TYPE_OPTIONS;
  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  private readonly itemOptions = signal<PaPayItemOption[]>([]);

  protected readonly payScheduleNo = signal<string | null>(null);
  protected readonly itemType = signal('1');
  protected readonly itemId = signal<string | null>(null);
  /** Hạng mục theo loại đang chọn (changeSelect bản gốc) */
  protected readonly filteredItems = computed(() => this.itemOptions().filter((o) => String(o.itemType) === this.itemType()));

  protected readonly loading = signal(false);
  protected readonly rows = signal<PaSalaryCheckEmpRow[]>([]);

  protected readonly fmt = paFormatNumber;
  protected readonly scheduleLabel = paScheduleLabel;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [schedules, items] = await Promise.all([
        this.payScheduleService.getList('', '', null),
        this.service.getPayItemOptions(),
      ]);
      this.scheduleOptions.set(schedules);
      if (schedules.length) this.payScheduleNo.set(schedules[0].payScheduleNo ?? null);
      this.itemOptions.set(items);
      this.changeItemType('1');
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  changeItemType(value: string): void {
    this.itemType.set(value);
    this.itemId.set(this.filteredItems()[0]?.itemId ?? null);
  }

  async search(): Promise<void> {
    const payScheduleNo = this.payScheduleNo();
    const itemId = this.itemId();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    if (!itemId) {
      this.message.warning(this.i18n.t('pa.salaryCheck.msgSelectItem', 'Vui lòng chọn hạng mục!'));
      return;
    }
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getItemCountList(payScheduleNo, itemId));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }
}
