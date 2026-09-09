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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  MonthDetailFilter,
  MonthDetailListService,
  MonthDetailRow,
} from './month-detail-list.service';

const QUICK_FILTER_DEBOUNCE_MS = 400;

const QUICK_EXPORT_BUTTONS = [
  { code: '306', labelKey: 'ess.viewMonthDetailList.quickReport.totalOt', fallback: '(In) Tổng tăng ca' },
  { code: '3277', labelKey: 'ess.viewMonthDetailList.quickReport.attPrint', fallback: 'Chấm công tháng (In)' },
  { code: '3286', labelKey: 'ess.viewMonthDetailList.quickReport.otOver', fallback: 'Tăng ca vượt tháng' },
  { code: '3289', labelKey: 'ess.viewMonthDetailList.quickReport.attTotalDay', fallback: 'Tổng ngày công tháng' },
] as const;

const REPORT_TYPE_OPTIONS = [
  { code: '314', labelKey: 'ess.viewMonthDetailList.reportType.salary', fallback: 'Công tính lương' },
  { code: '3294', labelKey: 'ess.viewMonthDetailList.reportType.bonus13th', fallback: 'Công tính thưởng tháng 13' },
  { code: '3293', labelKey: 'ess.viewMonthDetailList.reportType.referralBonus', fallback: 'Công tính thưởng giới thiệu 01.11.2025' },
  { code: '3292', labelKey: 'ess.viewMonthDetailList.reportType.workDuration', fallback: 'Công thời lượng đi làm trong tháng' },
  { code: '3291', labelKey: 'ess.viewMonthDetailList.reportType.workOtPrint', fallback: 'Công + Tăng ca tháng (Print)' },
  { code: '3296', labelKey: 'ess.viewMonthDetailList.reportType.diligence', fallback: 'Công tính chuyên cần 01.03.2026' },
] as const;

/**
 * Chi tiết chấm công nhân viên thời vụ theo tháng - port lại từ
 * ess/tempEmp/viewMonthDetailList.html (Thymeleaf + DataTables server-side,
 * đã xoá) sang Angular + NG-ZORRO, dùng nz-table phân trang server-side
 * (giống ManageCountInfoListComponent). Gọi lại nguyên vẹn API JSON sẵn có;
 * xuất báo cáo vẫn điều hướng tới endpoint export sẵn có (backend sinh file
 * theo mẫu riêng từng loại báo cáo).
 */
@Component({
  selector: 'app-month-detail-list',
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
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './month-detail-list.component.html',
  styleUrl: './month-detail-list.component.scss',
})
export class MonthDetailListComponent implements OnInit {
  private readonly service = inject(MonthDetailListService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly monthYear = signal<Date | null>(new Date());
  protected readonly keyword = signal('');
  protected readonly quickFilter = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly empTypeCode = signal<string | null>(null);
  protected readonly reportType = signal<string | null>(null);
  protected readonly reportYear = signal<number>(new Date().getFullYear());

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  readonly quickExportButtons = QUICK_EXPORT_BUTTONS;
  readonly reportTypeOptions = REPORT_TYPE_OPTIONS;

  protected readonly loading = signal(false);
  protected readonly rows = signal<MonthDetailRow[]>([]);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(25);
  protected readonly total = signal(0);

  private listBootstrapped = false;
  private drawCounter = 0;
  private quickFilterTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const deptList = await this.service.getAuthorizedDepartments();
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
    } catch {
      // im lặng bỏ qua - danh sách phòng ban trống không chặn việc tra cứu chính
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
        if (node) {
          roots.push(node);
        }
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

  onQuickFilterChange(value: string): void {
    this.quickFilter.set(value);
    clearTimeout(this.quickFilterTimer);
    this.quickFilterTimer = setTimeout(() => this.search(), QUICK_FILTER_DEBOUNCE_MS);
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  private buildFilter(): MonthDetailFilter {
    const my = this.monthYear();
    return {
      keyword: this.keyword() || undefined,
      quickFilter: this.quickFilter() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      empTypeCode: this.empTypeCode() ?? undefined,
      month: my ? formatDate(my, 'MM', 'en-US') : undefined,
      year: my ? formatDate(my, 'yyyy', 'en-US') : undefined,
    };
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
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getPageList(this.buildFilter(), ++this.drawCounter, start, this.pageSize());
      this.rows.set(res.data ?? []);
      this.total.set(res.recordsTotal ?? 0);
    } catch {
      this.message.error(this.i18n.t('ess.viewMonthDetailList.msg.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.loading.set(false);
    }
  }

  exportSelectedReport(): void {
    const type = this.reportType();
    if (!type) {
      this.message.warning(this.i18n.t('ess.viewMonthDetailList.msg.selectReportType', 'Vui lòng chọn loại báo cáo'));
      return;
    }
    window.location.href = this.service.buildExportUrl(this.buildFilter(), type, String(this.reportYear()));
  }

  quickExport(reportType: string): void {
    window.location.href = this.service.buildExportUrl(this.buildFilter(), reportType, String(this.reportYear()));
  }
}
