import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeOption, WorkGroupExperListService, WorkGroupRow } from './work-group-exper-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Lịch sử thay đổi ca làm của bản thân - port lại từ
 * ess/workgroup/viewWorkGroupExperList.html (Thymeleaf, đã xoá) sang Angular
 * + NG-ZORRO, dùng nz-table thay cho DataTables. Gọi lại nguyên vẹn API JSON
 * sẵn có. Bỏ khối "Thông tin nhân viên" (essEmpInfoCard) vì chưa có
 * component Angular tương đương, giống các trang tự xem khác trong đợt
 * migrate này.
 */
@Component({
  selector: 'app-work-group-exper-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzDatePickerModule, NzFormModule, NzIconModule, NzSelectModule, NzTableModule],
  templateUrl: './work-group-exper-list.component.html',
  styleUrl: './work-group-exper-list.component.scss',
})
export class WorkGroupExperListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(WorkGroupExperListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly rows = signal<WorkGroupRow[]>([]);
  protected readonly shiftOptions = signal<SyCodeOption[]>([]);
  private readonly shiftNameMap = new Map<string, string>();

  protected readonly shiftNo = signal<string | null>(null);
  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const options = await this.service.getShiftOptions();
      this.shiftOptions.set(options);
      options.forEach((opt) => this.shiftNameMap.set(opt.codeNo, this.shiftLabel(opt)));
    } catch {
      this.shiftOptions.set([]);
    }
    await this.search();
  }

  shiftLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.description || opt.codeNo;
  }

  shiftNameOf(shiftNo?: string): string {
    if (!shiftNo) {
      return '';
    }
    return this.shiftNameMap.get(shiftNo) ?? shiftNo;
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(
        await this.service.getMyList(this.shiftNo() ?? undefined, this.toApiDate(this.fromDate()), this.toApiDate(this.toDate())),
      );
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.shiftNo.set(null);
    this.fromDate.set(null);
    this.toDate.set(null);
    this.search();
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }
}
