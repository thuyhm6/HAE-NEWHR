import { computed, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export type TabKind = 'route' | 'external';

export interface TabItem {
  path: string; // route path (kind='route') hoặc URL Thymeleaf gốc (kind='external') - dùng làm key
  title: string;
  closable: boolean;
  kind: TabKind;
  reloadToken: number;
  /** menuNo của mục menu đã mở tab này - dự phòng cho các bước migrate sau (menu ngữ cảnh trên
   *  topbar), hiện AppShellComponent chưa dùng tới. */
  menuNo?: string;
}

const HOME_TAB: TabItem = { path: '/dashboard', title: 'Trang chủ', closable: false, kind: 'route', reloadToken: 0 };

/**
 * Quản lý danh sách tab đang mở. 2 loại tab:
 * - 'route': trang đã migrate sang Angular, ứng với 1 route thật, điều hướng qua Router - state giữ
 *   nguyên nhờ TabRouteReuseStrategy.
 * - 'external': trang Thymeleaf CHƯA migrate - nội dung được ExternalTabComponent AJAX-fetch (giống
 *   cơ chế innerTab.js gốc) và giữ nguyên DOM khi ẩn/hiện qua lại (không dùng Angular Router nên
 *   URL trên trình duyệt không đổi, đúng như hành vi bản gốc).
 */
@Injectable({ providedIn: 'root' })
export class TabService {
  readonly tabs = signal<TabItem[]>([HOME_TAB]);
  readonly activePath = signal<string>(HOME_TAB.path);

  readonly externalTabs = computed(() => this.tabs().filter((t) => t.kind === 'external'));
  readonly activeTabKind = computed<TabKind>(() => {
    const active = this.tabs().find((t) => t.path === this.activePath());
    return active?.kind ?? 'route';
  });

  constructor(private readonly router: Router) {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.activePath.set(e.urlAfterRedirects);
    });
  }

  /** Mở tab từ menu - nếu tab 'external' đã mở sẵn thì load lại nội dung mới nhất (giống hành vi gốc). */
  openTab(path: string, title: string, kind: TabKind, menuNo?: string): void {
    const key = path;
    const existing = this.tabs().find((t) => t.path === key);

    if (!existing) {
      this.tabs.update((tabs) => [...tabs, { path: key, title, closable: true, kind, reloadToken: 0, menuNo }]);
    } else if (kind === 'external') {
      this.tabs.update((tabs) =>
        tabs.map((t) => (t.path === key ? { ...t, reloadToken: t.reloadToken + 1, menuNo: menuNo ?? t.menuNo } : t)),
      );
    }

    this.switchTab(key);
  }

  /**
   * Chuyển sang tab đã mở sẵn - KHÔNG load lại nội dung (giống bấm vào tab-header ở bản gốc).
   * dùng skipLocationChange để router điều hướng nội bộ (giữ state, kích hoạt component) mà KHÔNG
   * ghi URL của route lên thanh địa chỉ trình duyệt - đồng nhất với hành vi tab 'external'.
   */
  switchTab(path: string): void {
    const tab = this.tabs().find((t) => t.path === path);
    if (!tab) return;
    if (tab.kind === 'route') {
      this.router.navigateByUrl(tab.path, { skipLocationChange: true });
    } else {
      this.activePath.set(tab.path);
    }
  }

  closeTab(path: string): void {
    const tabs = this.tabs();
    const idx = tabs.findIndex((t) => t.path === path);
    if (idx === -1 || !tabs[idx].closable) return;

    const next = tabs.filter((t) => t.path !== path);
    this.tabs.set(next);

    if (this.activePath() === path) {
      const fallback = next[Math.max(0, idx - 1)] ?? HOME_TAB;
      this.switchTab(fallback.path);
    }
  }

  /** Đóng tất cả tab (trừ tab Trang chủ không đóng được). */
  closeAllTabs(): void {
    const activeClosing = this.tabs().find((t) => t.path === this.activePath())?.closable ?? false;
    this.tabs.update((tabs) => tabs.filter((t) => !t.closable));
    if (activeClosing) this.switchTab(HOME_TAB.path);
  }

  /** Đóng tất cả tab (đóng được) nằm bên trái tab `path`. */
  closeTabsToLeft(path: string): void {
    const tabs = this.tabs();
    const idx = tabs.findIndex((t) => t.path === path);
    if (idx <= 0) return;

    const toClose = new Set(tabs.slice(0, idx).filter((t) => t.closable).map((t) => t.path));
    if (toClose.size === 0) return;

    this.tabs.set(tabs.filter((t) => !toClose.has(t.path)));
    if (toClose.has(this.activePath())) this.switchTab(path);
  }

  /** Đóng tất cả tab (đóng được) nằm bên phải tab `path`. */
  closeTabsToRight(path: string): void {
    const tabs = this.tabs();
    const idx = tabs.findIndex((t) => t.path === path);
    if (idx === -1) return;

    const toClose = new Set(tabs.slice(idx + 1).filter((t) => t.closable).map((t) => t.path));
    if (toClose.size === 0) return;

    this.tabs.set(tabs.filter((t) => !toClose.has(t.path)));
    if (toClose.has(this.activePath())) this.switchTab(path);
  }
}
