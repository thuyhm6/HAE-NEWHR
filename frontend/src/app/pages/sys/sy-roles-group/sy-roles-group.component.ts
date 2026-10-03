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
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { SyMenuTreeSource, SyRoleRow, SyRolesGroupService } from './sy-roles-group.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Quản lý Role + Phân quyền Menu (viewRolesGroup) - xem ghi chú trong
 * sy-roles-group.service.ts.
 */
@Component({
  selector: 'app-sy-roles-group',
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
    NzTreeModule,
  ],
  templateUrl: './sy-roles-group.component.html',
  styleUrl: './sy-roles-group.component.scss',
})
export class SyRolesGroupComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(SyRolesGroupService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly rows = signal<SyRoleRow[]>([]);
  protected readonly loading = signal(false);

  protected readonly treeLoading = signal(false);
  protected readonly treeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly selectedRoleNo = signal<string | null>(null);
  protected readonly selectedLabel = signal<string | null>(null);
  protected readonly checkedKeys = signal<NzTreeNodeKey[]>([]);
  protected readonly savingRelations = signal(false);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formRoleNo = signal('');
  protected readonly formRoleId = signal('');
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formSysType = signal('0');
  protected readonly formOrderNo = signal<number | null>(0);
  protected readonly formActivity = signal(true);

  readonly exportUrl = this.service.exportUrl;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const flat = await this.service.getMenuTree();
      this.treeNodes.set(this.buildTree(flat));
    } catch {
      this.treeNodes.set([]);
    }
    await this.search();
  }

  private buildTree(flat: SyMenuTreeSource[]): NzTreeNodeOptions[] {
    const idSet = new Set(flat.map((item) => item.menuNo));
    const nodeMap = new Map<string, NzTreeNodeOptions & { children: NzTreeNodeOptions[] }>();
    flat.forEach((item) => {
      if (!item.menuNo) return;
      nodeMap.set(item.menuNo, { key: item.menuNo, title: item.nameVi || item.menuCode || item.menuNo, children: [], isLeaf: true });
    });
    const roots: NzTreeNodeOptions[] = [];
    flat.forEach((item) => {
      if (!item.menuNo) return;
      const node = nodeMap.get(item.menuNo)!;
      const parentId = item.menuParentNo;
      if (!parentId || parentId === 'ROOT' || !idSet.has(parentId)) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(parentId);
        if (parent) {
          parent.children.push(node);
          parent.isLeaf = false;
        } else {
          roots.push(node);
        }
      }
    });
    return roots;
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

  async selectRole(row: SyRoleRow): Promise<void> {
    if (!row.roleNo) return;
    this.selectedRoleNo.set(row.roleNo);
    this.selectedLabel.set(row.nameVi || row.roleNo);
    this.checkedKeys.set([]);
    try {
      const detail = await this.service.getDetail(row.roleNo);
      this.checkedKeys.set((detail?.roleRelations ?? []).map((r) => r.menuNo));
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async saveRelations(): Promise<void> {
    const roleNo = this.selectedRoleNo();
    if (!roleNo) return;
    this.savingRelations.set(true);
    try {
      const roleRelations = this.checkedKeys().map((menuNo) => ({
        menuNo: String(menuNo),
        selectr: '1',
        insertr: '1',
        updater: '1',
        deleter: '1',
      }));
      const res = await this.service.saveRelations(roleNo, roleRelations);
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
    this.formRoleNo.set('');
    this.formRoleId.set('');
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formSysType.set('0');
    this.formOrderNo.set(0);
    this.formActivity.set(true);
    this.formVisible.set(true);
  }

  async openEditModal(row: SyRoleRow, event: Event): Promise<void> {
    event.stopPropagation();
    if (!row.roleNo) return;
    try {
      const detail = await this.service.getDetail(row.roleNo);
      this.formIsAdd.set(false);
      this.formRoleNo.set(detail.roleNo ?? '');
      this.formRoleId.set(detail.roleId ?? '');
      this.formNameVi.set(detail.nameVi ?? '');
      this.formNameEn.set(detail.nameEn ?? '');
      this.formNameZh.set(detail.nameZh ?? '');
      this.formNameKo.set(detail.nameKo ?? '');
      this.formSysType.set(detail.sysType ?? '0');
      this.formOrderNo.set(detail.orderNo ?? 0);
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
        roleNo: this.formRoleNo() || undefined,
        roleId: this.formRoleId() || undefined,
        nameVi: this.formNameVi().trim(),
        nameEn: this.formNameEn(),
        nameZh: this.formNameZh(),
        nameKo: this.formNameKo(),
        sysType: this.formSysType(),
        orderNo: this.formOrderNo() ?? 0,
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

  deleteRow(row: SyRoleRow, event: Event): void {
    event.stopPropagation();
    if (!row.roleNo) return;
    const roleNo = row.roleNo;
    this.modal.confirm({
      nzTitle: this.i18n.t('sys.role.viewRolesGroup.msg.confirmDelete', 'Bạn có chắc muốn xóa nhóm quyền này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(roleNo);
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
            if (this.selectedRoleNo() === roleNo) {
              this.selectedRoleNo.set(null);
              this.selectedLabel.set(null);
              this.checkedKeys.set([]);
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
