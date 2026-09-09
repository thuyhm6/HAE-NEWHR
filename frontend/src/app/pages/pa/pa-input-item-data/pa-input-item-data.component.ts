import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { TabService } from '../../../shell/tab.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import {
  DOWNLOAD_TEMPLATE_URL,
  PaInputItemDataRow,
  PaInputItemDataService,
  PaParamItemOption,
  SyCodeOption,
} from './pa-input-item-data.service';

function currentMonth(): string {
  const now = new Date();
  return String(now.getMonth() + 1).padStart(2, '0') + now.getFullYear();
}

function formatNumberStr(val: string): string {
  const raw = String(val).replace(/\./g, '').replace(/[^0-9-]/g, '');
  if (!raw) return '';
  const neg = raw.charAt(0) === '-';
  const digits = neg ? raw.substring(1) : raw;
  return (neg ? '-' : '') + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function unformatNumberStr(val: string): string {
  return String(val).replace(/\./g, '');
}

function isValidMMYYYY(val: string): boolean {
  if (!val || !/^\d{6}$/.test(val)) return false;
  const mm = parseInt(val.substring(0, 2), 10);
  return mm >= 1 && mm <= 12;
}

function toYYYYMM(mmyyyy: string): string {
  if (!mmyyyy || mmyyyy.length !== 6) return '';
  return mmyyyy.substring(2) + mmyyyy.substring(0, 2);
}

/**
 * Nhập dữ liệu tiêu chuẩn (viewPaInputItemData) - xem ghi chú trong
 * pa-input-item-data.service.ts. Sau khi import Excel thành công, mở tab
 * viewImportExcelTempPaParamList?paramNo=... để review trước khi lưu chính
 * thức - giống hành vi tabSystem.openTab() của bản gốc, dùng TabService.
 */
@Component({
  selector: 'app-pa-input-item-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './pa-input-item-data.component.html',
  styleUrl: './pa-input-item-data.component.scss',
})
export class PaInputItemDataComponent implements OnInit {
  private readonly service = inject(PaInputItemDataService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly empService = inject(EmpSearchService);
  private readonly route = inject(ActivatedRoute);
  private readonly tabs = inject(TabService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  @ViewChild('returnValueInput') returnValueInputRef?: ElementRef<HTMLInputElement>;

  private itemType = '';

  protected readonly items = signal<PaParamItemOption[]>([]);
  protected readonly selectedParamNo = signal('');
  protected readonly selectedParamName = computed(() => this.items().find((i) => i.paramNo === this.selectedParamNo())?.paramName ?? '');

  protected readonly searchPayMonth = signal(currentMonth());
  protected readonly searchEmpOffice = signal<string | null>(null);
  protected readonly searchDeptNos = signal<string[]>([]);
  protected readonly searchEmpSearch = signal('');
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly rows = signal<PaInputItemDataRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly checkedIds = signal<Set<number>>(new Set());

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formParamDataNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formPersonDisplay = signal('');
  protected readonly formEmployeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly formReturnValueDisplay = signal('');
  protected readonly formStartMonth = signal('');
  protected readonly formEndMonth = signal('');
  protected readonly formRemark = signal('');

  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  readonly downloadTemplateUrl = DOWNLOAD_TEMPLATE_URL;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.itemType = this.route.snapshot.queryParamMap.get('itemType') ?? '';

    try {
      const [items, empOfficeOptions, deptFlat] = await Promise.all([
        this.service.getItemList(this.itemType),
        this.service.getEmpOfficeOptions(),
        this.service.getAuthorizedDepartments(),
      ]);
      this.items.set(items);
      this.empOfficeOptions.set(empOfficeOptions);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  selectItem(item: PaParamItemOption): void {
    if (!item.paramNo) return;
    this.selectedParamNo.set(item.paramNo);
    this.pageIndex.set(1);
    this.loadList();
  }

  private async loadList(): Promise<void> {
    if (!this.selectedParamNo()) return;
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getList({
        paramNo: this.selectedParamNo(),
        payMonth: this.searchPayMonth(),
        empOfficeSearch: this.searchEmpOffice(),
        deptNos: this.searchDeptNos().join(','),
        empSearch: this.searchEmpSearch(),
        draw: 1,
        start,
        length: this.pageSize(),
      });
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.rows.set(resp.data || []);
      this.checkedIds.set(new Set());
    } catch {
      this.rows.set([]);
      this.recordsTotal.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  search(): void {
    this.pageIndex.set(1);
    this.loadList();
  }

  resetSearch(): void {
    this.searchPayMonth.set(currentMonth());
    this.searchEmpOffice.set(null);
    this.searchDeptNos.set([]);
    this.searchEmpSearch.set('');
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

  formatValue(v?: string): string {
    return v != null && v !== '' ? formatNumberStr(v) : '';
  }

  isChecked(id?: number): boolean {
    return id != null && this.checkedIds().has(id);
  }

  toggleChecked(id: number | undefined, checked: boolean): void {
    if (id == null) return;
    const set = new Set(this.checkedIds());
    if (checked) set.add(id);
    else set.delete(id);
    this.checkedIds.set(set);
  }

  toggleAll(checked: boolean): void {
    this.checkedIds.set(checked ? new Set(this.rows().map((r) => r.paramDataNo!).filter((v) => v != null)) : new Set());
  }

  openAddModal(): void {
    if (!this.selectedParamNo()) {
      this.message.warning(this.i18n.t('pa.inputItemData.selectItemFirst', 'Vui lòng chọn hạng mục ở bên trái trước!'));
      return;
    }
    this.formIsAdd.set(true);
    this.formParamDataNo.set(null);
    this.formPersonId.set('');
    this.formPersonDisplay.set('');
    this.formEmployeeOptions.set([]);
    this.formReturnValueDisplay.set('');
    this.formStartMonth.set('');
    this.formEndMonth.set('');
    this.formRemark.set('');
    this.formVisible.set(true);
  }

  async openEditModal(row: PaInputItemDataRow): Promise<void> {
    if (row.paramDataNo == null) return;
    try {
      const dto = await this.service.getOne(row.paramDataNo);
      this.formIsAdd.set(false);
      this.formParamDataNo.set(dto.paramDataNo ?? row.paramDataNo);
      this.formPersonId.set(dto.personId ?? '');
      this.formPersonDisplay.set(`${dto.empId ?? dto.personId ?? ''} - ${dto.localName ?? ''}`);
      this.formReturnValueDisplay.set(this.formatValue(dto.returnValue));
      this.formStartMonth.set(dto.startMonth ?? '');
      this.formEndMonth.set(dto.endMonth ?? '');
      this.formRemark.set(dto.remark ?? '');
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
  }

  onReturnValueInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pos = input.selectionStart ?? 0;
    const oldLen = input.value.length;
    const formatted = formatNumberStr(input.value);
    this.formReturnValueDisplay.set(formatted);
    const newLen = formatted.length;
    setTimeout(() => {
      const newPos = pos + (newLen - oldLen);
      input.setSelectionRange(newPos, newPos);
    });
  }

  async saveForm(): Promise<void> {
    const personId = this.formPersonId().trim();
    const returnValue = unformatNumberStr(this.formReturnValueDisplay()).trim();
    const startMonth = this.formStartMonth().trim();
    const endMonth = this.formEndMonth().trim();

    if (!personId) {
      this.message.warning(this.i18n.t('pa.inputItemData.personIdRequired', 'Vui lòng nhập mã nhân viên!'));
      return;
    }
    if (!returnValue) {
      this.message.warning(this.i18n.t('pa.inputItemData.valueRequired', 'Vui lòng nhập giá trị!'));
      return;
    }
    if (!startMonth) {
      this.message.warning(this.i18n.t('pa.inputItemData.startRequired', 'Vui lòng nhập tháng bắt đầu!'));
      return;
    }
    if (!isValidMMYYYY(startMonth)) {
      this.message.warning(this.i18n.t('pa.inputItemData.invalidMonthFormat', 'Định dạng tháng không hợp lệ. Vui lòng nhập theo định dạng MMYYYY (ví dụ: 012026).'));
      return;
    }
    if (endMonth) {
      if (!isValidMMYYYY(endMonth)) {
        this.message.warning(this.i18n.t('pa.inputItemData.invalidMonthFormat', 'Định dạng tháng không hợp lệ. Vui lòng nhập theo định dạng MMYYYY (ví dụ: 012026).'));
        return;
      }
      if (toYYYYMM(startMonth) > toYYYYMM(endMonth)) {
        this.message.warning(this.i18n.t('pa.inputItemData.startGreaterThanEnd', 'Tháng bắt đầu không được lớn hơn tháng kết thúc!'));
        return;
      }
    }

    this.formSaving.set(true);
    try {
      const dto: PaInputItemDataRow = {
        paramDataNo: this.formParamDataNo() ?? undefined,
        paramNo: this.selectedParamNo(),
        personId,
        returnValue,
        startMonth,
        endMonth,
        remark: this.formRemark(),
      };
      const res = this.formIsAdd() ? await this.service.insert(dto) : await this.service.update(dto);
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

  deleteSelected(): void {
    const ids = Array.from(this.checkedIds());
    if (!ids.length) {
      this.message.warning(this.i18n.t('pa.inputItemData.selectRequired', 'Vui lòng chọn ít nhất một bản ghi!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.inputItemData.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi đã chọn?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          for (const id of ids) {
            await this.service.delete(id);
          }
          this.message.success(this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.loadList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }

  openImportModal(): void {
    if (!this.selectedParamNo()) {
      this.message.warning(this.i18n.t('pa.inputItemData.selectItemFirst', 'Vui lòng chọn hạng mục ở bên trái trước!'));
      return;
    }
    this.importFile.set(null);
    this.importModalVisible.set(true);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile.set(input.files && input.files.length ? input.files[0] : null);
  }

  async submitImport(): Promise<void> {
    const file = this.importFile();
    const paramNo = this.selectedParamNo();
    if (!file || !paramNo) return;
    this.importing.set(true);
    try {
      await this.service.importExcel(file, paramNo);
      this.importModalVisible.set(false);
      const paramName = this.selectedParamName();
      this.tabs.openTab(
        `/pa/salary/viewImportExcelTempPaParamList?paramNo=${encodeURIComponent(paramNo)}`,
        this.i18n.t('pa.inputItemData.importResultTitle', 'Kết quả nhập') + (paramName ? ' - ' + paramName : ''),
        'route',
      );
    } catch {
      this.importModalVisible.set(false);
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.importing.set(false);
    }
  }
}
