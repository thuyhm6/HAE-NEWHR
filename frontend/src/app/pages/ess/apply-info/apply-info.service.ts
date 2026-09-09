import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ApplyTableType = 'PERSONAL' | 'ADDRESS' | 'FAMILY' | 'EMERGENCY' | 'WORK_EXP' | 'EDUCATION' | 'QUALIFICATION';

export interface EssApplyInfoRow {
  applyNo?: string;
  applyTableType?: ApplyTableType;
  personId?: string;
  createDate?: string;
  activity?: number;
  applyType?: number;
  managerInfo?: string;
  callback?: string;
  earror?: string;
}

export interface ApplyInfoFilter {
  fromDate?: string;
  toDate?: string;
  activitySearch?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
}

/** Hợp nhất field của cả 7 loại chi tiết thay đổi (PERSONAL/ADDRESS/FAMILY/EMERGENCY/WORK_EXP/EDUCATION/QUALIFICATION). */
export interface ApplyDetailFields {
  // PERSONAL
  name?: string;
  lastname?: string;
  sexName?: string;
  dob?: string;
  nationName?: string;
  nationalityName?: string;
  maritalStatusName?: string;
  weddingDate?: string;
  idcardNo?: string;
  idcardStartDate?: string;
  issuingAuthority?: string;
  email?: string;
  cellphone?: string;
  religion?: string;
  finalDegreeName?: string;
  // ADDRESS
  addressTypeName?: string;
  effectiveStartDate?: string;
  addressContent?: string;
  // FAMILY
  famName?: string;
  famTypeName?: string;
  famBorndate?: string;
  famIdcard?: string;
  famFamilyPhone?: string;
  mobilePhone?: string;
  famCompanyName?: string;
  famAddress?: string;
  famEmail?: string;
  gender?: string;
  // EMERGENCY
  emerName?: string;
  emerTypeName?: string;
  emerPhone?: string;
  emerCellphone?: string;
  emerWorkPhone?: string;
  emerEmail?: string;
  emerAddress?: string;
  // WORK_EXP
  cpnyName?: string;
  deptName?: string;
  position?: string;
  startDate?: string;
  startMonth?: string;
  endDate?: string;
  endMonth?: string;
  resignReason?: string;
  remark?: string;
  // EDUCATION
  subject?: string;
  degreeName?: string;
  institutionName?: string;
  startDatess?: string;
  endDatess?: string;
  gpa?: string;
  remarks?: string;
  // QUALIFICATION
  qualName?: string;
  dateObtained?: string;
  qualCardNo?: string;
  qualInstitute?: string;
  validityDate?: string;
  qualLevel?: string;
  qualRemark?: string;
}

export interface ApplyFile {
  fileNo?: string;
  applyNo?: string;
  applyType?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface ApplyDetailResponse {
  detail?: ApplyDetailFields;
  files?: ApplyFile[];
}

const LIST_URL = '/ess/empinfo/api/apply/myApplyList';
const DETAIL_URL = '/ess/empinfo/api/apply/detail';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewEssApplyInfo (không đổi
 * backend) - port lại từ ess/empinfo/viewEssApplyInfo.html (Thymeleaf, đã
 * xoá) sang Angular + NG-ZORRO. Đây là trang tra cứu lịch sử các yêu cầu
 * thay đổi thông tin cá nhân mà chính người đang đăng nhập đã gửi (chỉ xem,
 * không sửa).
 */
@Injectable({ providedIn: 'root' })
export class ApplyInfoService {
  private readonly http = inject(HttpClient);

  /** Tải toàn bộ (length lớn) giống hệt bản Thymeleaf cũ - lọc nhanh xử lý ở client. */
  getMyApplyList(filter: ApplyInfoFilter): Promise<DataTablesResponse<EssApplyInfoRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<EssApplyInfoRow>>(LIST_URL, {
        params: this.toHttpParams({ ...filter, draw: '1', start: '0', length: '9999' }),
      }),
    );
  }

  getDetail(applyNo: string, applyTableType: string): Promise<ApplyDetailResponse> {
    return firstValueFrom(
      this.http.get<ApplyDetailResponse>(DETAIL_URL, { params: { applyNo, applyTableType } }),
    );
  }

  private toHttpParams(filter: Record<string, string | undefined>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params;
  }
}
