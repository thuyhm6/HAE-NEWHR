import { I18nService } from '../../../i18n/i18n.service';

/** Nhãn đơn vị thời lượng: 0 = tháng, 1 = ngày, 2 = giờ (CLASS_UNIT / IMPLE_CLASS_UNIT bản gốc). */
export function eduClassUnitLabel(i18n: I18nService, unit?: string | null): string {
  switch (unit) {
    case '0':
      return i18n.t('display.mutual.month', 'Tháng');
    case '1':
      return i18n.t('ar.viewsummaryparameteritem.title.day', 'Ngày');
    case '2':
      return i18n.t('ar.viewsummaryparameteritem.title.hour', 'Tiếng');
    default:
      return '';
  }
}

/** "Kỳ thứ N" của khóa / kế hoạch đào tạo. */
export function eduPeriodLabel(i18n: I18nService, period?: string | null): string {
  return period ? i18n.t('edu.planManager.periodLabel', 'Kỳ thứ {0}').replace('{0}', period) : '';
}

/** "Tên khóa (Kỳ thứ N)". */
export function eduCourseTitle(i18n: I18nService, name?: string | null, period?: string | null): string {
  const p = eduPeriodLabel(i18n, period);
  return `${name ?? ''}${p ? ` (${p})` : ''}`;
}
