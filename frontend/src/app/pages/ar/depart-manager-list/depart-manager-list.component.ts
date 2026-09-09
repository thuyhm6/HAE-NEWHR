import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import {
  DepartManagerListService,
  DepartmentManageRow,
  DepartmentManageSavePayload,
  LockFlagKey,
} from './depart-manager-list.service';

interface RowVm {
  raw: DepartmentManageRow;
  deptNo: string;
  parentDeptNo: string;
  level: number;
  hasChildren: boolean;
  isOpen: boolean;
  isModified: boolean;
  flags: Record<LockFlagKey, boolean>;
}

export const LOCK_FLAG_KEYS: LockFlagKey[] = [
  'lockAttenAnnualFlag',
  'lockAttenAnnualNightFlag',
  'lockAttenFlag',
  'lockAttenNightFlag',
  'lockOtFlag',
  'lockOtNightFlag',
  'lockAttenExFlag',
  'lockAttenExNightFlag',
];

function todayStr(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Quản lý chốt công phòng ban theo ngày - port lại từ
 * ar/attendanceSettings/viewDepartManagerList.html (đã xoá). Bảng cây phòng
 * ban tự vẽ (không phải nz-table, do cấu trúc header 2 tầng + thu gọn/mở
 * rộng cây không khớp mô hình phân trang chuẩn của nz-table). Mỗi checkbox
 * độc lập theo dòng/cột (không cascade cha-con, khác với cây phân quyền ở
 * AttendanceKeeperComponent). Nút "Xuất Excel" ở bản gốc tồn tại trên giao
 * diện nhưng KHÔNG có bất kỳ xử lý click nào gắn vào (`#btnManageExport`
 * không xuất hiện trong toàn bộ script) - tức không hoạt động trong thực tế.
 * Đã hoàn thiện chức năng này bằng SheetJS khi migrate (xuất đúng dữ liệu
 * cây đang hiển thị), vì đây là nút bấm hiển thị rõ ràng cho người dùng chứ
 * không phải nhánh code ẩn như trường hợp `sysMode`.
 */
@Component({
  selector: 'app-depart-manager-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzTreeSelectModule,
  ],
  templateUrl: './depart-manager-list.component.html',
  styleUrl: './depart-manager-list.component.scss',
})
export class DepartManagerListComponent implements OnInit {
  private readonly service = inject(DepartManagerListService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly lockDate = signal<Date | null>(todayStr());
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly rows = signal<RowVm[]>([]);

  protected readonly flagKeys = LOCK_FLAG_KEYS;
  protected readonly massToggle = signal<Record<LockFlagKey, boolean>>(this.emptyFlagRecord());
  protected readonly selectAllCol = signal<Record<LockFlagKey, boolean>>(this.emptyFlagRecord());

  protected readonly visibleRows = computed(() => {
    const all = this.rows();
    const collapsedAncestor = new Set<string>();
    const byDept = new Map<string, RowVm>();
    all.forEach((r) => byDept.set(r.deptNo, r));

    const isHidden = (row: RowVm): boolean => {
      let parent = row.parentDeptNo;
      while (parent) {
        const parentRow = byDept.get(parent);
        if (!parentRow) break;
        if (!parentRow.isOpen) return true;
        parent = parentRow.parentDeptNo;
      }
      return false;
    };
    return all.filter((r) => !isHidden(r));
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.deptTreeNodes.set(this.buildDeptTree(await this.deptService.getAuthorizedDepartments()));
    } catch {
      this.deptTreeNodes.set([]);
    }
    await this.search();
  }

  private emptyFlagRecord(): Record<LockFlagKey, boolean> {
    const record = {} as Record<LockFlagKey, boolean>;
    LOCK_FLAG_KEYS.forEach((k) => (record[k] = false));
    return record;
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();
    flatList.forEach((item) => {
      nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true });
    });
    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '0' && nodeMap.has(item.parent)) {
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

  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : '';
  }

  async search(): Promise<void> {
    const lockDate = this.toApiDate(this.lockDate());
    if (!lockDate) {
      this.message.warning(this.i18n.t('ar.viewDepartManagerList.msg.selectDate', 'Vui lòng chọn ngày'));
      return;
    }
    this.listLoading.set(true);
    try {
      const list = await this.service.getList(lockDate, this.selectedDeptCodes().join(',') || undefined);
      this.rows.set(this.buildRows(list));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  private buildRows(list: DepartmentManageRow[]): RowVm[] {
    const dataMap = new Map<string, DepartmentManageRow>();
    list.forEach((itm) => dataMap.set(itm.deptNo, itm));
    const childrenMap = new Map<string, string[]>();
    const roots: string[] = [];
    list.forEach((itm) => {
      if (itm.parentDeptNo && itm.parentDeptNo !== '0' && dataMap.has(itm.parentDeptNo)) {
        const siblings = childrenMap.get(itm.parentDeptNo) ?? [];
        siblings.push(itm.deptNo);
        childrenMap.set(itm.parentDeptNo, siblings);
      } else {
        roots.push(itm.deptNo);
      }
    });

    const result: RowVm[] = [];
    const visit = (deptNo: string, level: number) => {
      const raw = dataMap.get(deptNo)!;
      const children = childrenMap.get(deptNo) ?? [];
      const flags = {} as Record<LockFlagKey, boolean>;
      this.flagKeys.forEach((k) => (flags[k] = raw[k] === '1'));
      result.push({
        raw,
        deptNo,
        parentDeptNo: raw.parentDeptNo && raw.parentDeptNo !== '0' ? raw.parentDeptNo : '',
        level,
        hasChildren: children.length > 0,
        isOpen: true,
        isModified: false,
        flags,
      });
      children.forEach((childNo) => visit(childNo, level + 1));
    };
    roots.forEach((rootNo) => visit(rootNo, 0));
    return result;
  }

  isNightFlag(key: LockFlagKey): boolean {
    return key.toLowerCase().includes('night');
  }

  clearSearch(): void {
    this.lockDate.set(todayStr());
    this.selectedDeptCodes.set([]);
    this.search();
  }

  toggleExpand(deptNo: string): void {
    this.rows.update((rows) => rows.map((r) => (r.deptNo === deptNo ? { ...r, isOpen: !r.isOpen } : r)));
  }

  toggleFlag(deptNo: string, key: LockFlagKey, checked: boolean): void {
    this.rows.update((rows) =>
      rows.map((r) => (r.deptNo === deptNo ? { ...r, isModified: true, flags: { ...r.flags, [key]: checked } } : r)),
    );
  }

  toggleColumnAll(key: LockFlagKey, checked: boolean): void {
    this.selectAllCol.update((cur) => ({ ...cur, [key]: checked }));
    this.rows.update((rows) => rows.map((r) => ({ ...r, isModified: true, flags: { ...r.flags, [key]: checked } })));
  }

  onMassToggleChange(key: LockFlagKey, checked: boolean): void {
    this.massToggle.update((cur) => ({ ...cur, [key]: checked }));
  }

  applyMassToggle(value: '0' | '1'): void {
    const checkedKeys = this.flagKeys.filter((k) => this.massToggle()[k]);
    if (!checkedKeys.length) {
      this.message.warning(this.i18n.t('ar.viewDepartManagerList.msg.selectMassToggle', 'Vui lòng tích chọn nhóm ngày/đêm ở phía trên trước khi Đóng/Mở xin phép!'));
      return;
    }
    const isChecked = value === '1';
    this.rows.update((rows) =>
      rows.map((r) => {
        const flags = { ...r.flags };
        checkedKeys.forEach((k) => (flags[k] = isChecked));
        return { ...r, isModified: true, flags };
      }),
    );
    this.message.success(
      isChecked
        ? this.i18n.t('ar.viewDepartManagerList.msg.massCloseSuccess', 'Đóng đồng loạt thành công. Vui lòng bấm Lưu để cập nhật!')
        : this.i18n.t('ar.viewDepartManagerList.msg.massOpenSuccess', 'Mở đồng loạt thành công. Vui lòng bấm Lưu để cập nhật!'),
    );
  }

  async save(): Promise<void> {
    const lockDate = this.toApiDate(this.lockDate());
    if (!lockDate) {
      this.message.error(this.i18n.t('ar.viewDepartManagerList.msg.selectDate', 'Vui lòng chọn ngày'));
      return;
    }
    const modified = this.rows().filter((r) => r.isModified);
    if (!modified.length) {
      this.message.info(this.i18n.t('ar.viewDepartManagerList.msg.noChanges', 'Không có thay đổi nào để lưu.'));
      return;
    }
    const payloads: DepartmentManageSavePayload[] = modified.map((r) => ({
      deptNo: r.deptNo,
      lockDate,
      lockAttenAnnualFlag: r.flags.lockAttenAnnualFlag ? '1' : '0',
      lockAttenAnnualNightFlag: r.flags.lockAttenAnnualNightFlag ? '1' : '0',
      lockAttenFlag: r.flags.lockAttenFlag ? '1' : '0',
      lockAttenNightFlag: r.flags.lockAttenNightFlag ? '1' : '0',
      lockOtFlag: r.flags.lockOtFlag ? '1' : '0',
      lockOtNightFlag: r.flags.lockOtNightFlag ? '1' : '0',
      lockAttenExFlag: r.flags.lockAttenExFlag ? '1' : '0',
      lockAttenExNightFlag: r.flags.lockAttenExNightFlag ? '1' : '0',
    }));

    this.saving.set(true);
    try {
      const res = await this.service.save(payloads);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('ar.viewDepartManagerList.msg.saveSuccess', 'Lưu chốt công thành công.'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  exportExcel(): void {
    const rows = this.visibleRows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const yn = (v: boolean) => (v ? 'Y' : 'N');
    const header = [
      this.i18n.t('ar.viewDepartManagerList.col.dept', 'Phòng ban'),
      this.i18n.t('ar.viewDepartManagerList.title.date', 'Ngày'),
      `${this.i18n.t('ar.viewDepartManagerList.group.annualLeave', 'Nghỉ phép năm')} - ${this.i18n.t('ar.viewDepartManagerList.shift.day', 'Ca ngày')}`,
      `${this.i18n.t('ar.viewDepartManagerList.group.annualLeave', 'Nghỉ phép năm')} - ${this.i18n.t('ar.viewDepartManagerList.shift.night', 'Ca đêm')}`,
      `${this.i18n.t('ar.viewDepartManagerList.group.leave', 'Nghỉ phép')} - ${this.i18n.t('ar.viewDepartManagerList.shift.day', 'Ca ngày')}`,
      `${this.i18n.t('ar.viewDepartManagerList.group.leave', 'Nghỉ phép')} - ${this.i18n.t('ar.viewDepartManagerList.shift.night', 'Ca đêm')}`,
      `${this.i18n.t('ar.viewDepartManagerList.group.ot', 'Tăng ca')} - ${this.i18n.t('ar.viewDepartManagerList.shift.day', 'Ca ngày')}`,
      `${this.i18n.t('ar.viewDepartManagerList.group.ot', 'Tăng ca')} - ${this.i18n.t('ar.viewDepartManagerList.shift.night', 'Ca đêm')}`,
      `${this.i18n.t('ar.viewDepartManagerList.group.abnormal', 'Bất thường')} - ${this.i18n.t('ar.viewDepartManagerList.shift.day', 'Ca ngày')}`,
      `${this.i18n.t('ar.viewDepartManagerList.group.abnormal', 'Bất thường')} - ${this.i18n.t('ar.viewDepartManagerList.shift.night', 'Ca đêm')}`,
      this.i18n.t('common.updater', 'Người thay đổi'),
      this.i18n.t('common.updateDate', 'Thời gian thay đổi'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((r) => {
      data.push([
        `${'  '.repeat(r.level)}${r.raw.dispDeptName ?? ''}`,
        r.raw.lockDate ?? '',
        yn(r.flags.lockAttenAnnualFlag),
        yn(r.flags.lockAttenAnnualNightFlag),
        yn(r.flags.lockAttenFlag),
        yn(r.flags.lockAttenNightFlag),
        yn(r.flags.lockOtFlag),
        yn(r.flags.lockOtNightFlag),
        yn(r.flags.lockAttenExFlag),
        yn(r.flags.lockAttenExNightFlag),
        r.raw.updatedBy ?? '',
        r.raw.updateDate ?? '',
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `depart_manager_export_${this.toApiDate(this.lockDate())}.xlsx`);
  }
}
