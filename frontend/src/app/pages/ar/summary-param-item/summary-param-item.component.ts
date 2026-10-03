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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AvailableItemOption,
  SummaryParamItemRow,
  SummaryParamItemSavePayload,
  SummaryParamItemService,
} from './summary-param-item.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * CRUD phẳng "Thông số Hạng mục tổng hợp" - port lại từ
 * ar/attendanceSettings/viewSummaryParamItem.html (đã xoá). Dropdown Hạng
 * mục chỉ liệt kê các hạng mục CHƯA có thông số (`availableItems` loại trừ
 * item đã tồn tại trong AR_STA_ITEM_PARAM) - khi sửa, khóa dropdown và tự
 * thêm item hiện tại vào danh sách để hiển thị đúng, khớp hành vi
 * `loadAvailableItems(selectedItemNo, ...)` bản gốc. `Thứ tự tính toán (Cal
 * Order)` tự tăng ở backend khi thêm mới, chỉ hiển thị (readonly) khi sửa.
 */
@Component({
  selector: 'app-summary-param-item',
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
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './summary-param-item.component.html',
  styleUrl: './summary-param-item.component.scss',
})
export class SummaryParamItemComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  protected readonly service = inject(SummaryParamItemService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchText = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<SummaryParamItemRow[]>([]);

  protected readonly itemOptions = signal<AvailableItemOption[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);

  protected readonly formParamNo = signal<string | null>(null);
  protected readonly formItemNo = signal<string | null>(null);
  protected readonly formUnit = signal('DAY');
  protected readonly formMinUnit = signal(1);
  protected readonly formCalOrder = signal<number | null>(null);
  protected readonly formManageFlag = signal<number | null>(null);
  protected readonly formOrderno = signal<number | null>(0);
  protected readonly formActive = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchText().trim() || undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchText.set('');
    this.search();
  }

  itemLabel(item: AvailableItemOption): string {
    return item.nameVi ? `${item.nameVi} (${item.itemNo})` : item.itemNo;
  }

  private async loadAvailableItems(currentItemNo?: string | null, currentItemName?: string | null): Promise<void> {
    try {
      const list = await this.service.getAvailableItems();
      if (currentItemNo) {
        list.unshift({ itemNo: currentItemNo, nameVi: currentItemName || currentItemNo });
      }
      this.itemOptions.set(list);
    } catch {
      this.itemOptions.set([]);
    }
  }

  async openAddModal(): Promise<void> {
    this.modalIsEdit.set(false);
    this.formParamNo.set(null);
    this.formItemNo.set(null);
    this.formUnit.set('DAY');
    this.formMinUnit.set(1);
    this.formCalOrder.set(null);
    this.formManageFlag.set(null);
    this.formOrderno.set(0);
    this.formActive.set(true);
    await this.loadAvailableItems(null, null);
    this.modalVisible.set(true);
  }

  async openEditModal(row: SummaryParamItemRow): Promise<void> {
    if (!row.paramNo) return;
    try {
      const d = await this.service.getById(row.paramNo);
      this.modalIsEdit.set(true);
      this.formParamNo.set(d.paramNo ?? row.paramNo);
      this.formItemNo.set(d.itemNo ?? row.itemNo ?? null);
      this.formUnit.set(d.unit ?? 'DAY');
      this.formMinUnit.set(d.minUnit ?? 1);
      this.formCalOrder.set(d.calOrder ?? null);
      this.formManageFlag.set(d.manageFlag ?? null);
      this.formOrderno.set(d.orderno ?? 0);
      this.formActive.set((d.activity ?? 1) === 1);
      await this.loadAvailableItems(d.itemNo ?? row.itemNo, d.itemNameVi ?? row.itemNameVi ?? d.itemNo);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    const itemNo = this.formItemNo();
    if (!itemNo) {
      this.message.warning(this.i18n.t('ar.viewSummaryParamItem.msg.selectItem', 'Vui lòng chọn Hạng mục tổng hợp!'));
      return;
    }
    const paramNo = this.formParamNo();
    const payload: SummaryParamItemSavePayload = {
      paramNo,
      itemNo,
      unit: this.formUnit(),
      minUnit: this.formMinUnit(),
      manageFlag: this.formManageFlag(),
      orderno: this.formOrderno(),
      activity: this.formActive() ? 1 : 0,
    };
    if (paramNo) {
      payload.calOrder = this.formCalOrder();
    }
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

  deleteOne(paramNo: string | undefined): void {
    if (!paramNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewSummaryParamItem.confirm.delete', 'Bạn có chắc chắn muốn xóa thông số này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(paramNo);
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
