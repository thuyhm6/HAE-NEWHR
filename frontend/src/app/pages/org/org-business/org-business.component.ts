import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { buildOrgTree, collectAllTreeKeys } from '../org-tree.util';
import { OrgComposeService, OrgInfoRow, OrgResumeOption } from '../org-compose/org-compose.service';
import { OrgBusinessRow, OrgBusinessService } from './org-business.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
type BusinessMode = 'NEW' | 'EDIT';

interface BusinessForm {
  seq: string | null;
  codeNo: string;
  orderNo: number | null;
  isDefault: boolean;
}

const EMPTY_FORM: BusinessForm = { seq: null, codeNo: '', orderNo: 0, isDefault: false };

/**
 * Quản lý nghiệp vụ phòng ban (viewOrgBusiness) - xem ghi chú trong org-business.service.ts. Cây tổ chức
 * bên trái dùng chung OrgComposeService + org-tree.util (cùng nguồn dữ liệu OrgComposeController#
 * getOrgStructure với trang org-compose), danh sách nghiệp vụ của phòng ban đang chọn bên phải. jsTree
 * bản gốc thay bằng nz-tree, DataTables thay bằng nz-table, modal Bootstrap thêm/sửa thay bằng nz-modal,
 * chọn 1 dòng để Sửa/Xóa bằng click chọn dòng (thay cho DataTables row-select), giống idiom NG-ZORRO đã
 * dùng ở các trang khác.
 */
@Component({
  selector: 'app-org-business',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeModule,
  ],
  templateUrl: './org-business.component.html',
  styleUrl: './org-business.component.scss',
})
export class OrgBusinessComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly composeService = inject(OrgComposeService);
  private readonly service = inject(OrgBusinessService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly resumeOptions = signal<OrgResumeOption[]>([]);
  protected readonly loadingResume = signal(false);
  protected readonly selectedResumeNo = signal<string | null>(null);

  protected readonly orgList = signal<OrgInfoRow[]>([]);
  protected readonly loadingTree = signal(false);
  protected readonly treeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly expandedKeys = signal<NzTreeNodeKey[]>([]);
  protected readonly searchTreeValue = signal('');
  protected readonly selectedDeptKey = signal<string | null>(null);
  protected readonly selectedDeptName = signal('');

  protected readonly businessList = signal<OrgBusinessRow[]>([]);
  protected readonly loadingList = signal(false);
  protected readonly selectedSeq = signal<string | null>(null);

  protected readonly modalVisible = signal(false);
  protected readonly modalMode = signal<BusinessMode>('NEW');
  protected form: BusinessForm = { ...EMPTY_FORM };
  protected readonly saving = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadResumeDropdown();
  }

  protected resumeLabel(r: OrgResumeOption): string {
    return r.no ? `${r.no} ${r.resumeName ?? ''}` : (r.resumeName ?? '');
  }

  private async loadResumeDropdown(): Promise<void> {
    this.loadingResume.set(true);
    try {
      const list = await this.composeService.getResumeDropdown();
      this.resumeOptions.set(list ?? []);
      if (list?.length) {
        this.selectedResumeNo.set(list[0].no);
        await this.onResumeChange(list[0].no);
      }
    } catch {
      this.resumeOptions.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loadingResume.set(false);
    }
  }

  async onResumeChange(resumeNo: string | null): Promise<void> {
    this.selectedResumeNo.set(resumeNo);
    this.resetDeptSelection();
    if (resumeNo) await this.loadOrgTree(resumeNo);
    else this.orgList.set([]);
  }

  private async loadOrgTree(resumeNo: string): Promise<void> {
    this.loadingTree.set(true);
    try {
      const list = await this.composeService.getOrgStructure(resumeNo);
      this.orgList.set(list ?? []);
      const nodes = buildOrgTree(list ?? []);
      this.treeNodes.set(nodes);
      this.expandedKeys.set(collectAllTreeKeys(nodes));
    } catch {
      this.orgList.set([]);
      this.treeNodes.set([]);
    } finally {
      this.loadingTree.set(false);
    }
  }

  protected expandAllNodes(): void {
    this.expandedKeys.set(collectAllTreeKeys(this.treeNodes()));
  }

  protected collapseAllNodes(): void {
    this.expandedKeys.set([]);
  }

  protected onTreeClick(event: NzFormatEmitEvent): void {
    const key = event.node?.key;
    if (!key) return;
    const item = this.orgList().find((o) => o.deptNo === key);
    if (!item) return;
    this.selectedDeptKey.set(key);
    this.selectedDeptName.set(item.orgNameLocal || item.orgNameEng || item.deptNo);
    this.selectedSeq.set(null);
    this.loadBusinessList();
  }

  private resetDeptSelection(): void {
    this.selectedDeptKey.set(null);
    this.selectedDeptName.set('');
    this.selectedSeq.set(null);
    this.businessList.set([]);
  }

  private async loadBusinessList(): Promise<void> {
    const resumeNo = this.selectedResumeNo();
    const deptNo = this.selectedDeptKey();
    if (!resumeNo || !deptNo) return;
    this.loadingList.set(true);
    try {
      this.businessList.set((await this.service.getList(resumeNo, deptNo)) ?? []);
    } catch {
      this.businessList.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loadingList.set(false);
    }
  }

  protected selectRow(row: OrgBusinessRow): void {
    this.selectedSeq.set(this.selectedSeq() === row.seq ? null : (row.seq ?? null));
  }

  protected selectedRow(): OrgBusinessRow | undefined {
    return this.businessList().find((b) => b.seq === this.selectedSeq());
  }

  // ==================== Thêm mới / Sửa ====================

  protected openAddModal(): void {
    if (!this.selectedDeptKey()) {
      this.message.warning(this.i18n.t('org.business.msg.pleaseSelectDept', 'Vui lòng chọn phòng ban để xem danh sách nghiệp vụ!'));
      return;
    }
    this.modalMode.set('NEW');
    this.form = { ...EMPTY_FORM };
    this.modalVisible.set(true);
  }

  protected openEditModal(): void {
    const row = this.selectedRow();
    if (!row) return;
    this.modalMode.set('EDIT');
    this.form = {
      seq: row.seq ?? null,
      codeNo: row.codeNo,
      orderNo: row.orderNo ?? 0,
      isDefault: row.isDefault === '1',
    };
    this.modalVisible.set(true);
  }

  protected async save(): Promise<void> {
    if (!this.form.codeNo?.trim()) {
      this.message.warning(this.i18n.t('org.business.msg.pleaseEnterCodeNo', 'Vui lòng nhập mã công việc!'));
      return;
    }
    const resumeNo = this.selectedResumeNo();
    const deptNo = this.selectedDeptKey();
    if (!resumeNo || !deptNo) return;

    const payload: OrgBusinessRow = {
      seq: this.form.seq,
      resumeNo,
      deptNo,
      codeNo: this.form.codeNo.trim(),
      orderNo: this.form.orderNo,
      isDefault: this.form.isDefault ? '1' : '0',
    };

    this.saving.set(true);
    try {
      const res = await this.service.save(payload);
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.modalVisible.set(false);
      await this.loadBusinessList();
    } catch (err: any) {
      this.message.error(err?.error?.error || this.i18n.t('common.saveFail', 'Lưu thất bại!'));
    } finally {
      this.saving.set(false);
    }
  }

  // ==================== Xóa ====================

  protected confirmDeleteRow(): void {
    const row = this.selectedRow();
    if (!row?.seq) return;
    const seq = row.seq;
    this.modal.confirm({
      nzTitle: this.i18n.t('org.business.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa nghiệp vụ này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(seq);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          this.selectedSeq.set(null);
          await this.loadBusinessList();
        } catch (err: any) {
          this.message.error(err?.error?.error || this.i18n.t('common.deleteFail', 'Xóa thất bại!'));
        }
      },
    });
  }
}
