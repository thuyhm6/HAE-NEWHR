import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';
import { EDU_CODE_TRAIN_DIFF, EDU_CODE_TRAIN_FORM, EduCommonService } from '../shared/edu-common.service';
import {
  EduTrainReportQuery,
  EduTrainReportRow,
  EduTrainReportService,
  EduTrainReportType,
} from './edu-train-report.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
interface EtrpMenuItem {
  key: string;
  label: string;
  type: EduTrainReportType | null;
}

interface EtrpColumn {
  field: keyof EduTrainReportRow;
  key: string;
  fallback: string;
  /** Cột giờ - thêm "(Tiếng)" vào tiêu đề */
  hour?: boolean;
  /** Cột số - canh phải + định dạng số */
  num?: boolean;
}

/** Báo cáo mặc định khi REPORT_CENTER chưa cấu hình (URL_JSP bản gốc -> loại báo cáo). */
const ETRP_DEFAULT_REPORTS: { type: EduTrainReportType; key: string; fallback: string }[] = [
  { type: 'course', key: 'edu.trainreport.KECHENGBIEPEIXUNBAOBIAO.a', fallback: 'Bảng chương trình đào tạo' },
  { type: 'postGrade', key: 'edu.trainreport.ZHIJIBIEPEIXUNBAOBIAO.a', fallback: 'Bảng đào tạo theo chức vụ' },
  { type: 'dept', key: 'edu.trainreport.BUMENBIEPEIXUNBAOBIAO.a', fallback: 'Bảng đào tạo theo phòng ban' },
  { type: 'year', key: 'edu.trainreport.NIANDUBIEPEIXUNBAOBIAO.a', fallback: 'Bảng đào tạo năm' },
  { type: 'month', key: 'edu.trainCostMANAGER.YUEBIEPEIXUNBAOBIAO.a', fallback: 'Bảng đào tạo tháng' },
  { type: 'form', key: 'edu.trainreport.KECHENGXINGSHIBIEPEIXUNBAOBIAO.a', fallback: 'Bảng hình thức đào tạo' },
];

const ETRP_URL_TYPES: { pattern: string; type: EduTrainReportType }[] = [
  { pattern: 'coursetrainreport', type: 'course' },
  { pattern: 'postgradetrainreport', type: 'postGrade' },
  { pattern: 'depttrainreport', type: 'dept' },
  { pattern: 'yeartrainreport', type: 'year' },
  { pattern: 'monthtrainreport', type: 'month' },
  { pattern: 'formtrainreport', type: 'form' },
];

const C = {
  counts: { field: 'counts', key: 'edu.trainreport.KECHENGSHULIANG.a', fallback: 'Số khóa học', num: true },
  times: { field: 'counts', key: 'edu.trainreport.KECHENGCISHU.a', fallback: 'Số khóa học', num: true },
  form: { field: 'trainFormName', key: 'hrm.empinfo.Training_form', fallback: 'Hình thức đào tạo' },
  numb: { field: 'numb', key: 'edu.planManager.PEIXUNRENSHU.a', fallback: 'Số lượng', num: true },
  avgCounts: { field: 'avgCounts', key: 'edu.trainreport.RENJUNPEIXUNCISHU.a', fallback: 'Số người TB', num: true },
  allTime: { field: 'allTime', key: 'edu.trainreport.ZONGPEIXUNSHIJIAN.a', fallback: 'Tổng thời gian', hour: true, num: true },
  totalPt: { field: 'totalPt', key: 'edu.trainreport.PEIXUNSHIJIANRENYUAN.a', fallback: 'Thời gian*nhân viên', hour: true, num: true },
  totalPs: { field: 'totalPt', key: 'edu.trainreport.PEIXUNSHIJIANRENSHU.a', fallback: 'Thời gian*số người', hour: true, num: true },
  avgTime: { field: 'avgTime', key: 'edu.trainreport.RENJUNPEIXUNSHIJIAN.a', fallback: 'Thời gian bình quân', hour: true, num: true },
  direct: { field: 'directCost', key: 'edu.trainCostMANAGER.ZHIJIEJINGFEI.a', fallback: 'Chi phí trực tiếp', num: true },
  indirect: { field: 'indirectCost', key: 'edu.trainCostMANAGER.JIANJIEJINGFEI.a', fallback: 'Chi phí gián tiếp', num: true },
  allCost: { field: 'allCost', key: 'edu.trainreport.ZONGPEIXUNFEIYONG.a', fallback: 'Tổng chi phí đào tạo', num: true },
  avgCost: { field: 'avgCost', key: 'edu.trainreport.RENJUNPEIXUNFEIYONG.a', fallback: 'Bình quân chi phí', num: true },
} satisfies Record<string, EtrpColumn>;

/** Cột theo từng báo cáo - cùng thứ tự với file Excel bản gốc (bản HAE) và EduTrainReportServiceImpl#columns. */
const ETRP_COLUMNS: Record<EduTrainReportType, EtrpColumn[]> = {
  course: [
    { field: 'trainDiffName', key: 'edu.trainreport.KECHENGQUFEN.a', fallback: 'Khóa học' },
    { field: 'trainTypeName', key: 'edu.trainreport.KECHENGLEIBIE.a', fallback: 'Hình thức đào tạo' },
    { field: 'courseNameCode', key: 'empsubject.subjectNm', fallback: 'Tên đào tạo' },
    C.times, C.form, C.numb,
    { field: 'allTime', key: 'liang.hr.viewTraining.title.TRAINING_TIME', fallback: 'Thời gian đào tạo', hour: true, num: true },
    C.totalPt, C.avgTime, C.direct, C.indirect, C.allCost, C.avgCost,
  ],
  postGrade: [
    { field: 'groupName', key: 'pa.insurance.title.postGrade', fallback: 'Chức vụ' },
    C.form, C.counts, C.times, C.numb, C.allTime, C.totalPs, C.avgTime, C.direct, C.indirect, C.allCost, C.avgCost,
  ],
  dept: [
    { field: 'groupName', key: 'ar.attendanceView.viewNoSwipingCard.deptName', fallback: 'Phòng ban' },
    C.form, C.counts, C.times, C.numb, C.allTime, C.totalPs, C.avgTime, C.direct, C.indirect, C.allCost, C.avgCost,
  ],
  year: [
    { field: 'groupName', key: 'pa.salary.canShu.nianDu', fallback: 'Năm' },
    C.counts, C.times, C.form, C.numb, C.avgCounts, C.allTime, C.totalPt, C.avgTime, C.allCost, C.direct, C.indirect, C.avgCost,
  ],
  month: [
    { field: 'groupName', key: 'ar.excelexport.title.month', fallback: 'Tháng' },
    C.counts, C.times, C.numb, C.form, C.avgCounts, C.allTime, C.totalPt, C.avgTime, C.direct, C.indirect, C.allCost, C.avgCost,
  ],
  form: [
    { field: 'groupName', key: 'edu.trainreport.KECHENGXINGSHI.a', fallback: 'Hình thức khóa học' },
    C.counts, C.times, C.numb, C.avgCounts, C.allTime, C.totalPt, C.avgTime, C.allCost, C.direct, C.indirect, C.avgCost,
  ],
};

/**
 * Báo cáo đào tạo - port từ /report/ar/viewTrainReport (Hanwha_HTSV): bên trái là cây
 * loại báo cáo (SY_CODE 14015405 + REPORT_CENTER), bên phải là báo cáo con
 * (/edu/trainreport/*TrainReport). Bản gốc chỉ có nút xuất Excel; ở đây xem trước bằng
 * nz-table rồi xuất .xlsx.
 */
@Component({
  selector: 'app-edu-train-report',
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
    NzMenuModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './edu-train-report.component.html',
  styleUrl: './edu-train-report.component.scss',
})
export class EduTrainReportComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduTrainReportService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly menuLoading = signal(false);
  protected readonly menu = signal<EtrpMenuItem[]>([]);
  protected readonly active = signal<EtrpMenuItem | null>(null);
  protected readonly activeType = computed(() => this.active()?.type ?? null);
  protected readonly columns = computed(() => {
    const type = this.activeType();
    return type ? ETRP_COLUMNS[type] : [];
  });

  // ===== Danh mục lọc =====
  protected readonly diffOptions = signal<SyCodeOption[]>([]);
  protected readonly typeOptions = signal<SyCodeOption[]>([]);
  protected readonly formOptions = signal<SyCodeOption[]>([]);
  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);

  // ===== Điều kiện lọc =====
  protected readonly trainDiffCode = signal<string | null>(null);
  protected readonly trainTypeCode = signal<string | null>(null);
  protected readonly courseName = signal('');
  protected readonly postGradeName = signal('');
  protected readonly deptNo = signal<string | null>(null);
  protected readonly year = signal<Date | null>(null);
  protected readonly month = signal<Date | null>(null);
  protected readonly trainFormCode = signal<string | null>(null);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduTrainReportRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const [diff, forms] = await Promise.all([
      this.common.getCodeListSafe(EDU_CODE_TRAIN_DIFF),
      this.common.getCodeListSafe(EDU_CODE_TRAIN_FORM),
    ]);
    this.diffOptions.set(diff);
    this.formOptions.set(forms);
    this.loadDeptTree();
    await this.loadMenu();
  }

  private async loadDeptTree(): Promise<void> {
    try {
      this.deptNodes.set(this.common.buildDeptTree(await this.common.getDeptTree()));
    } catch {
      this.deptNodes.set([]);
    }
  }

  private async loadMenu(): Promise<void> {
    this.menuLoading.set(true);
    let items: EtrpMenuItem[] = [];
    try {
      items = (await this.service.getMenu()).map((m, i) => ({
        key: `${m.codeNo}-${i}`,
        label: (m.content ?? '').trim() || m.reportName || m.urlJsp || m.codeNo,
        type: this.typeFromUrl(m.urlJsp),
      }));
    } catch {
      items = [];
    }
    if (items.length === 0) {
      items = ETRP_DEFAULT_REPORTS.map((r) => ({ key: r.type, label: this.i18n.t(r.key, r.fallback), type: r.type }));
    }
    this.menu.set(items);
    this.menuLoading.set(false);
    const first = items.find((i) => i.type);
    if (first) this.selectReport(first);
  }

  private typeFromUrl(url?: string): EduTrainReportType | null {
    const u = (url ?? '').toLowerCase();
    return ETRP_URL_TYPES.find((t) => u.includes(t.pattern))?.type ?? null;
  }

  selectReport(item: EtrpMenuItem): void {
    this.active.set(item);
    this.rows.set([]);
    if (item.type) this.search();
  }

  async onDiffChange(value: string | null): Promise<void> {
    this.trainDiffCode.set(value);
    this.trainTypeCode.set(null);
    this.typeOptions.set(await this.common.getCodeListSafe(value));
  }

  protected codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  protected colTitle(c: EtrpColumn): string {
    const title = this.i18n.t(c.key, c.fallback);
    return c.hour ? `${title} (${this.i18n.t('ar.viewitemparameter.title.xiaoshi', 'Tiếng')})` : title;
  }

  protected cellValue(row: EduTrainReportRow, c: EtrpColumn): unknown {
    return row[c.field];
  }

  private buildQuery(): EduTrainReportQuery {
    switch (this.activeType()) {
      case 'course':
        return { trainDiffCode: this.trainDiffCode(), trainTypeCode: this.trainTypeCode(), courseName: this.courseName() };
      case 'postGrade':
        return { postGradeName: this.postGradeName() };
      case 'dept':
        return { deptNo: this.deptNo() };
      case 'year':
        return { year: this.year() ? formatDate(this.year()!, 'yyyy', 'en-US') : null };
      case 'month':
        return { month: this.month() ? formatDate(this.month()!, 'MMyyyy', 'en-US') : null };
      case 'form':
        return { trainFormCode: this.trainFormCode() };
      default:
        return {};
    }
  }

  async search(): Promise<void> {
    const type = this.activeType();
    if (!type) return;
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getReport(type, this.buildQuery()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.trainDiffCode.set(null);
    this.trainTypeCode.set(null);
    this.typeOptions.set([]);
    this.courseName.set('');
    this.postGradeName.set('');
    this.deptNo.set(null);
    this.year.set(null);
    this.month.set(null);
    this.trainFormCode.set(null);
    this.search();
  }

  exportExcel(): void {
    const type = this.activeType();
    if (type) window.location.href = this.service.exportUrl(type, this.buildQuery());
  }
}
