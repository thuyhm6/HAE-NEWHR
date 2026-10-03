import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { SyLoginUserRow, SyLoginUserService, SyRoleGroupOption } from './sy-login-user.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const DEFAULT_PASSWORD = '123456A@';

/**
 * Quản lý người dùng đăng nhập (viewLoginUser) - xem ghi chú trong
 * sy-login-user.service.ts.
 */
@Component({
  selector: 'app-sy-login-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzTableModule],
  templateUrl: './sy-login-user.component.html',
  styleUrl: './sy-login-user.component.scss',
})
export class SyLoginUserComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(SyLoginUserService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly rows = signal<SyLoginUserRow[]>([]);
  protected readonly loading = signal(false);

  protected readonly allRoleGroups = signal<SyRoleGroupOption[]>([]);
  protected readonly selectedUserNo = signal<string | null>(null);
  protected readonly selectedLabel = signal<string | null>(null);
  protected readonly checkedRoleGroups = signal<Set<string>>(new Set());
  protected readonly savingRelations = signal(false);

  protected readonly resetModalVisible = signal(false);
  protected readonly resetSaving = signal(false);
  protected readonly resetUserNo = signal('');
  protected readonly resetUserName = signal('');
  protected readonly resetNewPassword = signal(DEFAULT_PASSWORD);

  readonly exportUrl = this.service.exportUrl;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.allRoleGroups.set(await this.service.getAllRoleGroups());
    } catch {
      this.allRoleGroups.set([]);
    }
    await this.search();
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

  clearSearch(): void {
    this.searchKeyword.set('');
    this.search();
  }

  displayName(row: SyLoginUserRow): string {
    return row.empName || row.userName || '';
  }

  async selectUser(row: SyLoginUserRow): Promise<void> {
    if (!row.userNo) return;
    this.selectedUserNo.set(row.userNo);
    this.selectedLabel.set(row.userName || row.userNo);
    this.checkedRoleGroups.set(new Set());
    try {
      const detail = await this.service.getDetail(row.userNo);
      this.checkedRoleGroups.set(new Set(detail?.roleGroupNos ?? []));
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  isRoleGroupChecked(roleGroupNo?: string): boolean {
    return !!roleGroupNo && this.checkedRoleGroups().has(roleGroupNo);
  }

  toggleRoleGroup(roleGroupNo: string | undefined, checked: boolean): void {
    if (!roleGroupNo) return;
    const set = new Set(this.checkedRoleGroups());
    if (checked) set.add(roleGroupNo);
    else set.delete(roleGroupNo);
    this.checkedRoleGroups.set(set);
  }

  async saveRelations(): Promise<void> {
    const userNo = this.selectedUserNo();
    if (!userNo) return;
    this.savingRelations.set(true);
    try {
      const res = await this.service.saveRelations(userNo, [...this.checkedRoleGroups()]);
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.savingRelations.set(false);
    }
  }

  openResetPasswordModal(row: SyLoginUserRow, event: Event): void {
    event.stopPropagation();
    if (!row.userNo) return;
    this.resetUserNo.set(row.userNo);
    this.resetUserName.set(row.userName ?? '');
    this.resetNewPassword.set(DEFAULT_PASSWORD);
    this.resetModalVisible.set(true);
  }

  async confirmReset(): Promise<void> {
    if (!this.resetNewPassword().trim()) {
      this.message.warning(this.i18n.t('sys.codeManage.validateNameViRequired', 'Vui lòng nhập đầy đủ thông tin bắt buộc!'));
      return;
    }
    this.resetSaving.set(true);
    try {
      const res = await this.service.resetPassword(this.resetUserNo(), this.resetNewPassword().trim());
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.resetModalVisible.set(false);
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.resetSaving.set(false);
    }
  }
}
