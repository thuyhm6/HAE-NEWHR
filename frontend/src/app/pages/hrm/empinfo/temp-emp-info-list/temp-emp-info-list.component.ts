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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../../i18n/i18n.service';
import { EmpSearchService, EmployeeSearchResult } from '../shared/emp-search.service';
import {
  FemaleEmployeeRow,
  FemaleEmployeeSavePayload,
  FemaleEmployeeSearchFilter,
  TempEmpInfoListService,
} from './temp-emp-info-list.service';

/**
 * Quản lý nhân viên nữ (viewTempEmpInfoList) - port lại từ
 * hrm/empinfo/viewTempEmpInfoList.html + editEmployee.html (đã xoá).
 *
 * Nút "Xem chi tiết" (View) ở bản gốc chỉ `alert('Xem chi tiết nhân viên: '
 * + specialNo)` - một placeholder chưa hoàn thiện, không phải hành vi cố ý
 * (khác với việc ẩn tính năng theo quyền). Hoàn thiện thành modal xem chi
 * tiết thực sự (chỉ đọc), theo đúng tiền lệ đã áp dụng cho nút "Xuất Excel"
 * ở DepartManagerListComponent và trang Recognition/Punishment.
 */
@Component({
  selector: 'app-temp-emp-info-list',
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
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './temp-emp-info-list.component.html',
  styleUrl: './temp-emp-info-list.component.scss',
})
export class TempEmpInfoListComponent implements OnInit {
  private readonly service = inject(TempEmpInfoListService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchLocalName = signal('');
  protected readonly searchEmpId = signal('');
  protected readonly searchDeptNo = signal('');
  protected readonly searchPosition = signal('');
  protected readonly searchCreateDateFrom = signal('');
  protected readonly searchCreateDateTo = signal('');
  protected readonly searchActivity = signal<string | null>(null);
  protected readonly searchOtFlag = signal<string | null>(null);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<FemaleEmployeeRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(10);
  private listBootstrapped = false;
  private drawCounter = 0;

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly viewModalVisible = signal(false);
  protected readonly viewRow = signal<FemaleEmployeeRow | null>(null);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formPersonId = signal('');
  protected readonly formEmpId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formLocalName = signal('');
  protected readonly formDeptNo = signal('');
  protected readonly formPosition = signal('');
  protected readonly formSpecialNo = signal('');
  protected readonly formActivity = signal('1');
  protected readonly formOtFlag = signal('0');
  protected readonly formSpecialContent = signal('');
  protected readonly formStartDate = signal('');
  protected readonly formEndDate = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  private buildFilter(): FemaleEmployeeSearchFilter {
    return {
      localName: this.searchLocalName().trim() || undefined,
      empId: this.searchEmpId().trim() || undefined,
      deptNo: this.searchDeptNo().trim() || undefined,
      position: this.searchPosition().trim() || undefined,
      createDateFrom: this.searchCreateDateFrom() || undefined,
      createDateTo: this.searchCreateDateTo() || undefined,
      activity: this.searchActivity() || undefined,
      otFlag: this.searchOtFlag() || undefined,
    };
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

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  clearSearch(): void {
    this.searchLocalName.set('');
    this.searchEmpId.set('');
    this.searchDeptNo.set('');
    this.searchPosition.set('');
    this.searchCreateDateFrom.set('');
    this.searchCreateDateTo.set('');
    this.searchActivity.set(null);
    this.searchOtFlag.set(null);
    this.search();
  }

  exportResults(): void {
    window.open(this.service.buildExportUrl(this.buildFilter()), '_blank');
  }

  private async loadPage(): Promise<void> {
    this.listLoading.set(true);
    const draw = ++this.drawCounter;
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getList(this.buildFilter(), draw, start, this.pageSize());
      if (draw !== this.drawCounter) return;
      if (res.error) {
        this.message.error(res.error);
        this.rows.set([]);
        this.total.set(0);
        return;
      }
      this.rows.set(res.data || []);
      this.total.set(res.recordsTotal || 0);
    } catch {
      this.rows.set([]);
      this.total.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      if (draw === this.drawCounter) this.listLoading.set(false);
    }
  }

  private resetForm(): void {
    this.formPersonId.set('');
    this.formEmpId.set('');
    this.formEmpLabel.set(null);
    this.formLocalName.set('');
    this.formDeptNo.set('');
    this.formPosition.set('');
    this.formSpecialNo.set('');
    this.formActivity.set('1');
    this.formOtFlag.set('0');
    this.formSpecialContent.set('');
    this.formStartDate.set('');
    this.formEndDate.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: FemaleEmployeeRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.specialNo!);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpId.set(d.empId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formLocalName.set(d.localName ?? '');
      this.formDeptNo.set(d.deptNo ?? '');
      this.formPosition.set(d.position ?? '');
      this.formSpecialNo.set(d.specialNo ?? '');
      this.formActivity.set(String(d.activity ?? 1));
      this.formOtFlag.set(String(d.otFlag ?? 0));
      this.formSpecialContent.set(d.specialContent ?? '');
      this.formStartDate.set((d.startDate ?? '').substring(0, 10));
      this.formEndDate.set((d.endDate ?? '').substring(0, 10));
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async onEmployeeSearch(keyword: string): Promise<void> {
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

  onEmployeeSelected(empId: string | null): void {
    this.formEmpId.set(empId ?? '');
    const found = this.employeeOptions().find((e) => e.empId === empId);
    if (found) {
      this.formPersonId.set(found.personId ?? '');
      this.formEmpLabel.set(`${found.empId} - ${found.localName}`);
      this.formLocalName.set(found.localName ?? '');
      this.formDeptNo.set(found.deptNo ?? '');
      this.formPosition.set(found.positionName ?? found.position ?? '');
    }
  }

  async saveRecord(): Promise<void> {
    const empId = this.formEmpId().trim();
    const localName = this.formLocalName().trim();
    if (!empId || !localName) {
      this.message.warning(this.i18n.t('hrm.viewTempEmpInfoList.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    const payload: FemaleEmployeeSavePayload = {
      personId: this.formPersonId() || undefined,
      empId,
      localName,
      deptNo: this.formDeptNo().trim() || undefined,
      position: this.formPosition().trim() || undefined,
      specialNo: this.formSpecialNo().trim() || undefined,
      activity: this.formActivity(),
      otFlag: this.formOtFlag(),
      specialContent: this.formSpecialContent().trim() || undefined,
      startDate: this.formStartDate() || undefined,
      endDate: this.formEndDate() || undefined,
    };
    this.saving.set(true);
    try {
      const res = this.modalIsEdit() ? await this.service.update(payload) : await this.service.add(payload);
      this.message.success(res || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.modalVisible.set(false);
      await this.loadPage();
    } catch (err: any) {
      const errText = err?.error && typeof err.error === 'string' ? err.error : this.i18n.t('common.saveFailed', 'Lưu thất bại.');
      this.message.error(errText);
    } finally {
      this.saving.set(false);
    }
  }

  async viewDetail(row: FemaleEmployeeRow): Promise<void> {
    try {
      const d = await this.service.getById(row.specialNo!);
      this.viewRow.set(d);
      this.viewModalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeViewModal(): void {
    this.viewModalVisible.set(false);
  }

  deleteOne(row: FemaleEmployeeRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t(
        'hrm.viewTempEmpInfoList.msg.confirmDelete',
        'Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác!',
      ),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.specialNo!);
          this.message.success(res || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.loadPage();
        } catch (err: any) {
          const errText =
            err?.error && typeof err.error === 'string' ? err.error : this.i18n.t('common.deleteFailed', 'Xóa thất bại.');
          this.message.error(errText);
        }
      },
    });
  }
}
