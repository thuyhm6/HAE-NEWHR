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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { ImportFromDeviceResponse } from '../card-record-for-self/card-record-for-self.service';
import { CardRecordDayService, ShiftOption } from '../card-record-day/card-record-day.service';
import {
  CardRecordFilter,
  CardRecordRow,
  CardRecordSavePayload,
  CardRecordService,
  DOWNLOAD_TEMPLATE_URL,
} from './card-record.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface RowVm {
  raw: CardRecordRow;
  checked: boolean;
  selectable: boolean;
}

function todayStr(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isAutoSource(insertBy: string | undefined): boolean {
  const src = (insertBy ?? '').toUpperCase();
  return src === 'M' || src === 'A';
}

/**
 * CRUD đầy đủ bản ghi quẹt thẻ ra vào (tra cứu, thêm/sửa/xóa từng dòng, xóa
 * hàng loạt, đọc dữ liệu quẹt thẻ trực tiếp từ máy chủ, import/xuất Excel) -
 * port lại từ ar/attendanceMintenance/viewArCardRecord.html (đã xoá). Không
 * replicate điều kiện ẩn nút theo `sysMode` của bản gốc vì giá trị này không
 * bao giờ được set trong thực tế (xem ghi chú ở CardRecordService) - luôn
 * hiển thị đầy đủ nút CRUD. Tái sử dụng dept-tree (ArPersonalListService),
 * tìm kiếm nhân viên (SstOtApplyService), danh sách ca làm
 * (CardRecordDayService) và modal đọc dữ liệu máy chủ (pattern từ
 * CardRecordForSelfComponent).
 */
@Component({
  selector: 'app-card-record',
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
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './card-record.component.html',
  styleUrl: './card-record.component.scss',
})
export class CardRecordComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(CardRecordService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly empService = inject(SstOtApplyService);
  private readonly shiftService = inject(CardRecordDayService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(todayStr());
  protected readonly toDate = signal<Date | null>(todayStr());
  protected readonly shiftNo = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<RowVm[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(TABLE_DEFAULT_PAGE_SIZE);
  private listBootstrapped = false;
  private drawCounter = 0;

  protected readonly allChecked = computed(() => {
    const selectable = this.rows().filter((r) => r.selectable);
    return selectable.length > 0 && selectable.every((r) => r.checked);
  });

  // ── Modal Thêm/Sửa ────────────────────────────────────────────────────
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formRecordNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpId = signal('');
  protected readonly formEmpNameDisplay = signal('');
  protected readonly formArDate = signal<Date | null>(null);
  protected readonly formSwipeDateTime = signal<Date | null>(null);
  protected readonly formDoorType = signal<string | null>(null);
  protected readonly formRemark = signal('');

  protected readonly empPickerVisible = signal(false);
  protected readonly empPickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly empPickerSearching = signal(false);
  private empPickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  // ── Modal Đọc dữ liệu quẹt thẻ từ máy chủ ───────────────────────────────
  protected readonly importModalVisible = signal(false);
  protected readonly importFromDate = signal<Date | null>(null);
  protected readonly importToDate = signal<Date | null>(null);
  protected readonly importing = signal(false);
  protected readonly importResult = signal<ImportFromDeviceResponse | null>(null);

  // ── Modal Import Excel ───────────────────────────────────────────────
  protected readonly importExcelModalVisible = signal(false);
  protected readonly importExcelFile = signal<File | null>(null);
  protected readonly importingExcel = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptList, shiftList] = await Promise.all([
        this.deptService.getAuthorizedDepartments(),
        this.shiftService.getShiftOptions(),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.shiftOptions.set(shiftList);
    } catch {
      // Danh sách bộ lọc trống không chặn việc tra cứu chính.
    }
    await this.search();
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

  private toApiFilterDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  private toApiArDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : '';
  }

  private toApiDateTime(value: Date | null): string {
    return value ? formatDate(value, 'yyyy/MM/dd HH:mm', 'en-US') : '';
  }

  private buildFilter(): CardRecordFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiFilterDate(this.fromDate()),
      toDate: this.toApiFilterDate(this.toDate()),
      shiftNo: this.shiftNo() ?? undefined,
    };
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.shiftNo.set(null);
    this.fromDate.set(todayStr());
    this.toDate.set(todayStr());
    this.search();
  }

  async onQueryParamsChange(params: NzTableQueryParams): Promise<void> {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    if (!this.listBootstrapped) {
      this.listBootstrapped = true;
      return;
    }
    await this.loadPage();
  }

  private async loadPage(): Promise<void> {
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getPageList(this.buildFilter(), ++this.drawCounter, start, this.pageSize());
      this.rows.set(
        (res.data ?? []).map((raw) => ({ raw, checked: false, selectable: !isAutoSource(raw.insertBy) })),
      );
      this.total.set(res.recordsTotal ?? 0);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  toggleAll(checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => (r.selectable ? { ...r, checked } : r)));
  }

  toggleRow(recordNo: number | undefined, checked: boolean): void {
    this.rows.update((rows) => rows.map((r) => (r.raw.recordNo === recordNo ? { ...r, checked } : r)));
  }

  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('common.empId', 'Mã nhân viên'),
      this.i18n.t('common.empName', 'Họ tên'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('common.position', 'Chức vụ'),
      this.i18n.t('attSearch.shiftType', 'Ca'),
      this.i18n.t('attSearch.workDate', 'Ngày công'),
      this.i18n.t('acr.col.swipeTime', 'Thời gian quẹt thẻ'),
      this.i18n.t('acr.col.doorType', 'Loại'),
      this.i18n.t('acr.col.dataSource', 'Nguồn dữ liệu'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((r, idx) => {
      const row = r.raw;
      data.push([
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.postGradeName ?? '',
        row.shiftName ?? '',
        row.arDateStr ?? '',
        row.swipeTime ?? '',
        row.doorType ?? '',
        row.dataSourceName ?? '',
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'lich_su_ra_vao.xlsx');
  }

  // ── Thêm/Sửa bản ghi ─────────────────────────────────────────────────
  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formRecordNo.set(null);
    this.formPersonId.set('');
    this.formEmpId.set('');
    this.formEmpNameDisplay.set('');
    this.formArDate.set(null);
    this.formSwipeDateTime.set(null);
    this.formDoorType.set(null);
    this.formRemark.set('');
    this.modalVisible.set(true);
  }

  async openEditModal(recordNo: number | undefined): Promise<void> {
    if (recordNo == null) return;
    try {
      const res = await this.service.getDetail(recordNo);
      if (!res.success || !res.data) {
        this.message.error(res.message || this.i18n.t('acr.msg.loadDetailError', 'Không thể tải dữ liệu bản ghi.'));
        return;
      }
      const d = res.data;
      this.modalIsEdit.set(true);
      this.formRecordNo.set(d.recordNo ?? recordNo);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpId.set(d.empId ?? '');
      this.formEmpNameDisplay.set(`${d.empId ?? ''}${d.localName ? ' - ' + d.localName : ''}`);
      this.formArDate.set(this.parseArDate(d.arDateStr));
      this.formSwipeDateTime.set(this.parseSwipeDateTime(d.swipeDatetime));
      this.formDoorType.set(d.doorType ?? null);
      this.formRemark.set(d.remark ?? '');
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('acr.msg.loadDetailError', 'Không thể tải dữ liệu bản ghi.'));
    }
  }

  private parseArDate(value: string | undefined): Date | null {
    if (!value) return null;
    const m = value.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }

  private parseSwipeDateTime(value: string | undefined): Date | null {
    if (!value) return null;
    const m = value.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    const personId = this.formPersonId().trim();
    const arDate = this.formArDate();
    const swipeDateTime = this.formSwipeDateTime();
    if (!personId) {
      this.message.warning(this.i18n.t('acr.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    if (!arDate) {
      this.message.warning(this.i18n.t('acr.msg.selectWorkDate', 'Vui lòng nhập ngày công'));
      return;
    }
    if (!swipeDateTime) {
      this.message.warning(this.i18n.t('acr.msg.selectDatetime', 'Vui lòng nhập thời gian quẹt thẻ'));
      return;
    }
    const payload: CardRecordSavePayload = {
      recordNo: this.formRecordNo(),
      personId,
      cardNo: this.formEmpId().trim() || null,
      arDateStr: this.toApiArDate(arDate),
      doorType: this.formDoorType(),
      remark: this.formRemark().trim() || null,
      swipeDatetime: this.toApiDateTime(swipeDateTime),
    };
    this.savingRecord.set(true);
    try {
      const res = this.modalIsEdit() ? await this.service.update(payload) : await this.service.insert(payload);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.loadPage();
      } else {
        this.message.error(res.message || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('acr.msg.saveError', 'Lỗi khi lưu bản ghi.'));
    } finally {
      this.savingRecord.set(false);
    }
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
      this.formEmpId.set(emp.empId ?? '');
      this.formEmpNameDisplay.set(`${emp.empId ?? ''} - ${emp.localName ?? ''}`);
    }
    this.closeEmpPicker();
  }

  // ── Xóa ────────────────────────────────────────────────────────────
  deleteOne(recordNo: number | undefined): void {
    if (recordNo == null) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('acr.confirm.deleteRecord', 'Bạn có chắc muốn xóa bản ghi này không?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(recordNo);
          if (res.success) {
            await this.loadPage();
          } else {
            this.message.error(res.message || this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('acr.msg.deleteError', 'Lỗi khi xóa bản ghi.'));
        }
      },
    });
  }

  deleteSelected(): void {
    const checked = this.rows().filter((r) => r.checked && r.raw.recordNo != null);
    if (!checked.length) {
      this.message.warning(this.i18n.t('acr.msg.selectToDelete', 'Vui lòng chọn ít nhất một bản ghi để xóa'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('acr.confirm.deleteSelected', 'Bạn có chắc muốn xóa các bản ghi đã chọn không?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await Promise.all(checked.map((r) => this.service.delete(r.raw.recordNo!)));
        } finally {
          await this.loadPage();
        }
      },
    });
  }

  // ── Đọc dữ liệu quẹt thẻ từ máy chủ ─────────────────────────────────
  openImportModal(): void {
    this.importFromDate.set(this.fromDate());
    this.importToDate.set(this.toDate());
    this.importResult.set(null);
    this.importModalVisible.set(true);
  }

  closeImportModal(): void {
    this.importModalVisible.set(false);
  }

  async runImport(): Promise<void> {
    const fromDate = this.toApiFilterDate(this.importFromDate());
    const toDate = this.toApiFilterDate(this.importToDate());
    if (!fromDate || !toDate) {
      this.message.warning(this.i18n.t('acr.imp.msg.selectDate', 'Vui lòng chọn khoảng thời gian cần đọc dữ liệu'));
      return;
    }
    this.importing.set(true);
    this.importResult.set(null);
    try {
      const res = await this.service.importFromDevice(fromDate, toDate);
      this.importResult.set(res);
      if (res.success) {
        await this.loadPage();
      }
    } catch {
      this.importResult.set({ success: false, message: this.i18n.t('acr.imp.msg.connectError', 'Lỗi kết nối máy chủ, vui lòng thử lại.') });
    } finally {
      this.importing.set(false);
    }
  }

  // ── Import/Tải file mẫu Excel ────────────────────────────────────────
  downloadTemplate(): void {
    window.location.href = DOWNLOAD_TEMPLATE_URL;
  }

  openImportExcelModal(): void {
    this.importExcelFile.set(null);
    this.importExcelModalVisible.set(true);
  }

  closeImportExcelModal(): void {
    this.importExcelModalVisible.set(false);
  }

  onImportExcelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importExcelFile.set(input.files && input.files.length ? input.files[0] : null);
  }

  async submitImportExcel(): Promise<void> {
    const file = this.importExcelFile();
    if (!file) return;
    this.importingExcel.set(true);
    try {
      const res = await this.service.uploadExcel(file);
      this.importExcelModalVisible.set(false);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.importSuccess', 'Import thành công!'));
      } else {
        this.message.warning(res.message || this.i18n.t('common.importPartialError', 'Import hoàn tất nhưng có lỗi.'));
      }
      window.open('/ar/attendanceMintenance/viewImportExcelTempMacRecordsList', '_blank');
      await this.loadPage();
    } catch {
      this.importExcelModalVisible.set(false);
      this.message.error(this.i18n.t('acr.imp.msg.uploadError', 'Lỗi khi tải file Excel lên.'));
    } finally {
      this.importingExcel.set(false);
    }
  }
}
