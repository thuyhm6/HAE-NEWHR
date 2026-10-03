import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { buildOrgTree, collectAllTreeKeys } from '../org-tree.util';
import { OrgComposeService, OrgCostCenterOption, OrgEmployeeRow, OrgInfoRow, OrgResumeOption } from '../org-compose/org-compose.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Lịch sử thay đổi cơ cấu tổ chức (viewHistoryOrgInfo) - bản chỉ xem của org-compose: xem lại cơ cấu tổ
 * chức + danh sách nhân viên của 1 phiên bản thay đổi bất kỳ trong quá khứ, KHÔNG có thao tác thêm/sửa/
 * xóa/điều chuyển (đúng bản gốc: mọi input readonly/disabled, checkbox nhân viên bị disable). Tái sử
 * dụng nguyên OrgComposeService (cùng API resume dropdown/cấu trúc/nhân viên/mã chi phí với trang
 * org-compose) và org-tree.util thay vì viết lại.
 */
@Component({
  selector: 'app-org-history-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzTableModule,
    NzTreeModule,
  ],
  templateUrl: './org-history-info.component.html',
  styleUrl: './org-history-info.component.scss',
})
export class OrgHistoryInfoComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(OrgComposeService);
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
  protected readonly selectedDept = signal<OrgInfoRow | null>(null);
  protected readonly selectedDateCreated = signal<Date | null>(null);

  protected readonly employees = signal<OrgEmployeeRow[]>([]);
  protected readonly loadingEmployees = signal(false);

  protected readonly costCenterOptions = signal<OrgCostCenterOption[]>([]);

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
    } finally {
      this.loadingResume.set(false);
    }
  }

  async onResumeChange(resumeNo: string | null): Promise<void> {
    this.selectedResumeNo.set(resumeNo);
    this.selectedDeptKey.set(null);
    this.selectedDept.set(null);
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
    this.selectedDept.set(item);
    this.selectedDateCreated.set(this.toDate(item.dateCreated ?? null));
    this.loadEmployees(item.deptNo);
  }

  private async loadEmployees(deptNo: string): Promise<void> {
    const resumeNo = this.selectedResumeNo();
    if (!resumeNo) {
      this.employees.set([]);
      return;
    }
    this.loadingEmployees.set(true);
    try {
      this.employees.set((await this.service.getEmployees(resumeNo, deptNo)) ?? []);
    } catch {
      this.employees.set([]);
    } finally {
      this.loadingEmployees.set(false);
    }
  }

  private toDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
}
