import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var jQuery: any;

let counter = 0;

/**
 * Hiển thị 1 trang Thymeleaf CHƯA migrate như 1 tab trong shell Angular - port lại đúng cơ chế của
 * innerTab.js (loadTabContent/handleTabScripts): fetch nguyên trang bằng X-Requested-With để server
 * biết là AJAX, lấy phần nội dung thật (#default-content - phần th:replace="~{::content}" trong
 * layout/master.html), inject trực tiếp bằng nativeElement.innerHTML (KHÔNG qua binding [innerHTML]
 * của Angular vì DomSanitizer sẽ xóa mất các thuộc tính onclick="..."/data-bs-* mà các trang cũ dùng
 * rất nhiều), rồi chạy lại các <script>/<style> khai báo trong <template id="fragmentScripts">.
 *
 * Nhiều trang cũ có script tự scope theo window._currentTabId (vd:
 * function vere$(sel){ return $('#' + window._currentTabId).find(sel); }) - phải gán biến này đúng
 * bằng id của phần tử host trước khi chạy script, nếu không các script đó sẽ tìm nhầm phần tử
 * '#default-content' (không tồn tại trong Angular) và lặng lẽ không chạy được (không lỗi, chỉ đứng
 * yên ở spinner "Đang tải...").
 *
 * Giới hạn đã biết (giống HVV-VHR): các trang phụ thuộc DataTables/jsTree/toastr/daterangepicker/
 * Quill... (nạp qua layout/master.html bản Thymeleaf) sẽ KHÔNG chạy được vì các thư viện này chưa
 * được nạp global ở index.html Angular - chỉ mới nạp jQuery. Cần bổ sung thêm nếu gặp trang cụ thể
 * cần các thư viện này.
 */
@Component({
  selector: 'app-external-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading()" class="text-center text-muted py-5">
      <span class="spinner-border spinner-border-sm me-2"></span>Đang tải...
    </div>
    <div *ngIf="error()" class="alert alert-danger">Lỗi tải nội dung: {{ error() }}</div>
  `,
})
export class ExternalTabComponent implements OnInit, OnChanges {
  @Input({ required: true }) url!: string;
  @Input() reloadToken = 0;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly hostId = 'ext-tab-' + counter++;
  private initialized = false;

  constructor(private readonly hostEl: ElementRef<HTMLDivElement>) {}

  ngOnInit(): void {
    this.hostEl.nativeElement.id = this.hostId;
    this.hostEl.nativeElement.classList.add('external-tab-host');
    this.initialized = true;
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['reloadToken'] && !changes['reloadToken'].firstChange) {
      this.load();
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.cleanupPreviousHandlers();

    try {
      const res = await fetch(this.url, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'text/html' },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('#default-content') || doc.querySelector('.container-fluid') || doc.body;

      this.loading.set(false);
      this.hostEl.nativeElement.innerHTML = content.innerHTML;
      this.runFragmentScripts(doc);
    } catch (e: any) {
      this.loading.set(false);
      this.error.set(e?.message || 'Không xác định');
    }
  }

  /** Gỡ handler jQuery cũ trước khi nạp lại nội dung mới - tránh cộng dồn handler qua mỗi lần load lại (giống innerTab.js). */
  private cleanupPreviousHandlers(): void {
    if (typeof jQuery !== 'undefined') {
      jQuery(this.hostEl.nativeElement).find('*').off();
      jQuery(this.hostEl.nativeElement).off();
    }
  }

  private runFragmentScripts(doc: Document): void {
    const template = doc.querySelector('#fragmentScripts') as HTMLTemplateElement | null;
    if (!template) return;

    const styles = Array.from(template.content.querySelectorAll('style'));
    styles.forEach((style) => {
      const el = document.createElement('style');
      el.textContent = style.textContent;
      this.hostEl.nativeElement.appendChild(el);
    });

    const scripts = Array.from(template.content.querySelectorAll('script'));
    if (scripts.length === 0) return;

    const setupScript = document.createElement('script');
    setupScript.textContent =
      'window._currentTabUrl = ' + JSON.stringify(this.url) + '; window._currentTabId = ' + JSON.stringify(this.hostId) + ';';
    this.hostEl.nativeElement.appendChild(setupScript);

    scripts.forEach((script) => {
      const el = document.createElement('script');
      Array.from(script.attributes).forEach((attr) => el.setAttribute(attr.name, attr.value));
      el.textContent = script.textContent;
      this.hostEl.nativeElement.appendChild(el);
    });
  }
}
