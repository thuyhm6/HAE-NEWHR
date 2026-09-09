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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AttendanceItemOption,
  AttendancePersonalInfoListService,
  AttendancePersonalRow,
} from './attendance-personal-info-list.service';

function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function lastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * NV tự tra cứu lịch sử chấm công cá nhân (đi trễ/về sớm/quên quẹt thẻ...) -
 * port lại từ ess/infoApplyAttendance/viewAttendancePersonalInfoList.html
 * (Thymeleaf, đã xoá) sang Angular + NG-ZORRO, dùng nz-table (phân trang
 * client-side) thay cho bảng dựng tay + phân trang JS thuần. Gọi lại nguyên
 * vẹn API JSON sẵn có. Không kèm khối "Thông tin nhân viên" (essEmpInfoCard)
 * vì chưa có component Angular tương đương, theo tiền lệ đã áp dụng ở
 * YearUseInfoComponent.
 */
@Component({
  selector: 'app-attendance-personal-info-list',
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
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './attendance-personal-info-list.component.html',
  styleUrl: './attendance-personal-info-list.component.scss',
})
export class AttendancePersonalInfoListComponent implements OnInit {
  private readonly service = inject(AttendancePersonalInfoListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly itemNo = signal<string | null>(null);
  protected readonly startDate = signal<Date | null>(firstDayOfMonth());
  protected readonly endDate = signal<Date | null>(lastDayOfMonth());
  protected readonly quickFilter = signal('');

  protected readonly itemOptions = signal<AttendanceItemOption[]>([]);
  protected readonly loading = signal(false);
  protected readonly allRows = signal<AttendancePersonalRow[]>([]);
  protected readonly filteredRows = signal<AttendancePersonalRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.itemOptions.set(await this.service.getItemOptions());
    } catch {
      this.itemOptions.set([]);
    }
    await this.search();
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
        }),
      );
      this.applyQuickFilter();
    } catch {
      this.message.error(this.i18n.t('atpi.js.loadError', 'Lỗi tải dữ liệu'));
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
        [row.localName, row.empId, row.deptName, row.itemName, row.arDateStr, row.indoorTime, row.outdoorTime].some(
          (v) => v && String(v).toLowerCase().includes(kw),
        ),
      ),
    );
  }
}
