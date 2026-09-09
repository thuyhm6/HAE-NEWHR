import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EssPersonalInfoDto {
  empId?: string;
  personId?: string;
  localName?: string;
  deptName?: string;
  dutyName?: string;
  positionNoName?: string;
  postFamily?: string;
  postFamilyName?: string;
  postGradeName?: string;
  headDepartment?: string;
  dateStarted?: string;
  englishName?: string;
  dob?: string;
  sexCode?: string;
  sexName?: string;
  maritalStatusCode?: string;
  maritalStatusName?: string;
  weddingDate?: string;
  nationCode?: string;
  nationName?: string;
  nationalityCode?: string;
  nationalityName?: string;
  houseTp?: string;
  homePhone?: string;
  companyPhone?: string;
  cellphone?: string;
  residentialDistinction?: string;
  existSingle?: string;
  email?: string;
  emailSecond?: string;
  singId?: string;
  homeAddress?: string;
  officePhone?: string;
  idcardNo?: string;
  idcardStartDate?: string;
  issuingAuthority?: string;
  regPlace?: string;
  finalDegreeCode?: string;
  finalDegreeName?: string;
  religion?: string;
  politicalStatus?: string;
  cvUpdateStatus?: string;
  armyOrNot?: string;
  obstacleOrNot?: string;
  photoPath?: string;
}

export interface HrEmergencyAddress {
  emergencyNo?: number;
  personId?: string;
  emerName?: string;
  emerPhone?: string;
  emerPhoneSecond?: string;
  emerEmail?: string;
  mainLiaisonOffice?: string;
  emerAddress?: string;
  emerTypeCode?: string;
  emerTypeName?: string;
  isEmergencyAddress?: string;
}

export interface HrAddressMatters {
  addressNo?: number;
  personId?: string;
  addressType?: string;
  addressTypeName?: string;
  effectiveStartDate?: string;
  addressContent?: string;
}

export interface HrFamily {
  familyNo?: number;
  personId?: string;
  famTypeCode?: string;
  famTypeName?: string;
  famName?: string;
  famBorndate?: string;
  famPhone?: string;
  gender?: string;
  genderName?: string;
}

export interface HrEducation {
  educNo?: number;
  personId?: string;
  degreeCode?: string;
  degreeName?: string;
  institutionName?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  remark?: string;
}

export interface HrReward {
  rewardNo?: number;
  personId?: string;
  rewardType?: string;
  rewardTypeCode?: string;
  rewardDate?: string;
  rewardCnpy?: string;
  reward?: string;
  remarks?: string;
}

export interface HrPunishment {
  punishNo?: number;
  personId?: string;
  punishDate?: string;
  punishCode?: string;
  punishReason?: string;
  releaseDate?: string;
  punishDepartment?: string;
  remarks?: string;
}

export interface EvsObjectDto {
  seq?: string;
  personId?: string;
  evsYear?: string;
  evsCycleName?: string;
  evsTypeName?: string;
  evsGroupName?: string;
  finalGrade?: string;
  finalAffirmContent?: string;
}

export interface HrSpecialMatter {
  specialNo?: string;
  personId?: string;
  registrationDate?: string;
  inforDisCode?: string;
  generationTitle?: string;
  specialContent?: string;
  startDate?: string;
  endDate?: string;
}

export interface ManageEmpPositionInsideDto {
  personId?: string;
  startDate?: string;
  deptName?: string;
  mainBusiness?: string;
  postGrade?: string;
  transCode?: string;
}

export interface EmployeeSearchResult {
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  position?: string;
}

const BASE_URL = '/ess/viewDept/api/personalInfoEss';
const INSIDE_EXPERIENCE_URL = '/ess/viewDept/api/manageEmpPositionInfo/insideExperience';
const EMPLOYEE_SEARCH_URL = '/hrm/empinfo/api/employee/search';

/**
 * Gọi lại nguyên vẹn các API JSON đã có sẵn của trang Hồ sơ nhân viên
 * (viewPersonalInfoEss) - port lại từ ess/viewDept/viewPersonalInfoEss.html
 * (Thymeleaf + jQuery) sang Angular + NG-ZORRO. Các endpoint reward/
 * punishment/evsObject/specialMatter đã có sẵn ở backend (EssViewDeptController,
 * mục "Hồ sơ nhân viên (viewPersonalInfoEss)") nhưng trang Thymeleaf cũ chưa
 * dùng tới (3 tab tương ứng chỉ hiển thị "Không có dữ liệu") - trang Angular
 * này tận dụng luôn để không bỏ phí API đã viết.
 */
@Injectable({ providedIn: 'root' })
export class PersonalInfoEssService {
  private readonly http = inject(HttpClient);

  getProfile(personId?: string): Promise<EssPersonalInfoDto> {
    return firstValueFrom(
      this.http.get<EssPersonalInfoDto>(`${BASE_URL}/profile`, {
        params: personId ? { personId } : {},
      }),
    );
  }

  getEmergencyList(personId: string): Promise<HrEmergencyAddress[]> {
    return firstValueFrom(this.http.get<HrEmergencyAddress[]>(`${BASE_URL}/emergency`, { params: { personId } }));
  }

  getAddressList(personId: string): Promise<HrAddressMatters[]> {
    return firstValueFrom(this.http.get<HrAddressMatters[]>(`${BASE_URL}/address`, { params: { personId } }));
  }

  getFamilyList(personId: string): Promise<HrFamily[]> {
    return firstValueFrom(this.http.get<HrFamily[]>(`${BASE_URL}/family`, { params: { personId } }));
  }

  getEducationList(personId: string): Promise<HrEducation[]> {
    return firstValueFrom(this.http.get<HrEducation[]>(`${BASE_URL}/education`, { params: { personId } }));
  }

  getRewardList(personId: string): Promise<HrReward[]> {
    return firstValueFrom(this.http.get<HrReward[]>(`${BASE_URL}/reward`, { params: { personId } }));
  }

  getPunishmentList(personId: string): Promise<HrPunishment[]> {
    return firstValueFrom(this.http.get<HrPunishment[]>(`${BASE_URL}/punishment`, { params: { personId } }));
  }

  getEvsObjectList(personId: string): Promise<EvsObjectDto[]> {
    return firstValueFrom(this.http.get<EvsObjectDto[]>(`${BASE_URL}/evsObject`, { params: { personId } }));
  }

  getSpecialMatterList(personId: string): Promise<HrSpecialMatter[]> {
    return firstValueFrom(this.http.get<HrSpecialMatter[]>(`${BASE_URL}/specialMatter`, { params: { personId } }));
  }

  getInsideExperienceList(personId: string): Promise<ManageEmpPositionInsideDto[]> {
    return firstValueFrom(
      this.http.get<ManageEmpPositionInsideDto[]>(INSIDE_EXPERIENCE_URL, { params: { personId } }),
    );
  }

  searchEmployees(keyword: string): Promise<EmployeeSearchResult[]> {
    return firstValueFrom(this.http.get<EmployeeSearchResult[]>(EMPLOYEE_SEARCH_URL, { params: { keyword } }));
  }
}
