import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PaPayObjRow, PaPayObjService, SyCodeOption } from './pa-pay-obj.service';

interface DirtyRow {
  payScheduleNo: string;
  empId: string;
  includeType: number;
}

/**
 * Đối tượng nhận lương (viewPaPayObj) - xem ghi chú trong pa-pay-obj.service.ts.
 * Cột "Phân biệt" cho phép sửa trực tiếp trên bảng (giống bản gốc), các
 * dòng đã sửa được theo dõi trong dirtyRows và chỉ gửi lên khi bấm "Lưu".
 */
@Component({
  selector: 'app-pa-pay-obj',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-pay-obj.component.html',
  styleUrl: './pa-pay-obj.component.scss',
})
export class PaPayObjComponent implements OnInit {
  private readonly service = inject(PaPayObjService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly empService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);

  protected readonly searchEmpSearch = signal('');
  protected readonly searchPayScheduleNo = signal<string | null>(null);
  protected readonly searchIncludeType = signal<string | null>(null);
  protected readonly searchEmpOffice = signal<string | null>(null);

  protected readonly rows = signal<PaPayObjRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly checkedKeys = signal<Set<string>>(new Set());

  private dirtyRows = new Map<string, DirtyRow>();
  protected readonly dirtyCount = signal(0);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formPayScheduleNo = signal<string | null>(null);
  protected readonly formEmpId = signal('');
  protected readonly formEmpDisplay = signal('');
  protected readonly formIncludeType = signal(1);
  protected readonly formEmployeeOptions = signal<EmployeeSearchResult[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [schedules, empOfficeOptions] = await Promise.all([
        this.payScheduleService.getList('', '', null),
        this.service.getEmpOfficeOptions(),
      ]);
      this.scheduleOptions.set(schedules);
      this.empOfficeOptions.set(empOfficeOptions);
      if (schedules.length) this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
    await this.loadList();
  }

  scheduleLabel(sch: PaPayScheduleRow): string {
    return `${sch.payDate} - ${sch.salaryDistinName ?? ''}`;
  }

  rowKey(row: PaPayObjRow): string {
    return `${row.payScheduleNo}_${row.empId}`;
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getList({
        empSearch: this.searchEmpSearch(),
        payScheduleNo: this.searchPayScheduleNo(),
        includeType: this.searchIncludeType(),
        empOffice: this.searchEmpOffice(),
        draw: 1,
        start,
        length: this.pageSize(),
      });
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.rows.set(resp.data || []);
      this.checkedKeys.set(new Set());
    } catch {
      this.rows.set([]);
      this.recordsTotal.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  search(): void {
    this.dirtyRows.clear();
    this.dirtyCount.set(0);
    this.pageIndex.set(1);
    this.loadList();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadList();
  }

  isChecked(key: string): boolean {
    return this.checkedKeys().has(key);
  }

  toggleChecked(key: string, checked: boolean): void {
    const set = new Set(this.checkedKeys());
    if (checked) set.add(key);
    else set.delete(key);
    this.checkedKeys.set(set);
  }

  toggleAll(checked: boolean): void {
    this.checkedKeys.set(checked ? new Set(this.rows().map((r) => this.rowKey(r))) : new Set());
  }

  onIncludeTypeChange(row: PaPayObjRow, value: number): void {
    row.includeType = value;
    const key = this.rowKey(row);
    this.dirtyRows.set(key, { payScheduleNo: row.payScheduleNo!, empId: row.empId!, includeType: value });
    this.dirtyCount.set(this.dirtyRows.size);
  }

  isDirty(row: PaPayObjRow): boolean {
    return this.dirtyRows.has(this.rowKey(row));
  }

  openAddModal(): void {
    this.formPayScheduleNo.set(this.scheduleOptions()[0]?.payScheduleNo ?? null);
    this.formEmpId.set('');
    this.formEmpDisplay.set('');
    this.formIncludeType.set(1);
    this.formEmployeeOptions.set([]);
    this.formVisible.set(true);
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

  onEmployeeSelect(empId: string | null): void {
    this.formEmpId.set(empId ?? '');
  }

  async saveNew(): Promise<void> {
    const payScheduleNo = this.formPayScheduleNo();
    const empId = this.formEmpId().trim();
    if (!payScheduleNo || !empId) {
      this.message.warning(this.i18n.t('pa.payObj.validateRequired', 'Vui lòng nhập đầy đủ thông tin bắt buộc!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({ payScheduleNo, empId, includeType: this.formIncludeType() });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.loadList();
      } else {
        this.message.error(res.error || res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  async saveDirty(): Promise<void> {
    const items = [...this.dirtyRows.values()];
    if (!items.length) {
      this.message.info(this.i18n.t('pa.payObj.noDirty', 'Không có dữ liệu thay đổi'));
      return;
    }
    try {
      const res = await this.service.saveList(items);
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.dirtyRows.clear();
      this.dirtyCount.set(0);
      await this.loadList();
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    }
  }

  deleteSelected(): void {
    const keys = [...this.checkedKeys()];
    if (!keys.length) {
      this.message.warning(this.i18n.t('pa.payObj.selectRequired', 'Vui lòng chọn ít nhất một bản ghi!'));
      return;
    }
    const targets = this.rows().filter((r) => keys.includes(this.rowKey(r)));
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.payObj.confirmDelete', 'Bạn có chắc chắn muốn xóa các bản ghi đã chọn?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteList(targets.map((r) => ({ payScheduleNo: r.payScheduleNo!, empId: r.empId! })));
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          this.dirtyRows.clear();
          this.dirtyCount.set(0);
          await this.loadList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }

  exportExcel(): void {
    const url = this.service.buildExportUrl(this.searchEmpSearch(), this.searchPayScheduleNo(), this.searchIncludeType(), this.searchEmpOffice());
    window.location.href = url;
  }
}
