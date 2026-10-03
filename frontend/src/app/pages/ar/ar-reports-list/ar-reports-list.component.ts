import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, Type, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { I18nService } from '../../../i18n/i18n.service';
import { ExternalTabComponent } from '../../../shell/external-tab.component';
import { TabService } from '../../../shell/tab.service';
import { ArReportMenuItem, ArReportsListService } from './ar-reports-list.service';

interface ArrlMenuItem {
  key: string;
  label: string;
  url: string;
}

/**
 * Trung tâm báo cáo (/report/ar/viewArReportsList) - port từ report/ar/viewArReportsList.jsp
 * (Hanwha_HAE). Dùng chung cho nhiều menu báo cáo (lương / nhân sự / chấm công / đào tạo) phân biệt
 * bằng menuNo: bên trái là cây loại báo cáo (SY_CODE + REPORT_CENTER), bên phải mở trang báo cáo
 * (URL_JSP) giống div jbsxBoxAr bản gốc:
 *  - URL đã migrate sang Angular (có route trong app.routes.ts) -> nạp component của route đó và
 *    nhúng bằng NgComponentOutlet;
 *  - URL chưa migrate -> nhúng trang Thymeleaf qua ExternalTabComponent (cơ chế tab 'external').
 * menuNo lấy từ query param (AppShellComponent gắn thêm khi mở menu) hoặc từ tab đang mở.
 */
@Component({
  selector: 'app-ar-reports-list',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet, NzCardModule, NzIconModule, NzMenuModule, NzSpinModule, ExternalTabComponent],
  templateUrl: './ar-reports-list.component.html',
  styleUrl: './ar-reports-list.component.scss',
})
export class ArReportsListComponent implements OnInit {
  private readonly service = inject(ArReportsListService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tabs = inject(TabService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly menuLoading = signal(false);
  protected readonly menu = signal<ArrlMenuItem[]>([]);
  protected readonly active = signal<ArrlMenuItem | null>(null);

  /** Báo cáo đã migrate: component của route tương ứng */
  protected readonly embeddedComponent = signal<Type<unknown> | null>(null);
  /** Báo cáo chưa migrate: URL trang Thymeleaf */
  protected readonly externalUrl = signal<string | null>(null);
  protected readonly contentLoading = signal(false);

  private currentMenuNo: string | null = null;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    // Cùng 1 route dùng cho nhiều menu -> component có thể được tái sử dụng khi chuyển tab, nên
    // theo dõi menuNo trên query param thay vì chỉ đọc 1 lần.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const menuNo = params.get('menuNo') || this.activeTabMenuNo();
      if (menuNo !== this.currentMenuNo) {
        this.currentMenuNo = menuNo;
        this.loadMenu(menuNo);
      }
    });
  }

  private activeTabMenuNo(): string | null {
    const active = this.tabs.tabs().find((t) => t.path === this.tabs.activePath());
    return active?.menuNo ?? null;
  }

  private async loadMenu(menuNo: string | null): Promise<void> {
    this.active.set(null);
    this.embeddedComponent.set(null);
    this.externalUrl.set(null);
    this.menu.set([]);
    if (!menuNo) return;
    this.menuLoading.set(true);
    try {
      const list: ArReportMenuItem[] = await this.service.getMenu(menuNo);
      const items = list
        .filter((m) => !!m.urlJsp)
        .map((m, i) => ({
          key: `${m.codeNo}-${i}`,
          label: (m.content ?? '').trim() || m.reportName || m.urlJsp || m.codeNo || '',
          url: m.urlJsp!.trim(),
        }));
      this.menu.set(items);
    } catch {
      this.menu.set([]);
    } finally {
      this.menuLoading.set(false);
    }
  }

  async selectReport(item: ArrlMenuItem): Promise<void> {
    this.active.set(item);
    this.embeddedComponent.set(null);
    this.externalUrl.set(null);
    const route = this.findRoute(this.pathOf(item.url));
    if (!route?.loadComponent && !route?.component) {
      this.externalUrl.set(item.url);
      return;
    }
    this.contentLoading.set(true);
    try {
      this.embeddedComponent.set(await this.resolveComponent(route));
    } catch {
      // Không nạp được component -> quay về nhúng trang theo URL như bản gốc
      this.externalUrl.set(item.url);
    } finally {
      this.contentLoading.set(false);
    }
  }

  /** '/pa/x/y?a=1' -> 'pa/x/y' */
  private pathOf(url: string): string {
    const q = url.indexOf('?');
    return (q === -1 ? url : url.slice(0, q)).replace(/^\/+/, '').replace(/\/+$/, '');
  }

  private findRoute(path: string, routes: Route[] = this.router.config, prefix = ''): Route | null {
    for (const r of routes) {
      const full = [prefix, r.path ?? ''].filter(Boolean).join('/');
      if (full === path && (r.loadComponent || r.component)) return r;
      if (r.children?.length) {
        const found = this.findRoute(path, r.children, full);
        if (found) return found;
      }
    }
    return null;
  }

  private async resolveComponent(route: Route): Promise<Type<unknown>> {
    if (route.component) return route.component;
    const loaded = (await route.loadComponent!()) as Type<unknown> | { default: Type<unknown> };
    return 'default' in loaded ? loaded.default : loaded;
  }
}
