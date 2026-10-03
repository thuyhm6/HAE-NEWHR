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
import { FamilyRow, FamilySavePayload, FamilyService } from './family.service';

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
 * Thông tin người thân - port lại từ hrm/empinfo/familySearch.html (đã xoá).
 */
@Component({
  selector: 'app-family',
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
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss',
})
export class FamilyComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(FamilyService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchFamName = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<FamilyRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formFamilyNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formFamName = signal('');
  protected readonly formFamTypeCode = signal('');
  protected readonly formFamBorndate = signal<Date | null>(null);
  protected readonly formFamIdcard = signal('');
  protected readonly formGender = signal('Male');
  protected readonly formFamPhone = signal('');
  protected readonly formFamEmail = signal('');
  protected readonly formOcupation = signal('');
  protected readonly formFamCompanyName = signal('');
  protected readonly formFamAddress = signal('');
  protected readonly formLiveYn = signal('N');
  protected readonly formEmergencyContactYn = signal('N');
  protected readonly formTaxYn = signal('N');
  protected readonly formRemarks = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchFamName().trim()));
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
    this.searchFamName.set('');
    this.search();
  }

  private resetForm(): void {
    this.formFamilyNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formFamName.set('');
    this.formFamTypeCode.set('');
    this.formFamBorndate.set(null);
    this.formFamIdcard.set('');
    this.formGender.set('Male');
    this.formFamPhone.set('');
    this.formFamEmail.set('');
    this.formOcupation.set('');
    this.formFamCompanyName.set('');
    this.formFamAddress.set('');
    this.formLiveYn.set('N');
    this.formEmergencyContactYn.set('N');
    this.formTaxYn.set('N');
    this.formRemarks.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: FamilyRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.familyNo!);
      this.formFamilyNo.set(d.familyNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formFamName.set(d.famName ?? '');
      this.formFamTypeCode.set(d.famTypeCode ?? '');
      this.formFamBorndate.set(toDateOrNull(d.famBorndate ?? ''));
      this.formFamIdcard.set(d.famIdcard ?? '');
      this.formGender.set(d.gender ?? 'Male');
      this.formFamPhone.set(d.famPhone ?? '');
      this.formFamEmail.set(d.famEmail ?? '');
      this.formOcupation.set(d.ocupation ?? '');
      this.formFamCompanyName.set(d.famCompanyName ?? '');
      this.formFamAddress.set(d.famAddress ?? '');
      this.formLiveYn.set(d.liveYn ?? 'N');
      this.formEmergencyContactYn.set(d.emergencyContactYn ?? 'N');
      this.formTaxYn.set(d.taxYn ?? 'N');
      this.formRemarks.set(d.remarks ?? '');
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
    const famName = this.formFamName().trim();
    const famTypeCode = this.formFamTypeCode().trim();
    if (!personId || !famName || !famTypeCode) {
      this.message.warning(this.i18n.t('hrm.familySearch.msg.requiredFields', 'Vui lòng điền đủ: Nhân viên, Tên người thân, Quan hệ'));
      return;
    }
    const payload: FamilySavePayload = {
      familyNo: this.formFamilyNo(),
      personId,
      famName,
      famTypeCode,
      famBorndate: toIsoDateOrUndefined(this.formFamBorndate()) ?? null,
      famIdcard: this.formFamIdcard().trim() || undefined,
      gender: this.formGender(),
      famPhone: this.formFamPhone().trim() || undefined,
      famEmail: this.formFamEmail().trim() || undefined,
      ocupation: this.formOcupation().trim() || undefined,
      famCompanyName: this.formFamCompanyName().trim() || undefined,
      famAddress: this.formFamAddress().trim() || undefined,
      liveYn: this.formLiveYn(),
      emergencyContactYn: this.formEmergencyContactYn(),
      taxYn: this.formTaxYn(),
      remarks: this.formRemarks().trim() || undefined,
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

  deleteOne(row: FamilyRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.familySearch.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.familyNo!);
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
