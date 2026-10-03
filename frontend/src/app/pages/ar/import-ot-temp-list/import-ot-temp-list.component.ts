import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { ImportOtTempListService, ImportOtTempRow } from './import-ot-temp-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Kết quả import Excel đơn tăng ca hàng loạt - port lại từ
 * ar/attendanceMintenance/viewImportOtTempList.html (đã xoá). Mở trong tab
 * trình duyệt mới từ ApplyOtBatchComponent sau khi import Excel thành công,
 * tự đóng tab sau khi "Lưu" thành công (giống fallback `window.close()` ở
 * bản gốc khi không có tabSystem nội bộ).
 */
@Component({
  selector: 'app-import-ot-temp-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzFormModule, NzIconModule, NzSelectModule, NzTableModule],
  templateUrl: './import-ot-temp-list.component.html',
  styleUrl: './import-ot-temp-list.component.scss',
})
export class ImportOtTempListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(ImportOtTempListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly errorOnly = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly rows = signal<ImportOtTempRow[]>([]);

  protected readonly totalRows = computed(() => this.rows().length);
  protected readonly errorRows = computed(() => this.rows().filter((r) => (r.uploadErrorMsg ?? '').trim() !== '').length);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  flagText(value: string | undefined): string {
    if (value === '1') return this.i18n.t('essOt.yes', 'Có');
    if (value === '0') return this.i18n.t('common.no', 'Không');
    return value ?? '';
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(this.errorOnly() ?? undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const res = await this.service.save();
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công!'));
        window.close();
      } else {
        this.message.error(res.error || res.message || this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
      }
    } catch {
      this.message.error(this.i18n.t('arOtf.msg.saveError', 'Lỗi khi gửi dữ liệu'));
    } finally {
      this.saving.set(false);
    }
  }
}
