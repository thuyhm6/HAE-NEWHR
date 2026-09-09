import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { I18nService } from '../../../i18n/i18n.service';
import { TabService } from '../../../shell/tab.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PaWorkFlowRecordRow, PaWorkFlowRow, PaWorkFlowService } from './pa-work-flow.service';

type StepKey = 'objCreate' | 'arMonthCal' | 'paCal' | 'confirm' | 'open';
type TaskKey = 'createPaObj' | 'arMonthCal' | 'paMonthCal' | 'paConfirm' | 'paOpen';

const STEP_KEY_MAP: Record<StepKey, number> = {
  objCreate: 1,
  arMonthCal: 2,
  paCal: 3,
  confirm: 4,
  open: 5,
};

const TASK_STEP_MAP: Record<TaskKey, number> = {
  createPaObj: 1,
  arMonthCal: 2,
  paMonthCal: 3,
  paConfirm: 4,
  paOpen: 5,
};

/**
 * Quy trình tính lương (viewPaWorkFlow) - xem ghi chú trong
 * pa-work-flow.service.ts. Nút "Thông tin tài khoản" (cột Điều chỉnh tiền
 * lương): bản gốc có bug - href trỏ đúng viewPaEmpAccount nhưng data-tab
 * (được bộ chặn click toàn cục dùng để mở tab) lại trỏ nhầm sang
 * viewPaInputItemData?itemType=4 giống 2 nút bên cạnh (copy-paste sai) - ở
 * đây điều hướng đúng bằng 3 handler riêng biệt, không lặp lại bug này.
 *
 * Bug có thật đã sửa thêm: key i18n "pa.workFlow.records.step" (tiêu đề cột
 * trong modal Lịch sử thao tác) có giá trị tiếng Việt/Hàn/Trung là "Mở
 * lương"/"급여 개방"/"开放薪资" - rõ ràng copy nhầm từ key step.5 (trong khi bản
 * tiếng Anh/mặc định đã đúng là "Operation") vì cột này liệt kê MỌI loại
 * bước (Tạo đối tượng, Tính lương, Chốt lương...) chứ không riêng "Mở
 * lương" - đã sửa lại 3 file properties (vi/ko/zh) thành nhãn chung tương
 * đương "Operation".
 */
@Component({
  selector: 'app-pa-work-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzModalModule, NzSelectModule, NzSpinModule],
  templateUrl: './pa-work-flow.component.html',
  styleUrl: './pa-work-flow.component.scss',
})
export class PaWorkFlowComponent implements OnInit {
  private readonly service = inject(PaWorkFlowService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly tabs = inject(TabService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly searchPayScheduleNo = signal<string | null>(null);

  protected readonly workflow = signal<PaWorkFlowRow | null>(null);
  protected readonly searched = signal(false);

  protected readonly chkObjCreate = signal(false);
  protected readonly chkArMonthCal = signal(false);
  protected readonly chkPaCal = signal(false);
  protected readonly chkPaConfirm = signal(false);
  protected readonly chkPaOpen = signal(false);

  protected readonly executing = signal(false);
  protected readonly loadingStepText = signal('');

  protected readonly recordsModalVisible = signal(false);
  protected readonly recordsLoading = signal(false);
  protected readonly records = signal<PaWorkFlowRecordRow[]>([]);

  readonly stepNameKeys: Record<number, string> = {
    1: 'pa.workFlow.records.step.1',
    2: 'pa.workFlow.records.step.2',
    3: 'pa.workFlow.records.step.3',
    4: 'pa.workFlow.records.step.4',
    5: 'pa.workFlow.records.step.5',
    6: 'pa.workFlow.records.step.6',
    7: 'pa.workFlow.records.step.7',
  };

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const schedules = await this.payScheduleService.getList('', '', null);
      this.scheduleOptions.set(schedules);
      if (schedules.length) {
        this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
        await this.search();
      }
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  scheduleLabel(opt: PaPayScheduleRow): string {
    return opt.payDate + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
  }

  stepName(flowStep?: number): string {
    if (flowStep == null) return '';
    const key = this.stepNameKeys[flowStep];
    return key ? this.i18n.t(key, String(flowStep)) : String(flowStep);
  }

  async search(): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.searched.set(true);
    this.chkObjCreate.set(false);
    this.chkArMonthCal.set(false);
    this.chkPaCal.set(false);
    this.chkPaConfirm.set(false);
    this.chkPaOpen.set(false);
    try {
      const data = await this.service.getWorkFlow(payScheduleNo);
      if (!data) {
        this.message.warning(this.i18n.t('pa.workFlow.msgNoData', 'Không có dữ liệu quy trình cho kế hoạch này!'));
        this.workflow.set(null);
        return;
      }
      this.workflow.set(data);
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
      this.workflow.set(null);
    }
  }

  async execute(): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    const wf = this.workflow();
    if (this.chkObjCreate() && wf?.objCreateFlag === 1) {
      this.message.warning(this.i18n.t('pa.workFlow.msgObjCreateAlready', 'Đã tạo đối tượng nhận lương, không thể tạo lại!'));
      return;
    }
    if ((this.chkArMonthCal() || this.chkPaCal()) && wf?.paConfirmFlag === 1) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSalaryClosed', 'Lương tháng này đã chốt, không thể tính công!'));
      return;
    }

    const tasks: TaskKey[] = [];
    if (this.chkObjCreate()) tasks.push('createPaObj');
    if (this.chkArMonthCal()) tasks.push('arMonthCal');
    if (this.chkPaCal()) tasks.push('paMonthCal');
    if (this.chkPaConfirm()) tasks.push('paConfirm');
    if (this.chkPaOpen()) tasks.push('paOpen');
    if (!tasks.length) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectStep', 'Vui lòng chọn ít nhất một bước cần thực hiện!'));
      return;
    }

    this.executing.set(true);
    try {
      for (let i = 0; i < tasks.length; i++) {
        const stepName = this.stepName(TASK_STEP_MAP[tasks[i]]);
        this.loadingStepText.set(`(${i + 1}/${tasks.length}) ${stepName}`);
        await this.service.execute(payScheduleNo, tasks[i]);
      }
      this.message.success(this.i18n.t('pa.workFlow.msgExecuteSuccess', 'Tất cả các bước đã hoàn thành thành công!'));
      await this.search();
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.executing.set(false);
      this.loadingStepText.set('');
    }
  }

  async openRecordsModal(stepKey: StepKey): Promise<void> {
    await this.loadRecordsModal(STEP_KEY_MAP[stepKey] ?? null);
  }

  /** Các nút Đối chiếu/Tra cứu (bản gốc không map sang flowStep cụ thể) - xem toàn bộ lịch sử. */
  async openAllRecordsModal(): Promise<void> {
    await this.loadRecordsModal(null);
  }

  private async loadRecordsModal(flowStep: number | null): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.recordsModalVisible.set(true);
    this.recordsLoading.set(true);
    this.records.set([]);
    try {
      this.records.set(await this.service.getRecords(payScheduleNo, flowStep));
    } catch {
      this.records.set([]);
    } finally {
      this.recordsLoading.set(false);
    }
  }

  operatorOf(rec: PaWorkFlowRecordRow): string {
    return (rec.createdBy || '') + (rec.createdIp ? ' ' + rec.createdIp : '');
  }

  goToAdjustPay(): void {
    this.tabs.openTab('/pa/salary/viewPaInputItemData?itemType=2', this.i18n.t('pa.workFlow.step.adjust.pay', 'Điều chỉnh trả lương'), 'route');
  }

  goToAdjustDeduct(): void {
    this.tabs.openTab('/pa/salary/viewPaInputItemData?itemType=4', this.i18n.t('pa.workFlow.step.adjust.deduct', 'Điều chỉnh khoản trừ'), 'route');
  }

  goToAccountInfo(): void {
    this.tabs.openTab('/pa/workManagement/viewPaEmpAccount', this.i18n.t('pa.workFlow.step.adjust.account', 'Thông tin tài khoản'), 'route');
  }
}
