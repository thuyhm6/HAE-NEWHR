import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { YearUseInfoService, YearUseLeaveUsageRow, YearUseVacationRow } from './year-use-info.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Thông tin nghỉ phép năm + tình trạng sử dụng phép năm - port lại từ
 * ess/viewDept/yearUseInfo.html (Thymeleaf, đã xoá) sang Angular + NG-ZORRO,
 * dùng nz-table thay cho bảng dựng tay bằng jQuery. Gọi lại nguyên vẹn API
 * JSON sẵn có. Không kèm khối "Thông tin nhân viên" (essEmpInfoCard) vì chưa
 * có component Angular tương đương - tập trung vào 2 bảng dữ liệu chính.
 */
@Component({
  selector: 'app-year-use-info',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzIconModule, NzInputNumberModule, NzTableModule],
  templateUrl: './year-use-info.component.html',
  styleUrl: './year-use-info.component.scss',
})
export class YearUseInfoComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(YearUseInfoService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly year = signal<number>(new Date().getFullYear());

  protected readonly vacLoading = signal(false);
  protected readonly vacationRows = signal<YearUseVacationRow[]>([]);

  protected readonly leaveLoading = signal(false);
  protected readonly leaveUsageRows = signal<YearUseLeaveUsageRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    const year = this.year() ? String(this.year()) : undefined;

    this.vacLoading.set(true);
    try {
      this.vacationRows.set(await this.service.getVacationRows(year));
    } catch {
      this.message.error(this.i18n.t('yuif.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.vacLoading.set(false);
    }

    this.leaveLoading.set(true);
    try {
      this.leaveUsageRows.set(await this.service.getLeaveUsage(year));
    } catch {
      this.message.error(this.i18n.t('yuif.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.leaveLoading.set(false);
    }
  }
}
