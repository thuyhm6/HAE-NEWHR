import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTreeModule, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { SyMenuParamRow, SyMenuParamService, SyMenuTreeSource, SyCompanyOption } from './sy-menu-param.service';

/**
 * Quản lý tham số Menu theo công ty (viewMenuParamList) - xem ghi chú trong
 * sy-menu-param.service.ts.
 */
@Component({
  selector: 'app-sy-menu-param',
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
  templateUrl: './sy-menu-param.component.html',
  styleUrl: './sy-menu-param.component.scss',
})
export class SyMenuParamComponent implements OnInit {
  private readonly service = inject(SyMenuParamService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly companyOptions = signal<SyCompanyOption[]>([]);
  protected readonly selectedCompanyId = signal<string | null>(null);

  protected readonly treeLoading = signal(false);
  protected readonly treeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchTreeValue = signal('');
  protected readonly selectedMenuNo = signal<string | null>(null);
  protected readonly selectedLabel = signal<string | null>(null);
  protected readonly expandedKeys = signal<NzTreeNodeKey[]>([]);

  protected readonly rows = signal<SyMenuParamRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly uiChecked = signal<Map<string, boolean>>(new Map());
  protected readonly saving = signal(false);

  protected readonly allChecked = computed(() => {
    const list = this.rows();
    return list.length > 0 && list.every((r) => this.isChecked(r));
  });

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formMenuNo = signal('');
  protected readonly formOrderNo = signal<number | null>(0);
  protected readonly formActivity = signal(true);
  protected readonly formIsCanBeBuild = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.companyOptions.set(await this.service.getCompanyList());
    } catch {
      this.companyOptions.set([]);
    }
    await this.loadTree();
  }

  private async loadTree(): Promise<void> {
    this.treeLoading.set(true);
    try {
      const flat = await this.service.getMenuTree();
      this.treeNodes.set(this.buildTree(flat));
    } catch {
      this.treeNodes.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.treeLoading.set(false);
    }
  }

  private buildTree(flat: SyMenuTreeSource[]): NzTreeNodeOptions[] {
    const idSet = new Set(flat.map((item) => item.menuNo));
    const nodeMap = new Map<string, NzTreeNodeOptions & { children: NzTreeNodeOptions[] }>();
    flat.forEach((item) => {
      if (!item.menuNo) return;
      const label = (item.nameVi || item.menuCode || item.menuNo) + (item.menuCode ? ` (${item.menuCode})` : '');
      nodeMap.set(item.menuNo, { key: item.menuNo, title: label, children: [], isLeaf: true });
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

  onTreeClick(event: NzFormatEmitEvent): void {
    const key = event.node?.key;
    if (!key) return;
    this.selectedMenuNo.set(key);
    this.selectedLabel.set(event.node?.title ?? key);
    this.loadTable(key);
  }

  onCompanyChange(cpnyId: string | null): void {
    this.selectedCompanyId.set(cpnyId);
    if (this.selectedMenuNo()) this.loadTable(this.selectedMenuNo()!);
  }

  private async loadTable(parentMenuNo: string): Promise<void> {
    this.loading.set(true);
    this.uiChecked.set(new Map());
    try {
      this.rows.set(await this.service.getList(parentMenuNo, this.selectedCompanyId() ?? ''));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  isChecked(row: SyMenuParamRow): boolean {
    if (!row.menuNo) return false;
    const map = this.uiChecked();
    return map.has(row.menuNo) ? map.get(row.menuNo)! : !!row.assigned;
  }

  toggleChecked(row: SyMenuParamRow, checked: boolean): void {
    if (!row.menuNo) return;
    const map = new Map(this.uiChecked());
    map.set(row.menuNo, checked);
    this.uiChecked.set(map);
  }

  toggleAll(checked: boolean): void {
    const map = new Map(this.uiChecked());
    for (const row of this.rows()) {
      if (row.menuNo) map.set(row.menuNo, checked);
    }
    this.uiChecked.set(map);
  }

  async saveDirty(): Promise<void> {
    const cpnyId = this.selectedCompanyId();
    if (!cpnyId) {
      this.message.warning(this.i18n.t('sys.codeParam.msgSelectCompanyFirst', 'Vui lòng chọn công ty trước'));
      return;
    }
    const tasks: Promise<unknown>[] = [];
    let count = 0;
    for (const row of this.rows()) {
      if (!row.menuNo) continue;
      const current = this.isChecked(row);
      const original = !!row.assigned;
      if (current === original) continue;
      count++;
      if (current) {
        tasks.push(this.service.save({ cpnyId, menuNo: row.menuNo, paramActivity: 1, paramOrderNo: 0 }));
      } else {
        tasks.push(this.service.delete(row.menuNo, cpnyId));
      }
    }
    if (count === 0) {
      this.message.info(this.i18n.t('sys.codeParam.msgNoChanges', 'Không có thay đổi nào cần lưu'));
      return;
    }
    this.saving.set(true);
    try {
      await Promise.all(tasks);
      this.message.success(
        `${this.i18n.t('sys.codeParam.msgUpdateSuccessPrefix', 'Cập nhật thành công')} ${count} ${this.i18n.t('sys.codeParam.msgUpdateSuccessSuffix', 'mục')}`,
      );
    } catch {
      this.message.error(this.i18n.t('sys.codeParam.msgSaveError', 'Có lỗi xảy ra khi lưu dữ liệu'));
    } finally {
      this.saving.set(false);
      await this.loadTable(this.selectedMenuNo()!);
    }
  }

  openEditModal(row: SyMenuParamRow): void {
    if (!row.assigned || !row.menuNo) return;
    this.formMenuNo.set(row.menuNo);
    this.formOrderNo.set(row.paramOrderNo ?? 0);
    this.formActivity.set(row.paramActivity !== 0);
    this.formIsCanBeBuild.set(row.isCanBeBuild === '1');
    this.formVisible.set(true);
  }

  async saveForm(): Promise<void> {
    const cpnyId = this.selectedCompanyId();
    if (!cpnyId) return;
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        cpnyId,
        menuNo: this.formMenuNo(),
        paramActivity: this.formActivity() ? 1 : 0,
        paramOrderNo: this.formOrderNo() ?? 0,
        isCanBeBuild: this.formIsCanBeBuild() ? '1' : '0',
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.loadTable(this.selectedMenuNo()!);
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  exportExcel(): void {
    const cpnyId = this.selectedCompanyId();
    if (!cpnyId) {
      this.message.warning(this.i18n.t('sys.codeParam.msgSelectCompanyExport', 'Chọn công ty để xuất excel'));
      return;
    }
    window.location.href = this.service.buildExportUrl(cpnyId, this.selectedMenuNo() ?? '');
  }
}
