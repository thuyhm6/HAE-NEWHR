import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MenuNode } from '../core/services/menu.service';
import { MenuAccordionService } from './menu-accordion.service';

const DIACRITIC_CODE_MIN = 0x0300;
const DIACRITIC_CODE_MAX = 0x036f;

/** Bỏ dấu tiếng Việt + chuyển chữ thường, dùng để so khớp từ khoá trong resolveParentIcon()
 *  không phụ thuộc vào cách gõ dấu của tên menu trong CSDL. Duyệt từng ký tự sau khi tách tổ hợp
 *  NFD (thay vì regex range dấu tổ hợp) để tránh sai lệch mã ký tự khi lưu file. */
function normalizeVi(text: string): string {
  const decomposed = (text ?? '').normalize('NFD');
  let result = '';
  for (const ch of decomposed) {
    const code = ch.charCodeAt(0);
    if (code >= DIACRITIC_CODE_MIN && code <= DIACRITIC_CODE_MAX) continue;
    result += ch;
  }
  return result.replace(/đ/gi, 'd').toLowerCase();
}

/** Bảng ánh xạ từ khoá (không dấu) trong tên menu cha sang icon antd phù hợp ngữ nghĩa - xét theo
 *  thứ tự khai báo, khớp từ khoá nào trước dùng icon đó. Bao phủ các nhóm nghiệp vụ chính của hệ
 *  thống (tổ chức, chấm công, lương, đánh giá, tuyển dụng, hệ thống...) suy ra từ tên các module
 *  (org/ar/pa/evs/hrm/ess/sys) - fallback "folder-open" cho menu chưa xác định được nhóm. */
const PARENT_ICON_RULES: ReadonlyArray<{ keywords: string[]; icon: string }> = [
  { keywords: ['to chuc', 'co cau', 'phong ban', 'don vi'], icon: 'apartment' },
  { keywords: ['cong ty'], icon: 'bank' },
  { keywords: ['cham cong', 'ca lam', 'lich lam', 'lich su dung'], icon: 'field-time' },
  { keywords: ['tang ca'], icon: 'clock-circle' },
  { keywords: ['nghi phep', 'ngay nghi', 'nghi le', 'ngay le'], icon: 'calendar' },
  { keywords: ['luong', 'thanh toan', 'tra luong'], icon: 'dollar' },
  { keywords: ['danh gia', 'xep loai', 'kpi'], icon: 'trophy' },
  { keywords: ['tuyen dung'], icon: 'solution' },
  { keywords: ['hop dong'], icon: 'file-protect' },
  { keywords: ['dao tao'], icon: 'read' },
  { keywords: ['bao cao', 'thong ke'], icon: 'bar-chart' },
  { keywords: ['quyen', 'vai tro', 'nguoi dung', 'tai khoan'], icon: 'safety-certificate' },
  { keywords: ['thong bao', 'gop y', 'phan hoi'], icon: 'notification' },
  { keywords: ['ngon ngu', 'da ngon ngu'], icon: 'global' },
  { keywords: ['tu phuc vu'], icon: 'contacts' },
  { keywords: ['nhan vien', 'nhan su', 'ho so', 'ly lich'], icon: 'idcard' },
  { keywords: ['cai dat', 'thiet lap', 'he thong', 'tham so', 'danh muc'], icon: 'setting' },
];

function resolveParentIcon(menuName: string): string {
  const normalized = normalizeVi(menuName ?? '');
  const rule = PARENT_ICON_RULES.find((r) => r.keywords.some((k) => normalized.includes(k)));
  return rule?.icon ?? 'folder-open';
}

/**
 * Render đệ quy 1 nhánh menu (item lá hoặc nz-submenu có children) cho
 * sidebar Angular (AppShellComponent), tái dùng cấu trúc cây MenuDTO từ
 * GET /api/dashboard/menu-tree.
 *
 * Hành vi accordion: bấm mở 1 submenu sẽ tự thu gọn mọi submenu khác (khác nhánh cha) thông qua
 * MenuAccordionService dùng chung giữa các instance đệ quy - xem [[menu-accordion.service]].
 *
 * Hành vi highlight: `activePath` (truyền từ AppShellComponent, gồm menuNo của toàn bộ đường đi
 * root -> menu lá đang active) quyết định menu lá nào được đánh dấu nzSelected và menu cha (nz-submenu)
 * nào trên đường đi đó được tô nền active - cùng tông màu với hover (xem app-shell.component.scss).
 */
@Component({
  selector: 'app-menu-node',
  standalone: true,
  imports: [CommonModule, NzMenuModule, NzIconModule],
  template: `
    @for (node of nodes; track node.menuNo) {
      @if (node.children && node.children.length) {
        <li
          nz-submenu
          [nzTitle]="node.menuName"
          [nzIcon]="resolveParentIcon(node.menuName)"
          [class.hae-menu-node-active]="activePath.includes(node.menuNo)"
          [attr.data-menu-url]="node.menuUrl"
          [attr.data-menu-no]="node.menuNo"
          [nzOpen]="accordion.isOpen(node.menuNo)"
          (nzOpenChange)="accordion.onOpenChange(ancestors, node.menuNo, $event)"
        >
          <ul>
            <app-menu-node
              [nodes]="node.children"
              [ancestors]="[...ancestors, node.menuNo]"
              [activePath]="activePath"
              (select)="select.emit($event)"
            ></app-menu-node>
          </ul>
        </li>
      } @else {
        <li
          nz-menu-item
          [nzSelected]="activePath[activePath.length - 1] === node.menuNo"
          [attr.data-menu-url]="node.menuUrl"
          [attr.data-menu-no]="node.menuNo"
          (click)="select.emit(node)"
        >
          <i nz-icon nzType="file-text" nzTheme="outline"></i>
          <span>{{ node.menuName }}</span>
        </li>
      }
    }
  `,
})
export class MenuNodeComponent {
  protected readonly accordion = inject(MenuAccordionService);
  protected readonly resolveParentIcon = resolveParentIcon;

  @Input() nodes: MenuNode[] = [];
  /** Danh sách menuNo của các submenu cha (từ root), dùng để MenuAccordionService biết nhánh nào
   *  cần giữ mở khi 1 submenu con được bấm mở. */
  @Input() ancestors: string[] = [];
  /** menuNo của toàn bộ đường đi root -> menu lá đang active (breadcrumbPath ở AppShellComponent),
   *  dùng để highlight menu lá (nzSelected) và menu cha chứa nó (hae-menu-node-active). */
  @Input() activePath: string[] = [];
  @Output() select = new EventEmitter<MenuNode>();
}
