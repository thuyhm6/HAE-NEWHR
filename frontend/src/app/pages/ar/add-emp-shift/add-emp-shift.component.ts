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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { AttendanceExForBatchService, SyCodeOption } from '../../ess/attendance-ex-for-batch/attendance-ex-for-batch.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { CardRecordDayService, ShiftOption } from '../card-record-day/card-record-day.service';
import { AddEmpShiftService, DOWNLOAD_TEMPLATE_URL, EmpShiftRow, EmpShiftSavePayload } from './add-emp-shift.service';

const DAY_TYPE_PARENT_CODE = '1439';

function currentMonthDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * CRUD xếp ca làm việc cho nhân viên theo tháng (thêm/sửa/xóa, import Excel
 * hàng loạt, tải file mẫu) - port lại từ
 * ar/attendanceMintenance/addEmpShiftView.html (đã xoá). Danh sách trả về
 * mảng phẳng không phân trang server-side (khác các trang card-record) nên
 * dùng nz-table phân trang phía client. Tái sử dụng tìm kiếm nhân viên
 * (SstOtApplyService), danh sách ca làm (CardRecordDayService) và danh sách
 * mã loại ngày (AttendanceExForBatchService.getCodeList, parent code 1439).
 */
@Component({
  selector: 'app-add-emp-shift',
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
  templateUrl: './add-emp-shift.component.html',
  styleUrl: './add-emp-shift.component.scss',
})
export class AddEmpShiftComponent implements OnInit {
  private readonly service = inject(AddEmpShiftService);
  private readonly shiftService = inject(CardRecordDayService);
  private readonly codeService = inject(AttendanceExForBatchService);
  private readonly empService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchMonth = signal<Date | null>(currentMonthDate());
  protected readonly searchEmpId = signal('');

  protected readonly shiftOptions = signal<ShiftOption[]>([]);
  protected readonly dayTypeOptions = signal<SyCodeOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EmpShiftRow[]>([]);

  // ── Modal Thêm/Sửa ────────────────────────────────────────────────────
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formPkNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpNameDisplay = signal('');
  protected readonly formArDate = signal<Date | null>(null);
  protected readonly formShiftNo = signal<string | null>(null);
  protected readonly formTypeid = signal<string | null>(null);
  protected readonly formRemark = signal('');

  protected readonly empPickerVisible = signal(false);
  protected readonly empPickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly empPickerSearching = signal(false);
  private empPickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  // ── Modal Import Excel ───────────────────────────────────────────────
  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [shiftList, dayTypeList] = await Promise.all([
        this.shiftService.getShiftOptions(),
        this.codeService.getCodeList(DAY_TYPE_PARENT_CODE),
      ]);
      this.shiftOptions.set(shiftList);
      this.dayTypeOptions.set(dayTypeList);
    } catch {
      // Danh sách bộ lọc trống không chặn việc tra cứu chính.
    }
    await this.search();
  }

  private toApiMonth(value: Date | null): string {
    return value ? formatDate(value, 'yyyy/MM', 'en-US') : formatDate(new Date(), 'yyyy/MM', 'en-US');
  }

  private toApiArDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : '';
  }

  private parseArDate(value: string | undefined): Date | null {
    if (!value) return null;
    const m = value.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchEmpId() || undefined, this.toApiMonth(this.searchMonth())));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchEmpId.set('');
    this.searchMonth.set(currentMonthDate());
    this.search();
  }

  // ── Thêm/Sửa ─────────────────────────────────────────────────────────
  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formPkNo.set(null);
    this.formPersonId.set('');
    this.formEmpNameDisplay.set('');
    this.formArDate.set(null);
    this.formShiftNo.set(null);
    this.formTypeid.set(null);
    this.formRemark.set('');
    this.modalVisible.set(true);
  }

  async openEditModal(pkNo: number | undefined): Promise<void> {
    if (pkNo == null) return;
    try {
      const d = await this.service.getByPkNo(pkNo);
      this.modalIsEdit.set(true);
      this.formPkNo.set(d.pkNo ?? pkNo);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpNameDisplay.set(`${d.empId ?? ''}${d.localName ? ' - ' + d.localName : ''}`);
      this.formArDate.set(this.parseArDate(d.arDateStr));
      this.formShiftNo.set(d.shiftNo ?? null);
      this.formTypeid.set(d.typeid != null ? String(d.typeid) : null);
      this.formRemark.set(d.remark ?? '');
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('addShift.msg.errorLoad', 'Lỗi khi lấy thông tin'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    const personId = this.formPersonId().trim();
    if (!personId) {
      this.message.warning(this.i18n.t('addShift.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    const arDate = this.formArDate();
    if (!arDate) {
      this.message.warning(this.i18n.t('addShift.msg.selectDate', 'Vui lòng chọn Ngày công'));
      return;
    }
    const shiftNo = this.formShiftNo();
    if (!shiftNo) {
      this.message.warning(this.i18n.t('addShift.msg.selectShift', 'Vui lòng chọn Ca làm việc'));
      return;
    }

    const typeidStr = this.formTypeid();
    const payload: EmpShiftSavePayload = {
      pkNo: this.formPkNo(),
      personId,
      arDateStr: this.toApiArDate(arDate),
      shiftNo,
      typeid: typeidStr ? Number(typeidStr) : null,
      remark: this.formRemark(),
    };

    this.savingRecord.set(true);
    try {
      const res = await this.service.save(payload);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('addShift.msg.errorConnect', 'Lỗi kết nối'));
    } finally {
      this.savingRecord.set(false);
    }
  }

  deleteOne(pkNo: number | undefined): void {
    if (pkNo == null) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('addShift.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa dữ liệu xếp ca này không?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(pkNo);
          if (res.success) {
            await this.search();
          } else {
            this.message.error(res.error || this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('addShift.msg.errorConnect', 'Lỗi kết nối'));
        }
      },
    });
  }

  openEmpPicker(): void {
    this.empPickerSearchResults.set([]);
    this.empPickerVisible.set(true);
  }

  closeEmpPicker(): void {
    this.empPickerVisible.set(false);
  }

  onEmpPickerSearch(keyword: string): void {
    if (this.empPickerSearchTimer) {
      clearTimeout(this.empPickerSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.empPickerSearchResults.set([]);
      return;
    }
    this.empPickerSearchTimer = setTimeout(async () => {
      this.empPickerSearching.set(true);
      try {
        this.empPickerSearchResults.set(await this.empService.searchEmployees(kw));
      } catch {
        this.empPickerSearchResults.set([]);
      } finally {
        this.empPickerSearching.set(false);
      }
    }, 300);
  }

  onEmpPickerSelected(personId: string | null): void {
    if (!personId) return;
    const emp = this.empPickerSearchResults().find((e) => e.personId === personId);
    if (emp) {
      this.formPersonId.set(emp.personId ?? '');
      this.formEmpNameDisplay.set(`${emp.empId ?? ''} - ${emp.localName ?? ''}`);
    }
    this.closeEmpPicker();
  }

  // ── Import/Tải file mẫu Excel ────────────────────────────────────────
  downloadTemplate(): void {
    window.location.href = DOWNLOAD_TEMPLATE_URL;
  }

  openImportModal(): void {
    this.importFile.set(null);
    this.importModalVisible.set(true);
  }

  closeImportModal(): void {
    this.importModalVisible.set(false);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile.set(input.files && input.files.length ? input.files[0] : null);
  }

  async submitImport(): Promise<void> {
    const file = this.importFile();
    if (!file) return;
    this.importing.set(true);
    try {
      const res = await this.service.importTemplate(file);
      this.importModalVisible.set(false);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.importSuccess', 'Import thành công!'));
      } else {
        this.message.warning(res.message || this.i18n.t('common.importPartialError', 'Import hoàn tất nhưng có lỗi.'));
      }
      await this.search();
    } catch {
      this.importModalVisible.set(false);
      this.message.error(this.i18n.t('addShift.msg.errorConnect', 'Lỗi kết nối'));
    } finally {
      this.importing.set(false);
    }
  }
}
