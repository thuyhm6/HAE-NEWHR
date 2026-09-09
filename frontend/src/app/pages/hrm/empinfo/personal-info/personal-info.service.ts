import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AddressRow } from '../address/address.service';
import { EducationRow } from '../education/education.service';
import { EmergencyAddressRow } from '../emergency-address/emergency-address.service';
import { FamilyRow } from '../family/family.service';
import { PunishmentRow } from '../punishment/punishment.service';
import { RewardRow } from '../recognition/recognition.service';

export interface EssPersonalInfoDto {
  empId?: string;
  personId?: string;
  localName?: string;
  deptName?: string;
  dutyName?: string;
  positionNoName?: string;
  postFamilyName?: string;
  postGradeName?: string;
  headDepartment?: string;
  dateStarted?: string;
  dob?: string;
  sexName?: string;
  maritalStatusName?: string;
  weddingDate?: string;
  nationName?: string;
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
  idcardNo?: string;
  idcardStartDate?: string;
  issuingAuthority?: string;
  regPlace?: string;
  finalDegreeName?: string;
  // 4 field này chưa từng có trong DTO gốc (EssPersonalInfoDto) - bản gốc
  // (viewPersonalInfo.html) tham chiếu tới nhưng API không bao giờ trả về,
  // nên các ô "Công việc/Mã chi phí/Trạng thái/Kinh nghiệm" luôn trống. Giữ
  // nguyên hành vi này, không tự chế dữ liệu.
  mainBusiness?: string;
  costCode?: string;
  empOffice?: string;
  experience?: string;
}

export interface InsideExperienceRow {
  personId?: string;
  startDate?: string;
  deptName?: string;
  mainBusiness?: string;
  postGrade?: string;
  transCode?: string;
}

const BASE_URL = '/hrm/empinfo/api/empProfile';

/**
 * Hồ sơ nhân viên (viewPersonalInfo) - port lại từ
 * hrm/empinfo/viewPersonalInfo.html (đã xoá). Tái sử dụng lại các interface
 * Row đã định nghĩa ở education/address/family/emergency-address/
 * recognition/punishment service (cùng model Java ở backend, khớp 100% với
 * dữ liệu trả về từ các endpoint /api/empProfile/*).
 */
@Injectable({ providedIn: 'root' })
export class PersonalInfoService {
  private readonly http = inject(HttpClient);

  getCurrentUserPersonId(): Promise<string> {
    return firstValueFrom(this.http.get<{ personId: string }>(`${BASE_URL}/currentUser`)).then((r) => r.personId);
  }

  getProfile(personId: string): Promise<EssPersonalInfoDto> {
    return firstValueFrom(this.http.get<EssPersonalInfoDto>(`${BASE_URL}/info`, { params: { personId } }));
  }

  getEmergencyList(personId: string): Promise<EmergencyAddressRow[]> {
    return firstValueFrom(this.http.get<EmergencyAddressRow[]>(`${BASE_URL}/emergency`, { params: { personId } }));
  }

  getAddressList(personId: string): Promise<AddressRow[]> {
    return firstValueFrom(this.http.get<AddressRow[]>(`${BASE_URL}/address`, { params: { personId } }));
  }

  getFamilyList(personId: string): Promise<FamilyRow[]> {
    return firstValueFrom(this.http.get<FamilyRow[]>(`${BASE_URL}/family`, { params: { personId } }));
  }

  getEducationList(personId: string): Promise<EducationRow[]> {
    return firstValueFrom(this.http.get<EducationRow[]>(`${BASE_URL}/education`, { params: { personId } }));
  }

  getInsideExperienceList(personId: string): Promise<InsideExperienceRow[]> {
    return firstValueFrom(this.http.get<InsideExperienceRow[]>(`${BASE_URL}/insideExperience`, { params: { personId } }));
  }

  getRewardList(personId: string): Promise<RewardRow[]> {
    return firstValueFrom(this.http.get<RewardRow[]>(`${BASE_URL}/reward`, { params: { personId } }));
  }

  getPunishmentList(personId: string): Promise<PunishmentRow[]> {
    return firstValueFrom(this.http.get<PunishmentRow[]>(`${BASE_URL}/punishment`, { params: { personId } }));
  }
}
