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
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { AttendanceExForBatchService, SyCodeOption } from '../../ess/attendance-ex-for-batch/attendance-ex-for-batch.service';
import { ArItemRow, ArItemSavePayload, ArItemService } from './ar-item.service';

const ITEM_GROUP_PARENT_CODE = '1429';

/**
 * CRUD phẳng danh mục "Hạng mục chấm công" - port lại từ
 * ar/attendanceSettings/viewArItem.html (đã xoá). Danh sách nhỏ (cấu hình hệ
 * thống) nên dùng nz-table phân trang phía client. Khác bản gốc (input số
 * 0/1 cho Trạng thái): dùng `nz-switch` cho gọn hơn, cùng ý nghĩa nghiệp vụ
 * (1 = Hoạt động, 0 = Ngừng). Tái sử dụng danh sách mã nhóm
 * (AttendanceExForBatchService.getCodeList, parent code 1429).
 */
@Component({
  selector: 'app-ar-item',
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
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './ar-item.component.html',
  styleUrl: './ar-item.component.scss',
})
export class ArItemComponent implements OnInit {
  private readonly service = inject(ArItemService);
  private readonly codeService = inject(AttendanceExForBatchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly groupOptions = signal<SyCodeOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<ArItemRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formItemNo = signal<string | null>(null);
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formItemId = signal('');
  protected readonly formShortName = signal('');
  protected readonly formDescription = signal('');
  protected readonly formUnit = signal('');
  protected readonly formItemGroupCode = signal<string | null>(null);
  protected readonly formItemIdMapping = signal('');
  protected readonly formOrderno = signal<number | null>(null);
  protected readonly formOrdernoSst = signal<number | null>(null);
  protected readonly formActive = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.groupOptions.set(await this.codeService.getCodeList(ITEM_GROUP_PARENT_CODE));
    } catch {
      this.groupOptions.set([]);
    }
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
    this.formItemId.set('');
    this.formShortName.set('');
    this.formDescription.set('');
    this.formUnit.set('');
    this.formItemGroupCode.set(null);
    this.formItemIdMapping.set('');
    this.formOrderno.set(null);
    this.formOrdernoSst.set(null);
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
      this.formItemId.set(d.itemId ?? '');
      this.formShortName.set(d.shortName ?? '');
      this.formDescription.set(d.description ?? '');
      this.formUnit.set(d.unit ?? '');
      this.formItemGroupCode.set(d.itemGroupCode ?? null);
      this.formItemIdMapping.set(d.itemIdMapping ?? '');
      this.formOrderno.set(d.orderno ?? null);
      this.formOrdernoSst.set(d.ordernoSst ?? null);
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
    const payload: ArItemSavePayload = {
      itemNo: this.formItemNo(),
      nameVi: this.formNameVi().trim(),
      nameEn: this.formNameEn().trim(),
      nameZh: this.formNameZh().trim(),
      nameKo: this.formNameKo().trim(),
      itemId: this.formItemId().trim(),
      shortName: this.formShortName().trim(),
      description: this.formDescription().trim(),
      unit: this.formUnit().trim(),
      itemGroupCode: this.formItemGroupCode(),
      itemIdMapping: this.formItemIdMapping().trim(),
      orderno: this.formOrderno(),
      ordernoSst: this.formOrdernoSst(),
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
      nzTitle: this.i18n.t('ar.viewArItem.confirm.delete', 'Bạn có chắc chắn muốn xóa hạng mục này? Tất cả thông tin đa ngôn ngữ cũng sẽ bị xóa.'),
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
