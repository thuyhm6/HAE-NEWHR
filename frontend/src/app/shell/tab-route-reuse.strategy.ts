import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

/**
 * Giữ nguyên instance component (state, scroll, filter đang nhập...) của các route con trong
 * AppShellComponent khi người dùng chuyển qua lại giữa các tab - thay vì Angular hủy/tạo lại
 * component mỗi lần điều hướng như mặc định. Chỉ áp dụng cho route lá có path cụ thể (dashboard,
 * ess/viewDept/ManageEmpPositionInfoList...), KHÔNG áp dụng cho route rỗng (AppShellComponent) hay
 * /login.
 */
export class TabRouteReuseStrategy implements RouteReuseStrategy {
  private readonly handles = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.isCacheable(route);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!this.isCacheable(route)) return;
    const key = this.key(route);
    if (handle) {
      this.handles.set(key, handle);
    } else {
      this.handles.delete(key);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.isCacheable(route) && this.handles.has(this.key(route));
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!this.isCacheable(route)) return null;
    return this.handles.get(this.key(route)) ?? null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private isCacheable(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    return !!path && path !== 'login';
  }

  private key(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map((r) => r.url.map((seg) => seg.path).join('/'))
      .filter(Boolean)
      .join('/');
  }
}
