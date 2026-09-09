import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../i18n/i18n.service';
import {
  AffirmContext,
  ApplyDetailInfo,
  ApplyDetailModalService,
  ApplyDetailResponse,
  ApplyDetailVariant,
  ApprovalRow,
} from './apply-detail-modal.service';

/**
 * Modal "Chi tiết đơn" dùng chung cho 3 loại đơn: tăng ca (ot), nghỉ phép
 * (leave), chấm công bất thường (attendanceEx) - port lại từ 3 fragment gần
 * như trùng lặp hoàn toàn (ess/infoApply/viewApprovaledOt.html,
 * viewApprovaledLeave.html, viewAttendanceEx.html, đều đã xoá) sang 1
 * component Angular + NG-ZORRO duy nhất. Đặt trong `shared/` vì được nhiều
 * trang (viewApprovalEmail, viewApprovaledEmail, viewNoticeedEmail,
 * viewPOtApplyInfoList, ...) tái sử dụng, không thuộc riêng module `ess`.
 *
 * Cách dùng: đặt `<app-apply-detail-modal #otModal variant="ot" (approved)="reload()">`
 * trong template trang cha, rồi gọi `otModal.open(applyNo, applyType, ctx)`
 * khi người dùng bấm xem chi tiết một dòng đơn tăng ca.
 */
@Component({
  selector: 'app-apply-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzTableModule],
  templateUrl: './apply-detail-modal.component.html',
  styleUrl: './apply-detail-modal.component.scss',
})
export class ApplyDetailModalComponent {
  @Input({ required: true }) variant!: ApplyDetailVariant;
  @Output() approved = new EventEmitter<void>();

  private readonly service = inject(ApplyDetailModalService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly visible = signal(false);
  protected readonly loading = signal(false);
  protected readonly detail = signal<ApplyDetailResponse | null>(null);
  protected readonly opinionText = signal('');
  private ctx: AffirmContext | null = null;

  /** true cho cả 'ot' và 'otOver' - 2 biến thể dùng chung field otInfo. */
  protected get isOtLike(): boolean {
    return this.variant === 'ot' || this.variant === 'otOver';
  }

  get info(): ApplyDetailInfo {
    const d = this.detail();
    return (this.isOtLike ? d?.otInfo : d?.leaveInfo) ?? {};
  }

  get employeeInfo(): ApplyDetailInfo {
    return this.detail()?.employeeInfo ?? this.info;
  }

  get approvalList(): ApprovalRow[] {
    return this.detail()?.approvalList ?? [];
  }

  get typeLabel(): string {
    return this.isOtLike
      ? this.info.otTypeName || this.i18n.t('arOtf.applyOt', 'Xin tăng ca')
      : this.info.leaveTypeName || this.i18n.t('applyAtt.applyTitleFallback', 'Xin nghỉ phép');
  }

  get applyTitleLine(): string {
    const localName = this.info.localName ?? '';
    if (this.isOtLike) {
      const from = this.info.detailFromDateTime ?? '';
      const to = this.info.detailToDateTime ?? '';
      if (!this.info.otTypeName && !localName && !from && !to) return '';
      return `${this.info.otTypeName ?? ''}/Apply(${localName})[Date: ${from} ~ ${to}]`;
    }
    const from = this.info.leaveFromTime ?? '';
    const to = this.info.leaveToTime ?? '';
    if (!this.info.leaveTypeName && !localName && !from && !to) return '';
    return `${this.info.leaveTypeName ?? ''}/Apply(${localName})[Date: ${from} ~ ${to}]`;
  }

  get applicantLine(): string {
    const e = this.employeeInfo;
    return `${e.localName ?? ''}/${e.postGradeName ?? ''}/${e.deptName ?? ''}`;
  }

  get durationText(): string {
    if (this.isOtLike) {
      return this.info.otApplyHour ?? '';
    }
    if (this.variant === 'leave') {
      return this.formatDuration(this.info.applyLength, this.info.dayHours);
    }
    return this.info.applyLength ?? '';
  }

  get canAffirm(): boolean {
    return !!(this.ctx?.fromApprovalEmail && this.ctx?.affirmPersonId && String(this.ctx?.affirmFlag) === '0');
  }

  private formatDuration(applyLength?: string, dayHours?: string): string {
    const len = parseFloat(applyLength ?? '');
    const dh = parseFloat(dayHours ?? '');
    if (isNaN(len) || isNaN(dh) || dh === 0) {
      return applyLength ?? '';
    }
    const days = Math.floor(len / dh);
    const hours = len - days * dh;
    let text = '';
    if (days > 0) text += `${days} Ngày`;
    if (hours > 0) text += (text ? ' ' : '') + `${hours} Giờ`;
    return text || String(len);
  }

  approvalStt(row: ApprovalRow, idx: number): string {
    const stt = row.affirmLevel ?? idx + 1;
    return String(stt) === '100' ? 'HR' : String(stt);
  }

  isPendingRow(row: ApprovalRow): boolean {
    return this.canAffirm && row.affirmPersonId === this.ctx?.affirmPersonId && String(row.affirmFlag) === '0';
  }

  async open(applyNo: string | undefined, applyType: string | undefined, ctx: AffirmContext | null): Promise<void> {
    if (!applyNo) {
      this.message.warning(this.i18n.t('applyAtt.msg.noApplyNo', 'Không tìm thấy số đơn để xem chi tiết'));
      return;
    }
    this.ctx = ctx;
    this.opinionText.set('');
    this.visible.set(true);
    this.loading.set(true);
    this.detail.set(null);
    try {
      this.detail.set(await this.service.getDetail(this.variant, applyNo, applyType));
    } catch {
      this.message.error(this.i18n.t('applyAtt.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.loading.set(false);
    }
  }

  close(): void {
    this.visible.set(false);
  }

  async doAffirm(flag: 1 | 2): Promise<void> {
    if (!this.ctx) {
      return;
    }
    const content = this.opinionText().trim() || (flag === 1 ? 'Ok' : 'Reject');
    try {
      const res = await this.service.executeAffirm([
        {
          applyNo: this.ctx.applyNo,
          applyType: this.ctx.applyType,
          applyFlag: this.ctx.applyFlag,
          affirmLevel: this.ctx.affirmLevel,
          flag,
          affirmContent: content,
        },
      ]);
      this.visible.set(false);
      if (res.success) {
        this.approved.emit();
      } else {
        this.message.error(res.message || this.i18n.t('vae.msg.executeFail', 'Có lỗi xảy ra trong quá trình xử lý.'));
      }
    } catch {
      this.message.error(this.i18n.t('vae.msg.executeFail', 'Có lỗi xảy ra trong quá trình xử lý.'));
    }
  }
}
