import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface HrCardEmployee {
  empId?: string;
  localName?: string;
  personId?: string;
  deptNo?: string;
  postGradeNo?: string;
  mainBusiness?: string;
  costCenter?: string;
  empOffice?: string;
  dateStarted?: string;
  dateLeft?: string;
}

export interface HrCardPersonalInfo {
  regPlace?: string;
  politicalStatus?: string;
  finalDegreeName?: string;
  dob?: string;
  sexName?: string;
  homePhone?: string;
  cellphone?: string;
  officePhone?: string;
  nationalityName?: string;
  nationName?: string;
  maritalStatusName?: string;
  email?: string;
  emailSecond?: string;
  weddingDate?: string;
  homeAddress?: string;
  singId?: string;
}

export interface HrCardEducationRow {
  degreeCode?: string;
  institutionName?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
}

export interface HrCardFamilyRow {
  famTypeName?: string;
  famTypeCode?: string;
  famName?: string;
  famBorndate?: string;
  famPhone?: string;
}

export interface HrCardExperienceRow {
  startDate?: string;
  endDate?: string;
  cpnyName?: string;
  deptName?: string;
  remark?: string;
}

export interface HrCardQualificationRow {
  qualName?: string;
  qualGrade?: string;
  qualInstitute?: string;
  qualCardNo?: string;
  validityDate?: string;
}

export interface HrCardDetail {
  employee?: HrCardEmployee;
  personalInfo?: HrCardPersonalInfo;
  educations?: HrCardEducationRow[];
  families?: HrCardFamilyRow[];
  experiences?: HrCardExperienceRow[];
  qualifications?: HrCardQualificationRow[];
}

const HR_CARD_URL = '/hrm/empinfo/api/hrCard/detail';

/**
 * Thẻ nhân sự (viewHAECardInfoList) - port lại từ
 * hrm/empinfo/viewHAECardInfoList.html (đã xoá). Danh sách tìm kiếm dùng lại
 * y nguyên ManageEmpPositionInfoService (cùng endpoint
 * /ess/viewDept/api/manageEmpPositionInfo/list đã có sẵn ở module ess) -
 * xem component để biết chi tiết import chéo module.
 *
 * Bug có thật đã sửa khi migrate: JS gốc đọc các trường
 * personalInfo.political/finalEdu/birthday/gender/tel/national/married/
 * personEmail/cEmail/marryDate/presentAdd/eagleMId - nhưng model
 * `HrPersonalInfo` ở backend KHÔNG có field nào tên như vậy (field thật là
 * politicalStatus/finalDegreeName/dob/sexName/cellphone/nationalityName/
 * maritalStatusName/email/emailSecond/weddingDate/homeAddress/singId).
 * Vì vậy gần như toàn bộ nửa "thông tin cá nhân" của Thẻ nhân sự khi in ra
 * TRƯỚC GIỜ LUÔN TRỐNG. Bản Angular đọc đúng tên field thật.
 * Các trường `gradSchool`/`major` (học vấn) và `divisionEntry`/`dateEntry`
 * (ngày vào bộ phận) không có nguồn dữ liệu tương ứng nào ở cả
 * HrPersonalInfo lẫn HrEmployee - đây là khoảng trống dữ liệu thật sự
 * (không phải lỗi đặt sai tên field), giữ nguyên để trống như bản gốc.
 *
 * Cùng loại bug field-name-mismatch cũng xảy ra ở 4 bảng con
 * (educations/families/experiences/qualifications): JS gốc đọc
 * admissions/graduation/education/major (Education), relation/birthday/tel
 * (Family), companyName/department/remarks (Experience), grade/issuing/
 * evidence/effective (Qualification) - không khớp field thật của
 * HrEducation/HrFamily/HrWorkExperience/HrQualification (đã biết chính xác
 * từ các trang CRUD education/family/work-experience/qualification đã
 * migrate trước đó trong cùng batch). Đã sửa dùng đúng tên field thật.
 */
@Injectable({ providedIn: 'root' })
export class HaeCardInfoListService {
  private readonly http = inject(HttpClient);

  getCardDetail(empId: string): Promise<HrCardDetail> {
    return firstValueFrom(this.http.get<HrCardDetail>(HR_CARD_URL, { params: { empId } }));
  }
}
