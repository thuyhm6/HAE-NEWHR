import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { AttendanceExForBatchService, SyCodeOption } from '../../ess/attendance-ex-for-batch/attendance-ex-for-batch.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import { VacEmpFilter, VacEmpRow, VacEmpListService } from './vac-emp-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const EMP_OFFICE_PARENT_CODE = '15118';
const EMP_OFFICE_DEFAULT = '15119';

/**
 * Tra cứu tổng hợp phép năm của nhân viên (chỉ xem + xuất Excel) - port lại
 * từ ar/attendanceSettings/viewVacEmpList.html (đã xoá). Backend trả mảng
 * phẳng (không phân trang server) nên dùng nz-table phân trang client. "Năm
 * phép" luôn là năm hiện tại, không có UI đổi năm (khớp bản gốc). Tái sử
 * dụng dept-tree (ArPersonalListService) và danh sách mã trạng thái làm việc
 * (AttendanceExForBatchService.getCodeList, parent code 15118).
 */
@Component({
  selector: 'app-vac-emp-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './vac-emp-list.component.html',
  styleUrl: './vac-emp-list.component.scss',
})
export class VacEmpListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(VacEmpListService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly codeService = inject(AttendanceExForBatchService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly empOffice = signal<string | null>(EMP_OFFICE_DEFAULT);
  protected readonly vacYear = signal(new Date().getFullYear().toString());

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<VacEmpRow[]>([]);

  protected readonly months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptList, empOfficeList] = await Promise.all([
        this.deptService.getAuthorizedDepartments(),
        this.codeService.getCodeList(EMP_OFFICE_PARENT_CODE),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.empOfficeOptions.set(empOfficeList);
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

  private buildFilter(): VacEmpFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      vacId: this.vacYear(),
      empOffice: this.empOffice() ?? undefined,
    };
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.buildFilter()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.empOffice.set(EMP_OFFICE_DEFAULT);
    this.vacYear.set(new Date().getFullYear().toString());
    this.search();
  }

  monthValue(row: VacEmpRow, month: number): string | undefined {
    return (row as unknown as Record<string, string | undefined>)[`useVac${month}`];
  }

  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('common.stt', 'No.'),
      this.i18n.t('common.empId', 'Mã nhân viên'),
      this.i18n.t('common.empName', 'Họ tên'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('common.position', 'Chức vụ'),
      this.i18n.t('ar.viewVacEmpList.col.totVacCnt', 'Tổng phép'),
      this.i18n.t('ar.viewVacEmpList.col.lastYearVac', 'Phép năm trước'),
      this.i18n.t('ar.viewVacEmpList.col.useVacCnt', 'Đã dùng'),
      this.i18n.t('ar.viewVacEmpList.col.affirmUseVac', 'Chờ duyệt'),
      ...this.months.map((m) => `${this.i18n.t('ar.viewVacEmpList.col.month', 'Tháng')} ${m}`),
      this.i18n.t('ar.viewVacEmpList.col.mentVac', 'Quy đổi'),
      this.i18n.t('ar.viewVacEmpList.col.workMonth', 'Tháng công tác'),
      this.i18n.t('ar.viewVacEmpList.col.isLocked', 'Khóa'),
      this.i18n.t('common.remark', 'Ghi chú'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      data.push([
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.postGradeName ?? '',
        row.totVacCnt ?? '',
        row.lastYearVac ?? '',
        row.useVacCnt ?? '',
        row.affirmUseVac ?? '',
        ...this.months.map((m) => this.monthValue(row, m) ?? ''),
        row.mentVac ?? '',
        row.workMonth ?? '',
        row.isLocked ?? '',
        row.remark ?? '',
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `vac_emp_export_${this.vacYear()}.xlsx`);
  }
}
