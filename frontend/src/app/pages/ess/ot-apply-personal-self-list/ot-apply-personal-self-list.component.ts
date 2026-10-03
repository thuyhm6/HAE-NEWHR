import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import {
  OtApplyPersonalSelfDetailRow,
  OtApplyPersonalSelfItem,
  OtApplyPersonalSelfListService,
  OtApplyPersonalSelfSummaryRow,
} from './ot-apply-personal-self-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface OtApplyPersonalSelfPivotRow {
  personId: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  total: number;
  items: Record<string, number>;
}

/**
 * Tình hình tăng ca của bản thân - port lại từ
 * ess/viewDept/viewOtApplyPersonalSelfList.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO, cùng cấu trúc với ArPersonalSelfListComponent nhưng gọi
 * API tăng ca, gọi lại nguyên vẹn API JSON sẵn có, xuất Excel .xlsx bằng
 * SheetJS ở client.
 */
@Component({
  selector: 'app-ot-apply-personal-self-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzIconModule,
    NzModalModule,
    NzTableModule,
  ],
  templateUrl: './ot-apply-personal-self-list.component.html',
  styleUrl: './ot-apply-personal-self-list.component.scss',
})
export class OtApplyPersonalSelfListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(OtApplyPersonalSelfListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly items = signal<OtApplyPersonalSelfItem[]>([]);
  protected readonly rows = signal<OtApplyPersonalSelfPivotRow[]>([]);

  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);

  protected readonly showDetailModal = signal(false);
  protected readonly detailTitle = signal('');
  protected readonly detailLoading = signal(false);
  protected readonly detailRows = signal<OtApplyPersonalSelfDetailRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.setDefaultCurrentMonth();
    try {
      this.items.set(await this.service.getItems());
    } catch {
      this.items.set([]);
    }
    await this.search();
  }

  private setDefaultCurrentMonth(): void {
    const now = new Date();
    this.startDate.set(new Date(now.getFullYear(), now.getMonth(), 1));
    this.endDate.set(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const raw = await this.service.getSummary(this.toApiDate(this.startDate()), this.toApiDate(this.endDate()));
      this.rows.set(this.pivot(raw));
    } catch {
      this.message.error(this.i18n.t('otsl.msg.loadOtFailed', 'Không tải được dữ liệu tình hình tăng ca.'));
    } finally {
      this.loading.set(false);
    }
  }

  private pivot(rawRows: OtApplyPersonalSelfSummaryRow[]): OtApplyPersonalSelfPivotRow[] {
    const map = new Map<string, OtApplyPersonalSelfPivotRow>();
    const order: string[] = [];
    rawRows.forEach((row) => {
      const pid = row.personId ?? '';
      let entry = map.get(pid);
      if (!entry) {
        entry = { personId: pid, empId: row.empId, localName: row.localName, deptName: row.deptName, total: 0, items: {} };
        map.set(pid, entry);
        order.push(pid);
      }
      const qty = parseFloat(row.totalQuantity ?? '0') || 0;
      entry.items[row.itemNo ?? ''] = qty;
      entry.total += qty;
    });
    return order.map((pid) => map.get(pid)!);
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : undefined;
  }

  async openDetail(row: OtApplyPersonalSelfPivotRow, item: OtApplyPersonalSelfItem): Promise<void> {
    const qty = row.items[item.itemNo ?? ''] ?? 0;
    if (!qty || !row.personId || !item.itemNo) {
      return;
    }
    this.detailTitle.set(item.itemName || this.i18n.t('otsl.msg.modalTitle', 'Chi tiết tăng ca'));
    this.showDetailModal.set(true);
    this.detailLoading.set(true);
    this.detailRows.set([]);
    try {
      this.detailRows.set(
        await this.service.getDetail(row.personId, item.itemNo, this.toApiDate(this.startDate()), this.toApiDate(this.endDate())),
      );
    } catch {
      this.message.error(this.i18n.t('otsl.msg.loadDetailFailed', 'Tải dữ liệu thất bại.'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
  }

  exportExcel(): void {
    if (!this.rows().length) {
      this.message.warning(this.i18n.t('otsl.msg.noDataToExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('otsl.msg.stt', 'STT'),
      this.i18n.t('otsl.msg.empId', 'Mã NV'),
      this.i18n.t('otsl.msg.empName', 'Họ tên'),
      this.i18n.t('otsl.msg.deptName', 'Phòng ban'),
      this.i18n.t('otsl.msg.total', 'Tổng'),
      ...this.items().map((item) => item.itemName ?? ''),
    ];
    const data: (string | number)[][] = [header];
    this.rows().forEach((row, idx) => {
      data.push([
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.total,
        ...this.items().map((item) => row.items[item.itemNo ?? ''] ?? 0),
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'tinh_hinh_tang_ca.xlsx');
  }
}
