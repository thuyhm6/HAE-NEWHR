import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaEmpAccountRow, PaEmpAccountService, SyCodeOption } from './pa-emp-account.service';

function toYyyyMmDd(d: Date | null): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Tài khoản lương nhân viên (viewPaEmpAccount) - xem ghi chú định dạng ngày
 * trong pa-emp-account.service.ts. Lọc phòng ban dùng lại
 * EvsAffirmorSetupService.getAuthorizedDepartments/buildDeptTree, tìm nhân
 * viên (chỉ khi Thêm mới) dùng lại EmpSearchService dùng chung.
 */
@Component({
  selector: 'app-pa-emp-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './pa-emp-account.component.html',
  styleUrl: './pa-emp-account.component.scss',
})
export class PaEmpAccountComponent implements OnInit {
  private readonly service = inject(PaEmpAccountService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly empService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpSearch = signal('');
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchDeptNos = signal<string[]>([]);
  protected readonly searchEmpOffice = signal<string | null>(null);
  protected readonly searchBank = signal<string | null>(null);
  protected readonly searchFromDate = signal<Date | null>(null);
  protected readonly searchToDate = signal<Date | null>(null);

  protected readonly bankOptions = signal<SyCodeOption[]>([]);
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);

  protected readonly rows = signal<PaEmpAccountRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly checkedSeqs = signal<Set<number>>(new Set());

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formPaEmpAccountNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpDisplay = signal('');
  protected readonly formEmployeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly formAccountType = signal<string | null>(null);
  protected readonly formAccountNo = signal('');
  protected readonly formAccountAddress = signal('');
  protected readonly formAccountName = signal('');
  protected readonly formSecurityNo = signal('');
  protected readonly formSecurityPayDate = signal('');
  protected readonly formFundNo = signal('');
  protected readonly formFundPayDate = signal('');
  protected readonly formTaxNo = signal('');
  protected readonly formActivity = signal(1);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptList, bankOptions, empOfficeOptions] = await Promise.all([
        this.deptService.getAuthorizedDepartments(),
        this.service.getBankOptions(),
        this.service.getEmpOfficeOptions(),
      ]);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptList) as NzTreeNodeOptions[]);
      this.bankOptions.set(bankOptions);
      this.empOfficeOptions.set(empOfficeOptions);
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
    await this.search();
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getList({
        empSearch: this.searchEmpSearch(),
        deptNos: this.searchDeptNos().join(','),
        empOfficeSearch: this.searchEmpOffice(),
        bankSearch: this.searchBank(),
        fromDateStarted: toYyyyMmDd(this.searchFromDate()),
        toDateStarted: toYyyyMmDd(this.searchToDate()),
        draw: this.pageIndex(),
        start,
        length: this.pageSize(),
      });
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.rows.set(resp.data || []);
      this.checkedSeqs.set(new Set());
    } catch {
      this.rows.set([]);
      this.recordsTotal.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
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

  isChecked(no?: number): boolean {
    return no != null && this.checkedSeqs().has(no);
  }

  toggleChecked(no: number | undefined, checked: boolean): void {
    if (no == null) return;
    const set = new Set(this.checkedSeqs());
    if (checked) set.add(no);
    else set.delete(no);
    this.checkedSeqs.set(set);
  }

  toggleAll(checked: boolean): void {
    this.checkedSeqs.set(checked ? new Set(this.rows().map((r) => r.paEmpAccountNo!).filter((v) => v != null)) : new Set());
  }

  private resetForm(): void {
    this.formPaEmpAccountNo.set(null);
    this.formPersonId.set('');
    this.formEmpDisplay.set('');
    this.formEmployeeOptions.set([]);
    this.formAccountType.set(null);
    this.formAccountNo.set('');
    this.formAccountAddress.set('');
    this.formAccountName.set('');
    this.formSecurityNo.set('');
    this.formSecurityPayDate.set('');
    this.formFundNo.set('');
    this.formFundPayDate.set('');
    this.formTaxNo.set('');
    this.formActivity.set(1);
  }

  openAddModal(): void {
    this.resetForm();
    this.formIsAdd.set(true);
    this.formVisible.set(true);
  }

  async openEditModal(row: PaEmpAccountRow): Promise<void> {
    if (row.paEmpAccountNo == null) return;
    try {
      const dto = await this.service.getOne(row.paEmpAccountNo);
      this.resetForm();
      this.formIsAdd.set(false);
      this.formPaEmpAccountNo.set(dto.paEmpAccountNo ?? null);
      this.formPersonId.set(dto.personId ?? '');
      this.formEmpDisplay.set(`${dto.empId ?? ''} - ${dto.localName ?? ''}`);
      this.formAccountType.set(dto.accountType != null ? String(dto.accountType) : null);
      this.formAccountNo.set(dto.accountNo ?? '');
      this.formAccountAddress.set(dto.accountAddress ?? '');
      this.formAccountName.set(dto.accountName ?? '');
      this.formSecurityNo.set(dto.securityNo ?? '');
      this.formSecurityPayDate.set(dto.securityPayDate ?? '');
      this.formFundNo.set(dto.fundNo ?? '');
      this.formFundPayDate.set(dto.fundPayDate ?? '');
      this.formTaxNo.set(dto.taxNo ?? '');
      this.formActivity.set(dto.activity ?? 1);
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
      this.message.warning(this.i18n.t('pa.empAccount.validateRequired', 'Vui lòng chọn nhân viên!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        paEmpAccountNo: this.formPaEmpAccountNo() ?? undefined,
        personId: this.formPersonId().trim(),
        accountType: this.formAccountType() ? Number(this.formAccountType()) : null,
        accountNo: this.formAccountNo().trim() || undefined,
        accountAddress: this.formAccountAddress().trim() || undefined,
        accountName: this.formAccountName().trim() || undefined,
        securityNo: this.formSecurityNo().trim() || undefined,
        securityPayDate: this.formSecurityPayDate().trim() || undefined,
        fundNo: this.formFundNo().trim() || undefined,
        fundPayDate: this.formFundPayDate().trim() || undefined,
        taxNo: this.formTaxNo().trim() || undefined,
        activity: this.formActivity(),
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.loadList();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteSelected(): void {
    const ids = Array.from(this.checkedSeqs());
    if (!ids.length) {
      this.message.warning(this.i18n.t('pa.empAccount.selectRequired', 'Vui lòng chọn ít nhất một bản ghi!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.empAccount.confirmDelete', 'Bạn có chắc chắn muốn xóa các bản ghi đã chọn?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteList(ids);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.loadList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
