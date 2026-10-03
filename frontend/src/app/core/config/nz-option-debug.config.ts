import { NzOptionItemComponent } from 'ng-zorro-antd/select';

/**
 * Kiểu nội bộ tối thiểu của NzOptionItemComponent (component mà NG-ZORRO dùng để
 * render từng <li> option trong dropdown của mọi nz-select/nz-option trong app).
 */
interface NzOptionItemInternal {
  el: HTMLElement;
  value: unknown;
  ngOnChanges(changes: unknown): void;
}

/**
 * Monkey-patch NzOptionItemComponent để gán thêm attribute data-nz-value (= nzValue)
 * lên phần tử <li> hiển thị trong dropdown, phục vụ xem value khi bấm F12.
 *
 * Lý do patch tại đây thay vì sửa từng file dùng nz-option: dropdown của nz-select
 * được NG-ZORRO render bằng 1 component nội bộ dùng chung (NzOptionItemComponent),
 * nzValue không được đưa ra DOM nên không thể xem qua F12. Patch 1 lần tại bootstrap
 * áp dụng cho TẤT CẢ nz-option trong toàn bộ dự án, tránh phải sửa lặp lại hàng trăm
 * file template đang dùng nz-option (tuân thủ quy tắc ưu tiên tái sử dụng code).
 * Đây là customization runtime (không đụng vào node_modules) nên không mất khi chạy
 * lại npm install.
 */
export function patchNzOptionDebugValueAttribute(): void {
  const proto = NzOptionItemComponent.prototype as unknown as NzOptionItemInternal;
  const originalNgOnChanges = proto.ngOnChanges;

  proto.ngOnChanges = function (this: NzOptionItemInternal, changes: unknown): void {
    originalNgOnChanges.call(this, changes);
    if (this.el) {
      this.el.setAttribute('data-nz-value', this.value == null ? '' : String(this.value));
    }
  };
}
