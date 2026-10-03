import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ApplyFileRow,
  ApplyListFilter,
  ApplyListRow,
  EssApplyInfoService,
} from './ess-apply-info.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
interface CompareRow {
  label: string;
  newVal: string;
  origVal: string;
  isDiff: boolean;
}

interface FieldMapEntry {
  i18nKey: string;
  vi: string;
  newField: string | string[];
  origField: string | string[];
}

const FIELD_MAP: Record<string, FieldMapEntry[]> = {
  PERSONAL: [
    { i18nKey: 'hmai.field.personal.gender', vi: 'Giới tính', newField: 'sexName', origField: 'sexCode' },
    { i18nKey: 'hmai.field.personal.dob', vi: 'Ngày sinh', newField: 'dob', origField: 'dob' },
    { i18nKey: 'hmai.field.personal.nation', vi: 'Dân tộc', newField: 'nationName', origField: 'nationCode' },
    { i18nKey: 'hmai.field.personal.nationality', vi: 'Quốc tịch', newField: 'nationalityName', origField: 'nationalityCode' },
    { i18nKey: 'hmai.field.personal.maritalStatus', vi: 'Tình trạng HN', newField: 'maritalStatusName', origField: 'maritalStatusCode' },
    { i18nKey: 'hmai.field.personal.weddingDate', vi: 'Ngày kết hôn', newField: 'weddingDate', origField: 'weddingDate' },
    { i18nKey: 'hmai.field.personal.idcardNo', vi: 'CMND/CCCD', newField: 'idcardNo', origField: 'idcardNo' },
    { i18nKey: 'hmai.field.personal.idcardStartDate', vi: 'Ngày cấp CMND', newField: 'idcardStartDate', origField: 'idcardStartDate' },
    { i18nKey: 'hmai.field.personal.issuingAuthority', vi: 'Nơi cấp', newField: 'issuingAuthority', origField: 'issuingAuthority' },
    { i18nKey: 'hmai.field.personal.email', vi: 'Email cá nhân', newField: 'email', origField: 'email' },
    { i18nKey: 'hmai.field.personal.emailSecond', vi: 'Email thứ 2', newField: 'emailSecond', origField: 'emailSecond' },
    { i18nKey: 'hmai.field.personal.cellphone', vi: 'ĐT di động', newField: 'cellphone', origField: 'cellphone' },
    { i18nKey: 'hmai.field.personal.companyPhone', vi: 'ĐT công ty', newField: 'companyPhone', origField: 'companyPhone' },
    { i18nKey: 'hmai.field.personal.homeAddress', vi: 'Địa chỉ thường trú', newField: 'homeAddress', origField: 'homeAddress' },
    { i18nKey: 'hmai.field.personal.regPlace', vi: 'Nơi đăng ký HK', newField: 'regPlace', origField: 'regPlace' },
    { i18nKey: 'hmai.field.personal.religion', vi: 'Tôn giáo', newField: 'religion', origField: 'religion' },
    { i18nKey: 'hmai.field.personal.politicalOutlook', vi: 'Quan điểm chính trị', newField: 'politicalOutlook', origField: 'politicalOutlook' },
    { i18nKey: 'hmai.field.personal.finalDegree', vi: 'Trình độ học vấn', newField: 'finalDegreeName', origField: 'finalDegreeCode' },
    { i18nKey: 'hmai.field.personal.armyOrNot', vi: 'Nghĩa vụ quân sự', newField: 'armyOrNot', origField: 'armyOrNot' },
    { i18nKey: 'hmai.field.personal.obstacleOrNot', vi: 'Người khuyết tật', newField: 'obstacleOrNot', origField: 'obstacleOrNot' },
  ],
  ADDRESS: [
    { i18nKey: 'hmai.field.address.type', vi: 'Loại địa chỉ', newField: 'addressTypeName', origField: 'addressType' },
    { i18nKey: 'hmai.field.address.effectiveStartDate', vi: 'Ngày hiệu lực', newField: 'effectiveStartDate', origField: 'effectiveStartDate' },
    { i18nKey: 'hmai.field.address.content', vi: 'Nội dung địa chỉ', newField: 'addressContent', origField: 'addressContent' },
    { i18nKey: 'hmai.field.address.nationality', vi: 'Quốc tịch', newField: 'nationalityName', origField: 'nationality' },
  ],
  FAMILY: [
    { i18nKey: 'hmai.field.family.relation', vi: 'Quan hệ', newField: 'famTypeName', origField: 'famTypeCode' },
    { i18nKey: 'hmai.field.family.name', vi: 'Họ tên', newField: 'famName', origField: 'famName' },
    { i18nKey: 'hmai.field.family.dob', vi: 'Ngày sinh', newField: 'famBorndate', origField: 'famBorndate' },
    { i18nKey: 'hmai.field.family.idcard', vi: 'CMND/CCCD', newField: 'famIdcard', origField: 'famIdcard' },
    { i18nKey: 'hmai.field.family.phone', vi: 'Điện thoại', newField: 'famFamilyPhone', origField: 'famFamilyPhone' },
    { i18nKey: 'hmai.field.family.gender', vi: 'Giới tính', newField: 'gender', origField: 'gender' },
    { i18nKey: 'hmai.field.family.company', vi: 'Công ty', newField: 'famCompanyName', origField: 'famCompanyName' },
    { i18nKey: 'hmai.field.family.address', vi: 'Địa chỉ', newField: 'famAddress', origField: 'famAddress' },
    { i18nKey: 'hmai.field.family.email', vi: 'Email', newField: 'famEmail', origField: 'famEmail' },
    { i18nKey: 'hmai.field.family.note', vi: 'Ghi chú', newField: 'note', origField: 'note' },
  ],
  EMERGENCY: [
    { i18nKey: 'hmai.field.emergency.name', vi: 'Họ tên', newField: 'emerName', origField: 'emerName' },
    { i18nKey: 'hmai.field.emergency.type', vi: 'Loại liên hệ', newField: 'emerTypeName', origField: 'emerTypeCode' },
    { i18nKey: 'hmai.field.emergency.phone', vi: 'Điện thoại', newField: 'emerPhone', origField: 'emerPhone' },
    { i18nKey: 'hmai.field.emergency.cellphone', vi: 'Di động', newField: 'emerCellphone', origField: 'emerCellphone' },
    { i18nKey: 'hmai.field.emergency.workPhone', vi: 'ĐT cơ quan', newField: 'emerWorkPhone', origField: 'emerWorkPhone' },
    { i18nKey: 'hmai.field.emergency.email', vi: 'Email', newField: 'emerEmail', origField: 'emerEmail' },
    { i18nKey: 'hmai.field.emergency.address', vi: 'Địa chỉ', newField: 'emerAddress', origField: 'emerAddress' },
  ],
  WORK_EXP: [
    { i18nKey: 'hmai.field.workExp.cpnyName', vi: 'Tên công ty', newField: 'cpnyName', origField: 'cpnyName' },
    { i18nKey: 'hmai.field.workExp.dept', vi: 'Phòng ban', newField: 'deptName', origField: 'deptName' },
    { i18nKey: 'hmai.field.workExp.position', vi: 'Vị trí', newField: 'position', origField: 'position' },
    { i18nKey: 'hmai.field.workExp.startDate', vi: 'Ngày bắt đầu', newField: ['startDate', 'startMonth'], origField: 'startDate' },
    { i18nKey: 'hmai.field.workExp.endDate', vi: 'Ngày kết thúc', newField: ['endDate', 'endMonth'], origField: 'endDate' },
    { i18nKey: 'hmai.field.workExp.tel', vi: 'ĐT liên hệ', newField: 'tel', origField: 'tel' },
    { i18nKey: 'hmai.field.workExp.resignReason', vi: 'Lý do nghỉ', newField: 'resignReason', origField: 'resignReason' },
    { i18nKey: 'hmai.field.workExp.remark', vi: 'Ghi chú', newField: 'remark', origField: 'remark' },
  ],
  EDUCATION: [
    { i18nKey: 'hmai.field.education.subject', vi: 'Chuyên ngành', newField: 'subject', origField: 'subject' },
    { i18nKey: 'hmai.field.education.degree', vi: 'Trình độ', newField: 'degreeName', origField: 'degreeCode' },
    { i18nKey: 'hmai.field.education.institution', vi: 'Tên trường', newField: 'institutionName', origField: 'institutionName' },
    { i18nKey: 'hmai.field.education.startDate', vi: 'Ngày bắt đầu', newField: 'startDate', origField: 'startDate' },
    { i18nKey: 'hmai.field.education.endDate', vi: 'Ngày kết thúc', newField: 'endDate', origField: 'endDate' },
    { i18nKey: 'hmai.field.education.country', vi: 'Quốc gia', newField: 'siteCountry', origField: 'siteCountry' },
    { i18nKey: 'hmai.field.education.gpa', vi: 'GPA', newField: 'gpa', origField: '' },
    { i18nKey: 'hmai.field.education.remark', vi: 'Ghi chú', newField: ['remarks', 'remark'], origField: 'remarks' },
  ],
  QUALIFICATION: [
    { i18nKey: 'hmai.field.qualification.name', vi: 'Tên chứng chỉ', newField: 'qualName', origField: 'qualName' },
    { i18nKey: 'hmai.field.qualification.dateObtained', vi: 'Ngày cấp', newField: 'dateObtained', origField: 'dateObtained' },
    { i18nKey: 'hmai.field.qualification.cardNo', vi: 'Số chứng chỉ', newField: 'qualCardNo', origField: 'qualCardNo' },
    { i18nKey: 'hmai.field.qualification.institute', vi: 'Nơi cấp', newField: 'qualInstitute', origField: 'qualInstitute' },
    { i18nKey: 'hmai.field.qualification.validityDate', vi: 'Ngày hết hạn', newField: 'validityDate', origField: 'validityDate' },
    { i18nKey: 'hmai.field.qualification.level', vi: 'Cấp độ', newField: 'qualLevel', origField: 'qualLevel' },
    { i18nKey: 'hmai.field.qualification.remark', vi: 'Ghi chú', newField: 'qualRemark', origField: 'qualRemark' },
  ],
};

const TYPE_I18N_KEYS: Record<string, string> = {
  PERSONAL: 'hmai.type.personal',
  ADDRESS: 'hmai.type.address',
  FAMILY: 'hmai.type.family',
  EMERGENCY: 'hmai.type.emergency',
  WORK_EXP: 'hmai.type.workExp',
  EDUCATION: 'hmai.type.education',
  QUALIFICATION: 'hmai.type.qualification',
};

const STATUS_I18N_KEYS: Record<number, string> = {
  1: 'hmai.status.submitted',
  2: 'hmai.status.approved',
  3: 'hmai.status.rejected',
};
const STATUS_COLORS: Record<number, string> = { 1: 'warning', 2: 'success', 3: 'error' };
const DISTINCTION_I18N_KEYS: Record<number, string> = { 1: 'hmai.distinction.new', 2: 'hmai.distinction.update' };

function readField(data: Record<string, unknown> | null | undefined, field: string | string[]): string {
  if (!data) return '';
  const fields = Array.isArray(field) ? field : [field];
  for (const f of fields) {
    if (!f) continue;
    const v = data[f];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
  }
  return '';
}

/**
 * Phê duyệt thay đổi thông tin cá nhân nhân viên - port lại từ
 * hrm/approve/viewEssApplyInfo.html (đã xoá). Danh sách bên trái dùng
 * server-side paging (DataTablesResponse, khớp pattern ManageCountInfoList).
 * Bảng so sánh dữ liệu mới/gốc bên phải build từ FIELD_MAP tĩnh theo
 * `applyTableType`, giữ đúng field mapping bất đối xứng của bản gốc (vd
 * "Trình độ học vấn" hiển thị tên ở dữ liệu mới nhưng mã ở dữ liệu gốc, vì
 * hai bảng nguồn lưu khác kiểu dữ liệu). Cột GPA luôn để trống ở "Dữ liệu
 * ban đầu" - giữ nguyên hành vi bản gốc (bảng học vấn gốc không lưu GPA).
 */
@Component({
  selector: 'app-ess-apply-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzRadioModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './ess-apply-info.component.html',
  styleUrl: './ess-apply-info.component.scss',
})
export class EssApplyInfoComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EssApplyInfoService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);
  protected readonly activitySearch = signal('1');
  protected readonly keyword = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<ApplyListRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);
  private listBootstrapped = false;
  private drawCounter = 0;

  protected readonly selectedApplyNo = signal<string | null>(null);
  protected readonly selectedType = signal<string | null>(null);
  protected readonly selectedActivity = signal<number | null>(null);

  protected readonly detailLoading = signal(false);
  protected readonly hasDetail = signal(false);
  protected readonly compareRows = signal<CompareRow[]>([]);
  protected readonly files = signal<ApplyFileRow[]>([]);
  protected readonly actioning = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  typeLabel(type: string | undefined): string {
    const key = type && TYPE_I18N_KEYS[type];
    return key ? this.i18n.t(key, type!) : type || '';
  }

  statusLabel(activity: number | undefined): string {
    const key = activity != null ? STATUS_I18N_KEYS[activity] : undefined;
    return key ? this.i18n.t(key, String(activity)) : String(activity ?? '');
  }

  statusColor(activity: number | undefined): string {
    return (activity != null && STATUS_COLORS[activity]) || 'default';
  }

  distinctionLabel(applyType: number | undefined): string {
    const key = applyType != null ? DISTINCTION_I18N_KEYS[applyType] : undefined;
    return key ? this.i18n.t(key, '') : '';
  }

  private buildFilter(): ApplyListFilter {
    return {
      fromDate: this.fromDate() ? formatDate(this.fromDate()!, 'yyyy-MM-dd', 'en-US') : undefined,
      toDate: this.toDate() ? formatDate(this.toDate()!, 'yyyy-MM-dd', 'en-US') : undefined,
      activitySearch: this.activitySearch() || undefined,
      keyword: this.keyword().trim() || undefined,
    };
  }

  async onQueryParamsChange(params: NzTableQueryParams): Promise<void> {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    if (!this.listBootstrapped) {
      // Lần gọi đầu tiên đã được nạp sẵn trong ngOnInit qua search(), bỏ qua để tránh gọi API 2 lần.
      this.listBootstrapped = true;
      return;
    }
    await this.loadList();
  }

  async search(): Promise<void> {
    this.resetDetail();
    this.pageIndex.set(1);
    await this.loadList();
  }

  clearSearch(): void {
    this.fromDate.set(null);
    this.toDate.set(null);
    this.activitySearch.set('1');
    this.keyword.set('');
    this.search();
  }

  private async loadList(): Promise<void> {
    this.listLoading.set(true);
    const draw = ++this.drawCounter;
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getApplyList(this.buildFilter(), draw, start, this.pageSize());
      if (draw !== this.drawCounter) return;
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

  private resetDetail(): void {
    this.selectedApplyNo.set(null);
    this.selectedType.set(null);
    this.selectedActivity.set(null);
    this.hasDetail.set(false);
    this.compareRows.set([]);
    this.files.set([]);
  }

  async selectRow(row: ApplyListRow): Promise<void> {
    if (!row.applyNo || !row.applyTableType) return;
    this.selectedApplyNo.set(row.applyNo);
    this.selectedType.set(row.applyTableType);
    this.selectedActivity.set(row.activity ?? null);
    this.hasDetail.set(true);
    this.detailLoading.set(true);
    this.compareRows.set([]);
    this.files.set([]);
    try {
      const res = await this.service.getApplyDetail(row.applyNo, row.applyTableType);
      if (res.success) {
        const map = FIELD_MAP[row.applyTableType] || [];
        const newData = res.applyData || {};
        const origData = res.originalData ?? null;
        this.compareRows.set(
          map.map((entry) => {
            const newVal = readField(newData, entry.newField);
            const origVal = readField(origData, entry.origField);
            return { label: this.i18n.t(entry.i18nKey, entry.vi), newVal, origVal, isDiff: newVal.trim() !== origVal.trim() };
          }),
        );
        this.files.set(res.files || []);
      } else {
        this.message.error(this.i18n.t('hmai.msg.loadFailed', 'Không thể tải dữ liệu'));
      }
    } catch {
      this.message.error(this.i18n.t('hmai.msg.loadFailed', 'Không thể tải dữ liệu'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  fileUrl(file: ApplyFileRow): string {
    return `/ess/empinfo/api/files/download/${file.fileNo}`;
  }

  approve(): void {
    const applyNo = this.selectedApplyNo();
    const type = this.selectedType();
    if (!applyNo || !type) return;
    if (this.selectedActivity() !== 1) {
      this.message.warning(this.i18n.t('hmai.msg.onlyPending', 'Chỉ có thể phê duyệt/từ chối yêu cầu đang chờ duyệt'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('hmai.msg.approveConfirm', 'Bạn có chắc chắn muốn phê duyệt yêu cầu này không?'),
      nzOnOk: async () => {
        this.actioning.set(true);
        try {
          const res = await this.service.approve(applyNo, type);
          if (res.success) {
            this.message.success(this.i18n.t('hmai.msg.approveSuccess', 'Phê duyệt thành công'));
            this.resetDetail();
            await this.loadList();
          } else {
            this.message.error(res.message || this.i18n.t('hmai.msg.actionFailed', 'Thao tác thất bại'));
          }
        } catch {
          this.message.error(this.i18n.t('hmai.msg.actionFailed', 'Thao tác thất bại'));
        } finally {
          this.actioning.set(false);
        }
      },
    });
  }

  reject(): void {
    const applyNo = this.selectedApplyNo();
    const type = this.selectedType();
    if (!applyNo || !type) return;
    if (this.selectedActivity() !== 1) {
      this.message.warning(this.i18n.t('hmai.msg.onlyPending', 'Chỉ có thể phê duyệt/từ chối yêu cầu đang chờ duyệt'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('hmai.msg.rejectConfirm', 'Bạn có chắc chắn muốn từ chối yêu cầu này không?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        this.actioning.set(true);
        try {
          const res = await this.service.reject(applyNo, type);
          if (res.success) {
            this.message.success(this.i18n.t('hmai.msg.rejectSuccess', 'Từ chối thành công'));
            this.resetDetail();
            await this.loadList();
          } else {
            this.message.error(res.message || this.i18n.t('hmai.msg.actionFailed', 'Thao tác thất bại'));
          }
        } catch {
          this.message.error(this.i18n.t('hmai.msg.actionFailed', 'Thao tác thất bại'));
        } finally {
          this.actioning.set(false);
        }
      },
    });
  }
}
