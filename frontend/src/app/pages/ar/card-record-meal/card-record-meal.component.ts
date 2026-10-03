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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import { ImportFromDeviceResponse } from '../card-record-for-self/card-record-for-self.service';
import { CardRecordMealFilter, CardRecordMealRow, CardRecordMealService } from './card-record-meal.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
function todayStr(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Tra cứu dữ liệu quẹt thẻ suất ăn, đọc trực tiếp từ máy chủ - port lại từ
 * ar/attendanceMintenance/viewArCardRecordMeal.html (đã xoá). Cùng pattern
 * phân trang server-side + modal import như CardRecordForSelfComponent.
 */
@Component({
  selector: 'app-card-record-meal',
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
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './card-record-meal.component.html',
  styleUrl: './card-record-meal.component.scss',
})
export class CardRecordMealComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(CardRecordMealService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(todayStr());
  protected readonly toDate = signal<Date | null>(todayStr());
  protected readonly eatDate = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<CardRecordMealRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(TABLE_DEFAULT_PAGE_SIZE);
  private listBootstrapped = false;
  private drawCounter = 0;

  protected readonly importModalVisible = signal(false);
  protected readonly importFromDate = signal<Date | null>(null);
  protected readonly importToDate = signal<Date | null>(null);
  protected readonly importing = signal(false);
  protected readonly importResult = signal<ImportFromDeviceResponse | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.deptTreeNodes.set(this.buildDeptTree(await this.deptService.getAuthorizedDepartments()));
    } catch {
      this.deptTreeNodes.set([]);
    }
    await this.search();
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
        if (node) roots.push(node);
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

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  private buildFilter(): CardRecordMealFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      eatDate: this.eatDate() ?? undefined,
    };
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.eatDate.set(null);
    this.fromDate.set(todayStr());
    this.toDate.set(todayStr());
    this.search();
  }

  async onQueryParamsChange(params: NzTableQueryParams): Promise<void> {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    if (!this.listBootstrapped) {
      this.listBootstrapped = true;
      return;
    }
    await this.loadPage();
  }

  private async loadPage(): Promise<void> {
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getPageList(this.buildFilter(), ++this.drawCounter, start, this.pageSize());
      this.rows.set(res.data ?? []);
      this.total.set(res.recordsTotal ?? 0);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  exportExcel(): void {
    window.location.href = this.service.buildExportUrl(this.buildFilter());
  }

  openImportModal(): void {
    this.importFromDate.set(this.fromDate());
    this.importToDate.set(this.toDate());
    this.importResult.set(null);
    this.importModalVisible.set(true);
  }

  closeImportModal(): void {
    this.importModalVisible.set(false);
  }

  async runImport(): Promise<void> {
    const fromDate = this.toApiDate(this.importFromDate());
    const toDate = this.toApiDate(this.importToDate());
    if (!fromDate || !toDate) {
      this.message.warning(this.i18n.t('acrm.imp.msg.selectDate', 'Vui lòng chọn khoảng thời gian cần đọc dữ liệu'));
      return;
    }
    this.importing.set(true);
    this.importResult.set(null);
    try {
      const res = await this.service.importFromDevice(fromDate, toDate);
      this.importResult.set(res);
      if (res.success) {
        await this.loadPage();
      }
    } catch {
      this.importResult.set({ success: false, message: this.i18n.t('acr.imp.msg.connectError', 'Lỗi kết nối máy chủ, vui lòng thử lại.') });
    } finally {
      this.importing.set(false);
    }
  }
}
