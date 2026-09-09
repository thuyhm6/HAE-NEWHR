import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface MenuNode {
  menuNo: string;
  menuParentNo: string;
  menuCode: string;
  menuName: string;
  menuImg: string;
  menuUrl: string;
  depth: number;
  orderNo: number;
  activity: number;
  children: MenuNode[] | null;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  async getMenuTree(sysType: '0' | '1' = '1'): Promise<MenuNode[]> {
    return firstValueFrom(
      this.http.get<MenuNode[]>('/api/dashboard/menu-tree', { params: { sysType } }),
    );
  }
}
