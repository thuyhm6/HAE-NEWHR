import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OrgNodeRow {
  id: string;
  parentId?: string | null;
  name?: string | null;
  title?: string | null;
  type: string;
  code?: string | null;
  managerName?: string | null;
  managerId?: string | null;
  imageUrl?: string | null;
  level: number;
  children?: OrgNodeRow[];
}

/**
 * Sơ đồ tổ chức dạng biểu đồ trực quan (viewOrgInfo) - gọi lại nguyên API JSON đã có sẵn ở
 * CurrentOrgController#getVisualTree, không đổi backend.
 */
@Injectable({ providedIn: 'root' })
export class OrgInfoService {
  private readonly http = inject(HttpClient);

  getVisualTree(): Promise<OrgNodeRow[]> {
    return firstValueFrom(this.http.get<OrgNodeRow[]>('/org/api/visual/tree'));
  }
}
