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
import { CycleRow, CycleSavePayload, CycleService } from './cycle.service';

/**
 * CRUD phẳng danh mục "Chi nhánh / chu kỳ chấm công" - port lại từ
 * ar/attendanceSettings/viewCycle.html (đã xoá). Khác bản gốc (input số 0/1
 * cho Trạng thái): dùng `nz-switch`, cùng ý nghĩa nghiệp vụ.
 */
@Component({
  selector: 'app-cycle',
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
  templateUrl: './cycle.component.html',
  styleUrl: './cycle.component.scss',
})
export class CycleComponent implements OnInit {
  private readonly service = inject(CycleService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<CycleRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formStatNo = signal<string | null>(null);
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formStartDay = signal<number | null>(null);
  protected readonly formEndDay = signal<number | null>(null);
  protected readonly formValidDateFrom = signal<Date | null>(null);
  protected readonly formValidDateTo = signal<Date | null>(null);
  protected readonly formBeginMonthOffset = signal<number | null>(0);
  protected readonly formEndMonthOffset = signal<number | null>(0);
  protected readonly formOrderno = signal<number | null>(null);
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
    this.formStatNo.set(null);
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formStartDay.set(null);
    this.formEndDay.set(null);
    this.formValidDateFrom.set(null);
    this.formValidDateTo.set(null);
    this.formBeginMonthOffset.set(0);
    this.formEndMonthOffset.set(0);
    this.formOrderno.set(null);
    this.formActive.set(true);
    this.modalVisible.set(true);
  }

  async openEditModal(statNo: string | undefined): Promise<void> {
    if (!statNo) return;
    try {
      const d = await this.service.getById(statNo);
      this.modalIsEdit.set(true);
      this.formStatNo.set(d.statNo ?? statNo);
      this.formNameVi.set(d.nameVi ?? '');
      this.formNameEn.set(d.nameEn ?? '');
      this.formNameZh.set(d.nameZh ?? '');
      this.formNameKo.set(d.nameKo ?? '');
      this.formStartDay.set(d.startDay ?? null);
      this.formEndDay.set(d.endDay ?? null);
      this.formValidDateFrom.set(this.parseApiDate(d.validDateFrom));
      this.formValidDateTo.set(this.parseApiDate(d.validDateTo));
      this.formBeginMonthOffset.set(d.beginMonthOffset ?? 0);
      this.formEndMonthOffset.set(d.endMonthOffset ?? 0);
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
    if (!this.formNameVi().trim()) {
      this.message.warning(this.i18n.t('common.msg.enterNameVi', 'Vui lòng nhập Tên tiếng Việt'));
      return;
    }
    const payload: CycleSavePayload = {
      statNo: this.formStatNo(),
      nameVi: this.formNameVi().trim(),
      nameEn: this.formNameEn().trim(),
      nameZh: this.formNameZh().trim(),
      nameKo: this.formNameKo().trim(),
      startDay: this.formStartDay(),
      endDay: this.formEndDay(),
      validDateFrom: this.toApiDate(this.formValidDateFrom()),
      validDateTo: this.toApiDate(this.formValidDateTo()),
      beginMonthOffset: this.formBeginMonthOffset(),
      endMonthOffset: this.formEndMonthOffset(),
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

  deleteOne(statNo: string | undefined): void {
    if (!statNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewcycle.confirm.delete', 'Bạn có chắc chắn muốn xóa bản ghi này? Tất cả thông tin đa ngôn ngữ cũng sẽ bị xóa.'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(statNo);
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
