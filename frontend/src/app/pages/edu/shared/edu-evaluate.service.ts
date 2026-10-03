import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduCourseSummaryData } from './edu-course-summary/edu-course-summary.component';
import { EduFile, EduSaveResponse } from './edu-common.service';

/** Loại đánh giá (EDU_PLAN_MANAGER.ISNOT_EVALUATE bản gốc). */
export type EduEvalType = '1' | '2' | '3';
export const EDU_EVAL_STUDENT: EduEvalType = '1';
export const EDU_EVAL_TEACHER: EduEvalType = '2';
export const EDU_EVAL_RESULT: EduEvalType = '3';

export interface EduEvalCourse extends EduCourseSummaryData {
  basicNo: string;
  studentEvalCount?: number;
  resultEvalCount?: number;
  studentCount?: number;
  resultNo?: string;
  inProgress?: boolean;
  canEvaluate?: boolean;
}

export interface EduEvalStudent {
  freeNo: string;
  empid: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  evaResult?: string;
}

export interface EduScoreStat {
  key: string;
  name?: string;
  deptName?: string;
  postGradeName?: string;
  evaluatedCount?: number;
  rev05?: string;
  rev04?: string;
  rev03?: string;
  rev02?: string;
  rev01?: string;
  revTotal?: string;
}

export interface EduTeacherCheck {
  checkNo: string;
  teaEmpid?: string;
  teaLocalName?: string;
  stuEmpid?: string;
  stuLocalName?: string;
  grooming?: string;
}

export interface EduTrainResult {
  resultNo: string;
  stuEmpid?: string;
  stuLocalName?: string;
  difficulty?: string;
  contentRich?: string;
  practicability?: string;
  timeModerate?: string;
  allscore?: string;
  otherAdvise?: string;
  files?: EduFile[];
}

export interface EduImportResponse extends EduSaveResponse {
  warnings?: string[];
  updatedCount?: number;
}

const API = '/edu/api';

/**
 * API dùng chung cho 3 màn đánh giá đào tạo (studentEvaluate / teacherEvaluate / trainResult).
 */
@Injectable({ providedIn: 'root' })
export class EduEvaluateService {
  private readonly http = inject(HttpClient);

  getCourses(type: EduEvalType, startDate?: string, endDate?: string): Promise<EduEvalCourse[]> {
    const params: Record<string, string> = { type };
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return firstValueFrom(this.http.get<EduEvalCourse[]>(`${API}/evaluate/courses`, { params }));
  }

  getCourse(basicNo: string): Promise<EduCourseSummaryData> {
    return firstValueFrom(this.http.get<EduCourseSummaryData>(`${API}/evaluate/course`, { params: { basicNo } }));
  }

  // ===== Đánh giá học viên =====
  getStudents(basicNo: string): Promise<EduEvalStudent[]> {
    return firstValueFrom(this.http.get<EduEvalStudent[]>(`${API}/studentEvaluate/students`, { params: { basicNo } }));
  }

  saveStudentScores(basicNo: string, scores: Record<string, string>): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${API}/studentEvaluate/save`, { basicNo, scores }));
  }

  // ===== Đánh giá giảng viên =====
  getTeacherStats(basicNo: string): Promise<EduScoreStat[]> {
    return firstValueFrom(this.http.get<EduScoreStat[]>(`${API}/teacherEvaluate/stats`, { params: { basicNo } }));
  }

  getTeacherChecks(basicNo: string, teaEmpid: string): Promise<EduTeacherCheck[]> {
    return firstValueFrom(this.http.get<EduTeacherCheck[]>(`${API}/teacherEvaluate/checks`, { params: { basicNo, teaEmpid } }));
  }

  // ===== Kết quả đào tạo =====
  getResultStats(basicNo: string): Promise<EduScoreStat[]> {
    return firstValueFrom(this.http.get<EduScoreStat[]>(`${API}/trainResult/stats`, { params: { basicNo } }));
  }

  getTrainResults(basicNo: string, onlyEvaluated: boolean): Promise<EduTrainResult[]> {
    return firstValueFrom(
      this.http.get<EduTrainResult[]>(`${API}/trainResult/list`, { params: { basicNo, onlyEvaluated: String(onlyEvaluated) } }),
    );
  }

  // ===== Excel =====
  /** module: studentEvaluate | teacherEvaluate | trainResult */
  importExcel(module: string, file: File, params: Record<string, string>): Promise<EduImportResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    return firstValueFrom(this.http.post<EduImportResponse>(`${API}/${module}/import`, form, { params }));
  }

  templateUrl(module: string): string {
    return `${API}/${module}/template`;
  }

  exportUrl(module: string, basicNo: string): string {
    return `${API}/${module}/export?basicNo=${encodeURIComponent(basicNo)}`;
  }
}
