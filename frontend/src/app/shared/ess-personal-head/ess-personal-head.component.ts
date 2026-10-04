import { Component, OnInit, inject, output, signal } from '@angular/core';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

import { I18nService } from '../../i18n/i18n.service';
import { EssPersonalHeadInfo, EssPersonalHeadService } from './ess-personal-head.service';

/**
 * Khối thông tin nhân viên đăng nhập ở đầu các form xin phép ESS - port
 * viewPersonalInfoHead_ess.jsp (Hanwha_HAE): Họ tên, Mã NV, Phòng ban, Trưởng
 * phòng, Nhóm chức, Cấp bậc, Chức trách, Ngày vào công ty. Tự tải thông tin
 * và phát `loaded` để trang cha dùng lại (personId, postFamily, sexCode...),
 * tránh gọi API myInfo 2 lần.
 */
@Component({
  selector: 'app-ess-personal-head',
  standalone: true,
  imports: [NzDescriptionsModule],
  template: `
    <nz-descriptions id="eph-info" class="eph-info" nzBordered nzSize="small" [nzColumn]="{ xs: 1, sm: 1, md: 2 }">
      <nz-descriptions-item [nzTitle]="i18n.t('hr.viewPersonalInfo.title.LOCAL_NAME', 'Họ tên')">{{ info()?.localName }}</nz-descriptions-item>
      <nz-descriptions-item [nzTitle]="i18n.t('hr.enpinfo.title.EMP.EMPNUMBER', 'Mã nhân viên')">{{ info()?.empId }}</nz-descriptions-item>
      <nz-descriptions-item [nzTitle]="i18n.t('hr.viewPersonalInfo.title.DEPTNAME', 'Phòng ban')">{{ info()?.deptName }}</nz-descriptions-item>
      <nz-descriptions-item [nzTitle]="i18n.t('hrm.empinfo.HEAD_DEPARTMENT', 'Trưởng phòng')">{{ info()?.headDepartment }}</nz-descriptions-item>
      <nz-descriptions-item [nzTitle]="i18n.t('ess.empInfo.zhiqun', 'Nhóm chức')">{{ info()?.postFamilyName }}</nz-descriptions-item>
      <nz-descriptions-item [nzTitle]="i18n.t('hrm.contract.Rank', 'Cấp bậc')">{{ info()?.postGradeName }}</nz-descriptions-item>
      <nz-descriptions-item [nzTitle]="i18n.t('org.title.POSITION_NO', 'Chức trách')">{{ info()?.positionNoName }}</nz-descriptions-item>
      <nz-descriptions-item [nzTitle]="i18n.t('hrm.empinfo.DATE_STARTED', 'Ngày vào công ty')">{{ info()?.dateStarted }}</nz-descriptions-item>
    </nz-descriptions>
  `,
  styles: [
    `
      .eph-info ::ng-deep .ant-descriptions-item-label {
        width: 20%;
        text-align: right;
      }
    `,
  ],
})
export class EssPersonalHeadComponent implements OnInit {
  private readonly service = inject(EssPersonalHeadService);
  protected readonly i18n = inject(I18nService);

  readonly loaded = output<EssPersonalHeadInfo>();
  protected readonly info = signal<EssPersonalHeadInfo | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const info = await this.service.getMyInfo();
      this.info.set(info);
      this.loaded.emit(info);
    } catch {
      this.info.set(null);
      this.loaded.emit({});
    }
  }
}
