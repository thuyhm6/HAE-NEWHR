import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduSaveResponse } from '../shared/edu-common.service';

export interface EduTrainingRegisterRow {
  applyNo: string;
  personId?: string;
  empid?: string;
  localName?: string;
  deptName?: string;
  trainingContent?: string;
  trainingPurpose?: string;
  trainingType?: string;
  trainingTypeName?: string;
  trainingUnit?: string;
  trainingLocation?: string;
  /** DD/MM/YYYY */
  startDate?: string;
  /** DD/MM/YYYY */
  endDate?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  remark?: string;
  trainUnit?: string;
  /** Số ngày */
  trainFee?: string;
  trainPrice?: string;
  trainTrainee?: string;
  trainAmount?: string;
  trainFeesOther?: string;
  trainFeesTotal?: string;
  createDate?: string;
}

/** AFFIRM_TYPE (SY_AFFIRM_EMAIL): '1' = Phê duyệt, '3' = Thông báo. */
export const ERT_AFFIRM_TYPE_APPROVAL = '1';
export const ERT_AFFIRM_TYPE_NOTICE = '3';

export interface EduRegisterApprover {
  personId: string;
  empid?: string;
  localName?: string;
  deptName?: string;
  positionName?: string;
  affirmType: string;
}

export interface EduTrainingRegisterRequest {
  trainingContent?: string;
  trainingPurpose?: string;
  trainingType?: string;
  trainingUnit?: string;
  trainingLocation?: string;
  startDate?: string;
  endDate?: string;
  trainFee?: string;
  trainUnit?: string;
  trainPrice?: string;
  trainTrainee?: string;
  trainAmount?: string;
  trainFeesOther?: string;
  trainFeesTotal?: string;
  remark?: string;
  approvers: EduRegisterApprover[];
}

/** Người duyệt mặc định trả về từ GET_AFFIRMOR_LIST_IMPROVE (SyAffirmEmailDto). */
interface DefaultAffirmor {
  affirmorId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  positionName?: string;
}

/** Mã cha danh mục loại hình đào tạo (ait:SelectSyCodeByCpnyID parentNo="1682" bản gốc). */
export const EDU_CODE_TRAINING_TYPE = '1682';

const BASE = '/edu/api/registerTraining';

/** Đăng ký đào tạo bên ngoài - port từ /edu/traineducation/viewRegisterForTraining (Hanwha_HAE). */
@Injectable({ providedIn: 'root' })
export class EduRegisterTrainingService {
  private readonly http = inject(HttpClient);

  getList(trainingType: string | null): Promise<EduTrainingRegisterRow[]> {
    const params: Record<string, string> = {};
    if (trainingType) params['trainingType'] = trainingType;
    return firstValueFrom(this.http.get<EduTrainingRegisterRow[]>(`${BASE}/list`, { params }));
  }

  async getDefaultApprovers(): Promise<EduRegisterApprover[]> {
    const list = await firstValueFrom(this.http.get<DefaultAffirmor[]>(`${BASE}/defaultApprovers`));
    return (list ?? [])
      .filter((a) => !!a.affirmorId)
      .map((a) => ({
        personId: a.affirmorId!,
        empid: a.empId,
        localName: a.localName,
        deptName: a.deptName,
        positionName: a.positionName,
        affirmType: ERT_AFFIRM_TYPE_APPROVAL,
      }));
  }

  apply(body: EduTrainingRegisterRequest): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/apply`, body));
  }
}
