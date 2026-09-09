import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

import { I18nService } from '../../../i18n/i18n.service';
import { OrgComposeService, OrgResumeOption } from '../org-compose/org-compose.service';
import { OrgResumeProcessService } from './org-resume-process.service';

/** Đúng logic xác định "Hoạt động" ở bản gốc (viewResumeProcess.html): chấp nhận cả code SY_CODE
 *  "14013948" lẫn chuỗi literal "ACTIVE" - giữ nguyên để không đổi hành vi hiển thị. */
function isActiveValue(activity: string | null | undefined): boolean {
  return activity === '14013948' || activity === 'ACTIVE';
}

/**
 * Quy trình xử lý thay đổi tổ chức (viewResumeProcess) - xem ghi chú trong org-resume-process.service.ts.
 * Layout sơ đồ 4 nhóm bước giữ nguyên CSS đã có sẵn ở assets/css/style.css (.process-container/
 * .process-group/...) - copy nguyên vào org-resume-process.component.scss (đổi tiền tố "process-"/
 * "step-"/"group-"/"vertical-" thành "orp-" để tránh trùng id/class với các trang Angular khác, đúng quy
 * tắc đặt tên CLAUDE.md) vì file CSS gốc chỉ được nạp cho các trang Thymeleaf, không có trong bundle
 * Angular. Dropdown phiên bản thay đổi tái sử dụng OrgComposeService (cùng API với trang org-compose).
 */
@Component({
  selector: 'app-org-resume-process',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzSelectModule],
  templateUrl: './org-resume-process.component.html',
  styleUrl: './org-resume-process.component.scss',
})
export class OrgResumeProcessComponent implements OnInit {
  private readonly composeService = inject(OrgComposeService);
  private readonly service = inject(OrgResumeProcessService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly resumeOptions = signal<OrgResumeOption[]>([]);
  protected readonly loading = signal(false);
  protected readonly executing = signal(false);
  protected readonly selectedNo = signal<string | null>(null);

  protected chkCopyOrg = false;
  protected chkScfl = false;
  protected chkSczz = false;
  protected chkQdzz = false;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadDropdown();
  }

  private async loadDropdown(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.composeService.getResumeDropdown();
      this.resumeOptions.set(list ?? []);
      this.selectedNo.set(list?.length ? list[0].no : null);
    } catch {
      this.resumeOptions.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  protected resumeLabel(r: OrgResumeOption): string {
    return r.no ? `${r.no} ${r.resumeName ?? ''}` : (r.resumeName ?? '');
  }

  protected selectedActivity(): string | null {
    return this.resumeOptions().find((r) => r.no === this.selectedNo())?.activity ?? null;
  }

  protected statusActive(): boolean {
    return isActiveValue(this.selectedActivity());
  }

  protected async execute(): Promise<void> {
    const resumeNo = this.selectedNo();
    if (!resumeNo) {
      this.message.warning(this.i18n.t('org.resumeProcess.msg.pleaseSelectResume', 'Vui lòng chọn phiên bản thay đổi!'));
      return;
    }

    const types: string[] = [];
    if (this.chkCopyOrg) types.push('copyOrg');
    if (this.chkScfl) types.push('scfl');
    if (this.chkSczz) types.push('sczz');
    if (this.chkQdzz) types.push('qdzz');

    if (types.length === 0) {
      this.message.warning(this.i18n.t('org.resumeProcess.msg.pleaseSelectStep', 'Vui lòng chọn ít nhất một bước thực hiện!'));
      return;
    }

    this.executing.set(true);
    try {
      const res = await this.service.executeProcess({ resumeNo, types });
      this.message.success(res.message || this.i18n.t('common.success', 'Thực hiện thành công!'));
    } catch (err: any) {
      const detail = err?.error?.error ? `: ${err.error.error}` : '';
      this.message.error(`${this.i18n.t('common.error', 'Lỗi')}${detail}`);
    } finally {
      this.executing.set(false);
    }
  }
}
