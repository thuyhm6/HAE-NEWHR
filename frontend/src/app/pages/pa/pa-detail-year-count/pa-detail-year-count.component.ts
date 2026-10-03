import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { PaSalaryDetailPanelComponent } from '../shared/pa-salary-detail-panel/pa-salary-detail-panel.component';
import { PaSalaryDetailItem, PaSalaryEmpRow, PaSalaryResultService } from '../shared/pa-salary-result.service';

/**
 * Lương năm chi tiết (/pa/workManagement/detailYearCountInfoLeft) - port từ
 * detailYearCountInfoLeft.jsp + detailYearCountInfoRight.jsp (pFrom=year) của dự án cũ Hanwha_HAE:
 * chọn 1 nhân viên + khoảng tháng lương (MM/YYYY) -> danh sách các kỳ lương bên trái, bấm 1 dòng để
 * xem chi tiết hạng mục lương (kèm lũy kế trong năm) bên phải. Popup chọn nhân viên
 * (viewEmpForPopList bản gốc) thay bằng tra cứu + modal chọn giống pa-ar-summary-manage.
 */
@Component({
  selector: 'app-pa-detail-year-count',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    PaSalaryDetailPanelComponent,
  ],
  templateUrl: './pa-detail-year-count.component.html',
  styleUrl: './pa-detail-year-count.component.scss',
})
export class PaDetailYearCountComponent implements OnInit {
  private readonly service = inject(PaSalaryResultService);
  private readonly empService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKey = signal('');
  protected readonly selectedEmp = signal<EmployeeSearchResult | null>(null);
  protected readonly startMonth = signal<Date | null>(null);
  protected readonly endMonth = signal<Date | null>(null);

  protected readonly empPickerVisible = signal(false);
  protected readonly empOptions = signal<EmployeeSearchResult[]>([]);

  protected readonly loading = signal(false);
  protected readonly rows = signal<PaSalaryEmpRow[]>([]);
  protected readonly selected = signal<PaSalaryEmpRow | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailItems = signal<PaSalaryDetailItem[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    // Mặc định từ tháng 1 tới tháng hiện tại của năm nay
    const now = new Date();
    this.startMonth.set(new Date(now.getFullYear(), 0, 1));
    this.endMonth.set(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  // ── Tra cứu nhân viên (thay cho popup viewEmpForPopList) ───────────────────

  async lookupEmployee(): Promise<void> {
    const kw = this.searchKey().trim();
    this.selectedEmp.set(null);
    if (!kw) return;
    try {
      const results = await this.empService.searchEmployees(kw);
      if (!results.length) {
        this.message.warning(this.i18n.t('esscal.msg.empNotFound', 'Không tìm thấy thông tin nhân viên.'));
      } else if (results.length === 1) {
        this.selectEmployee(results[0]);
      } else {
        this.empOptions.set(results);
        this.empPickerVisible.set(true);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  selectEmployee(emp: EmployeeSearchResult): void {
    this.empPickerVisible.set(false);
    this.selectedEmp.set(emp);
    this.searchKey.set(emp.localName ?? emp.empId ?? '');
    this.search();
  }

  protected empInfo(): string {
    const emp = this.selectedEmp();
    return emp ? [emp.empId, emp.localName, emp.deptName].filter((v) => !!v).join(' ') : '';
  }

  // ── Tìm kiếm ──────────────────────────────────────────────────────────────

  private monthParam(d: Date | null): string {
    return d ? formatDate(d, 'MM/yyyy', 'en-US') : '';
  }

  async search(): Promise<void> {
    const emp = this.selectedEmp();
    if (!emp?.personId) {
      this.message.warning(this.i18n.t('hrm.empinfo.pleaseSelectEmp', 'Vui lòng chọn nhân viên'));
      return;
    }
    const start = this.startMonth();
    const end = this.endMonth();
    if (!start || !end) {
      this.message.warning(this.i18n.t('pa.salaryDetail.msgSelectPeriod', 'Vui lòng chọn thời gian lương!'));
      return;
    }
    this.loading.set(true);
    this.selected.set(null);
    this.detailItems.set([]);
    try {
      this.rows.set(await this.service.getYearEmpList(emp.personId, this.monthParam(start), this.monthParam(end)));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Bấm 1 dòng -> chi tiết lương năm bên phải (changeUrlDetail bản gốc) */
  async selectRow(row: PaSalaryEmpRow): Promise<void> {
    const personId = row.personId ?? this.selectedEmp()?.personId;
    if (!personId || !row.payDate) return;
    this.selected.set(row);
    this.detailLoading.set(true);
    try {
      this.detailItems.set(
        await this.service.getYearDetail(row.payDate, personId, this.monthParam(this.startMonth()), this.monthParam(this.endMonth())),
      );
    } catch {
      this.detailItems.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected formatNumber(val: number | string | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    return isNaN(num) ? String(val) : Math.round(num).toLocaleString('en-US');
  }
}
