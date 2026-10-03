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
import * as XLSX from 'xlsx';

import { I18nService } from '../../../../i18n/i18n.service';
import { EmpSearchService, EmployeeSearchResult } from '../shared/emp-search.service';
import { PunishmentRow, PunishmentSavePayload, PunishmentService } from './punishment.service';

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
 * Kỷ luật (Punishment) - port lại từ hrm/empinfo/punishmentSearch.html (đã
 * xoá). Nút "Xuất Excel" ở bản gốc chỉ alert("đang được phát triển") - hoàn
 * thiện bằng SheetJS, cùng lý do như trang recognition.
 */
@Component({
  selector: 'app-punishment',
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
  templateUrl: './punishment.component.html',
  styleUrl: './punishment.component.scss',
})
export class PunishmentComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(PunishmentService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchPunishCode = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<PunishmentRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formPunishNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formDeptName = signal('');
  protected readonly formPunishCode = signal('');
  protected readonly formPunishDate = signal<Date | null>(null);
  protected readonly formPunishReason = signal('');
  protected readonly formReleaseDate = signal<Date | null>(null);
  protected readonly formPunishDepartment = signal('');
  protected readonly formPunishScore = signal('');
  protected readonly formFaultTypeCode = signal('');
  protected readonly formPaycutStartDate = signal<Date | null>(null);
  protected readonly formPaycutEndDate = signal<Date | null>(null);
  protected readonly formPersonnelCardInquiry = signal('N');
  protected readonly formRemarks = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchPunishCode().trim()),
      );
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  exportExcel(): void {
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('hrm.punishmentSearch.title.empId', 'Mã NV'),
      this.i18n.t('hrm.punishmentSearch.title.localName', 'Họ tên'),
      this.i18n.t('hrm.punishmentSearch.title.deptName', 'Phòng ban'),
      this.i18n.t('hrm.punishmentSearch.title.punishCode', 'Loại KL'),
      this.i18n.t('hrm.punishmentSearch.title.punishDate', 'Ngày KL'),
      this.i18n.t('hrm.punishmentSearch.title.punishReason', 'Lý do'),
      this.i18n.t('hrm.punishmentSearch.title.punishDepartment', 'Bộ phận KL'),
      this.i18n.t('hrm.punishmentSearch.title.punishScore', 'Điểm'),
      this.i18n.t('common.remark', 'Ghi chú'),
    ];
    const data = this.rows().map((r, idx) => [
      idx + 1,
      r.empId ?? '',
      r.localName ?? '',
      r.deptName ?? '',
      r.punishCode ?? '',
      r.punishDate ?? '',
      r.punishReason ?? '',
      r.punishDepartment ?? '',
      r.punishScore ?? '',
      r.remarks ?? '',
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'ky_luat_export.xlsx');
  }

  private resetForm(): void {
    this.formPunishNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formDeptName.set('');
    this.formPunishCode.set('');
    this.formPunishDate.set(null);
    this.formPunishReason.set('');
    this.formReleaseDate.set(null);
    this.formPunishDepartment.set('');
    this.formPunishScore.set('');
    this.formFaultTypeCode.set('');
    this.formPaycutStartDate.set(null);
    this.formPaycutEndDate.set(null);
    this.formPersonnelCardInquiry.set('N');
    this.formRemarks.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: PunishmentRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.punishNo!);
      this.formPunishNo.set(d.punishNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formDeptName.set(d.deptName ?? '');
      this.formPunishCode.set(d.punishCode ?? '');
      this.formPunishDate.set(toDateOrNull(d.punishDate ?? ''));
      this.formPunishReason.set(d.punishReason ?? '');
      this.formReleaseDate.set(toDateOrNull(d.releaseDate ?? ''));
      this.formPunishDepartment.set(d.punishDepartment ?? '');
      this.formPunishScore.set(d.punishScore ?? '');
      this.formFaultTypeCode.set(d.faultTypeCode ?? '');
      this.formPaycutStartDate.set(toDateOrNull(d.paycutStartDate ?? ''));
      this.formPaycutEndDate.set(toDateOrNull(d.paycutEndDate ?? ''));
      this.formPersonnelCardInquiry.set(d.personnelCardInquiry ?? 'N');
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
      this.formDeptName.set(found.deptName ?? '');
    }
  }

  async saveRecord(): Promise<void> {
    const personId = this.formPersonId().trim();
    if (!personId) {
      this.message.warning(this.i18n.t('hrm.punishmentSearch.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    const payload: PunishmentSavePayload = {
      punishNo: this.formPunishNo(),
      personId,
      punishCode: this.formPunishCode().trim() || undefined,
      punishDate: toIsoDateOrUndefined(this.formPunishDate()) ?? null,
      punishReason: this.formPunishReason().trim() || undefined,
      releaseDate: toIsoDateOrUndefined(this.formReleaseDate()) ?? null,
      punishDepartment: this.formPunishDepartment().trim() || undefined,
      punishScore: this.formPunishScore().trim() || undefined,
      paycutStartDate: toIsoDateOrUndefined(this.formPaycutStartDate()) ?? null,
      paycutEndDate: toIsoDateOrUndefined(this.formPaycutEndDate()) ?? null,
      personnelCardInquiry: this.formPersonnelCardInquiry(),
      faultTypeCode: this.formFaultTypeCode().trim() || undefined,
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

  deleteOne(row: PunishmentRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.punishmentSearch.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.punishNo!);
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
