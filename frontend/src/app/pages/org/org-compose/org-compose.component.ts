import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
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
import {
  OrgComposeService,
  OrgCostCenterOption,
  OrgEmployeeRow,
  OrgInfoRow,
  OrgResumeOption,
} from './org-compose.service';

type ComposeMode = 'VIEW' | 'NEW' | 'EDIT';

interface OrgInfoForm {
  deptNo: string;
  parentDeptNo: string | null;
  orgNameEng: string | null;
  orgNameLocal: string | null;
  deptType: string | null;
  deptLevel: number | null;
  managerEmpId: string | null;
  dateCreated: Date | null;
  isPartTime: boolean;
  costCenter: string | null;
}

const EMPTY_FORM: OrgInfoForm = {
  deptNo: '',
  parentDeptNo: null,
  orgNameEng: null,
  orgNameLocal: null,
  deptType: 'TEAM',
  deptLevel: null,
  managerEmpId: null,
  dateCreated: null,
  isPartTime: false,
  costCenter: null,
};

/**
 * Quản lý cơ cấu tổ chức theo phiên bản thay đổi (viewComposeOrg) - xem ghi chú trong
 * org-compose.service.ts. jsTree bản gốc thay bằng nz-tree (dựng cây thật theo parent/child từ danh sách
 * phẳng orgList, dùng chung 1 cây cho cả cây chính + 2 modal chọn phòng ban), DataTables thay bằng
 * nz-table, 2 modal Bootstrap thay bằng nz-modal.
 *
 * Bỏ ô "Tên trưởng phòng" (managerName) và nút tìm nhân viên cạnh Trưởng phòng so với bản gốc: bản gốc
 * không có API nào đổ dữ liệu cho managerName lẫn nút tìm (luôn disabled, không hoạt động).
 */
@Component({
  selector: 'app-org-compose',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeModule,
  ],
  templateUrl: './org-compose.component.html',
  styleUrl: './org-compose.component.scss',
})
export class OrgComposeComponent implements OnInit {
  private readonly service = inject(OrgComposeService);
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

  protected readonly mode = signal<ComposeMode>('VIEW');
  protected form: OrgInfoForm = { ...EMPTY_FORM };
  protected readonly saving = signal(false);

  protected readonly employees = signal<OrgEmployeeRow[]>([]);
  protected readonly loadingEmployees = signal(false);
  protected readonly selectedEmpIds = signal<Set<string>>(new Set());

  protected readonly costCenterOptions = signal<OrgCostCenterOption[]>([]);

  protected readonly parentModalVisible = signal(false);
  protected pendingParentKey: string | null = null;
  protected readonly parentSearchValue = signal('');

  protected readonly targetModalVisible = signal(false);
  protected readonly transferring = signal(false);
  protected pendingTargetKey: string | null = null;
  protected readonly targetSearchValue = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadResumeDropdown();
    this.loadCostCenters();
  }

  private async loadCostCenters(): Promise<void> {
    try {
      const res = await this.service.getCostCenters();
      this.costCenterOptions.set(res.data ?? []);
    } catch {
      this.costCenterOptions.set([]);
    }
  }

  protected resumeLabel(r: OrgResumeOption): string {
    return r.no ? `${r.no} ${r.resumeName ?? ''}` : (r.resumeName ?? '');
  }

  private async loadResumeDropdown(): Promise<void> {
    this.loadingResume.set(true);
    try {
      const list = await this.service.getResumeDropdown();
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
    this.selectedDeptKey.set(null);
    this.mode.set('VIEW');
    this.form = { ...EMPTY_FORM };
    this.employees.set([]);
    if (resumeNo) await this.loadOrgTree(resumeNo);
    else this.orgList.set([]);
  }

  private async loadOrgTree(resumeNo: string): Promise<void> {
    this.loadingTree.set(true);
    try {
      const list = await this.service.getOrgStructure(resumeNo);
      this.orgList.set(list ?? []);
      const nodes = buildOrgTree(list ?? []);
      this.treeNodes.set(nodes);
      this.expandedKeys.set(collectAllTreeKeys(nodes));
    } catch {
      this.orgList.set([]);
      this.treeNodes.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
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
    this.loadOrgDetails(item);
  }

  private loadOrgDetails(item: OrgInfoRow): void {
    this.mode.set('VIEW');
    this.form = {
      deptNo: item.deptNo,
      parentDeptNo: item.parentDeptNo ?? null,
      orgNameEng: item.orgNameEng ?? null,
      orgNameLocal: item.orgNameLocal ?? null,
      deptType: item.deptType ?? null,
      deptLevel: item.deptLevel ?? null,
      managerEmpId: item.managerEmpId ?? null,
      dateCreated: this.toDate(item.dateCreated ?? null),
      isPartTime: item.isPartTime === 'Y',
      costCenter: item.costCenter ?? null,
    };
    this.loadEmployees();
  }

  private async loadEmployees(): Promise<void> {
    const resumeNo = this.selectedResumeNo();
    if (!resumeNo || !this.form.deptNo) {
      this.employees.set([]);
      return;
    }
    this.loadingEmployees.set(true);
    this.selectedEmpIds.set(new Set());
    try {
      this.employees.set((await this.service.getEmployees(resumeNo, this.form.deptNo)) ?? []);
    } catch {
      this.employees.set([]);
    } finally {
      this.loadingEmployees.set(false);
    }
  }

  // ==================== Thêm mới / Sửa / Hủy ====================

  protected startNew(): void {
    if (!this.selectedResumeNo()) {
      this.message.warning(this.i18n.t('org.compose.msg.pleaseSelectResume', 'Vui lòng chọn phiên bản thay đổi tổ chức!'));
      return;
    }
    this.mode.set('NEW');
    this.form = { ...EMPTY_FORM, parentDeptNo: this.selectedDeptKey(), dateCreated: new Date() };
    this.employees.set([]);
  }

  protected startEdit(): void {
    if (!this.form.deptNo) return;
    this.mode.set('EDIT');
  }

  protected cancelEdit(): void {
    const key = this.selectedDeptKey();
    const current = key ? this.orgList().find((o) => o.deptNo === key) : undefined;
    if (current) {
      this.loadOrgDetails(current);
    } else {
      this.mode.set('VIEW');
      this.form = { ...EMPTY_FORM };
    }
  }

  protected async save(): Promise<void> {
    if (!this.form.deptNo) {
      this.message.warning(this.i18n.t('org.compose.msg.pleaseEnterDeptNo', 'Vui lòng nhập Mã phòng ban!'));
      return;
    }
    const isNew = this.mode() === 'NEW';
    const payload: OrgInfoRow = {
      resumeNo: this.selectedResumeNo(),
      deptNo: this.form.deptNo,
      parentDeptNo: this.form.parentDeptNo,
      orgNameEng: this.form.orgNameEng,
      orgNameLocal: this.form.orgNameLocal,
      deptType: this.form.deptType,
      deptLevel: this.form.deptLevel,
      managerEmpId: this.form.managerEmpId,
      dateCreated: this.formatYmd(this.form.dateCreated),
      isPartTime: this.form.isPartTime ? 'Y' : 'N',
      costCenter: this.form.costCenter,
    };

    this.saving.set(true);
    try {
      const res = await this.service.saveOrgInfo(payload, isNew);
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.selectedDeptKey.set(this.form.deptNo);
      this.mode.set('VIEW');
      const resumeNo = this.selectedResumeNo();
      if (resumeNo) await this.loadOrgTree(resumeNo);
    } catch (err: any) {
      this.message.error(err?.error?.error || this.i18n.t('common.saveFail', 'Lưu thất bại!'));
    } finally {
      this.saving.set(false);
    }
  }

  // ==================== Xóa ====================

  protected confirmDeleteOrg(): void {
    if (!this.form.deptNo) return;
    const resumeNo = this.selectedResumeNo();
    const deptNo = this.form.deptNo;
    this.modal.confirm({
      nzTitle: this.i18n.t('org.compose.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa phòng ban này?'),
      nzContent: deptNo,
      nzOkDanger: true,
      nzOnOk: async () => {
        if (!resumeNo) return;
        try {
          const res = await this.service.deleteOrgInfo(resumeNo, deptNo);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          this.selectedDeptKey.set(null);
          this.mode.set('VIEW');
          this.form = { ...EMPTY_FORM };
          this.employees.set([]);
          await this.loadOrgTree(resumeNo);
        } catch (err: any) {
          this.message.error(err?.error?.error || this.i18n.t('common.deleteFail', 'Xóa thất bại!'));
        }
      },
    });
  }

  // ==================== Modal chọn phòng ban trên ====================

  protected openParentModal(): void {
    this.pendingParentKey = this.form.parentDeptNo;
    this.parentSearchValue.set('');
    this.parentModalVisible.set(true);
  }

  protected onParentTreeClick(event: NzFormatEmitEvent): void {
    this.pendingParentKey = event.node?.key ?? null;
  }

  protected confirmParent(): void {
    if (!this.pendingParentKey) {
      this.message.warning(this.i18n.t('org.compose.msg.pleaseSelectParent', 'Vui lòng chọn phòng ban!'));
      return;
    }
    this.form.parentDeptNo = this.pendingParentKey;
    this.parentModalVisible.set(false);
  }

  // ==================== Danh sách nhân viên / điều chuyển ====================

  protected isEmpChecked(empId: string): boolean {
    return this.selectedEmpIds().has(empId);
  }

  protected toggleEmpCheck(empId: string, checked: boolean): void {
    const next = new Set(this.selectedEmpIds());
    if (checked) next.add(empId);
    else next.delete(empId);
    this.selectedEmpIds.set(next);
  }

  protected toggleAllEmp(checked: boolean): void {
    this.selectedEmpIds.set(checked ? new Set(this.employees().map((e) => e.empId)) : new Set());
  }

  protected allEmpChecked(): boolean {
    return this.employees().length > 0 && this.employees().every((e) => this.selectedEmpIds().has(e.empId));
  }

  protected openTransferModal(): void {
    if (this.selectedEmpIds().size === 0) {
      this.message.warning(this.i18n.t('org.compose.msg.pleaseSelectEmployee', 'Vui lòng chọn nhân viên cần điều chuyển!'));
      return;
    }
    this.pendingTargetKey = null;
    this.targetSearchValue.set('');
    this.targetModalVisible.set(true);
  }

  protected onTargetTreeClick(event: NzFormatEmitEvent): void {
    this.pendingTargetKey = event.node?.key ?? null;
  }

  protected async confirmTransfer(): Promise<void> {
    if (!this.pendingTargetKey) {
      this.message.warning(this.i18n.t('org.compose.msg.pleaseSelectTarget', 'Vui lòng chọn phòng ban đến!'));
      return;
    }
    const resumeNo = this.selectedResumeNo();
    if (!resumeNo) return;

    this.transferring.set(true);
    try {
      const res = await this.service.transferEmployees({
        resumeNo,
        targetDeptNo: this.pendingTargetKey,
        empIds: Array.from(this.selectedEmpIds()),
      });
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.targetModalVisible.set(false);
      await this.loadEmployees();
    } catch (err: any) {
      this.message.error(err?.error?.error || this.i18n.t('common.saveFail', 'Lưu thất bại!'));
    } finally {
      this.transferring.set(false);
    }
  }

  private toDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatYmd(d: Date | null): string | null {
    return d ? formatDate(d, 'yyyy-MM-dd', 'vi') : null;
  }
}
