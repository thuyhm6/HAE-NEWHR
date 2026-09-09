import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation, computed, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { select } from 'd3-selection';
import { ZoomBehavior, zoom, zoomIdentity } from 'd3-zoom';
import 'd3-transition';

import { I18nService } from '../../../i18n/i18n.service';
import { OrgChartCardComponent } from './org-chart-card.component';
import { OrgLayoutLink, OrgLayoutNode, computeOrgChartLayout } from './org-chart-layout';
import { OrgInfoService, OrgNodeRow } from './org-info.service';

const SCALE_EXTENT: [number, number] = [0.2, 2.5];

/** Duyệt đệ quy toàn bộ cây, gom id của các node thỏa predicate (và có con) vào `out` - dùng để tính
 *  trạng thái thu gọn mặc định lúc tải xong / khi bấm "Thu gọn". */
function collectCollapsibleIds(nodes: OrgNodeRow[], predicate: (n: OrgNodeRow) => boolean, out: Set<string>): void {
  nodes.forEach((n) => {
    if (n.children?.length) {
      if (predicate(n)) out.add(n.id);
      collectCollapsibleIds(n.children, predicate, out);
    }
  });
}

/**
 * Sơ đồ tổ chức dạng biểu đồ trực quan (viewOrgInfo), zoomable/pannable bằng D3 - port từ
 * HVV-VHR/frontend-ng/src/app/view-org-info (xem ghi chú chi tiết trong org-chart-layout.ts và
 * org-chart-card.component.ts). Gọi lại nguyên API JSON đã có sẵn ở CurrentOrgController#getVisualTree
 * (xem OrgInfoService) - không đổi backend.
 *
 * Khác bản CSS thuần trước đây (nested <ul>/<li> đệ quy qua OrgNodeComponent + OrgChartStateService, chỉ
 * cuộn ngang): tọa độ từng node được tính sẵn bằng d3-hierarchy/d3-tree (org-chart-layout.ts), render
 * phẳng bằng *ngFor qua OrgChartCardComponent định vị tuyệt đối, đường nối vẽ bằng <svg><path> (elbow),
 * và có pan/zoom qua d3-zoom. CSS .tf-nc/.dept-node/.manager-info/... giữ nguyên, chỉ bỏ phần vẽ đường
 * nối bằng ::before/::after. ViewEncapsulation.None vì OrgChartCardComponent là component con dùng
 * chung các class này.
 *
 * d3-zoom được gắn trong NgZone.runOutsideAngular vì app dùng zone.js - nếu không, mỗi tick wheel/drag/
 * transition sẽ kích hoạt 1 vòng change detection của toàn bộ cây, rất tốn. Transform (translate/scale)
 * được set thẳng vào style của #world bằng DOM API trong callback 'zoom', không qua signal - chỉ có
 * layout (nodes/links, đổi khi treeData/collapsedIds đổi) mới đi qua Angular template.
 */
@Component({
  selector: 'app-org-info',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzCardModule, NzIconModule, OrgChartCardComponent],
  templateUrl: './org-info.component.html',
  styleUrl: './org-info.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrgInfoComponent implements OnInit, OnDestroy {
  protected readonly roots = signal<OrgNodeRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal(false);
  protected readonly collapsedIds = signal<Set<string>>(new Set());

  protected readonly layout = computed(() => computeOrgChartLayout(this.roots(), this.collapsedIds()));

  /** Truyền thẳng làm callback xuống OrgChartCardComponent (mọi card dùng chung 1 hàm) thay vì
   *  bắn Output bong bóng lên qua từng cấp. */
  protected readonly toggleNode = (id: string): void => {
    const next = new Set(this.collapsedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.collapsedIds.set(next);
  };

  private viewportEl?: HTMLDivElement;
  private worldEl?: HTMLDivElement;
  private zoomBehavior?: ZoomBehavior<HTMLDivElement, unknown>;

  @ViewChild('viewport') set viewportRef(ref: ElementRef<HTMLDivElement> | undefined) {
    this.viewportEl = ref?.nativeElement;
    this.trySetupZoom();
  }

  @ViewChild('world') set worldRef(ref: ElementRef<HTMLDivElement> | undefined) {
    this.worldEl = ref?.nativeElement;
    this.trySetupZoom();
  }

  constructor(
    private readonly service: OrgInfoService,
    private readonly zone: NgZone,
    protected readonly i18n: I18nService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadTree();
  }

  ngOnDestroy(): void {
    if (this.viewportEl) select(this.viewportEl).on('.zoom', null);
  }

  protected async loadTree(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);
    try {
      const data = await this.service.getVisualTree();
      const list = data ?? [];
      this.roots.set(list);
      const initial = new Set<string>();
      collectCollapsibleIds(list, (n) => n.level >= 2, initial);
      this.collapsedIds.set(initial);
    } catch {
      this.roots.set([]);
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected expandAll(): void {
    this.collapsedIds.set(new Set());
  }

  protected collapseAll(): void {
    const next = new Set<string>();
    collectCollapsibleIds(this.roots(), (n) => n.level >= 1, next);
    this.collapsedIds.set(next);
  }

  protected trackNode(_index: number, n: OrgLayoutNode): string {
    return n.data.id;
  }

  protected trackLink(_index: number, l: OrgLayoutLink): string {
    return l.id;
  }

  protected zoomIn(): void {
    if (!this.viewportEl || !this.zoomBehavior) return;
    this.zone.runOutsideAngular(() => {
      select(this.viewportEl!).transition().duration(300).call(this.zoomBehavior!.scaleBy, 1.2);
    });
  }

  protected zoomOut(): void {
    if (!this.viewportEl || !this.zoomBehavior) return;
    this.zone.runOutsideAngular(() => {
      select(this.viewportEl!).transition().duration(300).call(this.zoomBehavior!.scaleBy, 1 / 1.2);
    });
  }

  protected resetZoom(): void {
    this.zone.runOutsideAngular(() => this.fitToViewport(true));
  }

  /** Gắn d3-zoom vào #viewport khi cả 2 element (viewport + world) đã tồn tại trong DOM - chỉ xảy ra
   *  đúng 1 lần cho mỗi lần *ngIf chuyển từ ẩn sang hiện (load xong lần đầu, hoặc bấm "Thử lại" sau
   *  lỗi), KHÔNG chạy lại mỗi khi roots/collapsedIds đổi trong lúc chart đã hiển thị - nếu không mỗi
   *  lần expand/collapse 1 node sẽ tự nhảy về fit view, phá pan/zoom hiện tại của user. */
  private trySetupZoom(): void {
    if (!this.viewportEl || !this.worldEl || this.zoomBehavior) return;
    const worldEl = this.worldEl;
    this.zone.runOutsideAngular(() => {
      this.zoomBehavior = zoom<HTMLDivElement, unknown>()
        .scaleExtent(SCALE_EXTENT)
        .clickDistance(10)
        .on('zoom', (event) => {
          worldEl.style.transform = `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`;
        });
      select(this.viewportEl!).call(this.zoomBehavior).on('dblclick.zoom', null);
      this.fitToViewport(false);
    });
  }

  private fitToViewport(animate: boolean): void {
    if (!this.viewportEl || !this.zoomBehavior) return;
    const { width, height } = this.layout();
    if (width === 0 || height === 0) return;

    const vpWidth = this.viewportEl.clientWidth;
    const vpHeight = this.viewportEl.clientHeight;
    const rawScale = Math.min(vpWidth / width, vpHeight / height);
    const scale = Math.max(SCALE_EXTENT[0], Math.min(SCALE_EXTENT[1], rawScale));
    const tx = (vpWidth - width * scale) / 2;
    const ty = (vpHeight - height * scale) / 2;
    const transform = zoomIdentity.translate(tx, ty).scale(scale);

    const selection = select(this.viewportEl);
    if (animate) selection.transition().duration(300).call(this.zoomBehavior.transform, transform);
    else selection.call(this.zoomBehavior.transform, transform);
  }
}
