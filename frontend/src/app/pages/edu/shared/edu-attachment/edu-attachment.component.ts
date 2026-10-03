import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { I18nService } from '../../../../i18n/i18n.service';
import { EduCommonService, EduFile } from '../edu-common.service';

/**
 * Khối file đính kèm dùng chung (ESS_FILE) cho Kế hoạch đào tạo / Đơn vị đào tạo /
 * Hợp đồng đào tạo.
 * - File đã lưu: hiển thị link tải (API download có sẵn của ESS), xóa ngay khi bấm (có xác nhận).
 * - File mới chọn: giữ ở client (pendingFiles), trang cha upload sau khi lưu bản ghi
 *   (vì khi thêm mới chưa có mã bản ghi để gắn file).
 */
@Component({
  selector: 'app-edu-attachment',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './edu-attachment.component.html',
  styleUrl: './edu-attachment.component.scss',
})
export class EduAttachmentComponent {
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  @Input() files: EduFile[] = [];
  @Input() pendingFiles: File[] = [];
  @Input() readonly = false;

  @Output() pendingFilesChange = new EventEmitter<File[]>();
  /** Phát ra sau khi xóa thành công 1 file đã lưu (trang cha nạp lại danh sách). */
  @Output() fileDeleted = new EventEmitter<string>();

  downloadUrl(fileNo: string): string {
    return this.common.fileDownloadUrl(fileNo);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    if (selected.length) {
      this.pendingFilesChange.emit([...this.pendingFiles, ...selected]);
    }
    input.value = '';
  }

  removePending(index: number): void {
    this.pendingFilesChange.emit(this.pendingFiles.filter((_, i) => i !== index));
  }

  deleteSaved(file: EduFile): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.alert.empinfo.Sure.delete', 'Đồng ý Xóa không?'),
      nzOkDanger: true,
      nzMaskClosable: true,
      nzOnOk: async () => {
        try {
          const res = await this.common.deleteFile(file.fileNo);
          if (res.success) {
            this.fileDeleted.emit(file.fileNo);
          } else {
            this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
