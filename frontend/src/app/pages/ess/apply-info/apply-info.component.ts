import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ApplyDetailFields,
  ApplyFile,
  ApplyInfoService,
  ApplyTableType,
  EssApplyInfoRow,
} from './apply-info.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
interface DetailRowConfig {
  labelKey: string;
  labelFallback: string;
  value?: string;
}

const TYPE_LABEL_KEYS: Record<string, { key: string; fallback: string }> = {
  PERSONAL: { key: 'veai.type.personal', fallback: 'Thông tin cá nhân' },
  ADDRESS: { key: 'veai.type.address', fallback: 'Loại địa chỉ' },
  FAMILY: { key: 'veai.type.family', fallback: 'Thông tin gia đình' },
  EMERGENCY: { key: 'veai.type.emergency', fallback: 'Người liên hệ khẩn cấp' },
  WORK_EXP: { key: 'veai.type.workExp', fallback: 'Kinh nghiệm làm việc' },
  EDUCATION: { key: 'veai.type.education', fallback: 'Trình độ học vấn' },
  QUALIFICATION: { key: 'veai.type.qualification', fallback: 'Chứng chỉ' },
};

const ACTIVITY_LABEL_KEYS: Record<number, { key: string; fallback: string }> = {
  1: { key: 'veai.status.submitted', fallback: 'Gửi' },
  2: { key: 'veai.status.approved', fallback: 'Duyệt' },
  3: { key: 'veai.status.rejected', fallback: 'Từ chối' },
};

const ACTIVITY_COLOR: Record<number, string> = { 1: 'default', 2: 'success', 3: 'error' };

const DISTINCTION_LABEL_KEYS: Record<number, { key: string; fallback: string }> = {
  1: { key: 'veai.distinction.new', fallback: 'Thêm mới' },
  2: { key: 'veai.distinction.update', fallback: 'Sửa' },
};

/**
 * Tra cứu lịch sử các yêu cầu thay đổi thông tin cá nhân đã gửi (chỉ xem) -
 * port lại từ ess/empinfo/viewEssApplyInfo.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO, bố cục 2 cột (danh sách | chi tiết) giữ nguyên như bản
 * gốc. Gọi lại nguyên vẹn API JSON sẵn có (tải toàn bộ 1 lần, lọc nhanh xử lý
 * ở client, giống hệt hành vi cũ).
 */
@Component({
  selector: 'app-apply-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzRadioModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './apply-info.component.html',
  styleUrl: './apply-info.component.scss',
})
export class ApplyInfoComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(ApplyInfoService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);
  protected readonly activity = signal('1');
  protected readonly quickFilter = signal('');

  protected readonly loading = signal(false);
  protected readonly allRows = signal<EssApplyInfoRow[]>([]);
  protected readonly filteredRows = signal<EssApplyInfoRow[]>([]);
  protected readonly selectedRow = signal<EssApplyInfoRow | null>(null);

  protected readonly detailLoading = signal(false);
  protected readonly detail = signal<ApplyDetailFields | null>(null);
  protected readonly detailRows = signal<DetailRowConfig[]>([]);
  protected readonly files = signal<ApplyFile[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  async search(): Promise<void> {
    this.loading.set(true);
    this.resetDetail();
    try {
      const res = await this.service.getMyApplyList({
        fromDate: this.toApiDate(this.fromDate()),
        toDate: this.toApiDate(this.toDate()),
        activitySearch: this.activity() || undefined,
      });
      this.allRows.set(res.data ?? []);
      this.applyQuickFilter();
    } catch {
      this.message.error(this.i18n.t('veai.msg.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.fromDate.set(null);
    this.toDate.set(null);
    this.activity.set('1');
    this.quickFilter.set('');
    this.search();
  }

  onQuickFilterChange(value: string): void {
    this.quickFilter.set(value);
    this.applyQuickFilter();
  }

  private applyQuickFilter(): void {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) {
      this.filteredRows.set(this.allRows());
      return;
    }
    this.filteredRows.set(
      this.allRows().filter((row) => {
        const label = this.typeLabel(row.applyTableType).toLowerCase();
        return (
          label.includes(kw) ||
          (row.managerInfo ?? '').toLowerCase().includes(kw) ||
          (row.callback ?? '').toLowerCase().includes(kw) ||
          (row.earror ?? '').toLowerCase().includes(kw)
        );
      }),
    );
  }

  typeLabel(type?: string): string {
    const cfg = type ? TYPE_LABEL_KEYS[type] : undefined;
    return cfg ? this.i18n.t(cfg.key, cfg.fallback) : (type ?? '');
  }

  activityLabel(activity?: number): string {
    const cfg = activity !== undefined ? ACTIVITY_LABEL_KEYS[activity] : undefined;
    return cfg ? this.i18n.t(cfg.key, cfg.fallback) : String(activity ?? '');
  }

  activityColor(activity?: number): string {
    return (activity !== undefined && ACTIVITY_COLOR[activity]) || 'default';
  }

  distinctionLabel(applyType?: number): string {
    const cfg = applyType !== undefined ? DISTINCTION_LABEL_KEYS[applyType] : undefined;
    return cfg ? this.i18n.t(cfg.key, cfg.fallback) : '';
  }

  private resetDetail(): void {
    this.selectedRow.set(null);
    this.detail.set(null);
    this.detailRows.set([]);
    this.files.set([]);
  }

  async selectRow(row: EssApplyInfoRow): Promise<void> {
    if (!row.applyNo || !row.applyTableType) {
      return;
    }
    this.selectedRow.set(row);
    this.detailLoading.set(true);
    this.detail.set(null);
    this.detailRows.set([]);
    this.files.set([]);
    try {
      const res = await this.service.getDetail(row.applyNo, row.applyTableType);
      this.detail.set(res.detail ?? null);
      this.detailRows.set(this.buildDetailRows(row.applyTableType as ApplyTableType, res.detail ?? {}));
      this.files.set(res.files ?? []);
    } catch {
      this.message.error(this.i18n.t('veai.msg.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  private buildDetailRows(type: ApplyTableType, d: ApplyDetailFields): DetailRowConfig[] {
    const row = (labelKey: string, labelFallback: string, value?: string): DetailRowConfig => ({
      labelKey,
      labelFallback,
      value,
    });

    switch (type) {
      case 'PERSONAL':
        return [
          row('epi.field.fullName', 'Họ tên', d.name || d.lastname),
          row('epi.field.gender', 'Giới tính', d.sexName),
          row('epi.field.dob', 'Ngày sinh', d.dob),
          row('epi.field.ethnicity', 'Dân tộc', d.nationName),
          row('epi.field.nationality', 'Quốc tịch', d.nationalityName),
          row('epi.field.maritalStatus', 'Tình trạng hôn nhân', d.maritalStatusName),
          row('epi.field.weddingDate', 'Ngày kết hôn', d.weddingDate),
          row('epi.field.idcardNo', 'CMND/CCCD', d.idcardNo),
          row('epi.field.idcardDate', 'Ngày cấp', d.idcardStartDate),
          row('epi.field.issuingAuthority', 'Nơi cấp', d.issuingAuthority),
          row('epi.field.email', 'Email', d.email),
          row('epi.field.phone', 'Điện thoại', d.cellphone),
          row('epi.field.religion', 'Tôn giáo', d.religion),
          row('epi.field.education', 'Trình độ học vấn', d.finalDegreeName),
        ];
      case 'ADDRESS':
        return [
          row('epi.field.addressType', 'Loại địa chỉ', d.addressTypeName),
          row('epi.field.effectiveDate', 'Ngày hiệu lực', d.effectiveStartDate),
          row('epi.field.address', 'Nội dung địa chỉ', d.addressContent),
          row('epi.field.nationality', 'Quốc tịch', d.nationalityName),
        ];
      case 'FAMILY':
        return [
          row('epi.field.fullName', 'Họ tên', d.famName),
          row('epi.field.relationship', 'Quan hệ', d.famTypeName),
          row('epi.field.dob', 'Ngày sinh', d.famBorndate),
          row('epi.field.idcardNo', 'CMND', d.famIdcard),
          row('epi.field.familyPhone', 'Điện thoại', d.famFamilyPhone),
          row('epi.field.phone', 'Điện thoại di động', d.mobilePhone),
          row('epi.field.cpnyName', 'Công ty', d.famCompanyName),
          row('epi.field.address', 'Địa chỉ', d.famAddress),
          row('epi.field.email', 'Email', d.famEmail),
          row('epi.field.gender', 'Giới tính', d.gender),
        ];
      case 'EMERGENCY':
        return [
          row('epi.field.fullName', 'Họ tên', d.emerName),
          row('epi.field.relationship', 'Loại liên hệ', d.emerTypeName),
          row('epi.field.phone', 'Điện thoại', d.emerPhone),
          row('epi.field.phone', 'Di động', d.emerCellphone),
          row('epi.field.companyPhone', 'Điện thoại cơ quan', d.emerWorkPhone),
          row('epi.field.email', 'Email', d.emerEmail),
          row('epi.field.address', 'Địa chỉ', d.emerAddress),
        ];
      case 'WORK_EXP':
        return [
          row('epi.field.cpnyName', 'Tên công ty', d.cpnyName),
          row('epi.field.department', 'Phòng ban', d.deptName),
          row('epi.field.position', 'Vị trí', d.position),
          row('epi.field.startDate', 'Ngày bắt đầu', d.startDate || d.startMonth),
          row('epi.field.endDate', 'Ngày kết thúc', d.endDate || d.endMonth),
          row('epi.field.resignReason', 'Lý do nghỉ', d.resignReason),
          row('epi.field.remark', 'Ghi chú', d.remark),
        ];
      case 'EDUCATION':
        return [
          row('qi.field.subject', 'Chuyên ngành', d.subject),
          row('qi.field.educLevel', 'Trình độ', d.degreeName),
          row('qi.field.institution', 'Trường', d.institutionName),
          row('qi.field.startDate', 'Ngày bắt đầu', d.startDate || d.startDatess),
          row('qi.field.endDate', 'Ngày kết thúc', d.endDate || d.endDatess),
          row('qi.label.gpa', 'GPA', d.gpa),
          row('qi.field.remark', 'Ghi chú', d.remark || d.remarks),
        ];
      case 'QUALIFICATION':
        return [
          row('qi.field.qualName', 'Tên chứng chỉ', d.qualName),
          row('qi.field.dateObtained', 'Ngày cấp', d.dateObtained),
          row('qi.field.qualCardNo', 'Số chứng chỉ', d.qualCardNo),
          row('qi.field.qualInstitute', 'Nơi cấp', d.qualInstitute),
          row('qi.field.validityDate', 'Ngày hết hạn', d.validityDate),
          row('qi.field.qualLevel', 'Cấp độ', d.qualLevel),
          row('qi.field.remark', 'Ghi chú', d.qualRemark),
        ];
      default:
        return [];
    }
  }
}
