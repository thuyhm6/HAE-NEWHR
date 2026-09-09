import { Injectable, signal } from '@angular/core';

/**
 * Quản lý trạng thái "accordion" cho sidebar menu (app-menu-node): tại mọi thời điểm chỉ giữ mở
 * 1 nhánh menu (từ root xuống submenu đang bấm) - bấm mở 1 submenu sẽ tự thu gọn mọi nhánh khác,
 * kể cả nhánh khác cấp. Provided ở root nên mọi instance đệ quy của MenuNodeComponent (kể cả
 * children lồng nhau) đều dùng chung 1 state.
 */
@Injectable({ providedIn: 'root' })
export class MenuAccordionService {
  private readonly openPathState = signal<string[]>([]);
  readonly openPath = this.openPathState.asReadonly();

  isOpen(menuNo: string): boolean {
    return this.openPathState().includes(menuNo);
  }

  onOpenChange(ancestors: string[], menuNo: string, open: boolean): void {
    if (open) {
      this.openPathState.set([...ancestors, menuNo]);
      return;
    }
    this.openPathState.update((path) => {
      const idx = path.indexOf(menuNo);
      return idx === -1 ? path : path.slice(0, idx);
    });
  }
}
