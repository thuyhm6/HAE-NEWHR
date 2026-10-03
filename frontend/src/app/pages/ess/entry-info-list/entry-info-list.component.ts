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
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  EntryInfoFilter,
  EntryInfoListService,
  EntryInfoRow,
  ShiftOption,
} from './entry-info-list.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Danh sách dữ liệu quẹt thẻ ca làm - port lại từ
 * ess/viewDept/viewEntryInfoList.html (Thymeleaf + DataTables server-side, đã
 * xoá) sang Angular + NG-ZORRO, dùng nz-table phân trang server-side (giống
 * ManageCountInfoListComponent). Gọi lại nguyên vẹn API JSON sẵn có. Bỏ qua
 * modal chọn nhanh nhân viên (EmployeeSearchModal, chưa có bản Angular) - chỉ
 * giữ ô nhập từ khoá, không ảnh hưởng chức năng tra cứu chính.
 */
@Component({
  selector: 'app-entry-info-list',
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
    NzTreeSelectModule,
  ],
  templateUrl: './entry-info-list.component.html',
  styleUrl: './entry-info-list.component.scss',
})
export class EntryInfoListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EntryInfoListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(new Date());
  protected readonly toDate = signal<Date | null>(new Date());
  protected readonly shiftNoFilter = signal<string | null>(null);
  protected readonly missingCard = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly rows = signal<EntryInfoRow[]>([]);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);
  protected readonly total = signal(0);

  private listBootstrapped = false;
  private drawCounter = 0;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadFilterOptions();
    await this.search();
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, shiftList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getShiftOptions(),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.shiftOptions.set(shiftList);
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

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.shiftNoFilter.set(null);
    this.missingCard.set(null);
    const today = new Date();
    this.fromDate.set(today);
    this.toDate.set(today);
    this.search();
  }

  private buildFilter(): EntryInfoFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      shiftNoFilter: this.shiftNoFilter() ?? undefined,
      missingCard: this.missingCard() ?? undefined,
    };
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
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
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getPageList(this.buildFilter(), ++this.drawCounter, start, this.pageSize());
      this.rows.set(res.data ?? []);
      this.total.set(res.recordsTotal ?? 0);
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  shiftLabel(row: EntryInfoRow): string {
    const name = row.shiftName ?? '';
    const time = row.shiftTime ?? '';
    return time ? `${name} (${time})` : name;
  }

  async exportExcel(): Promise<void> {
    if (!this.total()) {
      this.message.warning(this.i18n.t('common.noData', 'Không có dữ liệu'));
      return;
    }
    let rows: EntryInfoRow[];
    try {
      const full = await this.service.getPageList(this.buildFilter(), ++this.drawCounter, 0, this.total());
      rows = full.data ?? [];
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
      return;
    }
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('common.empId', 'Mã nhân viên'),
      this.i18n.t('common.empName', 'Họ tên'),
      this.i18n.t('acrd.col.team', 'TEAM'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('common.position', 'Chức vụ'),
      this.i18n.t('attSearch.workDate', 'Ngày công'),
      this.i18n.t('acrd.col.inDay', 'Ngày vào'),
      this.i18n.t('acrd.col.inTime', 'Thời gian vào'),
      this.i18n.t('acrd.col.outDay', 'Ngày ra'),
      this.i18n.t('acrd.col.outTime', 'Thời gian ra'),
      this.i18n.t('acr.col.remark', 'Ghi chú'),
      this.i18n.t('acrd.col.shiftName', 'Ca làm'),
      this.i18n.t('acrd.col.changeShiftPerson', 'Người thay đổi Ca làm'),
      this.i18n.t('acrd.col.eatTime', 'Eat time'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      data.push([
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptTeam ?? '',
        row.deptName ?? '',
        row.postGradeNoName ?? '',
        row.arDateStr ?? '',
        row.inDay ?? '',
        row.inTime ?? '',
        row.outDay ?? '',
        row.outTime ?? '',
        row.leaveContent ?? '',
        this.shiftLabel(row),
        row.changeShiftPerson ?? '',
        row.eatTimes ?? '',
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'du_lieu_quet_the_ca_lam.xlsx');
  }
}
