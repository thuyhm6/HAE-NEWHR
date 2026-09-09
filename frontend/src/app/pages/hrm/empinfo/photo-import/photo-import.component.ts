import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../../i18n/i18n.service';
import { PhotoImportResult, PhotoImportService } from './photo-import.service';

/**
 * Import ảnh đại diện nhân viên (photoImport) - port lại từ
 * hrm/empinfo/photoImport.html (đã xoá).
 */
@Component({
  selector: 'app-photo-import',
  standalone: true,
  imports: [CommonModule, NzAlertModule, NzButtonModule, NzCardModule, NzIconModule, NzModalModule, NzTableModule, NzTagModule],
  templateUrl: './photo-import.component.html',
  styleUrl: './photo-import.component.scss',
})
export class PhotoImportComponent {
  private readonly service = inject(PhotoImportService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly selectedFiles = signal<File[]>([]);
  protected readonly checking = signal(false);
  protected readonly saving = signal(false);
  protected readonly results = signal<PhotoImportResult[]>([]);
  protected readonly isSaveResult = signal(false);

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles.set(input.files ? Array.from(input.files) : []);
    this.results.set([]);
  }

  get successCount(): number {
    return this.results().filter((r) => r.success).length;
  }

  get failCount(): number {
    return this.results().filter((r) => !r.success).length;
  }

  async preview(): Promise<void> {
    if (!this.selectedFiles().length) {
      this.modal.warning({ nzTitle: this.i18n.t('hrm.photoImport.noFilesSelected', 'Chưa chọn file nào') });
      return;
    }
    this.checking.set(true);
    try {
      this.results.set(await this.service.preview(this.selectedFiles()));
      this.isSaveResult.set(false);
    } catch (e: any) {
      this.modal.error({
        nzTitle: this.i18n.t('hrm.photoImport.error.check', 'Lỗi khi kiểm tra file'),
        nzContent: e?.message || '',
      });
    } finally {
      this.checking.set(false);
    }
  }

  reset(): void {
    this.selectedFiles.set([]);
    this.results.set([]);
    this.isSaveResult.set(false);
  }

  confirmSave(): void {
    const validFiles = this.selectedFiles().filter((f) => this.results().some((r) => r.success && r.fileName === f.name));
    if (!validFiles.length) {
      this.modal.warning({ nzTitle: this.i18n.t('hrm.photoImport.noValidFiles', 'Không có file hợp lệ để lưu') });
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.photoImport.confirm.message', 'Xác nhận lưu ảnh hợp lệ vào hệ thống?'),
      nzOnOk: async () => {
        this.saving.set(true);
        try {
          const results = await this.service.save(validFiles);
          this.results.set(results);
          this.isSaveResult.set(true);
          const saved = results.filter((r) => r.success).length;
          this.modal.success({
            nzTitle: this.i18n.t('hrm.photoImport.saveResult.title', 'Kết quả lưu ảnh'),
            nzContent: `${saved} ${this.i18n.t('hrm.photoImport.saved.success', 'ảnh đã lưu thành công')}`,
          });
        } catch (e: any) {
          this.modal.error({
            nzTitle: this.i18n.t('hrm.photoImport.error.save', 'Lỗi khi lưu file'),
            nzContent: e?.message || '',
          });
        } finally {
          this.saving.set(false);
        }
      },
    });
  }
}
