import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { I18nService } from '../../../../i18n/i18n.service';
import { AddressRow } from '../address/address.service';
import { EducationRow } from '../education/education.service';
import { EmergencyAddressRow } from '../emergency-address/emergency-address.service';
import { FamilyRow } from '../family/family.service';
import { PunishmentRow } from '../punishment/punishment.service';
import { RewardRow } from '../recognition/recognition.service';
import { EmpSearchService, EmployeeSearchResult } from '../shared/emp-search.service';
import { EssPersonalInfoDto, InsideExperienceRow, PersonalInfoService } from './personal-info.service';

function calcAge(dobStr?: string): string {
  if (!dobStr) return '';
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }
  return `${years} Năm ${months} Tháng`;
}

function calcWorkDuration(startDateStr?: string): string {
  if (!startDateStr) return '';
  const started = new Date(startDateStr);
  if (isNaN(started.getTime())) return startDateStr;
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
  return `${years} Năm ${months} Tháng`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const p = dateStr.split('-');
    return `${p[2].substring(0, 2)}/${p[1]}/${p[0]}`;
  }
  return dateStr;
}

function getInitials(name?: string): string {
  const s = (name ?? 'NV').trim();
  if (!s) return 'NV';
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Hồ sơ nhân viên (viewPersonalInfo) - port lại từ
 * hrm/empinfo/viewPersonalInfo.html (đã xoá). 2 tab "Thông tin đánh giá" và
 * "Ghi chép đặc biệt" ở bản gốc luôn hiển thị "Không có dữ liệu" (không có
 * API nào cấp dữ liệu cho 2 tab này) - giữ nguyên hành vi, không tự thêm
 * tính năng mới nằm ngoài phạm vi migrate.
 */
@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzGridModule,
    NzIconModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
  ],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss',
})
export class PersonalInfoComponent implements OnInit {
  private readonly service = inject(PersonalInfoService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchPersonId = signal<string | null>(null);
  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly profileLoading = signal(false);
  protected readonly profile = signal<EssPersonalInfoDto | null>(null);
  protected readonly hasProfile = signal(false);

  protected readonly emergencyList = signal<EmergencyAddressRow[]>([]);
  protected readonly addressList = signal<AddressRow[]>([]);
  protected readonly familyList = signal<FamilyRow[]>([]);

  protected readonly insideExperienceList = signal<InsideExperienceRow[]>([]);
  protected readonly insideExperienceLoading = signal(false);

  protected readonly educationList = signal<EducationRow[]>([]);
  protected readonly educationLoading = signal(false);

  protected readonly rewardList = signal<RewardRow[]>([]);
  protected readonly punishmentList = signal<PunishmentRow[]>([]);
  protected readonly rewardPunishLoading = signal(false);

  private currentPersonId: string | null = null;
  private currentUserPersonId: string | null = null;
  private readonly loadedTabs = new Set<number>();

  calcAge = calcAge;
  calcWorkDuration = calcWorkDuration;
  getInitials = getInitials;
  formatDate = formatDate;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.currentUserPersonId = await this.service.getCurrentUserPersonId();
      if (this.currentUserPersonId) {
        await this.loadAll(this.currentUserPersonId);
      }
    } catch {
      // Không có nhân viên hiện tại - hiển thị placeholder chờ tìm kiếm.
    }
  }

  private async loadAll(personId: string): Promise<void> {
    this.currentPersonId = personId;
    this.loadedTabs.clear();
    this.insideExperienceList.set([]);
    this.educationList.set([]);
    this.rewardList.set([]);
    this.punishmentList.set([]);
    this.profileLoading.set(true);
    try {
      const [profile, emergency, address, family] = await Promise.all([
        this.service.getProfile(personId),
        this.service.getEmergencyList(personId),
        this.service.getAddressList(personId),
        this.service.getFamilyList(personId),
      ]);
      this.profile.set(profile);
      this.emergencyList.set(emergency);
      this.addressList.set(address);
      this.familyList.set(family);
      this.hasProfile.set(true);
    } catch {
      this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.profileLoading.set(false);
    }
  }

  async onTabChange(index: number): Promise<void> {
    if (!this.currentPersonId || this.loadedTabs.has(index)) return;
    this.loadedTabs.add(index);
    const personId = this.currentPersonId;

    if (index === 1) {
      this.insideExperienceLoading.set(true);
      try {
        this.insideExperienceList.set(await this.service.getInsideExperienceList(personId));
      } catch {
        this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
      } finally {
        this.insideExperienceLoading.set(false);
      }
    } else if (index === 2) {
      this.educationLoading.set(true);
      try {
        this.educationList.set(await this.service.getEducationList(personId));
      } catch {
        this.message.error(this.i18n.t('vpie.msg.loadError', 'Lỗi tải dữ liệu'));
      } finally {
        this.educationLoading.set(false);
      }
    } else if (index === 3) {
      this.rewardPunishLoading.set(true);
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
        this.rewardPunishLoading.set(false);
      }
    }
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

  async onEmployeeSelected(personId: string | null): Promise<void> {
    if (!personId) return;
    await this.loadAll(personId);
  }

  async resetSearch(): Promise<void> {
    this.searchPersonId.set(null);
    this.employeeOptions.set([]);
    if (this.currentUserPersonId) {
      await this.loadAll(this.currentUserPersonId);
    } else {
      this.hasProfile.set(false);
    }
  }
}
