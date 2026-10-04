import { Component, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { I18nService } from '../../i18n/i18n.service';
import {
  APPROV_TYPE_APPROVAL,
  APPROV_TYPE_NOTICE,
  ApproverChainItem,
  ApproverChainService,
  ApproverEmployee,
  newApproverKey,
} from './approver-chain.service';

/**
 * Bảng dây chuyền người duyệt dùng chung cho các form xin phép ESS - port
 * bảng addApply*Affirm_list ở các JSP Hanwha_HAE (viewSSTApplyAttendance,
 * viewSSTOtApplyInfo(Tx), viewAbnormalApplyByAnyApprover): cột STT / Người
 * duyệt / Mã NV / Phòng ban / Chức trách / Loại duyệt / (+)(-). Dòng thêm tay
 * nhập mã NV rồi Enter: đúng 1 kết quả thì điền luôn, không có/nhiều kết quả
 * hoặc ô trống thì mở popup tìm nhân viên (thay viewAddAffirmList).
 */
@Component({
  selector: 'app-approver-chain',
  standalone: true,
  imports: [FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTableModule, NzTooltipModule],
  templateUrl: './approver-chain.component.html',
  styleUrl: './approver-chain.component.scss',
})
export class ApproverChainComponent {
  private readonly service = inject(ApproverChainService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  /** Danh sách người duyệt (two-way binding: [(approvers)]) */
  readonly approvers = model<ApproverChainItem[]>([]);
  /** Tiền tố id phần tử để tránh trùng id khi nhúng vào trang cha */
  readonly idPrefix = input('apc');

  protected readonly APPROV_TYPE_APPROVAL = APPROV_TYPE_APPROVAL;
  protected readonly APPROV_TYPE_NOTICE = APPROV_TYPE_NOTICE;

  protected readonly pickerVisible = signal(false);
  protected readonly pickerResults = signal<ApproverEmployee[]>([]);
  protected readonly pickerSearching = signal(false);
  private pickerKey: string | null = null;
  private pickerTimer: ReturnType<typeof setTimeout> | undefined;

  private emptyRow(): ApproverChainItem {
    return {
      key: newApproverKey(),
      personId: '',
      empId: '',
      localName: '',
      deptName: '',
      positionName: '',
      approvType: APPROV_TYPE_APPROVAL,
      fromDefault: false,
    };
  }

  /** (+) ở tiêu đề: chèn 1 dòng lên đầu (addRowBy*First) */
  addFirst(): void {
    this.approvers.set([this.emptyRow(), ...this.approvers()]);
  }

  /** (+) trên dòng: chèn 1 dòng ngay sau dòng hiện tại (addRowBy*) */
  addAfter(key: string): void {
    const list = [...this.approvers()];
    const idx = list.findIndex((a) => a.key === key);
    list.splice(idx + 1, 0, this.emptyRow());
    this.approvers.set(list);
  }

  remove(key: string): void {
    this.approvers.set(this.approvers().filter((a) => a.key !== key));
  }

  private patch(key: string, patch: Partial<ApproverChainItem>): void {
    this.approvers.set(this.approvers().map((a) => (a.key === key ? { ...a, ...patch } : a)));
  }

  onTypeChange(key: string, approvType: string): void {
    this.patch(key, { approvType });
  }

  onEmpChange(key: string, empId: string): void {
    // Đổi mã -> xóa người duyệt cũ cho tới khi Enter tra cứu lại
    this.patch(key, { empId, personId: '', localName: '', deptName: '', positionName: '' });
  }

  async onEmpEnter(key: string, event: Event): Promise<void> {
    event.preventDefault();
    const keyword = (event.target as HTMLInputElement).value.replace(/ /g, '');
    if (!keyword) {
      this.openPicker(key, []);
      return;
    }
    try {
      const results = await this.service.searchEmployees(keyword);
      if (results.length === 1) {
        this.select(key, results[0]);
      } else {
        this.openPicker(key, results);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  openPicker(key: string, results: ApproverEmployee[]): void {
    this.pickerKey = key;
    this.pickerResults.set(results);
    this.pickerVisible.set(true);
  }

  closePicker(): void {
    this.pickerVisible.set(false);
    this.pickerKey = null;
  }

  onPickerSearch(keyword: string): void {
    if (this.pickerTimer) clearTimeout(this.pickerTimer);
    const kw = keyword.trim();
    if (!kw) return;
    this.pickerTimer = setTimeout(async () => {
      this.pickerSearching.set(true);
      try {
        this.pickerResults.set(await this.service.searchEmployees(kw));
      } catch {
        this.pickerResults.set([]);
      } finally {
        this.pickerSearching.set(false);
      }
    }, 300);
  }

  onPickerSelected(personId: string | null): void {
    const emp = this.pickerResults().find((e) => e.personId === personId);
    const key = this.pickerKey;
    if (!emp || !key) return;
    this.closePicker();
    this.select(key, emp);
  }

  private select(key: string, emp: ApproverEmployee): void {
    this.patch(key, {
      personId: emp.personId ?? '',
      empId: emp.empId ?? '',
      localName: emp.localName ?? '',
      deptName: emp.deptName ?? '',
      positionName: emp.positionName ?? '',
    });
  }
}
