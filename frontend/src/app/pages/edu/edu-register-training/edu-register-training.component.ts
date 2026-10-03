import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
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

import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';
import { EduCommonService, EduEmployee } from '../shared/edu-common.service';
import { EduEmpPickerComponent } from '../shared/edu-emp-picker/edu-emp-picker.component';
import {
  EDU_CODE_TRAINING_TYPE,
  ERT_AFFIRM_TYPE_APPROVAL,
  ERT_AFFIRM_TYPE_NOTICE,
  EduRegisterApprover,
  EduRegisterTrainingService,
  EduTrainingRegisterRow,
} from './edu-register-training.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/** Model form thêm mới (RegisterForTrainingView.jsp bản gốc). */
interface ErtForm {
  trainingContent: string;
  trainingPurpose: string;
  trainingType: string | null;
  trainingUnit: string;
  trainingLocation: string;
  startDate: Date | null;
  endDate: Date | null;
  trainFee: number | null;
  trainUnit: string;
  trainPrice: number | null;
  trainTrainee: number | null;
  trainAmount: number | null;
  trainFeesOther: number | null;
  trainFeesTotal: number | null;
  remark: string;
}

function emptyForm(): ErtForm {
  return {
    trainingContent: '',
    trainingPurpose: '',
    trainingType: null,
    trainingUnit: '',
    trainingLocation: '',
    startDate: null,
    endDate: null,
    trainFee: null,
    trainUnit: 'USD',
    trainPrice: null,
    trainTrainee: null,
    trainAmount: null,
    trainFeesOther: null,
    trainFeesTotal: null,
    remark: '',
  };
}

/**
 * Đăng ký đào tạo bên ngoài - port từ /edu/traineducation/viewRegisterForTraining
 * (Hanwha_HAE: viewRegisterForTraining.jsp, RegisterForTrainingView.jsp).
 * - Danh sách đơn của chính người đăng nhập, lọc theo loại hình đào tạo.
 * - Thêm mới: popup nhập thông tin đào tạo + chi phí + người phê duyệt (thêm/xóa/sắp xếp,
 *   loại Phê duyệt/Thông báo). Chọn người duyệt dùng lại popup app-edu-emp-picker.
 * - Nút Xóa/Hủy đơn bản gốc đã bị comment nên không port.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-register-training',
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
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    EduEmpPickerComponent,
  ],
  templateUrl: './edu-register-training.component.html',
  styleUrl: './edu-register-training.component.scss',
})
export class EduRegisterTrainingComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EduRegisterTrainingService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly AFFIRM_APPROVAL = ERT_AFFIRM_TYPE_APPROVAL;
  protected readonly AFFIRM_NOTICE = ERT_AFFIRM_TYPE_NOTICE;
  protected readonly currencies = ['USD', 'VND'];

  protected readonly typeOptions = signal<SyCodeOption[]>([]);

  // ===== Danh sách =====
  protected readonly searchType = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly rows = signal<EduTrainingRegisterRow[]>([]);

  // ===== Popup thêm mới =====
  protected readonly formVisible = signal(false);
  protected readonly saving = signal(false);
  protected form: ErtForm = emptyForm();
  protected readonly approvers = signal<EduRegisterApprover[]>([]);
  protected readonly approverLoading = signal(false);
  protected readonly pickerVisible = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.typeOptions.set(await this.common.getCodeListSafe(EDU_CODE_TRAINING_TYPE));
    await this.search();
  }

  protected codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  /** Nhãn ghép "Nội dung" + "Đào tạo"... giống spring:message ghép 2 key ở bản gốc. */
  protected label(key: string, fallback: string): string {
    return `${this.i18n.t(key, fallback)} ${this.i18n.t('hr.viewCondSql.title.PEIXUNXINXI', 'đào tạo')}`;
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchType()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  // ===== Thêm mới =====

  async openForm(): Promise<void> {
    this.form = emptyForm();
    this.approvers.set([]);
    this.formVisible.set(true);
    this.approverLoading.set(true);
    try {
      this.approvers.set(await this.service.getDefaultApprovers());
    } catch {
      this.approvers.set([]);
    } finally {
      this.approverLoading.set(false);
    }
  }

  closeForm(): void {
    this.formVisible.set(false);
  }

  /** Thành tiền = Đơn giá x Số lượng; Tổng = Thành tiền + Chi phí khác (vẫn cho sửa tay). */
  recalc(): void {
    const f = this.form;
    if (f.trainPrice != null && f.trainTrainee != null) {
      f.trainAmount = f.trainPrice * f.trainTrainee;
    }
    if (f.trainAmount != null || f.trainFeesOther != null) {
      f.trainFeesTotal = (f.trainAmount ?? 0) + (f.trainFeesOther ?? 0);
    }
  }

  onAmountChange(value: number | null): void {
    this.form.trainAmount = value;
    this.form.trainFeesTotal = value != null || this.form.trainFeesOther != null
      ? (value ?? 0) + (this.form.trainFeesOther ?? 0)
      : null;
  }

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onEmployeesPicked(list: EduEmployee[]): void {
    const exists = new Set(this.approvers().map((a) => a.personId));
    const added = list
      .filter((e) => e.personId && !exists.has(e.personId))
      .map((e) => ({
        personId: e.personId,
        empid: e.empid,
        localName: e.localName,
        deptName: e.deptName,
        positionName: e.positionName,
        affirmType: ERT_AFFIRM_TYPE_APPROVAL,
      }));
    this.approvers.set([...this.approvers(), ...added]);
  }

  removeApprover(idx: number): void {
    this.approvers.set(this.approvers().filter((_, i) => i !== idx));
  }

  moveApprover(idx: number, delta: number): void {
    const list = [...this.approvers()];
    const target = idx + delta;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    this.approvers.set(list);
  }

  changeApproverType(idx: number, affirmType: string): void {
    this.approvers.set(this.approvers().map((a, i) => (i === idx ? { ...a, affirmType } : a)));
  }

  submit(): void {
    const f = this.form;
    if (f.startDate && f.endDate && f.startDate.getTime() > f.endDate.getTime()) {
      this.message.warning(
        this.i18n.t('alert.message.ess.infoApply.startTimeNotLaterThanEndTime', 'Ngày kết thúc không được sớm hơn ngày bắt đầu, xin chọn lại!'),
      );
      return;
    }
    if (this.approvers().length === 0) {
      this.message.warning(this.i18n.t('alert.message.pleaseFirstSetRuler.b', 'Xin thiết lập người duyệt'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ess.message.confirm_sava', 'Đồng ý lưu không?'),
      nzOnOk: () => this.doSave(),
    });
  }

  private async doSave(): Promise<void> {
    const f = this.form;
    this.saving.set(true);
    try {
      const res = await this.service.apply({
        trainingContent: f.trainingContent.trim(),
        trainingPurpose: f.trainingPurpose.trim(),
        trainingType: f.trainingType ?? undefined,
        trainingUnit: f.trainingUnit.trim(),
        trainingLocation: f.trainingLocation.trim(),
        startDate: this.common.formatDate(f.startDate),
        endDate: this.common.formatDate(f.endDate),
        trainFee: this.num(f.trainFee),
        trainUnit: f.trainUnit,
        trainPrice: this.num(f.trainPrice),
        trainTrainee: this.num(f.trainTrainee),
        trainAmount: this.num(f.trainAmount),
        trainFeesOther: this.num(f.trainFeesOther),
        trainFeesTotal: this.num(f.trainFeesTotal),
        remark: f.remark.trim(),
        approvers: this.approvers(),
      });
      if (res.success) {
        this.message.success(this.i18n.t('pa.salarycode.affirm.success', 'Xin phép thành công! Xin chờ duyệt'));
        this.formVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('common.saveFail', 'Lưu thất bại!'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFail', 'Lưu thất bại!'));
    } finally {
      this.saving.set(false);
    }
  }

  private num(value: number | null): string | undefined {
    return value == null ? undefined : String(value);
  }
}
