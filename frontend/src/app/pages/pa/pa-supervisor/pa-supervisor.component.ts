import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeKey, NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaSupervisorRow, PaSupervisorService } from './pa-supervisor.service';

/**
 * Người phụ trách lương (viewPaSupervisor) - xem ghi chú trong
 * pa-supervisor.service.ts. Cây phòng ban dùng nz-tree checkable (cascading
 * chuẩn: check cha tự check hết con, check 1 con làm cha hiện indeterminate
 * chứ không tự ép check toàn bộ tổ tiên như bản gốc - sửa hành vi ép check
 * ancestor của bản gốc vì có thể gây cấp quyền rộng hơn dự định).
 */
@Component({
  selector: 'app-pa-supervisor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeModule,
  ],
  templateUrl: './pa-supervisor.component.html',
  styleUrl: './pa-supervisor.component.scss',
})
export class PaSupervisorComponent implements OnInit {
  private readonly service = inject(PaSupervisorService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly empService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly supervisors = signal<PaSupervisorRow[]>([]);
  protected readonly listFilter = signal('');
  protected readonly filteredSupervisors = computed(() => {
    const kw = this.listFilter().trim().toLowerCase();
    if (!kw) return this.supervisors();
    return this.supervisors().filter((s) => `${s.empId ?? ''} ${s.localName ?? ''} ${s.deptName ?? ''}`.toLowerCase().includes(kw));
  });

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly selectedPersonId = signal<string | null>(null);
  protected readonly selectedEmpName = signal('');
  protected readonly checkedKeys = signal<string[]>([]);
  protected readonly deptLoading = signal(false);
  protected readonly deptSaving = signal(false);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formPersonId = signal('');
  protected readonly formEmpDisplay = signal('');
  protected readonly formEmployeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly formActivity = signal(1);
  protected readonly formOrderNo = signal(0);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptFlat] = await Promise.all([this.service.getDepartmentTree()]);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      // im lặng bỏ qua
    }
    await this.loadSupervisorList();
  }

  private async loadSupervisorList(): Promise<void> {
    try {
      this.supervisors.set(await this.service.getAllSupervisorList());
    } catch {
      this.supervisors.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  displayName(row: PaSupervisorRow): string {
    return row.empId ? `${row.empId} - ${row.localName}` : (row.personId ?? '');
  }

  async selectSupervisor(row: PaSupervisorRow): Promise<void> {
    if (!row.personId) return;
    this.selectedPersonId.set(row.personId);
    this.selectedEmpName.set(this.displayName(row));
    this.deptLoading.set(true);
    this.checkedKeys.set([]);
    try {
      this.checkedKeys.set(await this.service.getDeptListByPersonId(row.personId));
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.deptLoading.set(false);
    }
  }

  onDeptCheckedKeysChange(keys: NzTreeNodeKey[]): void {
    this.checkedKeys.set(keys as string[]);
  }

  async saveDepts(): Promise<void> {
    const personId = this.selectedPersonId();
    if (!personId) return;
    this.deptSaving.set(true);
    try {
      const res = await this.service.saveDepartments(personId, this.checkedKeys());
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('pa.supervisor.deptSaved', 'Lưu phân quyền phòng ban thành công!'));
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.deptSaving.set(false);
    }
  }

  openAddModal(): void {
    this.formIsAdd.set(true);
    this.formPersonId.set('');
    this.formEmpDisplay.set('');
    this.formEmployeeOptions.set([]);
    this.formActivity.set(1);
    this.formOrderNo.set(0);
    this.formVisible.set(true);
  }

  async openEditModal(row: PaSupervisorRow, event: Event): Promise<void> {
    event.stopPropagation();
    if (!row.personId) return;
    try {
      const dto = await this.service.getOne(row.personId);
      this.formIsAdd.set(false);
      this.formPersonId.set(dto.personId ?? '');
      this.formEmpDisplay.set(`${dto.empId ?? ''} - ${dto.localName ?? ''}`);
      this.formActivity.set(dto.activity ?? 1);
      this.formOrderNo.set(dto.orderNo ?? 0);
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async onEmployeeSearch(keyword: string): Promise<void> {
    const kw = keyword.trim();
    if (!kw) {
      this.formEmployeeOptions.set([]);
      return;
    }
    try {
      this.formEmployeeOptions.set(await this.empService.searchEmployees(kw));
    } catch {
      this.formEmployeeOptions.set([]);
    }
  }

  onEmployeeSelect(personId: string | null): void {
    this.formPersonId.set(personId ?? '');
    const emp = this.formEmployeeOptions().find((e) => e.personId === personId);
    this.formEmpDisplay.set(emp ? `${emp.empId ?? ''} - ${emp.localName ?? ''}` : '');
  }

  async saveForm(): Promise<void> {
    if (!this.formPersonId().trim()) {
      this.message.warning(this.i18n.t('pa.supervisor.validateRequired', 'Vui lòng chọn người phụ trách!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        personId: this.formPersonId().trim(),
        activity: this.formActivity(),
        orderNo: this.formOrderNo(),
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.loadSupervisorList();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteSupervisor(row: PaSupervisorRow, event: Event): void {
    event.stopPropagation();
    if (!row.personId) return;
    const personId = row.personId;
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.supervisor.confirmDeleteFull', 'Bạn có chắc chắn muốn xóa người phụ trách này? Toàn bộ cấu hình phòng ban cũng sẽ bị xóa!'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(personId);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          if (this.selectedPersonId() === personId) {
            this.selectedPersonId.set(null);
            this.selectedEmpName.set('');
            this.checkedKeys.set([]);
          }
          await this.loadSupervisorList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
