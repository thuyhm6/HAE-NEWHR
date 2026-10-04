import { I18nService } from '../i18n/i18n.service';

/** Định dạng response chung của các API lưu đơn xin phép ESS */
export interface EssApplyResponse {
  success: boolean;
  messageKey?: string;
  suffix?: string;
  message?: string;
}

/** Ghép thông báo lỗi trả về từ backend: messageKey (+ suffix) hoặc message thô (đã dịch sẵn từ DB/backend) */
export function essApplyErrorText(i18n: I18nService, res: EssApplyResponse): string {
  if (res.message && !res.messageKey) return res.message;
  const base = res.messageKey
    ? i18n.t(res.messageKey, res.message || res.messageKey)
    : i18n.t('alert.message.add_fail', 'Lưu thất bại');
  return res.suffix ? `${res.suffix} ${base}` : base;
}
