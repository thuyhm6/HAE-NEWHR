import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { OrgNodeRow } from './org-info.service';

const DEFAULT_AVATAR = '/assets/images/users/dummy-avatar.jpg';

/**
 * 1 card trong sơ đồ tổ chức zoomable/pannable (org-info) - thay cho OrgNodeComponent đệ quy cũ (dựng
 * <li>/<ul> lồng nhau bằng CSS). Component này KHÔNG còn đệ quy: tọa độ x/y của từng node đã được tính
 * sẵn ở org-chart-layout.ts (d3.hierarchy/d3.tree), OrgInfoComponent chỉ *ngFor phẳng qua danh sách node
 * và định vị từng card bằng [style.transform] - xem org-info.component.html.
 *
 * Không có file .scss riêng: style .tf-nc/.dept-node/.emp-node/.manager-info/... nằm ở OrgInfoComponent
 * (ViewEncapsulation.None) để áp dụng xuyên qua component con này.
 */
@Component({
  selector: 'app-org-chart-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './org-chart-card.component.html',
})
export class OrgChartCardComponent {
  @Input({ required: true }) node!: OrgNodeRow;
  @Input({ required: true }) hasChildren!: boolean;
  @Input({ required: true }) collapsed!: boolean;
  @Input({ required: true }) toggleFn!: (id: string) => void;

  readonly defaultAvatar = DEFAULT_AVATAR;

  onToggle(): void {
    if (this.hasChildren) this.toggleFn(this.node.id);
  }

  /** Chỉ fallback về defaultAvatar đúng 1 lần/thẻ <img> (đánh dấu qua dataset) - nếu không, khi chính
   *  defaultAvatar cũng lỗi (404/mất mạng...), việc gán lại y hệt src cũ sẽ khiến trình duyệt tải lại
   *  và bắn 'error' lần nữa, tạo vòng lặp vô hạn liên tục gọi request/ghi log ở backend. */
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['avatarFallback'] === '1') return;
    img.dataset['avatarFallback'] = '1';
    img.src = this.defaultAvatar;
  }
}
