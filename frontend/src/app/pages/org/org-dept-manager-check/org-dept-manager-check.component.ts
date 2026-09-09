import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { EmpSearchService, EmployeeSearchResult } from '../../hrm/empinfo/shared/emp-search.service';
import { OrgComposeService, OrgResumeOption } from '../org-compose/org-compose.service';
import { DeptManagerCheckRow, OrgDeptManagerCheckService } from './org-dept-manager-check.service';

/**
 * Kiểm tra trưởng bộ phận (viewDeptManagerCheck) - xem ghi chú trong org-dept-manager-check.service.ts.
 * DataTables (không phân trang, cuộn dọc) thay bằng nz-table cuộn dọc tương đương. EmployeeSearchModal
 * (jQuery, mở modal DataTables riêng để tìm nhân viên) thay bằng nz-select nzServerSearch, tái sử dụng
 * nguyên EmpSearchService đã dùng ở các trang CRUD module hrm/empinfo thay vì viết lại logic tìm kiếm.
 * Dropdown phiên bản thay đổi tái sử dụng OrgComposeService.getResumeDropdown() (cùng API với trang
 * org-compose). Nút Excel/PDF/Print (DataTables buttons) chỉ giữ lại Excel - xuất file thật .xlsx bằng
 * thư viện xlsx phía client vì backend không có endpoint export riêng cho trang này.
 */
@Component({
  selector: 'app-org-dept-manager-check',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './org-dept-manager-check.component.html',
  styleUrl: './org-dept-manager-check.component.scss',
})
export class OrgDeptManagerCheckComponent implements OnInit {
  private readonly composeService = inject(OrgComposeService);
  private readonly service = inject(OrgDeptManagerCheckService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly resumeOptions = signal<OrgResumeOption[]>([]);
  protected readonly loadingResume = signal(false);
  protected readonly selectedResumeNo = signal<string | null>(null);

  protected readonly rows = signal<DeptManagerCheckRow[]>([]);
  protected readonly loadingRows = signal(false);

  protected readonly modalVisible = signal(false);
  protected readonly saving = signal(false);
  protected readonly editDeptNo = signal('');
  protected readonly editDeptLabel = signal('');
  protected readonly editManagerEmpId = signal('');
  protected readonly editEmpLabel = signal<string | null>(null);
  protected readonly editIsPartTime = signal(false);
  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadResumeDropdown();
  }

  protected resumeLabel(r: OrgResumeOption): string {
    return r.no ? `${r.no} ${r.resumeName ?? ''}` : (r.resumeName ?? '');
  }

  private async loadResumeDropdown(): Promise<void> {
    this.loadingResume.set(true);
    try {
      const list = await this.composeService.getResumeDropdown();
      this.resumeOptions.set(list ?? []);
      if (list?.length) {
        this.selectedResumeNo.set(list[0].no);
        await this.loadRows();
      }
    } catch {
      this.resumeOptions.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loadingResume.set(false);
    }
  }

  async onResumeChange(resumeNo: string | null): Promise<void> {
    this.selectedResumeNo.set(resumeNo);
    if (resumeNo) await this.loadRows();
    else this.rows.set([]);
  }

  private async loadRows(): Promise<void> {
    const resumeNo = this.selectedResumeNo();
    if (!resumeNo) return;
    this.loadingRows.set(true);
    try {
      this.rows.set((await this.service.getManagerCheckList(resumeNo)) ?? []);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loadingRows.set(false);
    }
  }

  protected deptIndentPx(row: DeptManagerCheckRow): string {
    return `${(row.DEPT_LEVEL || 0) * 20}px`;
  }

  protected isVacant(row: DeptManagerCheckRow): boolean {
    return String(row.VACANCY) === '1';
  }

  protected isPartTimeRow(row: DeptManagerCheckRow): boolean {
    return row.IS_PART_TIME === '1';
  }

  // ==================== Modal cập nhật trưởng bộ phận ====================

  protected openEditModal(row: DeptManagerCheckRow): void {
    this.editDeptNo.set(row.DEPTNO);
    this.editDeptLabel.set(`${row.DEPTNO} - ${row.ORG_NAME_LOCAL ?? ''}`);
    this.editManagerEmpId.set(row.MANAGER_EMP_ID ?? '');
    this.editEmpLabel.set(row.MANAGER_EMP_ID ? `${row.MANAGER_EMP_ID} - ${row.MANAGER_NAME ?? ''}` : null);
    this.editIsPartTime.set(row.IS_PART_TIME === '1');
    this.employeeOptions.set([]);
    this.modalVisible.set(true);
  }

  protected async onEmployeeSearch(keyword: string): Promise<void> {
    const kw = (keyword || '').trim();
    if (!kw) {
      this.employeeOptions.set([]);
      return;
    }
    this.employeeSearching.set(true);
    try {
      this.employeeOptions.set(await this.employeeService.searchEmployees(kw));
    } catch {
      this.employeeOptions.set([]);
    } finally {
      this.employeeSearching.set(false);
    }
  }

  protected onEmployeeSelected(personId: string | null): void {
    this.editManagerEmpId.set(personId ?? '');
    const found = this.employeeOptions().find((e) => e.personId === personId);
    if (found) this.editEmpLabel.set(`${found.empId} - ${found.localName}`);
  }

  protected clearSelectedManager(): void {
    this.editManagerEmpId.set('');
    this.editEmpLabel.set(null);
    this.employeeOptions.set([]);
  }

  protected async saveManager(): Promise<void> {
    const resumeNo = this.selectedResumeNo();
    if (!resumeNo) return;
    this.saving.set(true);
    try {
      const res = await this.service.updateManager({
        resumeNo,
        deptNo: this.editDeptNo(),
        managerEmpId: this.editManagerEmpId(),
        isPartTime: this.editIsPartTime() ? '1' : '0',
      });
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.modalVisible.set(false);
      await this.loadRows();
    } catch (err: any) {
      this.message.error(err?.error?.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  // ==================== Xuất Excel ====================

  protected exportExcel(): void {
    const headers = [
      this.i18n.t('org.deptMgr.deptColumn', 'Mã bộ phận - Tên bộ phận'),
      this.i18n.t('org.orgManage.DEPARTMENT_INFORMATION.Z', 'Trưởng phòng'),
      this.i18n.t('org.title.BUSINESS_NAME', 'Chức vụ'),
      this.i18n.t('org.title.POSITION_NO', 'Chức danh'),
      this.i18n.t('org.compose.isPartTime', 'Kiêm nhiệm'),
      this.i18n.t('org.deptMgr.vacancyColumn', 'Trống (Vacancy)'),
    ];
    const dataRows = this.rows().map((r) => [
      `${r.DEPTNO} - ${r.ORG_NAME_LOCAL ?? ''}`,
      r.MANAGER_NAME || this.i18n.t('org.deptMgr.noManager', 'Chưa có'),
      r.POST_GRADE_NAME ?? '',
      r.POSITION_NAME ?? '',
      this.isPartTimeRow(r) ? 'X' : '',
      this.isVacant(r) ? this.i18n.t('org.deptMgr.vacant', 'Trống') : this.i18n.t('org.deptMgr.appointed', 'Đã bổ nhiệm'),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'KiemTraTruongBoPhan');
    XLSX.writeFile(workbook, 'kiem_tra_truong_bo_phan.xlsx');
  }
}
