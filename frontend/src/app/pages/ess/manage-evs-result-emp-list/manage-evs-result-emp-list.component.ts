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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  ManageEvsResultEmpDto,
  ManageEvsResultEmpFilter,
  ManageEvsResultEmpListService,
  SyCodeOption,
} from './manage-evs-result-emp-list.service';

const POST_FAMILY_PARENT_CODE = '14015812';
const EMP_TYPE_PARENT_CODE = '13864';
const EMP_OFFICE_PARENT_CODE = '15118';
const EMP_OFFICE_ACTIVE_CODE = '15119';

const GRADE_COLOR: Record<string, string> = {
  EX: 'success',
  VG: 'processing',
  GD: 'cyan',
  NI: 'warning',
  UN: 'error',
};

const MONTH_FIELDS = [
  'evsMonth1', 'evsMonth2', 'evsMonth3', 'evsMonth4', 'evsMonth5', 'evsMonth6',
  'evsMonth7', 'evsMonth8', 'evsMonth9', 'evsMonth10', 'evsMonth11', 'evsMonth12', 'evsMonth13',
] as const;

/**
 * Kết quả đánh giá năng lực nhân viên theo tháng - port lại từ
 * ess/viewDept/viewManageEvsResultEmpList.html (Thymeleaf + DataTables, đã
 * xoá) sang Angular + NG-ZORRO, dùng nz-table + nz-tag thay cho DataTables +
 * badge Bootstrap. Gọi lại nguyên vẹn API JSON sẵn có, xuất Excel .xlsx bằng
 * SheetJS ở client.
 */
@Component({
  selector: 'app-manage-evs-result-emp-list',
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
    NzInputNumberModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTreeSelectModule,
  ],
  templateUrl: './manage-evs-result-emp-list.component.html',
  styleUrl: './manage-evs-result-emp-list.component.scss',
})
export class ManageEvsResultEmpListComponent implements OnInit {
  private readonly service = inject(ManageEvsResultEmpListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly list = signal<ManageEvsResultEmpDto[]>([]);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);
  protected readonly year = signal<number>(new Date().getFullYear());
  protected readonly postFamily = signal<string | null>(null);
  protected readonly empTypeCode = signal<string | null>(null);
  protected readonly empOffice = signal<string | null>(EMP_OFFICE_ACTIVE_CODE);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);

  readonly monthFields = MONTH_FIELDS;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([this.loadFilterOptions(), this.search()]);
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, postFamilyList, empTypeList, empOfficeList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getCodeList(POST_FAMILY_PARENT_CODE),
        this.service.getCodeList(EMP_TYPE_PARENT_CODE),
        this.service.getCodeList(EMP_OFFICE_PARENT_CODE),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.empTypeOptions.set(empTypeList);
      this.empOfficeOptions.set(empOfficeList);
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
    this.loading.set(true);
    try {
      this.list.set(await this.service.getList(this.buildFilter()));
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.fromDate.set(null);
    this.toDate.set(null);
    this.year.set(new Date().getFullYear());
    this.postFamily.set(null);
    this.empTypeCode.set(null);
    this.empOffice.set(EMP_OFFICE_ACTIVE_CODE);
    this.search();
  }

  private buildFilter(): ManageEvsResultEmpFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      year: this.year() ? String(this.year()) : undefined,
      postFamily: this.postFamily() ?? undefined,
      empTypeCode: this.empTypeCode() ?? undefined,
      empOffice: this.empOffice() ?? undefined,
    };
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  gradeColor(value?: string): string | undefined {
    return value ? GRADE_COLOR[value] : undefined;
  }

  monthValue(row: ManageEvsResultEmpDto, field: (typeof MONTH_FIELDS)[number]): string | undefined {
    return row[field];
  }

  exportExcel(): void {
    if (!this.list().length) {
      this.message.warning(this.i18n.t('common.noData', 'Không có dữ liệu'));
      return;
    }
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('common.empId', 'Mã NV'),
      this.i18n.t('common.empName', 'Họ tên'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('essDept.year', 'Năm'),
      ...MONTH_FIELDS.slice(0, 12).map((_, idx) =>
        this.i18n.t(`vmer.col.month.${String(idx + 1).padStart(2, '0')}`, `T${idx + 1}`),
      ),
      this.i18n.t('vmer.col.competency', 'Năng lực'),
    ];
    const data: (string | number)[][] = [header];
    this.list().forEach((row, idx) => {
      data.push([
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.evsYear ?? '',
        ...MONTH_FIELDS.map((field) => row[field] ?? ''),
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'view_manage_evs_result_emp_list.xlsx');
  }
}
