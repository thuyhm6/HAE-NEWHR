import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { TabService } from '../../../shell/tab.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PaSalaryCheckEmpRow, PaSalaryCheckService, paScheduleLabel } from '../shared/pa-salary-check.service';

type PvlSortKey = keyof Pick<
  PaSalaryCheckEmpRow,
  'localName' | 'empId' | 'deptName' | 'postFamilyName' | 'postGradeName' | 'positionName' | 'empTypeName' | 'transCodeName'
>;

/**
 * Quyết định thực hiện (/pa/workManagement/viewVerificationList) - port từ viewVerificationList.jsp
 * của Hanwha_HAE: các quyết định nhân sự có ngày hiệu lực trong kỳ chấm công của kế hoạch trả lương.
 * Bấm 1 dòng mở tab Chi tiết lương của NV đó (navTabNum detailPersonCountInfo bản gốc).
 */
@Component({
  selector: 'app-pa-verification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-verification-list.component.html',
  styleUrl: './pa-verification-list.component.scss',
})
export class PaVerificationListComponent implements OnInit {
  private readonly service = inject(PaSalaryCheckService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly tabs = inject(TabService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly searchKey = signal('');
  protected readonly payScheduleNo = signal<string | null>(null);

  protected readonly loading = signal(false);
  protected readonly rows = signal<PaSalaryCheckEmpRow[]>([]);

  protected readonly scheduleLabel = paScheduleLabel;
  private readonly sorters = new Map<PvlSortKey, (a: PaSalaryCheckEmpRow, b: PaSalaryCheckEmpRow) => number>();

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const schedules = await this.payScheduleService.getList('', '', null);
      this.scheduleOptions.set(schedules);
      if (schedules.length) this.payScheduleNo.set(schedules[0].payScheduleNo ?? null);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  textSort(key: PvlSortKey): (a: PaSalaryCheckEmpRow, b: PaSalaryCheckEmpRow) => number {
    let fn = this.sorters.get(key);
    if (!fn) {
      fn = (a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''));
      this.sorters.set(key, fn);
    }
    return fn;
  }

  async search(): Promise<void> {
    const payScheduleNo = this.payScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getVerificationList({ payScheduleNo, key: this.searchKey().trim() }));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Mở tab Chi tiết lương của NV (pa1014 bản gốc) */
  openDetail(row: PaSalaryCheckEmpRow): void {
    const payScheduleNo = this.payScheduleNo();
    if (!row.personId || !payScheduleNo) return;
    const qs = new URLSearchParams({ personId: row.personId, payScheduleNo });
    this.tabs.openTab(
      `/pa/workManagement/detailPersonCountInfo?${qs.toString()}`,
      this.i18n.t('pa.viewPaMain.GONGZIXIANGXIMINGXI.C', 'Chi tiết lương') + ' - ' + (row.localName ?? row.empId ?? ''),
      'route',
    );
  }
}
