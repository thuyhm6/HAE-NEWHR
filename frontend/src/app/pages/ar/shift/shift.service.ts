import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ShiftRow {
  shiftNo?: string;
  shiftId?: string;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
  companyName?: string;
  shiftShortname?: string;
  datatype?: number;
  deptDistinguishNo?: string;
  deductTime?: number;
  otTimeStart?: string;
  otAllowance?: number;
  shiftLength?: number;
  orderno?: number;
  activity?: number;
}

export interface ShiftSavePayload {
  shiftNo: string | null;
  shiftId: string | null;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  nameKo: string;
  shiftShortname: string | null;
  datatype: number | null;
  deptDistinguishNo: string | null;
  deductTime: number | null;
  otTimeStart: string | null;
  otAllowance: number | null;
  shiftLength: number | null;
  orderno: number;
  activity: number;
}

export interface ShiftDetailRow {
  pkNo?: number;
  shiftNo?: string;
  itemNo?: string;
  itemName?: string;
  beginDayOffset?: number;
  fromTimeStr?: string;
  endDayOffset?: number;
  toTimeStr?: string;
  orderno?: number;
  activity?: number;
}

export interface ShiftDetailSavePayload {
  pkNo: number | null;
  shiftNo: string;
  itemNo: string;
  beginDayOffset: number;
  fromTimeStr: string | null;
  endDayOffset: number;
  toTimeStr: string | null;
  orderno: number;
  activity: number;
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ArItemOption {
  itemNo: string;
  nameVi?: string;
  shortName?: string;
  activity?: number;
}

const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const SHIFT_SAVE_URL = '/ar/attendanceSettings/api/shift/save';
const SHIFT_DETAIL_URL = '/ar/attendanceSettings/api/shiftDetail';
const SHIFT_DETAIL_SAVE_URL = '/ar/attendanceSettings/api/shiftDetail/save';
const ITEM_LIST_URL = '/ar/attendanceSettings/api/arItem';

/**
 * Quản lý Ca làm việc (master AR_SHIFT010) + Chi tiết tham số ca
 * (detail AR_SHIFT020) - port lại từ ar/attendanceSettings/viewShift.html
 * (đã xoá). Cấu trúc master-detail: cây phẳng Ca làm việc bên trái, bảng
 * chi tiết bên phải lọc theo ca đã chọn.
 *
 * Bug có thật đã tìm thấy và sửa ở backend khi migrate (không phải do
 * Angular gây ra): `ArShiftServiceImpl.saveShiftDetail()` dùng
 * `LocalDateTime.parse(fromTimeStr)` trong khi `fromTimeStr` chỉ là chuỗi
 * "HH:mm" (không có phần ngày) - luôn ném `DateTimeParseException`, bị nuốt
 * bởi catch nên giờ bắt đầu/kết thúc KHÔNG BAO GIỜ được lưu ở bản gốc. Đã
 * sửa dùng `LocalTime.parse(...)` ghép với ngày mốc cố định.
 */
@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly http = inject(HttpClient);

  getShiftList(searchText?: string): Promise<ShiftRow[]> {
    const params: Record<string, string> = {};
    if (searchText) params['searchText'] = searchText;
    return firstValueFrom(this.http.get<ShiftRow[]>(SHIFT_URL, { params }));
  }

  getShiftById(shiftNo: string): Promise<ShiftRow> {
    return firstValueFrom(this.http.get<ShiftRow>(`${SHIFT_URL}/${shiftNo}`));
  }

  saveShift(payload: ShiftSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SHIFT_SAVE_URL, payload));
  }

  deleteShift(shiftNo: string): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${SHIFT_URL}/delete/${shiftNo}`));
  }

  getShiftDetailList(shiftNo: string): Promise<ShiftDetailRow[]> {
    return firstValueFrom(this.http.get<ShiftDetailRow[]>(SHIFT_DETAIL_URL, { params: { shiftNo } }));
  }

  getShiftDetailById(pkNo: number): Promise<ShiftDetailRow> {
    return firstValueFrom(this.http.get<ShiftDetailRow>(`${SHIFT_DETAIL_URL}/${pkNo}`));
  }

  saveShiftDetail(payload: ShiftDetailSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SHIFT_DETAIL_SAVE_URL, payload));
  }

  deleteShiftDetail(pkNo: number): Promise<SaveResponse> {
    return firstValueFrom(this.http.delete<SaveResponse>(`${SHIFT_DETAIL_URL}/delete/${pkNo}`));
  }

  getItemList(): Promise<ArItemOption[]> {
    return firstValueFrom(this.http.get<ArItemOption[]>(ITEM_LIST_URL));
  }
}
