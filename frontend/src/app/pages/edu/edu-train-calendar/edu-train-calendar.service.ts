import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduPlanManagerRow, EduTrainSyllabusRow } from '../edu-plan-manager/edu-plan-manager.service';

export interface EduCalendarItem {
  /** DD/MM/YYYY */
  courseDate: string;
  planNo: string;
  courseNameCode?: string;
  periodTime?: string;
}

export interface EduCalendarDetail {
  plan: EduPlanManagerRow;
  isnotTest?: string;
  isnotReport?: string;
  trainContent?: string;
  syllabus?: EduTrainSyllabusRow[];
}

const BASE = '/edu/api/trainCalendar';

/** Lịch đào tạo - port từ /edu/trainfile/trainCalendar (Hanwha_HTSV). */
@Injectable({ providedIn: 'root' })
export class EduTrainCalendarService {
  private readonly http = inject(HttpClient);

  /** personal = true: lịch cá nhân (/edu/trainfile/personalTrainCalendar) - chỉ khóa mình là học viên. */
  getMonth(year: number, month: number, personal = false): Promise<EduCalendarItem[]> {
    const url = personal ? `${BASE}/personalMonth` : `${BASE}/month`;
    return firstValueFrom(this.http.get<EduCalendarItem[]>(url, { params: { year, month } }));
  }

  getDetail(planNo: string): Promise<EduCalendarDetail> {
    return firstValueFrom(this.http.get<EduCalendarDetail>(`${BASE}/detail`, { params: { planNo } }));
  }
}
