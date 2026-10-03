import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, EmpSearchService } from '../../hrm/empinfo/shared/emp-search.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import {
  PaSalaryCheckEmpRow,
  PaSalaryCheckService,
  PaSalaryDetailInfoRow,
  paFormatNumber,
  paScheduleLabel,
} from '../shared/pa-salary-check.service';

/** 3 bảng theo ITEM_TYPE giống bản gốc: chi trả / khấu trừ / bảo hiểm công ty */
const PDPC_GROUPS = [
  { type: '1', labelKey: 'pa.detailPersonCountInfo.JIYUXIANGMU.b', fallback: 'Chi trả' },
  { type: '2', labelKey: 'pa.detailPersonCountInfo.KOUCHUXIANGMU.b', fallback: 'Khấu trừ' },
  { type: '3', labelKey: 'pa.detailPersonCountInfo.GONGSIBAOXIAN.b', fallback: 'BH công ty' },
];

/**
 * Chi tiết lương (/pa/workManagement/detailPersonCountInfo) - port từ detailPersonCountInfo.jsp của
 * Hanwha_HAE: chọn 1 NV + kế hoạch trả lương -> thông tin NV và 3 bảng hạng mục lương kèm công thức
 * (PA_FOR_SALARY_DETAIL_PAGE_P). Popup chọn NV (viewEmpForPopList bản gốc) thay bằng tra cứu + modal
 * giống pa-detail-year-count. Nhận ?personId=&payScheduleNo= khi mở từ Quyết định thực hiện.
 */
@Component({
  selector: 'app-pa-detail-person-count',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-detail-person-count.component.html',
  styleUrl: './pa-detail-person-count.component.scss',
})
export class PaDetailPersonCountComponent implements OnInit {
  private readonly service = inject(PaSalaryCheckService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly empService = inject(EmpSearchService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly payScheduleNo = signal<string | null>(null);
  protected readonly searchKey = signal('');
  protected readonly selectedPersonId = signal<string | null>(null);

  protected readonly empPickerVisible = signal(false);
  protected readonly empOptions = signal<EmployeeSearchResult[]>([]);

  protected readonly loading = signal(false);
  protected readonly empInfo = signal<PaSalaryCheckEmpRow | null>(null);
  protected readonly items = signal<PaSalaryDetailInfoRow[]>([]);
  protected readonly groups = computed(() =>
    PDPC_GROUPS.map((g) => ({ ...g, items: this.items().filter((i) => String(i.itemType) === g.type) })),
  );

  protected readonly fmt = paFormatNumber;
  protected readonly scheduleLabel = paScheduleLabel;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const schedules = await this.payScheduleService.getList('', '', null);
      this.scheduleOptions.set(schedules);
      if (!this.payScheduleNo() && schedules.length) this.payScheduleNo.set(schedules[0].payScheduleNo ?? null);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
    // TabRouteReuseStrategy dùng chung 1 instance cho mọi query -> nghe thay đổi để nạp lại
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const personId = params.get('personId');
      const payScheduleNo = params.get('payScheduleNo');
      if (!personId || !payScheduleNo) return;
      if (personId === this.selectedPersonId() && payScheduleNo === this.payScheduleNo() && this.empInfo()) return;
      this.searchKey.set('');
      this.selectedPersonId.set(personId);
      this.payScheduleNo.set(payScheduleNo);
      this.search(true);
    });
  }

  // ── Tra cứu nhân viên (thay cho popup viewEmpForPopList) ───────────────────

  async lookupEmployee(): Promise<void> {
    const kw = this.searchKey().trim();
    this.selectedPersonId.set(null);
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
    this.selectedPersonId.set(emp.personId ?? null);
    this.searchKey.set(emp.localName ?? emp.empId ?? '');
    this.search();
  }

  // ── Tìm kiếm ──────────────────────────────────────────────────────────────

  async search(silent = false): Promise<void> {
    const personId = this.selectedPersonId();
    const payScheduleNo = this.payScheduleNo();
    if (!personId) {
      if (!silent) this.message.warning(this.i18n.t('hrm.empinfo.pleaseSelectEmp', 'Vui lòng chọn nhân viên'));
      return;
    }
    if (!payScheduleNo) {
      if (!silent) this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.loading.set(true);
    try {
      const [info, items] = await Promise.all([
        this.service.getDetailEmpInfo(payScheduleNo, personId),
        this.service.getDetailItemList(payScheduleNo, personId),
      ]);
      this.empInfo.set(info ?? null);
      this.items.set(items ?? []);
      if (info?.localName && !this.searchKey()) this.searchKey.set(info.localName);
    } catch {
      this.empInfo.set(null);
      this.items.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Công thức dài hiển thị rút gọn, đủ nội dung ở tooltip (giống fn:substring bản gốc) */
  shortFormula(val: string | undefined): string {
    if (!val) return '';
    return val.length > 30 ? val.substring(0, 30) + '...' : val;
  }
}
