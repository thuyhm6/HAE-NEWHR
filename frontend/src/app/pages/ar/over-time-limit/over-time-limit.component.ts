import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { TABLE_DEFAULT_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
import { I18nService } from '../../../i18n/i18n.service';
import { AttendanceExForBatchService, POST_FAMILY_PARENT_CODE, SyCodeOption } from '../../ess/attendance-ex-for-batch/attendance-ex-for-batch.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import { OTL_DOWNLOAD_TEMPLATE_URL, OverTimeLimitRow, OverTimeLimitService } from './over-time-limit.service';

/** Giá trị Có/Không đang chỉnh sửa trên từng dòng (OT_LIMIT_MONTH_{i} / OT_LIMIT_YEAR_{i} bản cũ). */
interface EditState {
  month: string;
  year: string;
}

function currentMonthDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Giới hạn tăng ca theo tháng - port lại từ
 * ar/attendanceMintenance/viewOverTimeLimit.jsp (dự án Hanwha_HAE cũ).
 * - Lọc: mã/tên NV, phòng ban (nhiều), tháng bắt đầu/kết thúc, khóa tháng/năm,
 *   nhóm nhân viên, thời gian tăng ca >=.
 * - Sửa cờ khóa Tháng/Năm trực tiếp trên lưới (đổi giá trị tự tick dòng), "Thực
 *   hiện tất cả" gán nhanh giá trị cho các dòng đã tick, Lưu các dòng đã tick.
 * - Tải file mẫu / Import Excel (cập nhật HR_EMPLOYEE.OT_LIMIT, OT_LIMIT_100) và
 *   xuất Excel (.xlsx) phía client từ kết quả tra cứu.
 * Tái sử dụng: cây phòng ban được phân quyền (ArPersonalListService) và danh
 * mục nhóm nhân viên (AttendanceExForBatchService, parent 14015812).
 */
@Component({
  selector: 'app-over-time-limit',
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
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './over-time-limit.component.html',
  styleUrl: './over-time-limit.component.scss',
})
export class OverTimeLimitComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(OverTimeLimitService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly codeService = inject(AttendanceExForBatchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  // ── Bộ lọc ───────────────────────────────────────────────────────────
  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly startMonth = signal<Date | null>(currentMonthDate());
  protected readonly endMonth = signal<Date | null>(currentMonthDate());
  protected readonly filterOtLimitMonth = signal<string>('');
  protected readonly filterOtLimitYear = signal<string>('');
  protected readonly postFamily = signal<string | null>(null);
  protected readonly minOtHours = signal<number | null>(0);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);

  // ── Lưới dữ liệu ─────────────────────────────────────────────────────
  protected readonly listLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly rows = signal<OverTimeLimitRow[]>([]);
  protected readonly editMap = signal<Map<string, EditState>>(new Map());
  protected readonly checkedIds = signal<Set<string>>(new Set());

  protected readonly allChecked = computed(() => {
    const rows = this.rows();
    return rows.length > 0 && rows.every((r) => this.checkedIds().has(r.otLimitNo ?? ''));
  });
  protected readonly indeterminate = computed(() => this.checkedIds().size > 0 && !this.allChecked());

  // ── Thực hiện tất cả (gán nhanh) ─────────────────────────────────────
  protected readonly fillOtLimitMonth = signal<string>('');
  protected readonly fillOtLimitYear = signal<string>('');

  // ── Import Excel ─────────────────────────────────────────────────────
  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptList, postFamilyList] = await Promise.all([
        this.deptService.getAuthorizedDepartments(),
        this.codeService.getCodeList(POST_FAMILY_PARENT_CODE),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
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

  private toApiMonth(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyyMM', 'en-US') : undefined;
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      const minOt = this.minOtHours();
      const rows = await this.service.getList({
        keyword: this.keyword().trim() || undefined,
        deptNos: this.selectedDeptCodes().join(',') || undefined,
        startMonth: this.toApiMonth(this.startMonth()),
        endMonth: this.toApiMonth(this.endMonth()),
        postFamily: this.postFamily() ?? undefined,
        otLimitMonth: this.filterOtLimitMonth() || undefined,
        otLimitYear: this.filterOtLimitYear() || undefined,
        minOtHours: minOt != null ? String(minOt) : undefined,
      });
      this.rows.set(rows);
      this.resetEditState(rows);
    } catch {
      this.rows.set([]);
      this.resetEditState([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.startMonth.set(currentMonthDate());
    this.endMonth.set(currentMonthDate());
    this.filterOtLimitMonth.set('');
    this.filterOtLimitYear.set('');
    this.postFamily.set(null);
    this.minOtHours.set(0);
    this.search();
  }

  private resetEditState(rows: OverTimeLimitRow[]): void {
    const map = new Map<string, EditState>();
    rows.forEach((r) => {
      if (r.otLimitNo) {
        map.set(r.otLimitNo, { month: String(r.otLimitMonth ?? '0'), year: String(r.otLimitYear ?? '0') });
      }
    });
    this.editMap.set(map);
    this.checkedIds.set(new Set());
  }

  // ── Chỉnh sửa trên lưới ──────────────────────────────────────────────
  editValue(row: OverTimeLimitRow, field: keyof EditState): string {
    return this.editMap().get(row.otLimitNo ?? '')?.[field] ?? '0';
  }

  onEditChange(row: OverTimeLimitRow, field: keyof EditState, value: string): void {
    const id = row.otLimitNo;
    if (!id) return;
    const map = new Map(this.editMap());
    const current = map.get(id) ?? { month: '0', year: '0' };
    map.set(id, { ...current, [field]: value });
    this.editMap.set(map);
    // Giống bản cũ: đổi giá trị thì tự tick dòng đó.
    this.setChecked(id, true);
  }

  isChecked(row: OverTimeLimitRow): boolean {
    return this.checkedIds().has(row.otLimitNo ?? '');
  }

  setChecked(id: string | undefined, checked: boolean): void {
    if (!id) return;
    const set = new Set(this.checkedIds());
    if (checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    this.checkedIds.set(set);
  }

  onAllChecked(checked: boolean): void {
    this.checkedIds.set(checked ? new Set(this.rows().map((r) => r.otLimitNo ?? '').filter(Boolean)) : new Set());
  }

  /** "Thực hiện tất cả" - gán giá trị đã chọn cho các dòng đang tick (bỏ qua ô để "Tất cả"). */
  applyFillToChecked(): void {
    const ids = this.checkedIds();
    if (!ids.size) {
      this.message.error(this.i18n.t('ar.viewApplyAttenanceManagentInfoList.QINGXUANZEXIUGAINEIRONG.b', 'Xin chọn nội dung sửa'));
      return;
    }
    const month = this.fillOtLimitMonth();
    const year = this.fillOtLimitYear();
    const map = new Map(this.editMap());
    ids.forEach((id) => {
      const current = map.get(id) ?? { month: '0', year: '0' };
      map.set(id, { month: month !== '' ? month : current.month, year: year !== '' ? year : current.year });
    });
    this.editMap.set(map);
  }

  save(): void {
    const ids = Array.from(this.checkedIds());
    if (!ids.length) {
      this.message.info(this.i18n.t('ar.viewApplyAttenanceManagentInfoList.QINGXUANZEXIUGAINEIRONG.b', 'Xin chọn nội dung sửa'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.contractInfo.SURE_UPDATE.Z', 'Đồng ý sửa không?'),
      nzOnOk: async () => {
        const map = this.editMap();
        const items = ids.map((id) => ({
          otLimitNo: id,
          otLimitMonth: map.get(id)?.month ?? '',
          otLimitYear: map.get(id)?.year ?? '',
        }));
        this.saving.set(true);
        try {
          const res = await this.service.save(items);
          if (res.success) {
            this.message.success(this.i18n.t(res.messageKey ?? 'alert.message.update_success', 'Sửa thành công!'));
            await this.search();
          } else {
            this.message.error(this.i18n.t(res.messageKey ?? 'alert.message.update_fail', 'Sửa thất bại!'));
          }
        } catch {
          this.message.error(this.i18n.t('alert.message.update_fail', 'Sửa thất bại!'));
        } finally {
          this.saving.set(false);
        }
      },
    });
  }

  // ── Tải file mẫu / Import Excel ──────────────────────────────────────
  downloadTemplate(): void {
    window.location.href = OTL_DOWNLOAD_TEMPLATE_URL;
  }

  openImportModal(): void {
    this.importFile.set(null);
    this.importModalVisible.set(true);
  }

  closeImportModal(): void {
    this.importModalVisible.set(false);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile.set(input.files && input.files.length ? input.files[0] : null);
  }

  async submitImport(): Promise<void> {
    const file = this.importFile();
    if (!file) return;
    this.importing.set(true);
    try {
      const res = await this.service.importExcel(file);
      this.importModalVisible.set(false);
      if (res.success) {
        this.message.success(this.i18n.t('common.importSuccess', 'Import thành công!'));
      } else if (res.errors?.length) {
        this.modal.warning({
          nzTitle: this.i18n.t('common.importPartialError', 'Import hoàn tất nhưng có lỗi.'),
          nzContent: res.errors.join('<br/>'),
        });
      } else {
        this.message.error(res.message || this.i18n.t('common.importPartialError', 'Import hoàn tất nhưng có lỗi.'));
      }
      await this.search();
    } catch {
      this.importModalVisible.set(false);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.importing.set(false);
    }
  }

  // ── Xuất Excel (.xlsx) ───────────────────────────────────────────────
  private yesNo(value: string | undefined): string {
    return String(value) === '1' ? this.i18n.t('common.yes', 'Có') : this.i18n.t('common.no', 'Không');
  }

  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const otLimit = this.i18n.t('ar.viewAdjustLeaveTSTOBatchList.JIABANSHANGXIAN.b', 'Giới hạn tăng ca');
    const otTotal = this.i18n.t('ess.title.JIABANLEIJI', 'Tổng tăng ca');
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('common.empId', 'Mã nhân viên'),
      this.i18n.t('common.empName', 'Họ tên'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('ar.excelexport.title.month', 'Tháng'),
      `${otLimit} ${this.i18n.t('ar.excelexport.title.month', 'Tháng')}`,
      `${otLimit} ${this.i18n.t('rp.report.title.year', 'Năm')}`,
      `${otTotal} - ${this.i18n.t('ess.viewPiciOtAffirmBatchList.BENNIAN.b', 'Năm nay')}`,
      `${otTotal} - ${this.i18n.t('ess.viewPiciOtAffirmBatchList.BENYUE.b', 'Tháng này')}`,
      `${otTotal} - ${this.i18n.t('ar.viewitemparameter.title.pingshi', 'Ngày thường')}`,
      `${otTotal} - ${this.i18n.t('ess.viewMonthDetailList.OT_ON_SATURDAY.b', 'Thứ 7')}`,
      `${otTotal} - ${this.i18n.t('ar.viewitemparameter.title.zhoumo', 'Cuối tuần')}`,
      `${otTotal} - ${this.i18n.t('ar.viewitemparameter.title.jiejiari', 'Ngày nghỉ lễ')}`,
      this.i18n.t('hrm.empinfo.UPDATED_BY', 'Người thay đổi'),
      this.i18n.t('hrm.empinfo.UPDATE_DATE', 'Thời gian thay đổi'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      data.push([
        idx + 1,
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.arMonthStr ?? '',
        this.yesNo(row.otLimitMonth),
        this.yesNo(row.otLimitYear),
        row.otTotail ?? '',
        row.otTotailMonth ?? '',
        row.weekdayOtTotail ?? '',
        row.saturdayOtTotail ?? '',
        row.weekendOtTotail ?? '',
        row.hoildayOtTotail ?? '',
        row.updatedById ? `${row.updatedById} - ${row.updateLocalName ?? ''}` : '',
        row.updateDate ?? '',
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Over_Time_Limit');
    XLSX.writeFile(workbook, 'over_time_limit.xlsx');
  }
}
