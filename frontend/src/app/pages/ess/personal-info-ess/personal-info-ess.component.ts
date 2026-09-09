import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { I18nService } from '../../../i18n/i18n.service';
import {
  EmployeeSearchResult,
  EssPersonalInfoDto,
  EvsObjectDto,
  HrAddressMatters,
  HrEducation,
  HrEmergencyAddress,
  HrFamily,
  HrPunishment,
  HrReward,
  HrSpecialMatter,
  ManageEmpPositionInsideDto,
  PersonalInfoEssService,
} from './personal-info-ess.service';

/**
 * Hồ sơ nhân viên (viewDept) - port lại từ
 * ess/viewDept/viewPersonalInfoEss.html (Thymeleaf + jQuery, đã xoá) sang
 * Angular + NG-ZORRO. Ngoài các mục đã có ở bản cũ (thông tin cơ bản, liên hệ
 * khẩn cấp, địa chỉ, gia đình, quá trình nội bộ, học vấn), tận dụng luôn các
 * API reward/punishment/evsObject/specialMatter đã có sẵn ở backend
 * (EssViewDeptController) để lấp đầy 3 tab trước đây chỉ hiển thị
 * "Không có dữ liệu".
 */
@Component({
  selector: 'app-personal-info-ess',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
    NzTabsModule,
  ],
  templateUrl: './personal-info-ess.component.html',
  styleUrl: './personal-info-ess.component.scss',
})
export class PersonalInfoEssComponent implements OnInit {
  private readonly service = inject(PersonalInfoEssService);
  private readonly message = inject(NzMessageService);
  private readonly location = inject(Location);
  protected readonly i18n = inject(I18nService);

  protected readonly profileLoading = signal(false);
  protected readonly profile = signal<EssPersonalInfoDto | null>(null);

  protected readonly emergencyList = signal<HrEmergencyAddress[]>([]);
  protected readonly addressList = signal<HrAddressMatters[]>([]);
  protected readonly familyList = signal<HrFamily[]>([]);

  protected readonly insideExperienceList = signal<ManageEmpPositionInsideDto[]>([]);
  protected readonly insideExperienceLoading = signal(false);

  protected readonly educationList = signal<HrEducation[]>([]);
  protected readonly educationLoading = signal(false);

  protected readonly rewardList = signal<HrReward[]>([]);
  protected readonly punishmentList = signal<HrPunishment[]>([]);
  protected readonly rewardPunishmentLoading = signal(false);

  protected readonly evsObjectList = signal<EvsObjectDto[]>([]);
  protected readonly evsObjectLoading = signal(false);

  protected readonly specialMatterList = signal<HrSpecialMatter[]>([]);
  protected readonly specialMatterLoading = signal(false);

  protected readonly searchKeyword = signal('');
  protected readonly searchLoading = signal(false);
  protected readonly searchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly searchTouched = signal(false);

  private currentPersonId: string | null = null;
  private readonly loadedTabs = new Set<number>();

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.loadPerson(undefined);
  }

  goBack(): void {
    this.location.back();
  }

  private async loadPerson(personId: string | undefined): Promise<void> {
    this.profileLoading.set(true);
    try {
      const profile = await this.service.getProfile(personId);
      this.profile.set(profile);
      this.currentPersonId = profile.personId ?? null;
      this.loadedTabs.clear();
      this.insideExperienceList.set([]);
      this.educationList.set([]);
      this.rewardList.set([]);
      this.punishmentList.set([]);
      this.evsObjectList.set([]);
      this.specialMatterList.set([]);
      if (this.currentPersonId) {
        await this.loadBasicInfoLists(this.currentPersonId);
      }
    } catch {
      this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.profileLoading.set(false);
    }
  }

  private async loadBasicInfoLists(personId: string): Promise<void> {
    try {
      const [emergency, address, family] = await Promise.all([
        this.service.getEmergencyList(personId),
        this.service.getAddressList(personId),
        this.service.getFamilyList(personId),
      ]);
      this.emergencyList.set(emergency);
      this.addressList.set(address);
      this.familyList.set(family);
    } catch {
      this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async onTabChange(index: number | undefined): Promise<void> {
    if (index === undefined || !this.currentPersonId || this.loadedTabs.has(index)) {
      return;
    }
    this.loadedTabs.add(index);
    const personId = this.currentPersonId;

    switch (index) {
      case 1:
        this.insideExperienceLoading.set(true);
        try {
          this.insideExperienceList.set(await this.service.getInsideExperienceList(personId));
        } catch {
          this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
        } finally {
          this.insideExperienceLoading.set(false);
        }
        break;
      case 2:
        this.educationLoading.set(true);
        try {
          this.educationList.set(await this.service.getEducationList(personId));
        } catch {
          this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
        } finally {
          this.educationLoading.set(false);
        }
        break;
      case 3:
        this.rewardPunishmentLoading.set(true);
        try {
          const [reward, punishment] = await Promise.all([
            this.service.getRewardList(personId),
            this.service.getPunishmentList(personId),
          ]);
          this.rewardList.set(reward);
          this.punishmentList.set(punishment);
        } catch {
          this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
        } finally {
          this.rewardPunishmentLoading.set(false);
        }
        break;
      case 4:
        this.evsObjectLoading.set(true);
        try {
          this.evsObjectList.set(await this.service.getEvsObjectList(personId));
        } catch {
          this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
        } finally {
          this.evsObjectLoading.set(false);
        }
        break;
      case 5:
        this.specialMatterLoading.set(true);
        try {
          this.specialMatterList.set(await this.service.getSpecialMatterList(personId));
        } catch {
          this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
        } finally {
          this.specialMatterLoading.set(false);
        }
        break;
    }
  }

  async searchEmp(): Promise<void> {
    const keyword = this.searchKeyword().trim();
    if (!keyword) {
      return;
    }
    this.searchLoading.set(true);
    this.searchTouched.set(true);
    try {
      this.searchResults.set(await this.service.searchEmployees(keyword));
    } catch {
      this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.searchLoading.set(false);
    }
  }

  async selectEmployee(emp: EmployeeSearchResult): Promise<void> {
    if (!emp.personId) {
      return;
    }
    this.searchResults.set([]);
    this.searchTouched.set(false);
    this.searchKeyword.set(emp.empId ? `${emp.empId} - ${emp.localName ?? ''}` : emp.localName ?? '');
    await this.loadPerson(emp.personId);
  }

  async resetSearch(): Promise<void> {
    this.searchKeyword.set('');
    this.searchResults.set([]);
    this.searchTouched.set(false);
    await this.loadPerson(undefined);
  }

  resolvePhotoUrl(photoPath?: string): string | null {
    if (!photoPath) {
      return null;
    }
    const normalized = photoPath.trim();
    if (!normalized) {
      return null;
    }
    if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:')) {
      return normalized;
    }
    return normalized.startsWith('/') ? normalized : '/' + normalized.replace(/^\/+/, '');
  }

  getInitials(name?: string): string {
    const s = (name ?? '').trim();
    if (!s) {
      return 'NV';
    }
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) {
      return '';
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const p = dateStr.split('-');
      return p[2].substring(0, 2) + '/' + p[1] + '/' + p[0];
    }
    return dateStr;
  }

  calcAge(dobStr?: string): string {
    if (!dobStr) {
      return '';
    }
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) {
      return '';
    }
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }
    return years + ' ' + this.i18n.t('common.year', 'Năm') + ' ' + months + ' ' + this.i18n.t('common.month', 'Tháng');
  }

  calcWorkDuration(startDateStr?: string): string {
    if (!startDateStr) {
      return '';
    }
    const parts = startDateStr.split('/');
    let started: Date;
    if (parts.length === 3) {
      started = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      started = new Date(startDateStr);
    }
    if (isNaN(started.getTime())) {
      return startDateStr;
    }
    const now = new Date();
    let years = now.getFullYear() - started.getFullYear();
    let months = now.getMonth() - started.getMonth();
    let days = now.getDate() - started.getDate();
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return years + ' ' + this.i18n.t('common.year', 'Năm') + ' ' + months + ' ' + this.i18n.t('common.month', 'Tháng');
  }
}
