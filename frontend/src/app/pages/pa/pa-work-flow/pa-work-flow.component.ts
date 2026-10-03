import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { I18nService } from '../../../i18n/i18n.service';
import { TabService } from '../../../shell/tab.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PaWorkFlowRecordRow, PaWorkFlowRow, PaWorkFlowService } from './pa-work-flow.service';

/** Các bước có checkbox - value gửi lên procedure phụ thuộc trạng thái (xem processType()). */
type StepKey = 'objCreate' | 'arMonthCal' | 'paCal' | 'confirm' | 'open';

/** FLOW_STEP xem lịch sử của từng bước - Chốt/Mở lương gồm cả bước Hủy (giống bản gốc). */
const STEP_RECORD_FLOW: Record<StepKey, string> = {
  objCreate: '1',
  arMonthCal: '2',
  paCal: '3',
  confirm: '4,6',
  open: '5,7',
};

/** Nút điều hướng: url gốc (giữ nguyên như navTabNum ở JSP) + key i18n làm tiêu đề tab. */
interface NavLink {
  url: string;
  titleKey: string;
  fallback: string;
}

/**
 * Quy trình tính lương (/pa/workManagement/viewPaWorkFlow) - port từ
 * Hanwha_HAE viewPaWorkFlow.jsp:
 * - Chọn kế hoạch trả lương -> tự tra cứu lại (onchange submit như bản gốc).
 * - Thực hiện: các bước được tick chạy tuần tự qua PA_WORKFLOW_EXECUTE. Bước
 *   Chốt lương/Mở lương khi đã chốt/mở thì checkbox chuyển thành Hủy chốt/Hủy
 *   mở (type paUnConfirm/paUnOpen).
 * - Chốt công/Mở công (AR_LOCK_FLAG) gọi cùng procedure với type arLockYes/arLockNo.
 * - Các nút Đối chiếu/Tra cứu mở tab trang tương ứng: trang đã migrate mở route
 *   Angular, chưa migrate mở tab 'external' (giống menu ở AppShellComponent).
 */
@Component({
  selector: 'app-pa-work-flow',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzModalModule,
    NzSelectModule,
    NzSpinModule,
    NzTableModule,
    NzTooltipModule,
  ],
  templateUrl: './pa-work-flow.component.html',
  styleUrl: './pa-work-flow.component.scss',
})
export class PaWorkFlowComponent implements OnInit {
  private readonly service = inject(PaWorkFlowService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly tabs = inject(TabService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly searchPayScheduleNo = signal<string | null>(null);

  protected readonly workflow = signal<PaWorkFlowRow | null>(null);
  protected readonly loading = signal(false);

  protected readonly checked = signal<Record<StepKey, boolean>>(this.emptyChecked());

  protected readonly executing = signal(false);
  protected readonly loadingStepText = signal('');

  protected readonly recordsModalVisible = signal(false);
  protected readonly recordsLoading = signal(false);
  protected readonly records = signal<PaWorkFlowRecordRow[]>([]);

  /** AR_LOCK_FLAG: 0 -> hiện nút Chốt công, 1 -> hiện nút Mở công, khác -> ẩn (giống c:choose bản gốc). */
  protected readonly arLockFlag = computed(() => this.workflow()?.arLockFlag ?? null);

  readonly adjustLinks: NavLink[] = [
    { url: '/pa/salary/viewPaInputItemData?itemType=2', titleKey: 'pa.workFlow.step.adjust.pay', fallback: 'Điều chỉnh trả lương' },
    { url: '/pa/salary/viewPaInputItemData?itemType=4', titleKey: 'pa.workFlow.step.adjust.deduct', fallback: 'Điều chỉnh khoản trừ' },
    { url: '/pa/workManagement/viewPaEmpAccount', titleKey: 'pa.workFlow.step.adjust.account', fallback: 'Thông tin tài khoản' },
  ];

  readonly reconcileLinks: NavLink[] = [
    { url: '/pa/workManagement/monthPersonCountInfoList', titleKey: 'pa.workFlow.step.reconcile.emp', fallback: 'NV tham gia tính lương' },
    { url: '/pa/paView/viewPaMonthChain', titleKey: 'pa.workFlow.step.reconcile.pay', fallback: 'Các khoản chi trả' },
    { url: '/pa/workManagement/viewVerificationList', titleKey: 'pa.workFlow.step.reconcile.decision', fallback: 'Quyết định thực hiện' },
    { url: '/pa/workManagement/detailPersonCountInfo', titleKey: 'pa.workFlow.step.reconcile.detail', fallback: 'Chi tiết lương' },
    { url: '/pa/workManagement/detailPersonCountInfoLeft', titleKey: 'pa.workFlow.step.reconcile.personal', fallback: 'Kiểm tra cá nhân' },
    { url: '/pa/workManagement/detailItemCountInfo', titleKey: 'pa.workFlow.step.reconcile.item', fallback: 'Đối chiếu hạng mục' },
    { url: '/pa/workManagement/detailItemDifCountInfo', titleKey: 'pa.workFlow.step.reconcile.change', fallback: 'Khoản tiền thay đổi' },
    { url: '/pa/workManagement/viewResultConfirmList', titleKey: 'pa.workFlow.step.reconcile.result', fallback: 'Đối chiếu kết quả' },
  ];

  readonly reportLinks: NavLink[] = [
    { url: '/pa/workManagement/detailmonthCountInfoLeft', titleKey: 'pa.workFlow.step.report.monthly', fallback: 'Lương tháng chi tiết' },
    { url: '/pa/workManagement/detailYearCountInfoLeft', titleKey: 'pa.workFlow.step.report.yearly', fallback: 'Lương năm chi tiết' },
    { url: '/pa/workManagement/payStub', titleKey: 'pa.workFlow.step.report.slip', fallback: 'Phiếu lương' },
    { url: '/pa/workManagement/viewPaResultList', titleKey: 'pa.workFlow.step.report.totalEmp', fallback: 'Tổng lương (cá nhân)' },
    { url: '/pa/workManagement/viewDeptPaResultList', titleKey: 'pa.workFlow.step.report.totalDept', fallback: 'Tổng lương (phòng ban)' },
    { url: '/report/ar/viewArReportsList', titleKey: 'pa.workFlow.step.report.table', fallback: 'Bảng lương' },
  ];

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
    return (opt.payDate ?? '') + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
  }

  stepName(flowStep?: number): string {
    if (flowStep == null) return '';
    return this.i18n.t('pa.workFlow.records.step.' + flowStep, String(flowStep));
  }

  /** Bước đã thực hiện -> nhãn màu xanh đậm (#0A258F như bản gốc). */
  isDone(step: StepKey): boolean {
    const wf = this.workflow();
    if (!wf) return false;
    const flag = {
      objCreate: wf.objCreateFlag,
      arMonthCal: wf.arMonthCalFlag,
      paCal: wf.paCalFlag,
      confirm: wf.paConfirmFlag,
      open: wf.paOpenFlag,
    }[step];
    return Number(flag) === 1;
  }

  isChecked(step: StepKey): boolean {
    return this.checked()[step];
  }

  setChecked(step: StepKey, value: boolean): void {
    this.checked.update((c) => ({ ...c, [step]: value }));
  }

  onScheduleChange(value: string | null): void {
    this.searchPayScheduleNo.set(value);
    this.search();
  }

  async search(): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.checked.set(this.emptyChecked());
    this.loading.set(true);
    try {
      const data = await this.service.getWorkFlow(payScheduleNo);
      this.workflow.set(data ?? null);
      if (!data) {
        this.message.warning(this.i18n.t('pa.workFlow.msgNoData', 'Không có dữ liệu quy trình cho kế hoạch này!'));
      }
    } catch (err) {
      this.workflow.set(null);
      this.message.error(this.errorText(err));
    } finally {
      this.loading.set(false);
    }
  }

  /** Thực hiện quy trình - tương đương executeProcess() bản gốc. */
  execute(): void {
    const payScheduleNo = this.searchPayScheduleNo();
    const wf = this.workflow();
    if (!payScheduleNo || !wf) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    const c = this.checked();
    const types: { step: StepKey; type: string }[] = [];
    if (c.objCreate) types.push({ step: 'objCreate', type: 'createPaObj' });
    if (c.arMonthCal) types.push({ step: 'arMonthCal', type: 'arMonthCal' });
    if (c.paCal) types.push({ step: 'paCal', type: 'paMonthCal' });
    if (c.confirm) types.push({ step: 'confirm', type: this.isDone('confirm') ? 'paUnConfirm' : 'paConfirm' });
    if (c.open) types.push({ step: 'open', type: this.isDone('open') ? 'paUnOpen' : 'paOpen' });

    // Bản gốc chỉ nhắc (alert) chứ không chặn khi tổng hợp công mà chấm công chưa chốt
    if (c.arMonthCal && Number(wf.arLockFlag) === 0) {
      this.message.warning(this.i18n.t('pa.workFlow.msgArNotLocked', 'Lưu ý: chấm công tháng này chưa chốt'));
    }
    if (!types.length) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectStep', 'Vui lòng chọn ít nhất một bước cần thực hiện!'));
      return;
    }

    this.modal.confirm({
      nzTitle: this.i18n.t('pa.workFlow.confirmExecute', 'Bạn có chắc chắn muốn thực hiện không?'),
      nzOnOk: () => this.runTypes(payScheduleNo, types.map((t) => ({ type: t.type, label: this.stepLabel(t.step) }))),
    });
  }

  /** Chốt công (flag=1) / Mở công (flag=0) - tương đương exeArLock() bản gốc. */
  toggleArLock(lock: boolean): void {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    // Bản gốc bỏ tick toàn bộ checkbox trước khi chốt/mở công
    this.checked.set(this.emptyChecked());
    const label = lock ? this.i18n.t('pa.workFlow.arLock', 'Chốt công') : this.i18n.t('pa.workFlow.arUnlock', 'Mở công');
    this.modal.confirm({
      nzTitle: lock
        ? this.i18n.t('pa.workFlow.confirmArLock', 'Đồng ý đóng xin tăng ca, nghỉ phép không?')
        : this.i18n.t('pa.workFlow.confirmArUnlock', 'Đồng ý mở xin phép chấm công không?'),
      nzOnOk: () => this.runTypes(payScheduleNo, [{ type: lock ? 'arLockYes' : 'arLockNo', label }]),
    });
  }

  /**
   * Chạy tuần tự từng type (bản gốc lặp processType ở server, nối message từng bước
   * và vẫn chạy tiếp các bước sau dù 1 bước báo lỗi) rồi tải lại sơ đồ.
   */
  private async runTypes(payScheduleNo: string, items: { type: string; label: string }[]): Promise<void> {
    this.executing.set(true);
    const messages: string[] = [];
    let hasError = false;
    try {
      for (let i = 0; i < items.length; i++) {
        this.loadingStepText.set(`(${i + 1}/${items.length}) ${items[i].label}`);
        try {
          const res = await this.service.execute(payScheduleNo, items[i].type);
          if (res?.message) messages.push(res.message);
        } catch (err) {
          hasError = true;
          messages.push(this.errorText(err));
        }
      }
    } finally {
      this.executing.set(false);
      this.loadingStepText.set('');
    }

    const content = messages.filter((m) => !!m && m.trim()).join('\n');
    if (hasError) {
      this.modal.error({
        nzTitle: this.i18n.t('common.error', 'Lỗi'),
        nzContent: content,
        nzClassName: 'vpwf-msg-modal',
      });
    } else {
      this.message.success(content || this.i18n.t('pa.workFlow.msgExecuteSuccess', 'Tất cả các bước đã hoàn thành thành công!'));
    }
    await this.search();
  }

  async openRecordsModal(step: StepKey): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.workFlow.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.recordsModalVisible.set(true);
    this.recordsLoading.set(true);
    this.records.set([]);
    try {
      this.records.set(await this.service.getRecords(payScheduleNo, STEP_RECORD_FLOW[step]));
    } catch (err) {
      this.message.error(this.errorText(err));
    } finally {
      this.recordsLoading.set(false);
    }
  }

  /** Mở trang tương ứng trong tab - route Angular nếu đã migrate, ngược lại tab 'external'. */
  openLink(link: NavLink): void {
    const basePath = link.url.split('?')[0].replace(/^\//, '');
    const kind = this.hasRoute(this.router.config, basePath) ? 'route' : 'external';
    this.tabs.openTab(link.url, this.i18n.t(link.titleKey, link.fallback), kind);
  }

  private hasRoute(routes: Route[], path: string): boolean {
    return routes.some((r) => r.path === path || (!!r.children && this.hasRoute(r.children, path)));
  }

  stepLabel(step: StepKey): string {
    switch (step) {
      case 'objCreate':
        return this.i18n.t('pa.workFlow.step.objCreate.label', 'Tạo đối tượng');
      case 'arMonthCal':
        return this.i18n.t('pa.workFlow.step.arMonthCal.label', 'Tổng hợp chấm công tháng');
      case 'paCal':
        return this.i18n.t('pa.workFlow.step.paCal.label', 'Tính lương');
      case 'confirm':
        return this.isDone('confirm')
          ? this.i18n.t('pa.workFlow.step.confirm.cancel', 'Hủy chốt')
          : this.i18n.t('pa.workFlow.step.confirm.label', 'Chốt lương');
      case 'open':
        return this.isDone('open')
          ? this.i18n.t('pa.workFlow.step.open.cancel', 'Hủy mở')
          : this.i18n.t('pa.workFlow.step.open.label', 'Mở lương');
    }
  }

  private emptyChecked(): Record<StepKey, boolean> {
    return { objCreate: false, arMonthCal: false, paCal: false, confirm: false, open: false };
  }

  private errorText(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return err.error?.error || err.error?.message || err.message;
    }
    return this.i18n.t('common.error', 'Lỗi');
  }
}
