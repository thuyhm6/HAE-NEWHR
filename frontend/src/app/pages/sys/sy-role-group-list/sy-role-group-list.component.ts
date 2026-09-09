import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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
import { SyRoleGroupRow, SyRoleGroupListService, SyRoleOption } from './sy-role-group-list.service';

/**
 * Danh sách Nhóm quyền (viewSyRolesGroupList) - xem ghi chú trong
 * sy-role-group-list.service.ts.
 */
@Component({
  selector: 'app-sy-role-group-list',
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
  templateUrl: './sy-role-group-list.component.html',
  styleUrl: './sy-role-group-list.component.scss',
})
export class SyRoleGroupListComponent implements OnInit {
  private readonly service = inject(SyRoleGroupListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly rows = signal<SyRoleGroupRow[]>([]);
  protected readonly loading = signal(false);

  protected readonly allRoles = signal<SyRoleOption[]>([]);
  protected readonly selectedGroupNo = signal<string | null>(null);
  protected readonly selectedLabel = signal<string | null>(null);
  protected readonly checkedRoles = signal<Set<string>>(new Set());
  protected readonly savingRelations = signal(false);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formRoleGroupNo = signal('');
  protected readonly formRoleGroupId = signal('');
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formSysType = signal(0);
  protected readonly formOrderNo = signal<number | null>(0);
  protected readonly formJoinDefault = signal(false);
  protected readonly formActivity = signal(true);

  readonly exportUrl = this.service.exportUrl;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.allRoles.set(await this.service.getAllRoles());
    } catch {
      this.allRoles.set([]);
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

  async selectGroup(row: SyRoleGroupRow): Promise<void> {
    if (!row.roleGroupNo) return;
    this.selectedGroupNo.set(row.roleGroupNo);
    this.selectedLabel.set(row.nameVi || row.roleGroupNo);
    this.checkedRoles.set(new Set());
    try {
      const detail = await this.service.getDetail(row.roleGroupNo);
      this.checkedRoles.set(new Set(detail?.roleNos ?? []));
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  isRoleChecked(roleNo?: string): boolean {
    return !!roleNo && this.checkedRoles().has(roleNo);
  }

  toggleRole(roleNo: string | undefined, checked: boolean): void {
    if (!roleNo) return;
    const set = new Set(this.checkedRoles());
    if (checked) set.add(roleNo);
    else set.delete(roleNo);
    this.checkedRoles.set(set);
  }

  async saveRelations(): Promise<void> {
    const roleGroupNo = this.selectedGroupNo();
    if (!roleGroupNo) return;
    this.savingRelations.set(true);
    try {
      const res = await this.service.saveRelations(roleGroupNo, [...this.checkedRoles()]);
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

  openAddModal(): void {
    this.formIsAdd.set(true);
    this.formRoleGroupNo.set('');
    this.formRoleGroupId.set('');
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formSysType.set(0);
    this.formOrderNo.set(0);
    this.formJoinDefault.set(false);
    this.formActivity.set(true);
    this.formVisible.set(true);
  }

  async openEditModal(row: SyRoleGroupRow, event: Event): Promise<void> {
    event.stopPropagation();
    if (!row.roleGroupNo) return;
    try {
      const detail = await this.service.getDetail(row.roleGroupNo);
      this.formIsAdd.set(false);
      this.formRoleGroupNo.set(detail.roleGroupNo ?? '');
      this.formRoleGroupId.set(detail.roleGroupId ?? '');
      this.formNameVi.set(detail.nameVi ?? '');
      this.formNameEn.set(detail.nameEn ?? '');
      this.formNameZh.set(detail.nameZh ?? '');
      this.formNameKo.set(detail.nameKo ?? '');
      this.formSysType.set(detail.sysType ?? 0);
      this.formOrderNo.set(detail.orderNo ?? 0);
      this.formJoinDefault.set(detail.joinDefault === 1);
      this.formActivity.set(detail.activity !== 0);
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async saveForm(): Promise<void> {
    if (!this.formNameVi().trim()) {
      this.message.warning(this.i18n.t('sys.codeManage.validateNameViRequired', 'Vui lòng nhập Tên Tiếng Việt!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        roleGroupNo: this.formRoleGroupNo() || undefined,
        roleGroupId: this.formRoleGroupId() || undefined,
        nameVi: this.formNameVi().trim(),
        nameEn: this.formNameEn(),
        nameZh: this.formNameZh(),
        nameKo: this.formNameKo(),
        sysType: this.formSysType(),
        orderNo: this.formOrderNo() ?? 0,
        joinDefault: this.formJoinDefault() ? 1 : 0,
        activity: this.formActivity() ? 1 : 0,
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteRow(row: SyRoleGroupRow, event: Event): void {
    event.stopPropagation();
    if (!row.roleGroupNo) return;
    const roleGroupNo = row.roleGroupNo;
    this.modal.confirm({
      nzTitle: this.i18n.t('sys.role.viewRolesGroupList.msg.confirmDelete', 'Bạn có chắc muốn xóa nhóm quyền này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(roleGroupNo);
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
            if (this.selectedGroupNo() === roleGroupNo) {
              this.selectedGroupNo.set(null);
              this.selectedLabel.set(null);
              this.checkedRoles.set(new Set());
            }
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
