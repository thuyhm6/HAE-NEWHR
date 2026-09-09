import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { AttendanceKeeperService, DeptTreeNode, SupervisorRow } from './attendance-keeper.service';

/**
 * Quản lý "Người chấm công" (nhân viên được phân quyền quản lý phòng ban) -
 * port lại từ ar/attendanceSettings/viewAttendanceKeeper.html (đã xoá).
 * Layout master-detail: trái là danh sách nhân viên phân quyền, phải là cây
 * phòng ban dùng `nz-tree` checkable (cascade cha-con mặc định của
 * NG-ZORRO, thay cho logic cascade tự viết tay bằng jQuery ở bản gốc).
 */
@Component({
  selector: 'app-attendance-keeper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTreeModule,
  ],
  templateUrl: './attendance-keeper.component.html',
  styleUrl: './attendance-keeper.component.scss',
})
export class AttendanceKeeperComponent implements OnInit {
  private readonly service = inject(AttendanceKeeperService);
  private readonly empService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly listLoading = signal(false);
  protected readonly supervisors = signal<SupervisorRow[]>([]);
  protected readonly searchFilter = signal('');

  protected readonly filteredSupervisors = computed(() => {
    const kw = this.searchFilter().trim().toLowerCase();
    const list = this.supervisors();
    if (!kw) return list;
    return list.filter((s) => `${s.empId ?? ''} ${s.empName ?? ''} ${s.deptName ?? ''}`.toLowerCase().includes(kw));
  });

  protected readonly selectedPersonId = signal<string | null>(null);
  protected readonly selectedEmpName = signal<string | null>(null);
  protected readonly deptTreeLoading = signal(false);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly checkedDeptKeys = signal<string[]>([]);
  protected readonly savingDepts = signal(false);

  private rawDeptTree: DeptTreeNode[] = [];

  // ── Modal Thêm/Sửa cán bộ phân quyền ─────────────────────────────────
  protected readonly modalVisible = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formPersonId = signal('');
  protected readonly formEmpNameDisplay = signal('');
  protected readonly formOrderno = signal<number | null>(null);
  protected readonly formModifyYn = signal('0');
  protected readonly formActivity = signal('1');

  protected readonly empPickerVisible = signal(false);
  protected readonly empPickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly empPickerSearching = signal(false);
  private empPickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.rawDeptTree = await this.service.getDepartmentTree();
      this.deptTreeNodes.set(this.buildDeptTree(this.rawDeptTree));
    } catch {
      this.deptTreeNodes.set([]);
    }
    await this.loadSupervisors();
  }

  private buildDeptTree(flatList: DeptTreeNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();
    flatList.forEach((item) => {
      nodeMap.set(item.id, { key: item.id, title: `${item.text} (${item.id})`, isLeaf: true });
    });
    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '#' && item.parent !== '0' && nodeMap.has(item.parent)) {
        const siblings = childKeys.get(item.parent) ?? [];
        siblings.push(item.id);
        childKeys.set(item.parent, siblings);
      } else {
        const node = nodeMap.get(item.id);
        if (node) roots.push(node);
      }
    });
    nodeMap.forEach((node, id) => {
      const children = childKeys.get(id);
      if (children && children.length) {
        node.isLeaf = false;
        node.children = children.map((childId) => nodeMap.get(childId)!).filter(Boolean);
      }
    });
    return roots;
  }

  async loadSupervisors(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.supervisors.set(await this.service.getAllSupervisors());
    } catch {
      this.supervisors.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  displayName(row: SupervisorRow): string {
    return row.empId ? `${row.empId} - ${row.empName ?? ''}` : row.personId;
  }

  async selectSupervisor(row: SupervisorRow): Promise<void> {
    this.selectedPersonId.set(row.personId);
    this.selectedEmpName.set(this.displayName(row));
    this.deptTreeLoading.set(true);
    this.checkedDeptKeys.set([]);
    try {
      const checked = await this.service.getSupervisorDepartments(row.personId);
      this.checkedDeptKeys.set(checked);
    } catch {
      this.message.error(this.i18n.t('arSupervisor.js.deptError', 'Lỗi dữ liệu phòng ban.'));
    } finally {
      this.deptTreeLoading.set(false);
    }
  }

  onDeptCheckboxChange(event: NzFormatEmitEvent): void {
    if (event.keys) {
      this.checkedDeptKeys.set(event.keys);
    }
  }

  async saveDepartments(): Promise<void> {
    const personId = this.selectedPersonId();
    if (!personId) {
      this.message.error(this.i18n.t('arSupervisor.js.noPersonId', 'Chưa có ID nhân sự được chọn.'));
      return;
    }
    this.savingDepts.set(true);
    try {
      const res = await this.service.saveDepartments(personId, this.checkedDeptKeys());
      if (res.success) {
        this.message.success(
          `${this.i18n.t('arSupervisor.js.savedDeptsPrefix', 'Đã lưu')} ${this.checkedDeptKeys().length}${this.i18n.t('arSupervisor.js.savedDeptsSuf', ' phòng ban phân quyền cho NV!')}`,
        );
      } else {
        this.message.error(res.error || this.i18n.t('arSupervisor.js.serverError', 'Lỗi xử lý server'));
      }
    } catch {
      this.message.error(this.i18n.t('arSupervisor.js.saveConnError', 'Lỗi kết nối khi lưu!'));
    } finally {
      this.savingDepts.set(false);
    }
  }

  // ── Modal Thêm mới ────────────────────────────────────────────────
  openAddModal(): void {
    this.formPersonId.set('');
    this.formEmpNameDisplay.set('');
    this.formOrderno.set(null);
    this.formModifyYn.set('0');
    this.formActivity.set('1');
    this.modalVisible.set(true);
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  openEmpPicker(): void {
    this.empPickerSearchResults.set([]);
    this.empPickerVisible.set(true);
  }

  closeEmpPicker(): void {
    this.empPickerVisible.set(false);
  }

  onEmpPickerSearch(keyword: string): void {
    if (this.empPickerSearchTimer) {
      clearTimeout(this.empPickerSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.empPickerSearchResults.set([]);
      return;
    }
    this.empPickerSearchTimer = setTimeout(async () => {
      this.empPickerSearching.set(true);
      try {
        this.empPickerSearchResults.set(await this.empService.searchEmployees(kw));
      } catch {
        this.empPickerSearchResults.set([]);
      } finally {
        this.empPickerSearching.set(false);
      }
    }, 300);
  }

  onEmpPickerSelected(personId: string | null): void {
    if (!personId) return;
    const emp = this.empPickerSearchResults().find((e) => e.personId === personId);
    if (emp) {
      this.formPersonId.set(emp.personId ?? '');
      this.formEmpNameDisplay.set(`${emp.empId ?? ''} - ${emp.localName ?? ''}`);
    }
    this.closeEmpPicker();
  }

  async saveRecord(): Promise<void> {
    const personId = this.formPersonId().trim();
    if (!personId) {
      this.message.warning(this.i18n.t('arSupervisor.js.pleaseSearch', 'Vui lòng Tra cứu để đảm bảo mã NV hợp lệ.'));
      return;
    }
    this.savingRecord.set(true);
    try {
      const res = await this.service.save({
        personId,
        orderno: this.formOrderno(),
        modifyYn: Number(this.formModifyYn()),
        activity: Number(this.formActivity()),
      });
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.loadSupervisors();
      } else {
        this.message.error(res.error || this.i18n.t('arSupervisor.js.serverError', 'Lỗi xử lý server'));
      }
    } catch {
      this.message.error(this.i18n.t('arSupervisor.js.connectionError', 'Lỗi kết nối!'));
    } finally {
      this.savingRecord.set(false);
    }
  }

  deleteSupervisor(personId: string, event: Event): void {
    event.stopPropagation();
    this.modal.confirm({
      nzTitle: this.i18n.t(
        'arSupervisor.js.deleteConfirm',
        'Bạn có chắc chắn muốn xóa phân quyền NV này?\nChú ý: Toàn bộ cấu hình phòng ban của NV sẽ bị xóa theo!',
      ),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(personId);
          if (res.success) {
            if (this.selectedPersonId() === personId) {
              this.selectedPersonId.set(null);
              this.selectedEmpName.set(null);
              this.checkedDeptKeys.set([]);
            }
            await this.loadSupervisors();
          } else {
            this.message.error(res.error || this.i18n.t('arSupervisor.js.deleteError', 'Lỗi khi xóa!'));
          }
        } catch {
          this.message.error(this.i18n.t('arSupervisor.js.deleteError', 'Lỗi khi xóa!'));
        }
      },
    });
  }
}
