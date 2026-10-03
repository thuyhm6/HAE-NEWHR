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
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { CardRecordDayFilter, CardRecordDayRow, CardRecordDayService, ShiftOption } from './card-record-day.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
function todayStr(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Tra cứu tổng hợp quẹt thẻ theo ca làm (giờ vào/ra, thiếu thẻ, đổi ca) -
 * port lại từ ar/attendanceMintenance/viewArCardRecordDay.html (đã xoá).
 * Phân trang server-side giống 2 trang card-record khác. Không có backend
 * exportExcel nên xuất Excel client bằng SheetJS chỉ với dữ liệu trang đang
 * xem (giữ nguyên hạn chế của DataTables Buttons "excel" ở bản gốc khi
 * serverSide=true).
 */
@Component({
  selector: 'app-card-record-day',
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
  templateUrl: './card-record-day.component.html',
  styleUrl: './card-record-day.component.scss',
})
export class CardRecordDayComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(CardRecordDayService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly otService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(todayStr());
  protected readonly toDate = signal<Date | null>(todayStr());
  protected readonly shiftNoFilter = signal<string | null>(null);
  protected readonly missingCard = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<CardRecordDayRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);
  private listBootstrapped = false;
  private drawCounter = 0;

  protected readonly pickerVisible = signal(false);
  protected readonly pickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly pickerSearching = signal(false);
  private pickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptList, shiftList] = await Promise.all([
        this.deptService.getAuthorizedDepartments(),
        this.service.getShiftOptions(),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.shiftOptions.set(shiftList);
    } catch {
      // Danh sách bộ lọc trống không chặn việc tra cứu chính.
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

  private buildFilter(): CardRecordDayFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      shiftNoFilter: this.shiftNoFilter() ?? undefined,
      missingCard: this.missingCard() ?? undefined,
    };
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

  shiftLabel(row: CardRecordDayRow): string {
    const name = row.shiftName ?? '';
    const time = row.shiftTime ?? '';
    return time ? `${name} (${time})` : name;
  }

  exportExcel(): void {
    if (!this.rows().length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
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
    this.rows().forEach((row, idx) => {
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

  // ── Tìm nhân viên cho ô từ khóa ─────────────────────────────────────────
  openEmployeePicker(): void {
    this.pickerSearchResults.set([]);
    this.pickerVisible.set(true);
  }

  closePicker(): void {
    this.pickerVisible.set(false);
  }

  onPickerSearch(keyword: string): void {
    if (this.pickerSearchTimer) {
      clearTimeout(this.pickerSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.pickerSearchResults.set([]);
      return;
    }
    this.pickerSearchTimer = setTimeout(async () => {
      this.pickerSearching.set(true);
      try {
        this.pickerSearchResults.set(await this.otService.searchEmployees(kw));
      } catch {
        this.pickerSearchResults.set([]);
      } finally {
        this.pickerSearching.set(false);
      }
    }, 300);
  }

  onPickerSelected(personId: string | null): void {
    if (!personId) return;
    const emp = this.pickerSearchResults().find((e) => e.personId === personId);
    if (emp) {
      this.keyword.set(`${emp.empId ?? ''} - ${emp.localName ?? ''}`);
    }
    this.closePicker();
    this.search();
  }
}
