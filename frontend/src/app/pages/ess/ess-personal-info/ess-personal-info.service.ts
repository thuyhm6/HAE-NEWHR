import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EssPersonalInfo {
  empId?: string;
  personId?: string;
  localName?: string;
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

export interface PersonalSaveFields {
  dob?: string;
  sexCode?: string;
  maritalStatusCode?: string;
  weddingDate?: string;
  nationCode?: string;
  nationalityCode?: string;
  finalDegreeCode?: string;
  religion?: string;
  politicalOutlook?: string;
  armyOrNot?: string;
  obstacleOrNot?: string;
  idcardNo?: string;
  idcardStartDate?: string;
  issuingAuthority?: string;
  cvUpdateStatus?: string;
  regPlace?: string;
  houseTp?: string;
  homePhone?: string;
  companyPhone?: string;
  cellphone?: string;
  email?: string;
  emailSecond?: string;
  residentialDistinction?: string;
  existSingle?: string;
  singId?: string;
}

export interface AddressRow {
  addressNo?: number;
  addressType?: string;
  addressTypeName?: string;
  effectiveStartDate?: string;
  addressContent?: string;
  nationalityName?: string;
}

export interface AddressSavePayload {
  updateAddressNo?: number | null;
  addressType?: string | null;
  effectiveStartDate?: string | null;
  addressContent?: string | null;
}

export interface FamilyRow {
  familyNo?: number;
  famTypeCode?: string;
  famTypeName?: string;
  famName?: string;
  gender?: string;
  genderName?: string;
  famBorndate?: string;
  famPhone?: string;
}

export interface FamilySaveFields {
  updateFamilyNo?: number;
  famTypeCode: string;
  famName: string;
  gender?: string;
  famBorndate?: string;
  famPhone?: string;
}

export interface EmergencyRow {
  emergencyNo?: number;
  emerName?: string;
  emerTypeCode?: string;
  emerTypeName?: string;
  emerPhone?: string;
  emerEmail?: string;
  emerAddress?: string;
  isEmergencyAddress?: string;
}

export interface EmergencySaveFields {
  updateEmergencyNo?: number;
  emerName: string;
  emerTypeCode?: string;
  emerPhone?: string;
  emerEmail?: string;
  emerAddress?: string;
  isEmergencyAddress: string;
}

export interface EssFile {
  fileNo?: string;
  applyNo?: string;
  fileName?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

const BASE = '/ess/empinfo/api/personalInfo';
const CODE_LIST_URL = '/sys/api/getCode/list';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewEssPersonalInfo (không đổi
 * backend) - port lại từ ess/empinfo/viewEssPersonalInfo.html (Thymeleaf, đã
 * xoá) sang Angular + NG-ZORRO. Đây là trang tự quản lý hồ sơ cá nhân của
 * chính người đang đăng nhập - mọi thay đổi đều gửi yêu cầu chờ quản lý xét
 * duyệt (không cập nhật trực tiếp), giống hệt hành vi bản gốc.
 */
@Injectable({ providedIn: 'root' })
export class EssPersonalInfoService {
  private readonly http = inject(HttpClient);

  getMyInfo(): Promise<EssPersonalInfo> {
    return firstValueFrom(this.http.get<EssPersonalInfo>(`${BASE}/myInfo`));
  }

  savePersonal(fields: PersonalSaveFields, files: File[]): Promise<{ message?: string; applyNo?: string }> {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    files.forEach((file) => formData.append('attachFiles', file));
    return firstValueFrom(this.http.post<{ message?: string; applyNo?: string }>(`${BASE}/savePersonal`, formData));
  }

  getPersonalFiles(): Promise<EssFile[]> {
    return firstValueFrom(this.http.get<EssFile[]>(`${BASE}/personalFiles`));
  }

  getAddresses(): Promise<AddressRow[]> {
    return firstValueFrom(this.http.get<AddressRow[]>(`${BASE}/myAddress`));
  }

  saveAddress(payload: AddressSavePayload): Promise<{ addressNo?: string }> {
    return firstValueFrom(this.http.post<{ addressNo?: string }>(`${BASE}/saveAddress`, payload));
  }

  getFamilies(): Promise<FamilyRow[]> {
    return firstValueFrom(this.http.get<FamilyRow[]>(`${BASE}/myFamily`));
  }

  saveFamily(fields: FamilySaveFields, files: File[]): Promise<{ message?: string; applyNo?: string }> {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    files.forEach((file) => formData.append('attachFiles', file));
    return firstValueFrom(this.http.post<{ message?: string; applyNo?: string }>(`${BASE}/saveFamily`, formData));
  }

  getEmergencies(): Promise<EmergencyRow[]> {
    return firstValueFrom(this.http.get<EmergencyRow[]>(`${BASE}/myEmergency`));
  }

  saveEmergency(fields: EmergencySaveFields, files: File[]): Promise<{ message?: string; applyNo?: string }> {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    files.forEach((file) => formData.append('attachFiles', file));
    return firstValueFrom(this.http.post<{ message?: string; applyNo?: string }>(`${BASE}/saveEmergency`, formData));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }
}
