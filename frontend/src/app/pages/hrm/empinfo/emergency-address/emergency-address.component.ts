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
import { EmergencyAddressRow, EmergencyAddressSavePayload, EmergencyAddressService } from './emergency-address.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../../core/config/table-pagination.config';
/**
 * Địa chỉ khẩn cấp - port lại từ hrm/empinfo/emergencyAddressSearch.html
 * (đã xoá).
 */
@Component({
  selector: 'app-emergency-address',
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
  templateUrl: './emergency-address.component.html',
  styleUrl: './emergency-address.component.scss',
})
export class EmergencyAddressComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EmergencyAddressService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchEmerName = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EmergencyAddressRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formEmergencyNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formEmerName = signal('');
  protected readonly formEmerTypeCode = signal('');
  protected readonly formEmerPhone = signal('');
  protected readonly formEmerCellphone = signal('');
  protected readonly formEmerWorkPhone = signal('');
  protected readonly formEmerPhoneSecond = signal('');
  protected readonly formEmerEmail = signal('');
  protected readonly formEmerAddress = signal('');
  protected readonly formNationality = signal('');
  protected readonly formMainContactAddress = signal('');
  protected readonly formMainLiaisonOffice = signal('N');
  protected readonly formIsEmergencyAddress = signal('0');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchEmerName().trim()),
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
    this.searchEmerName.set('');
    this.search();
  }

  private resetForm(): void {
    this.formEmergencyNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formEmerName.set('');
    this.formEmerTypeCode.set('');
    this.formEmerPhone.set('');
    this.formEmerCellphone.set('');
    this.formEmerWorkPhone.set('');
    this.formEmerPhoneSecond.set('');
    this.formEmerEmail.set('');
    this.formEmerAddress.set('');
    this.formNationality.set('');
    this.formMainContactAddress.set('');
    this.formMainLiaisonOffice.set('N');
    this.formIsEmergencyAddress.set('0');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: EmergencyAddressRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.emergencyNo!);
      this.formEmergencyNo.set(d.emergencyNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formEmerName.set(d.emerName ?? '');
      this.formEmerTypeCode.set(d.emerTypeCode ?? '');
      this.formEmerPhone.set(d.emerPhone ?? '');
      this.formEmerCellphone.set(d.emerCellphone ?? '');
      this.formEmerWorkPhone.set(d.emerWorkPhone ?? '');
      this.formEmerPhoneSecond.set(d.emerPhoneSecond ?? '');
      this.formEmerEmail.set(d.emerEmail ?? '');
      this.formEmerAddress.set(d.emerAddress ?? '');
      this.formNationality.set(d.nationality ?? '');
      this.formMainContactAddress.set(d.mainContactAddress ?? '');
      this.formMainLiaisonOffice.set(d.mainLiaisonOffice ?? 'N');
      this.formIsEmergencyAddress.set(d.isEmergencyAddress ?? '0');
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
    const emerName = this.formEmerName().trim();
    if (!personId || !emerName) {
      this.message.warning(this.i18n.t('hrm.emergencyAddressSearch.msg.requiredFields', 'Vui lòng điền đủ: Nhân viên, Tên người liên hệ'));
      return;
    }
    const payload: EmergencyAddressSavePayload = {
      emergencyNo: this.formEmergencyNo(),
      personId,
      emerName,
      emerTypeCode: this.formEmerTypeCode().trim() || undefined,
      emerPhone: this.formEmerPhone().trim() || undefined,
      emerCellphone: this.formEmerCellphone().trim() || undefined,
      emerWorkPhone: this.formEmerWorkPhone().trim() || undefined,
      emerPhoneSecond: this.formEmerPhoneSecond().trim() || undefined,
      emerEmail: this.formEmerEmail().trim() || undefined,
      emerAddress: this.formEmerAddress().trim() || undefined,
      nationality: this.formNationality().trim() || undefined,
      mainContactAddress: this.formMainContactAddress().trim() || undefined,
      mainLiaisonOffice: this.formMainLiaisonOffice(),
      isEmergencyAddress: this.formIsEmergencyAddress(),
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

  deleteOne(row: EmergencyAddressRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.emergencyAddressSearch.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.emergencyNo!);
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
