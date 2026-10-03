import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

import { routes } from './app.routes';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';
import { TabRouteReuseStrategy } from './shell/tab-route-reuse.strategy';
import { NZ_ICON_LIST } from './core/config/nz-icons.config';

registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([csrfInterceptor])),
    provideAnimationsAsync(),
    provideNzI18n(vi_VN),
    provideNzDateFnsAdapter(),
    // Bật chọn số dòng/trang cho mọi nz-table; danh sách giá trị xem core/config/table-pagination.config.ts
    provideNzConfig({ table: { nzShowSizeChanger: true } }),
    // Đăng ký icon tĩnh (offline) để tránh IconService gọi HTTP ra ngoài lấy SVG -> 404
    // trong môi trường intranet không có internet. Xem core/config/nz-icons.config.ts.
    provideNzIcons(NZ_ICON_LIST),
    // Giữ nguyên instance component (state) của các tab route khi chuyển qua lại giữa các tab -
    // xem shell/tab-route-reuse.strategy.ts + shell/tab.service.ts.
    { provide: RouteReuseStrategy, useClass: TabRouteReuseStrategy },
    // Router dùng APP_BASE_HREF = "/" để sinh URL (khớp với route Java: /dashboard, /login...),
    // tách riêng khỏi <base href="/ng/"> trong index.html (chỉ dùng để load file JS/CSS đã build).
    { provide: APP_BASE_HREF, useValue: '/' },
  ],
};
