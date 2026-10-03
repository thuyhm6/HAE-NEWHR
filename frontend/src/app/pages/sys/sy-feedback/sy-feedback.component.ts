import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { SyFeedbackRow, SyFeedbackService } from './sy-feedback.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Danh sách góp ý người dùng (viewFeedback) - xem ghi chú trong
 * sy-feedback.service.ts. Trang chỉ đọc, click 1 dòng mở modal xem chi
 * tiết đầy đủ nội dung (bảng chỉ hiển thị rút gọn 100 ký tự).
 */
@Component({
  selector: 'app-sy-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzTableModule],
  templateUrl: './sy-feedback.component.html',
  styleUrl: './sy-feedback.component.scss',
})
export class SyFeedbackComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(SyFeedbackService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly rows = signal<SyFeedbackRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(TABLE_DEFAULT_PAGE_SIZE);

  protected readonly detailVisible = signal(false);
  protected readonly detailRow = signal<SyFeedbackRow | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getList(this.searchKeyword(), 1, start, this.pageSize());
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.rows.set(resp.data || []);
    } catch {
      this.rows.set([]);
      this.recordsTotal.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  search(): void {
    this.pageIndex.set(1);
    this.loadList();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadList();
  }

  truncate(text?: string): string {
    if (!text) return '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  openDetail(row: SyFeedbackRow): void {
    this.detailRow.set(row);
    this.detailVisible.set(true);
  }
}
