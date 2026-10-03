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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { ArCalenderRow, STATUTORY_DEFAULT_SHIFT_NO, StatutoryHolidaysService } from './statutory-holidays.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
function todayDate(): Date {
  return new Date();
}

/**
 * CRUD phẳng "Ngày lễ pháp định" - port lại từ
 * ar/attendanceSettings/viewStatutoryHolidays.html (đã xoá). Giữ nguyên đúng
 * hành vi save của bản gốc: form chỉ cho sửa Ngày (khoá khi edit) / Loại ngày
 * (TypeID) / Ghi chú - các trường còn lại (shiftNo, workdayflag, orderno,
 * activity, statutoryFlag) được gán CỨNG khi lưu (shiftNo='14015838',
 * workdayflag=0, orderno=0, activity=1, statutoryFlag=1), đúng như payload
 * cố định trong `shlSaveData()` bản gốc (không đọc lại giá trị hiện có khi
 * sửa) - đây là chủ đích thiết kế (trang chỉ quản lý NGÀY NGHỈ LỄ, luôn là
 * ngày nghỉ + đang hoạt động), không phải bug.
 */
@Component({
  selector: 'app-statutory-holidays',
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
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './statutory-holidays.component.html',
  styleUrl: './statutory-holidays.component.scss',
})
export class StatutoryHolidaysComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  protected readonly service = inject(StatutoryHolidaysService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchYear = signal<number | null>(new Date().getFullYear());

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<ArCalenderRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);

  protected readonly formDdate = signal<Date | null>(null);
  protected readonly formDdateStr = signal<string | null>(null);
  protected readonly formTypeid = signal('1442');
  protected readonly formRemark = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      const iyear = this.searchYear() != null ? String(this.searchYear()) : undefined;
      this.rows.set(await this.service.getList(iyear));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchYear.set(new Date().getFullYear());
    this.search();
  }

  displayDate(ddateStr: string | undefined): string {
    if (!ddateStr) return '';
    const parts = ddateStr.split('/');
    if (parts.length !== 3) return ddateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formDdate.set(todayDate());
    this.formDdateStr.set(null);
    this.formTypeid.set('1442');
    this.formRemark.set('');
    this.modalVisible.set(true);
  }

  async openEditModal(ddateStr: string | undefined): Promise<void> {
    if (!ddateStr) return;
    try {
      const d = await this.service.getByPk(ddateStr);
      this.modalIsEdit.set(true);
      this.formDdateStr.set(d.ddateStr ?? ddateStr);
      this.formDdate.set(null);
      this.formTypeid.set(d.typeid ?? '1442');
      this.formRemark.set(d.remark ?? '');
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    const isEdit = this.modalIsEdit();
    const ddateStr = isEdit
      ? this.formDdateStr()
      : this.formDdate()
        ? formatDate(this.formDdate()!, 'yyyy/MM/dd', 'en-US')
        : null;
    if (!ddateStr) {
      this.message.warning(this.i18n.t('ar.viewStatutoryHolidays.msg.selectDate', 'Vui lòng nhập Ngày'));
      return;
    }
    const typeid = this.formTypeid() || '1442';
    const payload: ArCalenderRow = {
      ddateStr,
      shiftNo: STATUTORY_DEFAULT_SHIFT_NO,
      typeid,
      overtypeid: typeid,
      typeidDefault: typeid,
      workdayflag: 0,
      operationId: undefined,
      remark: this.formRemark().trim() || undefined,
      orderno: 0,
      activity: 1,
      statutoryFlag: 1,
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

  deleteOne(ddateStr: string | undefined): void {
    if (!ddateStr) return;
    const confirmMsg =
      this.i18n.t('ar.viewStatutoryHolidays.confirm.delete', 'Chắc chắn muốn xóa ngày lễ') +
      ` "${ddateStr}"? ` +
      this.i18n.t('ar.viewStatutoryHolidays.confirm.deleteNote', 'Dữ liệu liên quan trong AR_CALENDER_GROUP_HISTORY cũng sẽ bị xóa.');
    this.modal.confirm({
      nzTitle: confirmMsg,
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(ddateStr);
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
