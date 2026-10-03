import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PaSalaryCheckService, PaSalaryDetailInfoRow, paFormatNumber, paScheduleLabel } from '../shared/pa-salary-check.service';
import { PaSalaryEmpRow, PaSalaryResultService } from '../shared/pa-salary-result.service';

/**
 * Kiểm tra cá nhân (/pa/workManagement/detailPersonCountInfoLeft) - port từ
 * detailPersonCountInfoLeft.jsp + detailPersonCountInfoRight.jsp của Hanwha_HAE: bên trái danh sách
 * NV của kỳ lương (dùng lại API monthEmpList của Lương tháng chi tiết - cùng câu SQL
 * detailPersonCountInfoLeft bản gốc), bấm 1 dòng xem hạng mục lương kèm công thức bên phải.
 */
@Component({
  selector: 'app-pa-detail-person-check',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzSelectModule, NzTableModule, NzTreeSelectModule],
  templateUrl: './pa-detail-person-check.component.html',
  styleUrl: './pa-detail-person-check.component.scss',
})
export class PaDetailPersonCheckComponent implements OnInit {
  private readonly service = inject(PaSalaryCheckService);
  private readonly resultService = inject(PaSalaryResultService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);

  protected readonly searchKey = signal('');
  protected readonly payScheduleNo = signal<string | null>(null);
  protected readonly deptNo = signal<string | null>(null);

  protected readonly loading = signal(false);
  protected readonly rows = signal<PaSalaryEmpRow[]>([]);
  protected readonly selected = signal<PaSalaryEmpRow | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailItems = signal<PaSalaryDetailInfoRow[]>([]);

  protected readonly fmt = paFormatNumber;
  protected readonly scheduleLabel = paScheduleLabel;

  protected readonly sortEmpId = (a: PaSalaryEmpRow, b: PaSalaryEmpRow) => String(a.empId ?? '').localeCompare(String(b.empId ?? ''));
  protected readonly sortName = (a: PaSalaryEmpRow, b: PaSalaryEmpRow) => String(a.localName ?? '').localeCompare(String(b.localName ?? ''));
  protected readonly sortWages = (a: PaSalaryEmpRow, b: PaSalaryEmpRow) => (Number(a.realWages) || 0) - (Number(b.realWages) || 0);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [schedules, deptFlat] = await Promise.all([
        this.payScheduleService.getList('', '', null),
        this.deptService.getAuthorizedDepartments(),
      ]);
      this.scheduleOptions.set(schedules);
      if (schedules.length) this.payScheduleNo.set(schedules[0].payScheduleNo ?? null);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async search(): Promise<void> {
    const payScheduleNo = this.payScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.loading.set(true);
    this.selected.set(null);
    this.detailItems.set([]);
    try {
      this.rows.set(await this.resultService.getMonthEmpList(payScheduleNo, this.searchKey().trim(), this.deptNo()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  /** Bấm 1 dòng -> hạng mục lương bên phải (changeUrlDetail -> detailPersonCountInfoRight bản gốc) */
  async selectRow(row: PaSalaryEmpRow): Promise<void> {
    if (!row.personId || !row.payScheduleNo) return;
    this.selected.set(row);
    this.detailLoading.set(true);
    try {
      this.detailItems.set(await this.service.getDetailItemList(row.payScheduleNo, row.personId));
    } catch {
      this.detailItems.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.detailLoading.set(false);
    }
  }
}
