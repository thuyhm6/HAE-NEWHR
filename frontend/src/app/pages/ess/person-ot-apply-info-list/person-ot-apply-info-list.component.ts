import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { OtItemOption, PersonOtApplyInfoListService, PersonOtRow } from './person-ot-apply-info-list.service';

function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function lastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Báo cáo tăng ca theo hạng mục của chính nhân viên đang đăng nhập - port lại
 * từ ess/infoApply/viewPersonOtApplyInfoList.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO, dùng nz-table (phân trang client-side) thay cho bảng
 * dựng tay + phân trang JS thuần. Gọi lại nguyên vẹn API JSON sẵn có. Không
 * kèm khối "Thông tin nhân viên" (essEmpInfoCard) vì chưa có component
 * Angular tương đương, theo tiền lệ đã áp dụng ở YearUseInfoComponent.
 */
@Component({
  selector: 'app-person-ot-apply-info-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './person-ot-apply-info-list.component.html',
  styleUrl: './person-ot-apply-info-list.component.scss',
})
export class PersonOtApplyInfoListComponent implements OnInit {
  private readonly service = inject(PersonOtApplyInfoListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly itemNo = signal<string | null>(null);
  protected readonly minQuantity = signal<number | null>(null);
  protected readonly startDate = signal<Date | null>(firstDayOfMonth());
  protected readonly endDate = signal<Date | null>(lastDayOfMonth());
  protected readonly quickFilter = signal('');

  protected readonly itemOptions = signal<OtItemOption[]>([]);
  protected readonly loading = signal(false);
  protected readonly allRows = signal<PersonOtRow[]>([]);
  protected readonly filteredRows = signal<PersonOtRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.itemOptions.set(await this.service.getItemOptions());
    } catch {
      this.itemOptions.set([]);
    }
    await this.search();
  }

  dayOfWeek(arDateStr?: string): string {
    if (!arDateStr) {
      return '';
    }
    const parts = arDateStr.split('/');
    if (parts.length !== 3) {
      return '';
    }
    const date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    if (isNaN(date.getTime())) {
      return '';
    }
    const weekdays = this.i18n.t('poai.weekdays', 'CN,T2,T3,T4,T5,T6,T7').split(',');
    return weekdays[date.getDay()];
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : undefined;
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.allRows.set(
        await this.service.getList({
          startDate: this.toApiDate(this.startDate()),
          endDate: this.toApiDate(this.endDate()),
          itemNoSearch: this.itemNo() ?? undefined,
          minQuantity: this.minQuantity() != null ? String(this.minQuantity()) : undefined,
        }),
      );
      this.applyQuickFilter();
    } catch {
      this.message.error(this.i18n.t('poai.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  onQuickFilterChange(value: string): void {
    this.quickFilter.set(value);
    this.applyQuickFilter();
  }

  private applyQuickFilter(): void {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) {
      this.filteredRows.set(this.allRows());
      return;
    }
    this.filteredRows.set(
      this.allRows().filter((row) =>
        [row.arDateStr, row.itemName, row.shiftName, row.workTime, row.otStartTime, row.otEndTime, row.workHour].some(
          (v) => v && String(v).toLowerCase().includes(kw),
        ),
      ),
    );
  }
}
