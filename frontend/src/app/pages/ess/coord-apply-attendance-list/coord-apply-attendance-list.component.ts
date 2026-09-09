import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
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
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AttendanceItemOption,
  AuthorizedDeptNode,
  CoordApplyAttendanceFilter,
  CoordApplyAttendanceListService,
  CoordApplyAttendanceRow,
  DataTablesResponse,
  ShiftOption,
  SyCodeOption,
} from './coord-apply-attendance-list.service';

/**
 * Coordinator tra cứu chấm công nhân viên theo phòng ban - port lại từ
 * ess/infoApplyAttendance/viewCoordApplyAttendanceInfoList.html (Thymeleaf +
 * DataTables server-side, đã xoá) sang Angular + NG-ZORRO, dùng nz-table với
 * `nzFrontPagination=false` + `(nzQueryParamsChange)` để giữ đúng phân trang
 * server-side thật của bản gốc. Xuất Excel chuyển sang .xlsx client-side
 * (SheetJS) theo quy ước dự án, chỉ xuất dữ liệu trang hiện tại (do dữ liệu
 * phân trang server-side, giống hạn chế của nút Export DataTables bản gốc).
 */
@Component({
  selector: 'app-coord-apply-attendance-list',
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
  templateUrl: './coord-apply-attendance-list.component.html',
  styleUrl: './coord-apply-attendance-list.component.scss',
})
export class CoordApplyAttendanceListComponent implements OnInit {
  private readonly service = inject(CoordApplyAttendanceListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);
  protected readonly postFamily = signal<string | null>(null);
  protected readonly shiftNo = signal<string | null>(null);
  protected readonly itemNoSearch = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);
  protected readonly itemOptions = signal<AttendanceItemOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly rows = signal<CoordApplyAttendanceRow[]>([]);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(25);
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
      const [deptList, postFamilyList, shiftList, itemList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getPostFamilyOptions(),
        this.service.getShiftOptions(),
        this.service.getItemOptions(),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.shiftOptions.set(shiftList);
      this.itemOptions.set(itemList);
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

  shiftLabel(opt: ShiftOption): string {
    return opt.nameVi || opt.shiftName || opt.shiftNo || '';
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : undefined;
  }

  private buildFilter(): CoordApplyAttendanceFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      startDate: this.toApiDate(this.startDate()),
      endDate: this.toApiDate(this.endDate()),
      shiftNo: this.shiftNo() ?? undefined,
      itemNoSearch: this.itemNoSearch() ?? undefined,
      postFamily: this.postFamily() ?? undefined,
    };
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.startDate.set(null);
    this.endDate.set(null);
    this.postFamily.set(null);
    this.shiftNo.set(null);
    this.itemNoSearch.set(null);
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
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res: DataTablesResponse<CoordApplyAttendanceRow> = await this.service.getPageList(
        this.buildFilter(),
        ++this.drawCounter,
        start,
        this.pageSize(),
      );
      this.rows.set(res.data ?? []);
      this.total.set(res.recordsTotal ?? 0);
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  exportExcel(): void {
    const header = [
      this.i18n.t('ex.col.no', 'No.'),
      this.i18n.t('ex.col.empId', 'Mã nhân viên'),
      this.i18n.t('ex.col.fullName', 'Họ tên'),
      this.i18n.t('ex.col.dept', 'Phòng ban'),
      this.i18n.t('ex.col.position', 'Chức vụ'),
      this.i18n.t('cai.col.shift', 'Ca'),
      this.i18n.t('cai.col.category', 'Phân loại'),
      this.i18n.t('cai.col.duration', 'Thời lượng'),
      this.i18n.t('cai.col.workDate', 'Ngày công'),
      this.i18n.t('cai.col.fromTime', 'Thời gian bắt đầu'),
      this.i18n.t('cai.col.toTime', 'Thời gian kết thúc'),
    ];
    const data = [
      header,
      ...this.rows().map((row, idx) => [
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.postGradeName ?? '',
        row.shiftName ?? '',
        row.itemName ?? '',
        `${row.quantity ?? ''}${row.unit ? ' ' + row.unit : ''}`,
        row.arDateStr ?? '',
        row.fromDate ?? '',
        row.toTime ?? '',
      ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'coord_apply_attendance_export.xlsx');
  }
}
