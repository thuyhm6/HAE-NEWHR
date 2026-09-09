import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../i18n/i18n.service';
import { AttendanceExForBatchService, POST_FAMILY_PARENT_CODE, SyCodeOption } from '../../ess/attendance-ex-for-batch/attendance-ex-for-batch.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import { CardRecordDayService, ShiftOption } from '../card-record-day/card-record-day.service';
import { AttendanceSearchFilter, AttendanceSearchRow, AttendanceSearchService, ItemOption, SyncCleverseTestResponse } from './attendance-search.service';

function yesterday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
}

function todayStr(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Tra cứu chi tiết công (nghỉ phép/chấm công bất thường) theo phòng ban được
 * phân quyền - port lại từ
 * ar/attendanceMintenance/viewAttendanceManagentForSerchInfoList.html (đã
 * xoá). Danh sách trả về mảng phẳng (không phân trang server-side, bản gốc
 * dùng DataTables client-paged) nên dùng nz-table phân trang phía client và
 * xuất Excel toàn bộ `rows()` bằng SheetJS (khớp hành vi nút "excel" của
 * DataTables Buttons ở chế độ không serverSide - xuất toàn bộ dữ liệu đã
 * tải, không chỉ trang hiện tại). Tái sử dụng dept-tree
 * (ArPersonalListService), ca làm (CardRecordDayService) và nhóm nhân viên
 * (AttendanceExForBatchService.getCodeList).
 */
@Component({
  selector: 'app-attendance-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
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
  templateUrl: './attendance-search.component.html',
  styleUrl: './attendance-search.component.scss',
})
export class AttendanceSearchComponent implements OnInit {
  protected readonly service = inject(AttendanceSearchService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly shiftService = inject(CardRecordDayService);
  private readonly codeService = inject(AttendanceExForBatchService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(yesterday());
  protected readonly toDate = signal<Date | null>(todayStr());
  protected readonly postFamily = signal<string | null>(null);
  protected readonly shiftNo = signal<string | null>(null);
  protected readonly itemNo = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly shiftOptions = signal<ShiftOption[]>([]);
  protected readonly itemOptions = signal<ItemOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<AttendanceSearchRow[]>([]);

  // ── Modal Test Sync Cleverse (DEV) ────────────────────────────────────
  protected readonly syncModalVisible = signal(false);
  protected readonly syncEnterCd = signal('HAPM');
  protected readonly syncSabun = signal('19945437');
  protected readonly syncGntCd = signal('517_EH');
  protected readonly syncSYmd = signal('20260612');
  protected readonly syncEYmd = signal('20260612');
  protected readonly syncInstanceId = signal('HAPM19910157Q28242988');
  protected readonly syncCancelYn = signal('N');
  protected readonly syncIfId = signal('HHR');
  protected readonly syncStatus = signal('0');
  protected readonly syncReason = signal('Refresh');
  protected readonly syncSending = signal(false);
  protected readonly syncResult = signal<SyncCleverseTestResponse | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadFilterOptions();
    await this.search();
  }

  protected async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, postFamilyList, shiftList, itemList] = await Promise.all([
        this.deptService.getAuthorizedDepartments(),
        this.codeService.getCodeList(POST_FAMILY_PARENT_CODE),
        this.shiftService.getShiftOptions(),
        this.service.getItemOptions('attendance'),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.shiftOptions.set(shiftList);
      this.itemOptions.set(itemList);
    } catch {
      // Danh sách bộ lọc trống không chặn việc tra cứu chính.
    }
  }

  protected buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
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

  protected toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  protected buildFilter(): AttendanceSearchFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      postFamily: this.postFamily() ?? undefined,
      shiftNo: this.shiftNo() ?? undefined,
      itemNo: this.itemNo() ?? undefined,
    };
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.buildFilter()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.postFamily.set(null);
    this.shiftNo.set(null);
    this.itemNo.set(null);
    this.fromDate.set(yesterday());
    this.toDate.set(todayStr());
    this.search();
  }

  exportExcel(): void {
    const rows = this.rows();
    if (!rows.length) {
      this.message.warning(this.i18n.t('vapl.msg.noDataExport', 'Không có dữ liệu để xuất.'));
      return;
    }
    const header = [
      this.i18n.t('common.stt', 'STT'),
      this.i18n.t('attSearch.workDate', 'Ngày công'),
      this.i18n.t('common.empId', 'Mã nhân viên'),
      this.i18n.t('common.empName', 'Tên nhân viên'),
      this.i18n.t('common.deptName', 'Phòng ban'),
      this.i18n.t('attSearch.position', 'Chức vụ'),
      this.i18n.t('attSearch.shiftType', 'Ca làm việc'),
      this.i18n.t('attSearch.leaveType', 'Loại nghỉ phép'),
      this.i18n.t('attSearch.fromTime', 'Từ thời gian'),
      this.i18n.t('attSearch.toTime', 'Đến thời gian'),
      this.i18n.t('attSearch.quantity', 'Số lượng'),
      this.i18n.t('attSearch.unit', 'Đơn vị'),
    ];
    const data: (string | number)[][] = [header];
    rows.forEach((row, idx) => {
      data.push([
        idx + 1,
        row.arDateStr ?? '',
        row.empId ?? '',
        row.localName ?? '',
        row.deptName ?? '',
        row.postGradeName ?? '',
        row.shiftName ?? '',
        row.itemName ?? '',
        row.fromTime ?? '',
        row.toTime ?? '',
        row.quantity ?? '',
        row.unit ?? '',
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'attendance_search_export.xlsx');
  }

  // ── Modal Test Sync Cleverse (DEV) ────────────────────────────────────
  openSyncModal(): void {
    this.syncResult.set(null);
    this.syncModalVisible.set(true);
  }

  closeSyncModal(): void {
    this.syncModalVisible.set(false);
  }

  async sendSyncCleverse(): Promise<void> {
    const enterCd = this.syncEnterCd().trim();
    const sabun = this.syncSabun().trim();
    const gntCd = this.syncGntCd().trim();
    const sYmd = this.syncSYmd().trim();
    const eYmd = this.syncEYmd().trim();
    const instanceId = this.syncInstanceId().trim();
    if (!enterCd || !sabun || !gntCd || !sYmd || !eYmd || !instanceId) {
      this.message.warning(
        this.i18n.t(
          'attSearch.syncModal.msgRequired',
          'Vui lòng nhập đầy đủ các trường bắt buộc: Mã công ty, Mã nhân viên, Mã chấm công, Ngày bắt đầu, Ngày kết thúc, Instance ID.',
        ),
      );
      return;
    }

    this.syncSending.set(true);
    this.syncResult.set(null);
    try {
      const res = await this.service.syncCleverseTest({
        enterCd,
        sabun,
        gntCd,
        sYmd,
        eYmd,
        orgCd: '',
        instanceId,
        cancelYn: this.syncCancelYn(),
        ifId: this.syncIfId().trim(),
        status: this.syncStatus(),
        reason: this.syncReason().trim(),
      });
      this.syncResult.set(res);
    } catch {
      this.syncResult.set({ success: false, message: this.i18n.t('acr.imp.msg.connectError', 'Lỗi kết nối máy chủ, vui lòng thử lại.') });
    } finally {
      this.syncSending.set(false);
    }
  }
}
