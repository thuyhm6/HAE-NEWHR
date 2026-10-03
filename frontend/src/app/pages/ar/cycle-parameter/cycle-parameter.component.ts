import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
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
import { CycleParameterRow, CycleParameterSavePayload, CycleParameterService } from './cycle-parameter.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * CRUD phẳng "Thông số chu kỳ chấm công" - port lại từ
 * ar/attendanceSettings/viewCycleParameter.html (đã xoá). Khác 2 trang CRUD
 * cùng batch (ArItem/Cycle - có phần đa ngôn ngữ): trang này không có
 * nameVi/en/zh/ko, chỉ CRUD thuần các trường cpnyId/statNo/startDate/endDate.
 */
@Component({
  selector: 'app-cycle-parameter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
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
  templateUrl: './cycle-parameter.component.html',
  styleUrl: './cycle-parameter.component.scss',
})
export class CycleParameterComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(CycleParameterService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchCpnyId = signal('');
  protected readonly searchStatNo = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<CycleParameterRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formParamNo = signal<string | null>(null);
  protected readonly formCpnyId = signal('');
  protected readonly formStatNo = signal('');
  protected readonly formStartDate = signal<Date | null>(null);
  protected readonly formEndDate = signal<Date | null>(null);
  protected readonly formOrderno = signal<number | null>(null);
  protected readonly formActive = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchCpnyId() || undefined, this.searchStatNo() || undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchCpnyId.set('');
    this.searchStatNo.set('');
    this.search();
  }

  private toApiDate(value: Date | null): string | null {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : null;
  }

  private parseApiDate(value: string | undefined): Date | null {
    if (!value) return null;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formParamNo.set(null);
    this.formCpnyId.set('');
    this.formStatNo.set('');
    this.formStartDate.set(null);
    this.formEndDate.set(null);
    this.formOrderno.set(null);
    this.formActive.set(true);
    this.modalVisible.set(true);
  }

  async openEditModal(paramNo: string | undefined): Promise<void> {
    if (!paramNo) return;
    try {
      const d = await this.service.getById(paramNo);
      this.modalIsEdit.set(true);
      this.formParamNo.set(d.paramNo ?? paramNo);
      this.formCpnyId.set(d.cpnyId ?? '');
      this.formStatNo.set(d.statNo ?? '');
      this.formStartDate.set(this.parseApiDate(d.startDate));
      this.formEndDate.set(this.parseApiDate(d.endDate));
      this.formOrderno.set(d.orderno ?? null);
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
    if (!this.formCpnyId().trim() || !this.formStatNo().trim()) {
      this.message.warning(this.i18n.t('ar.viewcycleparameter.msg.required', 'Vui lòng nhập Mã công ty và Khoảng mã'));
      return;
    }
    const payload: CycleParameterSavePayload = {
      paramNo: this.formParamNo(),
      cpnyId: this.formCpnyId().trim(),
      statNo: this.formStatNo().trim(),
      startDate: this.toApiDate(this.formStartDate()),
      endDate: this.toApiDate(this.formEndDate()),
      orderno: this.formOrderno(),
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

  deleteOne(paramNo: string | undefined): void {
    if (!paramNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewcycleparameter.confirm.delete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
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
