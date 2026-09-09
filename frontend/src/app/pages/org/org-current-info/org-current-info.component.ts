import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { buildOrgTree, collectAllTreeKeys } from '../org-tree.util';
import { CurrentOrgEmployeeRow, HrDepartmentRow, OrgCurrentInfoService } from './org-current-info.service';

/**
 * Sơ đồ tổ chức hiện hành (viewCurrentOrgInfo) - xem ghi chú trong org-current-info.service.ts. jsTree
 * bản gốc thay bằng nz-tree (dựng cây thật theo parent/child, dùng chung util với org-compose), DataTables
 * thay bằng nz-table phân trang client-side (pageSize 20, đúng bản gốc). Trang chỉ xem, không có thao
 * tác thêm/sửa/xóa. Nút Excel/PDF/Print (DataTables buttons) bản gốc chỉ giữ lại Excel - xuất file thật
 * .xlsx bằng thư viện xlsx phía client vì backend không có endpoint export riêng cho trang này.
 */
@Component({
  selector: 'app-org-current-info',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzTableModule, NzTreeModule],
  templateUrl: './org-current-info.component.html',
  styleUrl: './org-current-info.component.scss',
})
export class OrgCurrentInfoComponent implements OnInit {
  private readonly service = inject(OrgCurrentInfoService);
  protected readonly i18n = inject(I18nService);

  protected readonly deptList = signal<HrDepartmentRow[]>([]);
  protected readonly loadingTree = signal(false);
  protected readonly treeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly expandedKeys = signal<NzTreeNodeKey[]>([]);
  protected readonly searchTreeValue = signal('');
  protected readonly selectedDeptKey = signal<string | null>(null);
  protected readonly selectedDept = signal<HrDepartmentRow | null>(null);

  protected readonly employees = signal<CurrentOrgEmployeeRow[]>([]);
  protected readonly loadingEmployees = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadTree();
  }

  private async loadTree(): Promise<void> {
    this.loadingTree.set(true);
    try {
      const list = await this.service.getStructure();
      this.deptList.set(list ?? []);
      const nodes = buildOrgTree(list ?? []);
      this.treeNodes.set(nodes);
      this.expandedKeys.set(collectAllTreeKeys(nodes));
    } catch {
      this.deptList.set([]);
      this.treeNodes.set([]);
    } finally {
      this.loadingTree.set(false);
    }
  }

  protected expandAllNodes(): void {
    this.expandedKeys.set(collectAllTreeKeys(this.treeNodes()));
  }

  protected collapseAllNodes(): void {
    this.expandedKeys.set([]);
  }

  protected onTreeClick(event: NzFormatEmitEvent): void {
    const key = event.node?.key;
    if (!key) return;
    const dept = this.deptList().find((d) => d.deptNo === key);
    if (!dept) return;
    this.selectedDeptKey.set(key);
    this.selectedDept.set(dept);
    this.loadEmployees(key);
  }

  private async loadEmployees(deptNo: string): Promise<void> {
    this.loadingEmployees.set(true);
    try {
      this.employees.set((await this.service.getEmployees(deptNo)) ?? []);
    } catch {
      this.employees.set([]);
    } finally {
      this.loadingEmployees.set(false);
    }
  }

  protected managerDisplay(dept: HrDepartmentRow): string {
    return dept.managerEmpName ? `${dept.managerEmpName} (${dept.managerEmpId ?? ''})` : (dept.managerEmpId ?? '');
  }

  protected deptTypeDisplay(dept: HrDepartmentRow): string {
    return dept.deptTypeName || dept.deptType || '';
  }

  protected costCenterDisplay(dept: HrDepartmentRow): string {
    return dept.costCenterName ? `${dept.costCenterName} (${dept.costCenter ?? ''})` : (dept.costCenter ?? '');
  }

  protected isActiveEmp(emp: CurrentOrgEmployeeRow): boolean {
    return emp.activity === 1 || String(emp.activity) === '1';
  }

  protected formatDateStarted(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : formatDate(d, 'dd/MM/yyyy', 'vi');
  }

  protected exportExcel(): void {
    const headers = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('org.title.EMPID', 'Mã nhân viên'),
      this.i18n.t('sys.affirm.title.personName', 'Tên nhân viên'),
      this.i18n.t('org.title.ORG_NAME_ENG', 'Tên tiếng Anh'),
      this.i18n.t('hrm.empinfo.workexp.position', 'Vị trí'),
      this.i18n.t('org.title.DATE_STARTED', 'Ngày vào làm'),
      this.i18n.t('common.status', 'Trạng thái'),
    ];
    const dataRows = this.employees().map((e, i) => [
      i + 1,
      e.empId,
      e.localName,
      e.englishName,
      e.position,
      this.formatDateStarted(e.dateStarted),
      this.isActiveEmp(e) ? this.i18n.t('common.active', 'Hoạt động') : this.i18n.t('common.inactive', 'Không hoạt động'),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachNhanVien');
    XLSX.writeFile(workbook, 'danh_sach_nhan_vien_phong_ban.xlsx');
  }
}
