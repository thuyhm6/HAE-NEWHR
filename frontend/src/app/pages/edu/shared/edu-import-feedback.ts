import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { I18nService } from '../../../i18n/i18n.service';
import { EduImportResponse } from './edu-evaluate.service';

const MAX_LINES = 30;

function toHtml(lines: string[]): string {
  const escaped = lines.slice(0, MAX_LINES).map((l) => l.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!));
  return escaped.join('<br/>') + (lines.length > MAX_LINES ? '<br/>...' : '');
}

/**
 * Hiển thị kết quả import Excel dùng chung cho các màn đánh giá đào tạo:
 * lỗi định dạng -> popup lỗi (không ghi dữ liệu); dòng không khớp -> popup cảnh báo (đã bỏ qua).
 * Trả về true nếu import thành công.
 */
export function showEduImportResult(
  res: EduImportResponse,
  i18n: I18nService,
  message: NzMessageService,
  modal: NzModalService,
): boolean {
  if (res.success) {
    message.success(i18n.t('edu.common.importSuccess', 'Import thành công!') + ` (${res.updatedCount ?? 0})`);
    if (res.warnings?.length) {
      modal.warning({
        nzTitle: i18n.t('edu.import.msg.skippedTitle', 'Các dòng sau không khớp dữ liệu của khóa và đã bị bỏ qua'),
        nzContent: toHtml(res.warnings),
        nzMaskClosable: true,
      });
    }
    return true;
  }
  if (res.errors?.length) {
    modal.error({ nzTitle: i18n.t('edu.common.importFailed', 'Import thất bại.'), nzContent: toHtml(res.errors), nzMaskClosable: true });
  } else {
    message.error(i18n.t('edu.common.importFailed', 'Import thất bại.'));
  }
  return false;
}
