import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { PersonShiftListService, PersonShiftRow } from './person-shift-list.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Lịch sử ca làm của bản thân trong tháng - port lại từ
 * ess/workgroup/viewPersonShiftList.html (Thymeleaf, đã xoá) sang Angular +
 * NG-ZORRO, dùng nz-table thay cho DataTables. Gọi lại nguyên vẹn API JSON
 * sẵn có. Bỏ khối "Thông tin nhân viên" (essEmpInfoCard) vì chưa có
 * component Angular tương đương, giống các trang tự xem khác trong đợt
 * migrate này (yearUseInfo, ...).
 */
@Component({
  selector: 'app-person-shift-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzDatePickerModule, NzFormModule, NzIconModule, NzTableModule],
  templateUrl: './person-shift-list.component.html',
  styleUrl: './person-shift-list.component.scss',
})
export class PersonShiftListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(PersonShiftListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly rows = signal<PersonShiftRow[]>([]);
  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.setDefaultDates();
    await this.search();
  }

  private setDefaultDates(): void {
    const now = new Date();
    this.fromDate.set(new Date(now.getFullYear(), now.getMonth(), 1));
    this.toDate.set(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getMyList(this.toApiDate(this.fromDate()), this.toApiDate(this.toDate())));
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.setDefaultDates();
    this.search();
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }
}
