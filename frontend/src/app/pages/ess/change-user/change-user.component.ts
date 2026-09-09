import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { ChangeUserService, EmployeeSearchResult } from './change-user.service';

/**
 * Đổi người dùng đang thao tác (giả lập đăng nhập bằng người khác, dùng cho
 * hỗ trợ/ kiểm thử) - port lại từ ess/change/changeUser.html (Thymeleaf, đã
 * xoá) sang Angular + NG-ZORRO. Thay EmployeeSearchModal (jQuery) bằng
 * nz-select tìm kiếm server-side gọi lại nguyên vẹn API JSON sẵn có.
 */
@Component({
  selector: 'app-change-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzIconModule, NzModalModule, NzSelectModule],
  templateUrl: './change-user.component.html',
  styleUrl: './change-user.component.scss',
})
export class ChangeUserComponent {
  private readonly service = inject(ChangeUserService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searching = signal(false);
  protected readonly changing = signal(false);
  protected readonly options = signal<EmployeeSearchResult[]>([]);
  protected readonly selectedPersonId = signal<string | null>(null);

  async onSearch(keyword: string): Promise<void> {
    const trimmed = keyword?.trim();
    if (!trimmed) {
      this.options.set([]);
      return;
    }
    this.searching.set(true);
    try {
      this.options.set(await this.service.searchEmployees(trimmed));
    } catch {
      this.options.set([]);
    } finally {
      this.searching.set(false);
    }
  }

  confirmChange(): void {
    const personId = this.selectedPersonId();
    if (!personId) {
      this.message.warning(this.i18n.t('ess.changeUser.noEmpSelected', 'Vui lòng chọn nhân viên!'));
      return;
    }
    const selected = this.options().find((opt) => opt.personId === personId);
    const label = selected ? `${selected.empId} - ${selected.localName}` : personId;

    this.modal.confirm({
      nzTitle: this.i18n.t('ess.changeUser.confirm', 'Bạn có chắc chắn muốn thay đổi người dùng?'),
      nzContent: label,
      nzOnOk: () => this.doChange(personId),
    });
  }

  private async doChange(personId: string): Promise<void> {
    this.changing.set(true);
    try {
      await this.service.changeUser(personId);
      this.message.success(this.i18n.t('ess.changeUser.success', 'Thay đổi người dùng thành công!'));
      setTimeout(() => window.location.reload(), 800);
    } catch (err: unknown) {
      const httpError = err as { error?: { error?: string } };
      this.message.error(httpError?.error?.error || this.i18n.t('ess.changeUser.error', 'Thay đổi người dùng thất bại!'));
    } finally {
      this.changing.set(false);
    }
  }
}
