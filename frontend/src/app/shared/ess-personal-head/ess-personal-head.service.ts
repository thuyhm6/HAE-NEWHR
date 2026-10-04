import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EssPersonalHeadInfo {
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  headDepartment?: string;
  postFamily?: string;
  postFamilyName?: string;
  postGradeName?: string;
  positionNoName?: string;
  /** DD/MM/YYYY */
  dateStarted?: string;
  sexCode?: string;
}

const MY_INFO_URL = '/ess/empinfo/api/personalInfo/myInfo';

/** Thông tin user đăng nhập cho khối header ESS (viewPersonalInfoHead_ess.jsp ở bản cũ). */
@Injectable({ providedIn: 'root' })
export class EssPersonalHeadService {
  private readonly http = inject(HttpClient);

  getMyInfo(): Promise<EssPersonalHeadInfo> {
    return firstValueFrom(this.http.get<EssPersonalHeadInfo>(MY_INFO_URL));
  }
}
