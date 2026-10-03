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
import { AddressRow, AddressSavePayload, AddressService } from './address.service';

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
 * Tra cứu địa chỉ - port lại từ hrm/empinfo/addressSearch.html (đã xoá).
 */
@Component({
  selector: 'app-address',
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
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(AddressService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchAddressContent = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<AddressRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formAddressNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formAddressType = signal('');
  protected readonly formEffectiveStartDate = signal<Date | null>(null);
  protected readonly formNationality = signal('');
  protected readonly formAddressContent = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchAddressContent().trim()),
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
    this.searchAddressContent.set('');
    this.search();
  }

  private resetForm(): void {
    this.formAddressNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formAddressType.set('');
    this.formEffectiveStartDate.set(null);
    this.formNationality.set('');
    this.formAddressContent.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: AddressRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.addressNo!);
      this.formAddressNo.set(d.addressNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formAddressType.set(d.addressType ?? '');
      this.formEffectiveStartDate.set(toDateOrNull(d.effectiveStartDate ?? ''));
      this.formNationality.set(d.nationality ?? '');
      this.formAddressContent.set(d.addressContent ?? '');
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
    const addressType = this.formAddressType().trim();
    if (!personId) {
      this.message.warning(this.i18n.t('hrm.addressSearch.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    if (!addressType) {
      this.message.warning(this.i18n.t('hrm.addressSearch.msg.enterAddressType', 'Vui lòng nhập loại địa chỉ'));
      return;
    }
    const payload: AddressSavePayload = {
      addressNo: this.formAddressNo(),
      personId,
      addressType,
      effectiveStartDate: toIsoDateOrUndefined(this.formEffectiveStartDate()) ?? null,
      addressContent: this.formAddressContent().trim() || undefined,
      nationality: this.formNationality().trim() || undefined,
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

  deleteOne(row: AddressRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.addressSearch.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.addressNo!);
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
