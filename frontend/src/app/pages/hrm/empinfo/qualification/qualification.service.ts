import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface QualificationRow {
  qualNo?: number;
  personId?: string;
  qualName?: string;
  dateObtained?: string;
  qualCardNo?: string;
  qualInstitute?: string;
  validityDate?: string;
  acquisitionModes?: string;
  qualLevel?: string;
  paymentAllowanceYN?: string;
  qualRemark?: string;
  qualGrade?: string;
  qualSubmitDate?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
}

export interface QualificationSavePayload {
  qualNo?: number | null;
  personId: string;
  qualName: string;
  dateObtained?: string | null;
  qualCardNo?: string;
  qualInstitute?: string;
  validityDate?: string | null;
  acquisitionModes?: string;
  qualLevel?: string;
  paymentAllowanceYN?: string;
  qualRemark?: string;
  qualGrade?: string;
  qualSubmitDate?: string;
}

interface ActionResponse {
  message?: string;
  error?: string;
}

const BASE_URL = '/hrm/empinfo/api/qualification';

/**
 * Port lại nguyên vẹn API /hrm/empinfo/api/qualification đã có sẵn ở
 * HrEmpinfoController (viewQualification.html cũ, đã xoá).
 *
 * Bug có thật ở bản gốc (đã sửa khi migrate): `HrQualification.dateObtained`
 * và `validityDate` là kiểu `LocalDate` ở backend, nhưng form cũ dùng input
 * text với placeholder "YYYYMMDD" (không dấu gạch, vd "20240115"). Jackson
 * mặc định chỉ deserialize LocalDate từ chuỗi ISO "yyyy-MM-dd" - nghĩa là bất
 * kỳ người dùng nào nhập đúng theo hướng dẫn "YYYYMMDD" sẽ luôn gặp lỗi 400
 * khi lưu. Bản Angular dùng nz-date-picker và gửi đúng định dạng "yyyy-MM-dd".
 */
@Injectable({ providedIn: 'root' })
export class QualificationService {
  private readonly http = inject(HttpClient);

  search(empId: string, localName: string, qualName: string): Promise<QualificationRow[]> {
    return firstValueFrom(this.http.get<QualificationRow[]>(BASE_URL, { params: { empId, localName, qualName } }));
  }

  getById(qualNo: number): Promise<QualificationRow> {
    return firstValueFrom(this.http.get<QualificationRow>(`${BASE_URL}/${qualNo}`));
  }

  save(payload: QualificationSavePayload): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, payload));
  }

  delete(qualNo: number): Promise<ActionResponse> {
    return firstValueFrom(this.http.delete<ActionResponse>(`${BASE_URL}/delete/${qualNo}`));
  }
}
