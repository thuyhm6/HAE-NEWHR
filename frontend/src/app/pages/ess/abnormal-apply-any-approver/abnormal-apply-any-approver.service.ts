import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApproverSaveItem } from '../../../shared/approver-chain/approver-chain.service';
import { EssApplyResponse } from '../../../shared/ess-apply-response';

/** Một dòng chấm công bất thường gửi lên (jsonData ở bản cũ) */
export interface AbnormalApplyItem {
  /** PK_NO của AR_DETAIL */
  applyNo: string;
  personId: string;
  empId: string;
  localName: string;
  itemNo: string;
  /** YYYY/MM/DD */
  arDateStr: string;
  /** YYYY/MM/DD HH:mm - giờ vào xin phép */
  fromDateTime: string;
  /** YYYY/MM/DD HH:mm - giờ ra xin phép */
  toDateTime: string;
  workHour: string;
  remark: string;
}

const APPLY_URL = '/ess/infoApply/api/abnormalAnyApprover/apply';

/**
 * Xin phép chấm công bất thường với người duyệt tự chọn -
 * /ess/infoApply/viewAbnormalApplyByAnyApprover (addAbnormalApplyByAnyApprover ở bản cũ).
 * Danh sách dùng lại API của viewShowCwaAbnormalApply (CwaAbnormalApplyService.getList).
 */
@Injectable({ providedIn: 'root' })
export class AbnormalApplyAnyApproverService {
  private readonly http = inject(HttpClient);

  apply(items: AbnormalApplyItem[], approvers: ApproverSaveItem[]): Promise<EssApplyResponse> {
    return firstValueFrom(this.http.post<EssApplyResponse>(APPLY_URL, { items, approvers }));
  }
}
