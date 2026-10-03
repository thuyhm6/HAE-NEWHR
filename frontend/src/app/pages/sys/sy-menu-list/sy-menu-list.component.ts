import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { SyMenuListService, SyMenuRow } from './sy-menu-list.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Quản lý Menu hệ thống (viewMenuList) - xem ghi chú trong
 * sy-menu-list.service.ts.
 */
@Component({
  selector: 'app-sy-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './sy-menu-list.component.html',
  styleUrl: './sy-menu-list.component.scss',
})
export class SyMenuListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(SyMenuListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly rows = signal<SyMenuRow[]>([]);
  protected readonly loading = signal(false);

  /** Danh sách đầy đủ (không lọc theo từ khóa) dùng để đổ vào dropdown chọn Menu Cha. */
  protected readonly allMenus = signal<SyMenuRow[]>([]);
  protected readonly parentMenuOptions = computed(() =>
    this.allMenus().filter((m) => !this.formMenuNo() || m.menuNo !== this.formMenuNo())
  );

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formMenuNo = signal('');
  protected readonly formMenuCode = signal('');
  protected readonly formMenuParentNo = signal('');
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formMenuUrl = signal('');
  protected readonly formMenuImg = signal('');
  protected readonly formDepth = signal<number | null>(0);
  protected readonly formOrderNo = signal<number | null>(0);
  protected readonly formActivity = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([this.search(), this.loadAllMenus()]);
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchKeyword()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Tải lại toàn bộ danh sách menu (không lọc) để cập nhật dropdown Menu Cha. */
  async loadAllMenus(): Promise<void> {
    try {
      this.allMenus.set(await this.service.getList(''));
    } catch {
      this.allMenus.set([]);
    }
  }

  clearSearch(): void {
    this.searchKeyword.set('');
    this.search();
  }

  openAddModal(): void {
    this.formIsAdd.set(true);
    this.formMenuNo.set('');
    this.formMenuCode.set('');
    this.formMenuParentNo.set('');
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formMenuUrl.set('');
    this.formMenuImg.set('');
    this.formDepth.set(0);
    this.formOrderNo.set(0);
    this.formActivity.set(true);
    this.formVisible.set(true);
  }

  openEditModal(row: SyMenuRow): void {
    this.formIsAdd.set(false);
    this.formMenuNo.set(row.menuNo ?? '');
    this.formMenuCode.set(row.menuCode ?? '');
    this.formMenuParentNo.set(row.menuParentNo ?? '');
    this.formNameVi.set(row.nameVi ?? '');
    this.formNameEn.set(row.nameEn ?? '');
    this.formNameZh.set(row.nameZh ?? '');
    this.formNameKo.set(row.nameKo ?? '');
    this.formMenuUrl.set(row.menuUrl ?? '');
    this.formMenuImg.set(row.menuImg ?? '');
    this.formDepth.set(row.depth ?? 0);
    this.formOrderNo.set(row.orderNo ?? 0);
    this.formActivity.set(row.activity === 1);
    this.formVisible.set(true);
  }

  async saveForm(): Promise<void> {
    if (!this.formMenuCode().trim() || !this.formNameVi().trim()) {
      this.message.warning(this.i18n.t('sys.codeManage.validateNameViRequired', 'Vui lòng nhập Tên Tiếng Việt!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        menuNo: this.formMenuNo() || undefined,
        menuCode: this.formMenuCode().trim(),
        menuParentNo: this.formMenuParentNo(),
        nameVi: this.formNameVi().trim(),
        nameEn: this.formNameEn(),
        nameZh: this.formNameZh(),
        nameKo: this.formNameKo(),
        menuUrl: this.formMenuUrl(),
        menuImg: this.formMenuImg(),
        depth: this.formDepth() ?? 0,
        orderNo: this.formOrderNo() ?? 0,
        activity: this.formActivity() ? 1 : 0,
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await Promise.all([this.search(), this.loadAllMenus()]);
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteRow(row: SyMenuRow): void {
    if (!row.menuNo) return;
    const menuNo = row.menuNo;
    this.modal.confirm({
      nzTitle: this.i18n.t('sys.basic.viewMenuList.msg.confirmDelete', 'Bạn có chắc muốn xóa menu này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(menuNo);
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
            await Promise.all([this.search(), this.loadAllMenus()]);
          } else {
            this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }

  readonly exportUrl = this.service.exportUrl;
}
