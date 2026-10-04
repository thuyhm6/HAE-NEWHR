import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
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
 * Dây chuyền người duyệt dạng gọn nằm trong 1 ô của bảng (mỗi dòng dữ liệu 1 dây
 * chuyền) - port bảng addApply*Affirm_list_{index} ở các JSP xin phép hàng loạt
 * Hanwha_HAE (viewAttendanceExForBatchInfoList, viewApplyOtLBatchByAnyApproverList,
 * viewApplyOTBatchInfoHAE): STT | Họ tên/Chức vụ/Phòng ban | Mã NV (Enter tra cứu)
 * | Loại duyệt | (+)(-). Dùng chung ApproverChainService/ApproverChainItem với
 * ApproverChainComponent (bản dạng bảng đầy đủ cho form 1 đơn).
 */
@Component({
  selector: 'app-row-approvers',
  standalone: true,
  imports: [FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTooltipModule],
  template: `
    <div class="rap-list">
      @for (a of approvers(); track a.key; let idx = $index) {
        <div class="rap-line">
          <span class="rap-level">{{ idx + 1 }}</span>
          <input nz-input nzSize="small" class="rap-info" [value]="infoText(a)" disabled />
          <div class="rap-emp">
            <input
              nz-input
              nzSize="small"
              [attr.id]="idPrefix() + '-emp-' + idx"
              [class.rap-required]="!a.personId"
              [ngModel]="a.empId"
              (ngModelChange)="onEmpChange(a.key, $event)"
              (keydown.enter)="onEmpEnter(a.key, $event)"
              nz-tooltip
              [nzTooltipTitle]="i18n.t('evs.affirm.please_input_enter.e', 'Chọn từ khóa sau đó Enter')"
            />
            <button nz-button nzSize="small" type="button" (click)="openPicker(a.key, [])"><span nz-icon nzType="search"></span></button>
          </div>
          <nz-select nzSize="small" class="rap-type" [attr.id]="idPrefix() + '-type-' + idx" [ngModel]="a.approvType" (ngModelChange)="patch(a.key, { approvType: $event })">
            <nz-option [nzValue]="APPROV_TYPE_APPROVAL" [nzLabel]="i18n.t('hr.contract.title.shenpi', 'Phê duyệt')"></nz-option>
            <nz-option [nzValue]="APPROV_TYPE_NOTICE" [nzLabel]="i18n.t('ess.infoApply.gonggao', 'Thông báo')"></nz-option>
          </nz-select>
          <button nz-button nzSize="small" nzShape="circle" type="button" [title]="i18n.t('button.add', 'Thêm mới')" (click)="addAfter(a.key)">
            <span nz-icon nzType="plus"></span>
          </button>
          <button nz-button nzSize="small" nzShape="circle" nzDanger type="button" [title]="i18n.t('button.delete', 'Xóa')" (click)="remove(a.key)">
            <span nz-icon nzType="minus"></span>
          </button>
        </div>
      } @empty {
        <button nz-button nzSize="small" nzShape="circle" type="button" [attr.id]="idPrefix() + '-add-btn'" [title]="i18n.t('button.add', 'Thêm mới')" (click)="addAfter(null)">
          <span nz-icon nzType="plus"></span>
        </button>
      }
    </div>

    <!-- Popup tìm nhân viên (thay /ar/attendanceMintenance/viewAddAffirmList ở bản cũ) -->
    @if (pickerVisible()) {
      <nz-modal [nzVisible]="true" [nzTitle]="i18n.t('empSearch.title', 'Tìm kiếm nhân viên')" [nzFooter]="null" (nzOnCancel)="closePicker()">
        <ng-container *nzModalContent>
          <nz-select
            [attr.id]="idPrefix() + '-picker-select'"
            class="rap-full"
            nzShowSearch
            [nzServerSearch]="true"
            [nzLoading]="pickerSearching()"
            [ngModel]="null"
            (ngModelChange)="onPickerSelected($event)"
            (nzOnSearch)="onPickerSearch($event)"
            [nzPlaceHolder]="i18n.t('empSearch.placeholder.keyword', 'Nhập mã NV hoặc họ tên...')"
          >
            @for (emp of pickerResults(); track emp.personId) {
              <nz-option [nzValue]="emp.personId" [nzLabel]="(emp.empId || '') + ' - ' + (emp.localName || '') + (emp.deptName ? ' / ' + emp.deptName : '')"></nz-option>
            }
          </nz-select>
        </ng-container>
      </nz-modal>
    }
  `,
  styles: [
    `
      .rap-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .rap-line {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .rap-level {
        flex: 0 0 18px;
        text-align: center;
      }
      .rap-info {
        flex: 1;
        min-width: 120px;
      }
      .rap-emp {
        display: flex;
        flex: 0 0 120px;
      }
      .rap-type {
        flex: 0 0 105px;
      }
      .rap-required {
        border-color: #ff4d4f;
      }
      .rap-full {
        width: 100%;
      }
    `,
  ],
})
export class RowApproversComponent {
  private readonly service = inject(ApproverChainService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  /** Danh sách người duyệt của dòng (two-way binding: [(approvers)]) */
  readonly approvers = model<ApproverChainItem[]>([]);
  /** Tiền tố id phần tử (nên chứa khóa dòng) để tránh trùng id giữa các dòng */
  readonly idPrefix = input('rap');
  /** Bắn ra mỗi khi người dùng sửa dây chuyền (trang cha dùng để tự tick chọn dòng) */
  readonly edited = output<void>();

  protected readonly APPROV_TYPE_APPROVAL = APPROV_TYPE_APPROVAL;
  protected readonly APPROV_TYPE_NOTICE = APPROV_TYPE_NOTICE;

  protected readonly pickerVisible = signal(false);
  protected readonly pickerResults = signal<ApproverEmployee[]>([]);
  protected readonly pickerSearching = signal(false);
  private pickerKey: string | null = null;
  private pickerTimer: ReturnType<typeof setTimeout> | undefined;

  /** Họ tên/Chức vụ/Phòng ban - giống ô InfoEMPINFO* ở JSP cũ */
  infoText(a: ApproverChainItem): string {
    return a.personId ? [a.localName, a.positionName, a.deptName].map((v) => v ?? '').join('/') : '';
  }

  private update(list: ApproverChainItem[]): void {
    this.approvers.set(list);
    this.edited.emit();
  }

  addAfter(key: string | null): void {
    const list = [...this.approvers()];
    const idx = key ? list.findIndex((a) => a.key === key) : -1;
    list.splice(idx + 1, 0, {
      key: newApproverKey(),
      personId: '',
      empId: '',
      localName: '',
      deptName: '',
      positionName: '',
      approvType: APPROV_TYPE_APPROVAL,
      fromDefault: false,
    });
    this.update(list);
  }

  remove(key: string): void {
    this.update(this.approvers().filter((a) => a.key !== key));
  }

  patch(key: string, patch: Partial<ApproverChainItem>): void {
    this.update(this.approvers().map((a) => (a.key === key ? { ...a, ...patch } : a)));
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
