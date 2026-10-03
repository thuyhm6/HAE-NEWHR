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
import { RecognitionService, RewardRow, RewardSavePayload } from './recognition.service';

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
 * Khen thưởng (Recognition) - port lại từ hrm/empinfo/recognitionSearch.html
 * (đã xoá). Nút "Xuất Excel" ở bản gốc chỉ alert("đang được phát triển") -
 * đây là tính năng hiển thị nhưng chưa hoàn thiện (không phải dead code ẩn),
 * nên hoàn thiện luôn bằng SheetJS thay vì giữ nguyên trạng thái chưa xong,
 * theo đúng tiền lệ đã áp dụng ở nút Xuất Excel của DepartManagerListComponent.
 */
@Component({
  selector: 'app-recognition',
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
  templateUrl: './recognition.component.html',
  styleUrl: './recognition.component.scss',
})
export class RecognitionComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(RecognitionService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchRewardType = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<RewardRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formRewardNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formDeptName = signal('');
  protected readonly formRewardType = signal('');
  protected readonly formRewardDate = signal<Date | null>(null);
  protected readonly formRewardCnpy = signal('');
  protected readonly formReward = signal('');
  protected readonly formRewardTypeCode = signal('');
  protected readonly formRewardPayDate = signal<Date | null>(null);
  protected readonly formPersonnelCardInquiry = signal('N');
  protected readonly formPayAppearIsnot = signal('N');
  protected readonly formLineId = signal('');
  protected readonly formOtherType = signal('');
  protected readonly formRemarks = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchRewardType().trim()),
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
      this.i18n.t('hrm.recognitionSearch.title.empId', 'Mã NV'),
      this.i18n.t('hrm.recognitionSearch.title.localName', 'Họ tên'),
      this.i18n.t('hrm.recognitionSearch.title.deptName', 'Phòng ban'),
      this.i18n.t('hrm.recognitionSearch.title.rewardType', 'Loại hình'),
      this.i18n.t('hrm.recognitionSearch.title.rewardDate', 'Ngày KT'),
      this.i18n.t('hrm.recognitionSearch.title.rewardCnpy', 'Cơ quan KT'),
      this.i18n.t('hrm.recognitionSearch.title.reward', 'Phần thưởng'),
      this.i18n.t('common.remark', 'Ghi chú'),
    ];
    const data = this.rows().map((r, idx) => [
      idx + 1,
      r.empId ?? '',
      r.localName ?? '',
      r.deptName ?? '',
      r.rewardType ?? '',
      r.rewardDate ?? '',
      r.rewardCnpy ?? '',
      r.reward ?? '',
      r.remarks ?? '',
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'khen_thuong_export.xlsx');
  }

  private resetForm(): void {
    this.formRewardNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formDeptName.set('');
    this.formRewardType.set('');
    this.formRewardDate.set(null);
    this.formRewardCnpy.set('');
    this.formReward.set('');
    this.formRewardTypeCode.set('');
    this.formRewardPayDate.set(null);
    this.formPersonnelCardInquiry.set('N');
    this.formPayAppearIsnot.set('N');
    this.formLineId.set('');
    this.formOtherType.set('');
    this.formRemarks.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: RewardRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.rewardNo!);
      this.formRewardNo.set(d.rewardNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formDeptName.set(d.deptName ?? '');
      this.formRewardType.set(d.rewardType ?? '');
      this.formRewardDate.set(toDateOrNull(d.rewardDate ?? ''));
      this.formRewardCnpy.set(d.rewardCnpy ?? '');
      this.formReward.set(d.reward ?? '');
      this.formRewardTypeCode.set(d.rewardTypeCode ?? '');
      this.formRewardPayDate.set(toDateOrNull(d.rewardPayDate ?? ''));
      this.formPersonnelCardInquiry.set(d.personnelCardInquiry ?? 'N');
      this.formPayAppearIsnot.set(d.payAppearIsnot ?? 'N');
      this.formLineId.set(d.lineId ?? '');
      this.formOtherType.set(d.otherType ?? '');
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
      this.message.warning(this.i18n.t('hrm.recognitionSearch.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    const payload: RewardSavePayload = {
      rewardNo: this.formRewardNo(),
      personId,
      rewardType: this.formRewardType().trim() || undefined,
      rewardDate: toIsoDateOrUndefined(this.formRewardDate()) ?? null,
      rewardCnpy: this.formRewardCnpy().trim() || undefined,
      reward: this.formReward().trim() || undefined,
      rewardTypeCode: this.formRewardTypeCode().trim() || undefined,
      rewardPayDate: toIsoDateOrUndefined(this.formRewardPayDate()) ?? null,
      personnelCardInquiry: this.formPersonnelCardInquiry(),
      payAppearIsnot: this.formPayAppearIsnot(),
      lineId: this.formLineId().trim() || undefined,
      otherType: this.formOtherType().trim() || undefined,
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

  deleteOne(row: RewardRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.recognitionSearch.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.rewardNo!);
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
