import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PaParamDataTempRow {
  paramNo?: string;
  empId?: string;
  localName?: string;
  returnValue?: string;
  startMonth?: string;
  endMonth?: string;
  remark?: string;
  uploadErrorMsg?: string;
  lineId?: number;
  resultFlag?: string;
  uploadBy?: string;
  uploadDate?: string;
  paramItemName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/pa/salary/inputItemData/api/importTemp';

/**
 * Kết quả nhập Excel dữ liệu tiêu chuẩn (viewImportExcelTempPaParamList) -
 * port lại từ pa/salary/viewImportExcelTempPaParamList.html (đã xoá). Trang
 * review được mở thành tab mới sau khi import Excel thành công ở
 * pa-input-item-data (xem TabService.openTab trong component đó) - đọc
 * paramNo từ query param, cho phép xem/lọc dòng lỗi trước khi xác nhận Lưu
 * (chuyển PA_PARAM_DATA_TEMP sang PA_PARAM_DATA chính thức) hoặc Hủy bỏ.
 */
@Injectable({ providedIn: 'root' })
export class PaImportExcelTempPaParamListService {
  private readonly http = inject(HttpClient);

  getList(errorOnly: string): Promise<PaParamDataTempRow[]> {
    return firstValueFrom(this.http.get<PaParamDataTempRow[]>(`${BASE_URL}/list`, { params: { errorOnly } }));
  }

  save(paramNo: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, null, { params: { paramNo } }));
  }
}
