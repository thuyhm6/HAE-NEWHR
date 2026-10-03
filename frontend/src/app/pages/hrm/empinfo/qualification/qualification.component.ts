import { CommonModule } from '@angular/common';
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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../../i18n/i18n.service';
import { EmpSearchService, EmployeeSearchResult } from '../shared/emp-search.service';
import { QualificationRow, QualificationSavePayload, QualificationService } from './qualification.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../../core/config/table-pagination.config';
function toDateOrNull(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function toIsoDateOrUndefined(value: Date | null): string | undefined {
  if (!value) return undefined;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Chứng chỉ (Qualification) - port lại từ hrm/empinfo/viewQualification.html
 * (đã xoá). Xem ghi chú bug ngày tháng trong qualification.service.ts.
 */
@Component({
  selector: 'app-qualification',
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
  ],
  templateUrl: './qualification.component.html',
  styleUrl: './qualification.component.scss',
})
export class QualificationComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(QualificationService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchQualName = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<QualificationRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formQualNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formQualName = signal('');
  protected readonly formDateObtained = signal<Date | null>(null);
  protected readonly formQualCardNo = signal('');
  protected readonly formQualInstitute = signal('');
  protected readonly formValidityDate = signal<Date | null>(null);
  protected readonly formQualLevel = signal('');
  protected readonly formQualGrade = signal('');
  protected readonly formAcquisitionModes = signal('');
  protected readonly formPaymentAllowanceYN = signal('');
  protected readonly formQualSubmitDate = signal<Date | null>(null);
  protected readonly formQualRemark = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchQualName().trim()),
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
    this.searchQualName.set('');
    this.search();
  }

  private resetForm(): void {
    this.formQualNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formQualName.set('');
    this.formDateObtained.set(null);
    this.formQualCardNo.set('');
    this.formQualInstitute.set('');
    this.formValidityDate.set(null);
    this.formQualLevel.set('');
    this.formQualGrade.set('');
    this.formAcquisitionModes.set('');
    this.formPaymentAllowanceYN.set('');
    this.formQualSubmitDate.set(null);
    this.formQualRemark.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: QualificationRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.qualNo!);
      this.formQualNo.set(d.qualNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formQualName.set(d.qualName ?? '');
      this.formDateObtained.set(toDateOrNull(d.dateObtained ?? ''));
      this.formQualCardNo.set(d.qualCardNo ?? '');
      this.formQualInstitute.set(d.qualInstitute ?? '');
      this.formValidityDate.set(toDateOrNull(d.validityDate ?? ''));
      this.formQualLevel.set(d.qualLevel ?? '');
      this.formQualGrade.set(d.qualGrade ?? '');
      this.formAcquisitionModes.set(d.acquisitionModes ?? '');
      this.formPaymentAllowanceYN.set(d.paymentAllowanceYN ?? '');
      this.formQualSubmitDate.set(toDateOrNull(d.qualSubmitDate ?? ''));
      this.formQualRemark.set(d.qualRemark ?? '');
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
    const qualName = this.formQualName().trim();
    if (!personId || !qualName) {
      this.message.warning(this.i18n.t('hrm.viewQualification.msg.requiredFields', 'Vui lòng chọn Nhân viên và nhập Tên chứng chỉ'));
      return;
    }
    const payload: QualificationSavePayload = {
      qualNo: this.formQualNo(),
      personId,
      qualName,
      dateObtained: toIsoDateOrUndefined(this.formDateObtained()) ?? null,
      qualCardNo: this.formQualCardNo().trim() || undefined,
      qualInstitute: this.formQualInstitute().trim() || undefined,
      validityDate: toIsoDateOrUndefined(this.formValidityDate()) ?? null,
      qualLevel: this.formQualLevel().trim() || undefined,
      qualGrade: this.formQualGrade().trim() || undefined,
      acquisitionModes: this.formAcquisitionModes().trim() || undefined,
      paymentAllowanceYN: this.formPaymentAllowanceYN() || undefined,
      qualSubmitDate: toIsoDateOrUndefined(this.formQualSubmitDate()) || undefined,
      qualRemark: this.formQualRemark().trim() || undefined,
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

  deleteOne(row: QualificationRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.viewQualification.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.qualNo!);
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
