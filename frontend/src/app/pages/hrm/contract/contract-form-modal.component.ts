import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { ContractRow, ContractSavePayload, ContractService } from './contract.service';

/**
 * Modal Thêm mới / Cập nhật hợp đồng - dùng chung cho viewNOContractInfo (Add
 * + Edit) và viewExpiredContract (Add khi "Gia hạn", tạo bản ghi MỚI đại
 * diện cho kỳ hợp đồng tiếp theo - không update bản ghi cũ). Khi Thêm mới,
 * chọn nhân viên qua ô tìm kiếm server-side (thay cho `EmployeeSearchModal`
 * popup riêng của bản gốc, cùng ý nghĩa: khoá không cho gõ tay Mã NV). Khi
 * Sửa, Mã NV là input text thường (khớp đúng bản gốc - `contractEditEmpId`
 * không readonly, không có nút tìm kiếm).
 */
@Component({
  selector: 'app-contract-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
  ],
  templateUrl: './contract-form-modal.component.html',
  styleUrl: './contract-form-modal.component.scss',
})
export class ContractFormModalComponent {
  private readonly service = inject(ContractService);
  private readonly employeeService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  @Output() saved = new EventEmitter<void>();

  protected readonly visible = signal(false);
  protected readonly isEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formContractNo = signal('');
  protected readonly formEmpId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formContractName = signal('');
  protected readonly formContractType = signal('FULL_TIME');
  protected readonly formContractTypeCode = signal('');
  protected readonly formStartContractDate = signal('');
  protected readonly formEndContractDate = signal('');
  protected readonly formChangeDate = signal('');
  protected readonly formDeptNo = signal('');
  protected readonly formWorkPosition = signal('');
  protected readonly formPositionNo = signal('');
  protected readonly formPostGradeNo = signal('');
  protected readonly formSalary = signal<number | null>(null);
  protected readonly formWorkTime = signal('');
  protected readonly formWorkHourType = signal('');
  protected readonly formTotalPeriod = signal('');
  protected readonly formTotalPeriod08 = signal('');
  protected readonly formWorkContent = signal('');
  protected readonly formRemark = signal('');
  protected readonly formActivity = signal('ACTIVE');

  private resetForm(): void {
    this.formContractNo.set('');
    this.formEmpId.set('');
    this.formEmpLabel.set(null);
    this.formContractName.set('');
    this.formContractType.set('FULL_TIME');
    this.formContractTypeCode.set('');
    this.formStartContractDate.set('');
    this.formEndContractDate.set('');
    this.formChangeDate.set('');
    this.formDeptNo.set('');
    this.formWorkPosition.set('');
    this.formPositionNo.set('');
    this.formPostGradeNo.set('');
    this.formSalary.set(null);
    this.formWorkTime.set('');
    this.formWorkHourType.set('');
    this.formTotalPeriod.set('');
    this.formTotalPeriod08.set('');
    this.formWorkContent.set('');
    this.formRemark.set('');
    this.formActivity.set('ACTIVE');
    this.employeeOptions.set([]);
  }

  openForAdd(prefill?: Partial<ContractSavePayload> & { empId?: string; empLabel?: string }): void {
    this.resetForm();
    this.isEdit.set(false);
    if (prefill) {
      if (prefill.empId) {
        this.formEmpId.set(prefill.empId);
        this.formEmpLabel.set(prefill.empLabel ?? prefill.empId);
      }
      if (prefill.contractName) this.formContractName.set(prefill.contractName);
      if (prefill.contractTypeCode) this.formContractTypeCode.set(prefill.contractTypeCode);
      if (prefill.deptNo) this.formDeptNo.set(prefill.deptNo);
      if (prefill.workPosition) this.formWorkPosition.set(prefill.workPosition);
      if (prefill.salary != null) this.formSalary.set(prefill.salary);
      if (prefill.workTime) this.formWorkTime.set(prefill.workTime);
      if (prefill.workHourType) this.formWorkHourType.set(prefill.workHourType);
      if (prefill.startContractDate) this.formStartContractDate.set(prefill.startContractDate);
      if (prefill.endContractDate) this.formEndContractDate.set(prefill.endContractDate);
    }
    this.visible.set(true);
  }

  async openForEdit(row: ContractRow): Promise<void> {
    this.resetForm();
    this.isEdit.set(true);
    try {
      const d = await this.service.getContractByNo(row.contractNo!);
      this.formContractNo.set(d.contractNo ?? row.contractNo ?? '');
      this.formEmpId.set(d.empId ?? '');
      this.formContractName.set(d.contractName ?? '');
      this.formContractType.set(d.contractType ?? 'FULL_TIME');
      this.formContractTypeCode.set(d.contractTypeCode ?? '');
      this.formStartContractDate.set(d.startContractDate ?? '');
      this.formEndContractDate.set(d.endContractDate ?? '');
      this.formChangeDate.set(d.changeDate ?? '');
      this.formDeptNo.set(d.deptNo ?? '');
      this.formWorkPosition.set(d.workPosition ?? '');
      this.formPositionNo.set(d.positionNo ?? '');
      this.formPostGradeNo.set(d.postGradeNo ?? '');
      this.formSalary.set(d.salary ?? null);
      this.formWorkTime.set(d.workTime ?? '');
      this.formWorkHourType.set(d.workHourType ?? '');
      this.formTotalPeriod.set(d.totalPeriod ?? '');
      this.formTotalPeriod08.set(d.totalPeriod08 ?? '');
      this.formWorkContent.set(d.workContent ?? '');
      this.formRemark.set(d.remark ?? '');
      this.formActivity.set(d.activity ?? 'ACTIVE');
      this.visible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  close(): void {
    this.visible.set(false);
  }

  async onEmployeeSearch(keyword: string): Promise<void> {
    const kw = (keyword || '').trim();
    if (!kw) {
      this.employeeOptions.set([]);
      return;
    }
    this.employeeSearching.set(true);
    try {
      this.employeeOptions.set(await this.employeeService.searchEmployees(kw));
    } catch {
      this.employeeOptions.set([]);
    } finally {
      this.employeeSearching.set(false);
    }
  }

  onEmployeeSelected(empId: string | null): void {
    this.formEmpId.set(empId ?? '');
    const found = this.employeeOptions().find((e) => e.empId === empId);
    if (found) {
      this.formEmpLabel.set(`${found.empId} - ${found.localName}`);
      if (!this.formDeptNo().trim()) this.formDeptNo.set(found.deptNo ?? '');
      if (!this.formWorkPosition().trim()) this.formWorkPosition.set(found.positionName ?? found.position ?? '');
    }
  }

  async save(): Promise<void> {
    const contractNo = this.formContractNo().trim();
    const empId = this.formEmpId().trim();
    const contractName = this.formContractName().trim();
    if (!contractNo) {
      this.message.warning(this.i18n.t('hrm.editContract.msg.enterContractNo', 'Vui lòng nhập số hợp đồng'));
      return;
    }
    if (!empId) {
      this.message.warning(this.i18n.t('hrm.editContract.msg.enterEmpId', 'Vui lòng nhập mã nhân viên'));
      return;
    }
    if (!contractName) {
      this.message.warning(this.i18n.t('hrm.editContract.msg.enterContractName', 'Vui lòng nhập tên hợp đồng'));
      return;
    }
    const payload: ContractSavePayload = {
      contractNo,
      empId,
      contractName,
      contractType: this.formContractType(),
      contractTypeCode: this.formContractTypeCode().trim() || null,
      startContractDate: this.formStartContractDate() || null,
      endContractDate: this.formEndContractDate() || null,
      changeDate: this.formChangeDate() || null,
      deptNo: this.formDeptNo().trim() || null,
      workPosition: this.formWorkPosition().trim() || null,
      positionNo: this.formPositionNo().trim() || null,
      postGradeNo: this.formPostGradeNo().trim() || null,
      salary: this.formSalary(),
      workTime: this.formWorkTime().trim() || null,
      workHourType: this.formWorkHourType() || null,
      totalPeriod: this.formTotalPeriod().trim() || null,
      totalPeriod08: this.formTotalPeriod08().trim() || null,
      workContent: this.formWorkContent().trim() || null,
      remark: this.formRemark().trim() || null,
      activity: this.formActivity(),
    };
    this.saving.set(true);
    try {
      const res = this.isEdit() ? await this.service.updateContract(payload) : await this.service.addContract(payload);
      if (res.error) {
        this.message.error(res.error);
        return;
      }
      this.message.success(
        res.message ||
          (this.isEdit()
            ? this.i18n.t('common.saveSuccess', 'Lưu thành công')
            : this.i18n.t('common.saveSuccess', 'Lưu thành công')),
      );
      this.visible.set(false);
      this.saved.emit();
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }
}
