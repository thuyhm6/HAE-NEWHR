import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AR_PERSONAL_LIST_ITEM_GROUP,
  ArPersonalListDetailRow,
  ArPersonalListFilter,
  ArPersonalListItem,
  ArPersonalListService,
  ArPersonalListSummaryRow,
  AuthorizedDeptNode,
  SyCodeOption,
} from './ar-personal-list.service';

const EMP_TYPE_PARENT_CODE = '13864';
/** Số cột cố định trước các cột chấm công động: STT, Mã NV, Họ tên, Phòng ban. */
const STICKY_COLUMN_COUNT = 4;

/**
 * Tình hình chấm công nhân viên theo phòng ban (dành cho quản lý/HR xem của
 * người khác) - port lại từ ess/viewDept/viewArPersonalList.html (Thymeleaf,
 * đã xoá) sang Angular + NG-ZORRO, dùng nz-table (cột sticky bằng CSS) thay
 * cho bảng dựng tay bằng jQuery. Gọi lại nguyên vẹn API JSON sẵn có, xuất
 * Excel .xlsx bằng SheetJS ở client.
 */
@Component({
  selector: 'app-ar-personal-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './ar-personal-list.component.html',
  styleUrl: './ar-personal-list.component.scss',
})
export class ArPersonalListComponent implements OnInit {
  private readonly service = inject(ArPersonalListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly items = signal<ArPersonalListItem[]>([]);
  protected readonly rows = signal<ArPersonalListSummaryRow[]>([]);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly empTypeCode = signal<string | null>(null);
  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);

  protected readonly showDetailModal = signal(false);
  protected readonly detailTitle = signal('');
  protected readonly detailLoading = signal(false);
  protected readonly detailRows = signal<ArPersonalListDetailRow[]>([]);

  readonly stickyColumnCount = STICKY_COLUMN_COUNT;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.setDefaultDateRange();
    await Promise.all([this.loadFilterOptions(), this.loadItems()]);
    await this.search();
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 25);
    const thisMonthDate = new Date(now.getFullYear(), now.getMonth(), 24);
    this.startDate.set(prevMonthDate);
    this.endDate.set(thisMonthDate);
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, empTypeList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getCodeList(EMP_TYPE_PARENT_CODE),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.empTypeOptions.set(empTypeList);
    } catch {
      // im lặng bỏ qua - danh sách bộ lọc trống không chặn việc tra cứu chính
    }
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();

    flatList.forEach((item) => {
      nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true });
    });

    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '0' && nodeMap.has(item.parent)) {
        const siblings = childKeys.get(item.parent) ?? [];
        siblings.push(item.id);
        childKeys.set(item.parent, siblings);
      } else {
        const node = nodeMap.get(item.id);
        if (node) {
          roots.push(node);
        }
      }
    });

    nodeMap.forEach((node, id) => {
      const children = childKeys.get(id);
      if (children && children.length) {
        node.isLeaf = false;
        node.children = children.map((childId) => nodeMap.get(childId)!).filter(Boolean);
      }
    });

    return roots;
  }

  private async loadItems(): Promise<void> {
    try {
      this.items.set(await this.service.getItems(AR_PERSONAL_LIST_ITEM_GROUP));
    } catch {
      this.items.set([]);
    }
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getSummary(this.buildFilter()));
    } catch {
      this.message.error(this.i18n.t('vapl.msg.loadFailed', 'Lỗi tải dữ liệu chấm công.'));
    } finally {
      this.loading.set(false);
    }
  }

  private buildFilter(): ArPersonalListFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      empTypeCode: this.empTypeCode() ?? undefined,
      // ArPersonalListMapper so sánh trực tiếp chuỗi với AR_DATE_STR định dạng YYYY/MM/DD
      // (không TO_DATE) nên bắt buộc gửi đúng định dạng này, khác với các trang apsl/otsl.
      startDate: this.toApiDate(this.startDate()),
      endDate: this.toApiDate(this.endDate()),
      itemGroup: AR_PERSONAL_LIST_ITEM_GROUP,
    };
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : undefined;
  }

  quantityOf(row: ArPersonalListSummaryRow, itemId: string): number {
    return parseFloat(String(row[itemId] ?? '0')) || 0;
  }

  formatQty(value: number): string {
    if (!value) {
      return '0';
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
  }

  async openDetail(row: ArPersonalListSummaryRow, item: ArPersonalListItem): Promise<void> {
    const qty = this.quantityOf(row, item.itemId ?? '');
    const personId = String(row['PERSON_ID'] ?? '');
    if (!qty || !personId || !item.itemId) {
      return;
    }
    this.detailTitle.set(item.itemName || this.i18n.t('apsl.modal.title', 'Chi tiết chấm công'));
    this.showDetailModal.set(true);
    this.detailLoading.set(true);
    this.detailRows.set([]);
    try {
      this.detailRows.set(
        await this.service.getDetail(personId, item.itemId, this.toApiDate(this.startDate()), this.toApiDate(this.endDate())),
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
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('vapl.msg.stt', 'STT'),
      this.i18n.t('vapl.msg.empId', 'Mã NV'),
      this.i18n.t('vapl.msg.empName', 'Họ tên'),
      this.i18n.t('vapl.msg.deptName', 'Phòng ban'),
      this.i18n.t('vapl.msg.position', 'Chức vụ'),
      this.i18n.t('vapl.msg.normalWork', 'Tổng giờ công'),
      this.i18n.t('vapl.msg.lateEarlyGoTotal', 'Tổng (muộn/sớm/ra ngoài)'),
      ...this.items().map((item) => item.itemName ?? ''),
    ];
    const data: (string | number)[][] = [header];
    this.rows().forEach((row, idx) => {
      data.push([
        idx + 1,
        String(row['EMPID'] ?? ''),
        String(row['LOCAL_NAME'] ?? ''),
        String(row['DEPT_NAME'] ?? ''),
        String(row['POSITION_NAME'] ?? ''),
        this.formatQty(this.quantityOf(row, 'NORMAL_WORK')),
        this.formatQty(this.quantityOf(row, 'LATE_EARLY_GO_TOTAL')),
        ...this.items().map((item) => this.formatQty(this.quantityOf(row, item.itemId ?? ''))),
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'tinh_hinh_cham_cong_nhan_vien.xlsx');
  }
}
