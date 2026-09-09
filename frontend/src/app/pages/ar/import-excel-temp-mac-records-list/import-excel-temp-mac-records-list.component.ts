import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { ImportExcelTempMacRecordsListService, MacRecordTempRow } from './import-excel-temp-mac-records-list.service';

/**
 * Xem/xác nhận kết quả import Excel dữ liệu quẹt thẻ - port lại từ
 * ar/attendanceMintenance/viewImportExcelTempMacRecordsList.html (đã xoá).
 * Mở trong tab trình duyệt mới từ CardRecordComponent sau khi import Excel
 * thành công, tự đóng tab sau khi "Xác nhận" thành công (giống fallback
 * window.close() ở bản gốc khi không có tabSystem nội bộ).
 */
@Component({
  selector: 'app-import-excel-temp-mac-records-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzFormModule, NzIconModule, NzModalModule, NzSelectModule, NzTableModule],
  templateUrl: './import-excel-temp-mac-records-list.component.html',
  styleUrl: './import-excel-temp-mac-records-list.component.scss',
})
export class ImportExcelTempMacRecordsListComponent implements OnInit {
  private readonly service = inject(ImportExcelTempMacRecordsListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly errorOnly = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly confirming = signal(false);
  protected readonly rows = signal<MacRecordTempRow[]>([]);

  protected readonly totalRows = computed(() => this.rows().length);
  protected readonly errorRows = computed(() => this.rows().filter((r) => (r.uploadErrorMsg ?? '').trim() !== '').length);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
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

  confirmImport(): void {
    if (this.totalRows() === 0) {
      this.message.warning(this.i18n.t('impMac.noData', 'Không có dữ liệu để xác nhận.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('impMac.confirmPrompt', 'Bạn có chắc chắn muốn xác nhận và lưu dữ liệu vào hệ thống không?'),
      nzOnOk: async () => {
        this.confirming.set(true);
        try {
          const res = await this.service.confirm();
          if (res.success) {
            this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công!'));
            window.close();
          } else {
            this.message.error(res.message || this.i18n.t('acr.msg.saveError', 'Lỗi khi lưu bản ghi.'));
          }
        } catch {
          this.message.error(this.i18n.t('acr.imp.msg.connectError', 'Lỗi kết nối máy chủ, vui lòng thử lại.'));
        } finally {
          this.confirming.set(false);
        }
      },
    });
  }
}
