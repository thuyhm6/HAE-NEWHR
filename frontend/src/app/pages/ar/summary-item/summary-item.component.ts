import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { SummaryItemRow, SummaryItemSavePayload, SummaryItemService } from './summary-item.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * CRUD phẳng danh mục "Hạng mục tổng hợp" - port lại từ
 * ar/attendanceSettings/viewSummaryItem.html (đã xoá). Cùng cấu trúc với
 * ArItemComponent (Batch R): itemNo tự sinh, dùng nz-switch cho Trạng thái
 * và "Có hiển thị (Y/N)" thay input/select thô của bản gốc.
 */
@Component({
  selector: 'app-summary-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './summary-item.component.html',
  styleUrl: './summary-item.component.scss',
})
export class SummaryItemComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(SummaryItemService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<SummaryItemRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formItemNo = signal<string | null>(null);
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formUnit = signal('');
  protected readonly formStaItemId = signal('');
  protected readonly formOrderno = signal<number | null>(null);
  protected readonly formShowYn = signal(true);
  protected readonly formShowOrder = signal<number | null>(null);
  protected readonly formActive = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.keyword() || undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.search();
  }

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formItemNo.set(null);
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formUnit.set('');
    this.formStaItemId.set('');
    this.formOrderno.set(null);
    this.formShowYn.set(true);
    this.formShowOrder.set(null);
    this.formActive.set(true);
    this.modalVisible.set(true);
  }

  async openEditModal(itemNo: string | undefined): Promise<void> {
    if (!itemNo) return;
    try {
      const d = await this.service.getById(itemNo);
      this.modalIsEdit.set(true);
      this.formItemNo.set(d.itemNo ?? itemNo);
      this.formNameVi.set(d.nameVi ?? '');
      this.formNameEn.set(d.nameEn ?? '');
      this.formNameZh.set(d.nameZh ?? '');
      this.formNameKo.set(d.nameKo ?? '');
      this.formUnit.set(d.unit ?? '');
      this.formStaItemId.set(d.staItemId ?? '');
      this.formOrderno.set(d.orderno ?? null);
      this.formShowYn.set((d.showYn ?? 'Y') === 'Y');
      this.formShowOrder.set(d.showOrder ?? null);
      this.formActive.set((d.activity ?? 1) === 1);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    if (!this.formNameVi().trim()) {
      this.message.warning(this.i18n.t('common.msg.enterNameVi', 'Vui lòng nhập Tên tiếng Việt'));
      return;
    }
    const payload: SummaryItemSavePayload = {
      itemNo: this.formItemNo(),
      nameVi: this.formNameVi().trim(),
      nameEn: this.formNameEn().trim(),
      nameZh: this.formNameZh().trim(),
      nameKo: this.formNameKo().trim(),
      unit: this.formUnit().trim(),
      staItemId: this.formStaItemId().trim(),
      orderno: this.formOrderno(),
      showYn: this.formShowYn() ? 'Y' : 'N',
      showOrder: this.formShowOrder(),
      activity: this.formActive() ? 1 : 0,
    };
    this.savingRecord.set(true);
    try {
      const res = await this.service.save(payload);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.savingRecord.set(false);
    }
  }

  deleteOne(itemNo: string | undefined): void {
    if (!itemNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewSummaryItem.confirm.delete', 'Bạn có chắc chắn muốn xóa hạng mục này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(itemNo);
          if (res.success) {
            await this.search();
          } else {
            this.message.error(res.error || this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
