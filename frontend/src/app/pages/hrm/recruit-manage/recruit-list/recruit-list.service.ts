import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  error?: string;
}

export interface RecruitEmployeeRow {
  personId?: string;
  deptNo?: string;
  empId?: string;
  localName?: string;
  chinesePinyin?: string;
  englishName?: string;
  koreanName?: string;
  sexcode?: string;
  dob?: string;
  nationalityCode?: string;
  nationCode?: string;
  maritalStatusCode?: string;
  standardPosition?: string;
  postFamily?: string;
  postGradeNo?: string;
  positionNo?: string;
  workArea?: string;
  empTypeCode?: string;
  empCommonTypeCode?: string;
  joinType?: string;
  joinDetailType?: string;
  dateStarted?: string;
  confirmWorkDate?: string;
  isProbation?: string;
  endProbationDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  timeStarted?: string;
  mainBusiness?: string;
  rankStatistics?: string;
  productType?: string;
  costCenter?: string;
  coinCode?: string;
  homePhone?: string;
  companyPhone?: string;
  officePhone?: string;
  email?: string;
  idcardNo?: string;
  documentType?: string;
  idcardStartDate?: string;
  issuingAuthority?: string;
  addressContent?: string;
  hujiaddressContent?: string;
  nationality?: string;
  insuranceType?: string;
  insuranceArea?: string;
  insuranceDistinguish?: string;
  jingshebao?: string;
  wageType?: string;
  accountNo?: string;
  oldPay?: string;
  experience?: string;
  recruitType?: string;
  recommend?: string;
  remark?: string;
  deptName?: string;
}

export interface RecruitEducationRow {
  seq?: number;
  personId?: string;
  degreeCode?: string;
  finalDegreeWhether?: string;
  degreesCode?: string;
  institutionName?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  experienceStudyAbroad?: string;
  remark?: string;
  degreeName?: string;
  degreesName?: string;
}

export interface RecruitWorkExpRow {
  seq?: number;
  personId?: string;
  cpnyName?: string;
  deptName?: string;
  startDate?: string;
  endDate?: string;
  position?: string;
  payroll?: string;
  remark?: string;
  leftReason?: string;
}

export interface RecruitFamilyRow {
  seq?: number;
  personId?: string;
  famName?: string;
  famTypeCode?: string;
  gender?: string;
  famBorndate?: string;
  emergencyContactYn?: string;
  famPhone?: string;
  occupation?: string;
  remark?: string;
  famTypeName?: string;
  genderName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  personId?: string;
}

const BASE_URL = '/hrm/recruitManage/api';

/**
 * Quyết định nhận việc (viewRecruitList) - port lại từ
 * hrm/recruitManage/viewRecruitList.html (đã xoá).
 *
 * Bug dữ liệu nghiêm trọng đã sửa (có thật ở bản gốc, không phải do
 * migrate): JS gốc `vrlLoadEmployeeDetail()`/`vrlSaveGeneral()` đọc/ghi 11
 * trường (standardPosition, workArea, confirmWorkDate, contractEndDate,
 * timeStarted, coinCode, insuranceType, insuranceArea, insuranceDistinguish,
 * jingshebao, wageType) nhưng KHÔNG có input/select nào cho các trường này
 * trong HTML - `.val()` trên tập rỗng jQuery luôn trả về `undefined`.
 * Mapper `updateEmployee` là UPDATE không điều kiện (không `<if>` guard) nên
 * 11 cột này bị XÓA TRẮNG sau mỗi lần Lưu, kể cả khi có dữ liệu thật (từ
 * import Excel hàng loạt hoặc quy trình khác). Bản Angular đọc và giữ
 * nguyên các giá trị này ở state ẩn, gửi lại nguyên vẹn khi lưu.
 */
@Injectable({ providedIn: 'root' })
export class RecruitListService {
  private readonly http = inject(HttpClient);

  getEmployeeList(
    filter: { activity: string; searchName?: string; searchEmpId?: string },
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<RecruitEmployeeRow>> {
    return firstValueFrom(
      this.http.post<DataTablesResponse<RecruitEmployeeRow>>(`${BASE_URL}/employee/list`, { draw, start, length, ...filter }),
    );
  }

  getEmployeeDetail(personId: string): Promise<RecruitEmployeeRow> {
    return firstValueFrom(this.http.get<RecruitEmployeeRow>(`${BASE_URL}/employee/detail`, { params: { personId } }));
  }

  saveEmployee(payload: RecruitEmployeeRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/employee/save`, payload));
  }

  getEducationList(personId: string): Promise<RecruitEducationRow[]> {
    return firstValueFrom(this.http.get<RecruitEducationRow[]>(`${BASE_URL}/education/list`, { params: { personId } }));
  }

  saveEducation(payload: RecruitEducationRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/education/save`, payload));
  }

  deleteEducation(seq: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/education/delete`, null, { params: { seq } }));
  }

  getWorkExpList(personId: string): Promise<RecruitWorkExpRow[]> {
    return firstValueFrom(this.http.get<RecruitWorkExpRow[]>(`${BASE_URL}/workexp/list`, { params: { personId } }));
  }

  saveWorkExp(payload: RecruitWorkExpRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/workexp/save`, payload));
  }

  deleteWorkExp(seq: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/workexp/delete`, null, { params: { seq } }));
  }

  getFamilyList(personId: string): Promise<RecruitFamilyRow[]> {
    return firstValueFrom(this.http.get<RecruitFamilyRow[]>(`${BASE_URL}/family/list`, { params: { personId } }));
  }

  saveFamily(payload: RecruitFamilyRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/family/save`, payload));
  }

  deleteFamily(seq: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/family/delete`, null, { params: { seq } }));
  }

  execute(personIds: string[], type: 'CONFIRM' | 'CANCEL'): Promise<ActionResponse> {
    const params = new URLSearchParams();
    params.set('personIds', personIds.join(','));
    params.set('type', type);
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/execute?${params.toString()}`, null));
  }
}
