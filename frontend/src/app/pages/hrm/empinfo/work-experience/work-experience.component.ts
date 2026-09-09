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
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../../i18n/i18n.service';
import { EmpSearchService, EmployeeSearchResult } from '../shared/emp-search.service';
import { WorkExperienceRow, WorkExperienceSavePayload, WorkExperienceService } from './work-experience.service';

/**
 * Kinh nghiệm làm việc (Work Experience) - port lại từ
 * hrm/empinfo/viewWorkInformation.html (đã xoá).
 */
@Component({
  selector: 'app-work-experience',
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
  ],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss',
})
export class WorkExperienceComponent implements OnInit {
  private readonly service = inject(WorkExperienceService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchCompanyName = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<WorkExperienceRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formWorkExpNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formCpnyName = signal('');
  protected readonly formDeptName = signal('');
  protected readonly formPosition = signal('');
  protected readonly formStartDate = signal('');
  protected readonly formEndDate = signal('');
  protected readonly formDuty = signal('');
  protected readonly formPayYear = signal('');
  protected readonly formResignReason = signal('');
  protected readonly formRemark = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchCompanyName().trim()),
      );
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchEmpId.set('');
    this.searchLocalName.set('');
    this.searchCompanyName.set('');
    this.search();
  }

  private resetForm(): void {
    this.formWorkExpNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formCpnyName.set('');
    this.formDeptName.set('');
    this.formPosition.set('');
    this.formStartDate.set('');
    this.formEndDate.set('');
    this.formDuty.set('');
    this.formPayYear.set('');
    this.formResignReason.set('');
    this.formRemark.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: WorkExperienceRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.workExpNo!);
      this.formWorkExpNo.set(d.workExpNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formCpnyName.set(d.cpnyName ?? '');
      this.formDeptName.set(d.deptName ?? '');
      this.formPosition.set(d.position ?? '');
      this.formStartDate.set(d.startDate ?? '');
      this.formEndDate.set(d.endDate ?? '');
      this.formDuty.set(d.duty ?? '');
      this.formPayYear.set(d.payYear ?? '');
      this.formResignReason.set(d.resignReason ?? '');
      this.formRemark.set(d.remark ?? '');
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

  onEmployeeSelected(personId: string | null): void {
    this.formPersonId.set(personId ?? '');
    const found = this.employeeOptions().find((e) => e.personId === personId);
    if (found) {
      this.formEmpLabel.set(`${found.empId} - ${found.localName}`);
    }
  }

  async saveRecord(): Promise<void> {
    const personId = this.formPersonId().trim();
    const cpnyName = this.formCpnyName().trim();
    if (!personId || !cpnyName) {
      this.message.warning(this.i18n.t('hrm.viewWorkInformation.msg.requiredFields', 'Vui lòng chọn Nhân viên và nhập Tên công ty'));
      return;
    }
    const payload: WorkExperienceSavePayload = {
      workExpNo: this.formWorkExpNo(),
      personId,
      cpnyName,
      deptName: this.formDeptName().trim() || undefined,
      position: this.formPosition().trim() || undefined,
      startDate: this.formStartDate().trim() || undefined,
      endDate: this.formEndDate().trim() || undefined,
      duty: this.formDuty().trim() || undefined,
      payYear: this.formPayYear().trim() || undefined,
      resignReason: this.formResignReason().trim() || undefined,
      remark: this.formRemark().trim() || undefined,
    };
    this.saving.set(true);
    try {
      const res = await this.service.save(payload);
      if (res.error) {
        this.message.error(res.error);
        return;
      }
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.modalVisible.set(false);
      await this.search();
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  deleteOne(row: WorkExperienceRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.viewWorkInformation.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.workExpNo!);
          if (res.error) {
            this.message.error(res.error);
            return;
          }
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.search();
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
