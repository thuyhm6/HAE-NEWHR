import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface SyFeedbackRow {
  feedbackId?: string;
  feedbackTitle?: string;
  feedbackContent?: string;
  createDate?: string;
  createdIp?: string;
}

const BASE_URL = '/sys/api/feedback';

/**
 * Danh sách góp ý người dùng (viewFeedback) - port lại từ
 * sys/viewFeedback.html (đã xoá). Trang chỉ đọc (không có CRUD/export) -
 * xem góp ý gửi từ trang đăng nhập (SyFeedbackController#submitFeedback,
 * public, không cần đăng nhập).
 */
@Injectable({ providedIn: 'root' })
export class SyFeedbackService {
  private readonly http = inject(HttpClient);

  getList(keyword: string, draw: number, start: number, length: number): Promise<DataTablesResponse<SyFeedbackRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<SyFeedbackRow>>(`${BASE_URL}/list`, { params: { keyword, draw, start, length } }),
    );
  }
}
