import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** 1 mục của cây loại báo cáo (SY_CODE + REPORT_CENTER) - cùng cấu trúc EduTrainReportMenu phía backend */
export interface ArReportMenuItem {
  codeNo?: string;
  /** Tên loại báo cáo - nhãn hiển thị trên cây (giống bản gốc) */
  content?: string;
  reportName?: string;
  /** URL_JSP bản gốc - trang báo cáo mở ở khung bên phải */
  urlJsp?: string;
}

/**
 * Trung tâm báo cáo (/report/ar/viewArReportsList) - port từ ArReportCtroller.viewArReportsList
 * (Hanwha_HAE). Backend: ArReportController.
 */
@Injectable({ providedIn: 'root' })
export class ArReportsListService {
  private readonly http = inject(HttpClient);

  getMenu(menuNo: string): Promise<ArReportMenuItem[]> {
    return firstValueFrom(this.http.get<ArReportMenuItem[]>('/report/api/arReports/menu', { params: { menuNo } }));
  }
}
