import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeManageService, SyCodeRow } from './sy-code-manage.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Quản lý danh mục Code (viewCodeManage) - xem ghi chú trong
 * sy-code-manage.service.ts. Dùng nz-tree (thay cho jstree bản gốc) cho cây
 * code cha/con - build cây từ danh sách phẳng, root = parentCodeNo rỗng/
 * 'ROOT'/không tồn tại trong tập codeNo (giống đúng logic bản gốc).
 */
@Component({
  selector: 'app-sy-code-manage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSwitchModule,
    NzTableModule,
    NzTreeModule,
  ],
  templateUrl: './sy-code-manage.component.html',
  styleUrl: './sy-code-manage.component.scss',
})
export class SyCodeManageComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(SyCodeManageService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly treeLoading = signal(false);
  protected readonly treeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchTreeValue = signal('');
  protected readonly selectedCodeNo = signal<string | null>(null);
  protected readonly selectedLabel = signal<string | null>(null);
  protected readonly expandedKeys = signal<NzTreeNodeKey[]>([]);

  protected readonly rows = signal<SyCodeRow[]>([]);
  protected readonly loading = signal(false);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formCodeNo = signal('');
  protected readonly formParentCodeNo = signal('');
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formOrderNo = signal<number | null>(0);
  protected readonly formDescription = signal('');
  protected readonly formActivity = signal(true);

  readonly exportUrl = this.service.exportUrl;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadTree();
    await this.loadTable('');
  }

  private async loadTree(): Promise<void> {
    this.treeLoading.set(true);
    try {
      const flat = await this.service.getTree();
      this.treeNodes.set(this.buildTree(flat));
    } catch {
      this.treeNodes.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.treeLoading.set(false);
    }
  }

  private buildTree(flat: SyCodeRow[]): NzTreeNodeOptions[] {
    const idSet = new Set(flat.map((item) => item.codeNo));
    const nodeMap = new Map<string, NzTreeNodeOptions & { children: NzTreeNodeOptions[] }>();
    flat.forEach((item) => {
      if (!item.codeNo) return;
      nodeMap.set(item.codeNo, { key: item.codeNo, title: item.nameVi || item.codeNo, children: [], isLeaf: true });
    });
    const roots: NzTreeNodeOptions[] = [];
    flat.forEach((item) => {
      if (!item.codeNo) return;
      const node = nodeMap.get(item.codeNo)!;
      const parentId = item.parentCodeNo;
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
    this.selectedCodeNo.set(key);
    this.selectedLabel.set(event.node?.title ?? key);
    this.loadTable(key);
  }

  private async loadTable(parentCodeNo: string): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(parentCodeNo));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  openAddModal(): void {
    this.formIsAdd.set(true);
    this.formCodeNo.set('');
    this.formParentCodeNo.set(this.selectedCodeNo() ?? '');
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formOrderNo.set(0);
    this.formDescription.set('');
    this.formActivity.set(true);
    this.formVisible.set(true);
  }

  openEditModal(row: SyCodeRow): void {
    this.formIsAdd.set(false);
    this.formCodeNo.set(row.codeNo ?? '');
    this.formParentCodeNo.set(row.parentCodeNo ?? '');
    this.formNameVi.set(row.nameVi ?? '');
    this.formNameEn.set(row.nameEn ?? '');
    this.formNameZh.set(row.nameZh ?? '');
    this.formNameKo.set(row.nameKo ?? '');
    this.formOrderNo.set(row.orderNo ?? 0);
    this.formDescription.set(row.description ?? '');
    this.formActivity.set(row.activity !== '0');
    this.formVisible.set(true);
  }

  async saveForm(): Promise<void> {
    if (!this.formNameVi().trim()) {
      this.message.warning(this.i18n.t('sys.codeManage.validateNameViRequired', 'Vui lòng nhập Tên Tiếng Việt!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        codeNo: this.formCodeNo() || undefined,
        parentCodeNo: this.formParentCodeNo(),
        nameVi: this.formNameVi().trim(),
        nameEn: this.formNameEn().trim(),
        nameZh: this.formNameZh().trim(),
        nameKo: this.formNameKo().trim(),
        orderNo: this.formOrderNo() ?? 0,
        description: this.formDescription(),
        activity: this.formActivity() ? '1' : '0',
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.loadTable(this.selectedCodeNo() ?? '');
        await this.loadTree();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteRow(row: SyCodeRow): void {
    if (!row.codeNo) return;
    const codeNo = row.codeNo;
    this.modal.confirm({
      nzTitle: `${this.i18n.t('sys.codeManage.confirmDeletePrefix', 'Bạn có chắc muốn xóa code:')} ${codeNo}?`,
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(codeNo);
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
            await this.loadTable(this.selectedCodeNo() ?? '');
            await this.loadTree();
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
