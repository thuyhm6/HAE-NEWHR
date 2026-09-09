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
  ArPersonalSelfDetailRow,
  ArPersonalSelfItem,
  ArPersonalSelfListService,
  ArPersonalSelfSummaryRow,
} from './ar-personal-self-list.service';

interface ArPersonalSelfPivotRow {
  personId: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  total: number;
  items: Record<string, number>;
}

/**
 * Tình hình chấm công của bản thân (nghỉ phép/nghỉ khác) - port lại từ
 * ess/viewDept/viewArPersonalSelfList.html (Thymeleaf, đã xoá) sang Angular +
 * NG-ZORRO, dùng nz-table thay cho bảng dựng tay bằng jQuery, gọi lại nguyên
 * vẹn API JSON sẵn có, xuất Excel .xlsx bằng SheetJS ở client thay vì .xls
 * dựng bằng HTML table như bản cũ.
 */
@Component({
  selector: 'app-ar-personal-self-list',
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
  templateUrl: './ar-personal-self-list.component.html',
  styleUrl: './ar-personal-self-list.component.scss',
})
export class ArPersonalSelfListComponent implements OnInit {
  private readonly service = inject(ArPersonalSelfListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly items = signal<ArPersonalSelfItem[]>([]);
  protected readonly rows = signal<ArPersonalSelfPivotRow[]>([]);

  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);

  protected readonly showDetailModal = signal(false);
  protected readonly detailTitle = signal('');
  protected readonly detailLoading = signal(false);
  protected readonly detailRows = signal<ArPersonalSelfDetailRow[]>([]);

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
      this.message.error(this.i18n.t('apsl.msg.loadFailed', 'Không tải được dữ liệu tình hình chấm công.'));
    } finally {
      this.loading.set(false);
    }
  }

  private pivot(rawRows: ArPersonalSelfSummaryRow[]): ArPersonalSelfPivotRow[] {
    const map = new Map<string, ArPersonalSelfPivotRow>();
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

  async openDetail(row: ArPersonalSelfPivotRow, item: ArPersonalSelfItem): Promise<void> {
    const qty = row.items[item.itemNo ?? ''] ?? 0;
    if (!qty || !row.personId || !item.itemNo) {
      return;
    }
    this.detailTitle.set(item.itemName || this.i18n.t('apsl.msg.modalTitle', 'Chi tiết chấm công'));
    this.showDetailModal.set(true);
    this.detailLoading.set(true);
    this.detailRows.set([]);
    try {
      this.detailRows.set(
        await this.service.getDetail(row.personId, item.itemNo, this.toApiDate(this.startDate()), this.toApiDate(this.endDate())),
      );
    } catch {
      this.message.error(this.i18n.t('apsl.msg.loadDetailFailed', 'Tải dữ liệu thất bại.'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
  }

  exportExcel(): void {
    if (!this.rows().length) {
      this.message.warning(this.i18n.t('apsl.msg.noDataToExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('apsl.msg.stt', 'STT'),
      this.i18n.t('apsl.msg.empId', 'Mã NV'),
      this.i18n.t('apsl.msg.empName', 'Họ tên'),
      this.i18n.t('apsl.msg.deptName', 'Phòng ban'),
      this.i18n.t('apsl.msg.total', 'Tổng'),
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
    XLSX.writeFile(workbook, 'tinh_hinh_cham_cong.xlsx');
  }
}
