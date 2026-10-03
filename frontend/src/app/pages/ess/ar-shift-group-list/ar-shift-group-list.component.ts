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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { ArShiftGroupListService, ArShiftGroupRow, SyCodeOption } from './ar-shift-group-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface EditableShiftGroupRow extends ArShiftGroupRow {
  editShiftNo: string | null;
  editStartDate: Date | null;
  editRemark: string;
  saving: boolean;
}

/**
 * Quản lý thay đổi ca làm việc nhân viên - port lại từ
 * ess/deptEmpAtt/viewArShiftGroupList.html (Thymeleaf + DataTables, đã xoá)
 * sang Angular + NG-ZORRO, dùng nz-table với các ô nhập trực tiếp trên từng
 * dòng (giống bảng gốc) thay vì dựng HTML input bằng tay. Gọi lại nguyên vẹn
 * API JSON sẵn có.
 */
@Component({
  selector: 'app-ar-shift-group-list',
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
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './ar-shift-group-list.component.html',
  styleUrl: './ar-shift-group-list.component.scss',
})
export class ArShiftGroupListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(ArShiftGroupListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly rows = signal<EditableShiftGroupRow[]>([]);
  protected readonly shiftOptions = signal<SyCodeOption[]>([]);

  protected readonly searchEmpId = signal('');
  protected readonly searchEmpName = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.shiftOptions.set(await this.service.getShiftOptions());
    } catch {
      this.shiftOptions.set([]);
    }
    await this.search();
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.service.getList(this.searchEmpId() || undefined, this.searchEmpName() || undefined);
      this.rows.set(
        list.map((row) => ({
          ...row,
          editShiftNo: row.shiftNo ?? null,
          editStartDate: this.parseDate(row.startDate),
          editRemark: row.remark ?? '',
          saving: false,
        })),
      );
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.searchEmpId.set('');
    this.searchEmpName.set('');
    this.search();
  }

  private parseDate(value?: string): Date | null {
    if (!value) {
      return null;
    }
    const normalized = value.replace(/\//g, '-');
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  }

  shiftLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.description || opt.codeNo;
  }

  async saveRow(row: EditableShiftGroupRow): Promise<void> {
    if (!row.personId) {
      this.message.warning('Không lấy được thông tin nhân viên (PERSON_ID).');
      return;
    }
    if (!row.editShiftNo) {
      this.message.warning('Vui lòng chọn Ca mới.');
      return;
    }
    if (!row.editStartDate) {
      this.message.warning('Vui lòng nhập Ngày bắt đầu.');
      return;
    }

    row.saving = true;
    try {
      const res = await this.service.save({
        PERSON_ID: row.personId,
        BEFOR_SHIFT_NO: row.beforShiftNo,
        SHIFT_NO: row.editShiftNo,
        START_DATE: formatDate(row.editStartDate, 'yyyy-MM-dd', 'en-US'),
        REMARK: row.editRemark,
      });
      if (res.success) {
        this.message.success(res.message || 'Lưu thành công!');
      } else {
        this.message.error(res.error || 'Lỗi server.');
      }
    } catch {
      this.message.error('Lỗi không xác định');
    } finally {
      row.saving = false;
    }
  }
}
