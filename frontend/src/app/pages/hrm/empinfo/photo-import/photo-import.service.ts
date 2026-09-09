import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PhotoImportResult {
  fileName?: string;
  empId?: string;
  personId?: string;
  localName?: string;
  success: boolean;
  errorMessage?: string;
}

const PREVIEW_URL = '/hrm/empinfo/api/photo/preview';
const SAVE_URL = '/hrm/empinfo/api/photo/save';

/**
 * Import ảnh đại diện nhân viên (photoImport) - port lại từ
 * hrm/empinfo/photoImport.html (đã xoá). Gọi lại nguyên vẹn 2 API
 * multipart/form-data đã có sẵn ở backend.
 */
@Injectable({ providedIn: 'root' })
export class PhotoImportService {
  private readonly http = inject(HttpClient);

  preview(files: File[]): Promise<PhotoImportResult[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return firstValueFrom(this.http.post<PhotoImportResult[]>(PREVIEW_URL, formData));
  }

  save(files: File[]): Promise<PhotoImportResult[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return firstValueFrom(this.http.post<PhotoImportResult[]>(SAVE_URL, formData));
  }
}
