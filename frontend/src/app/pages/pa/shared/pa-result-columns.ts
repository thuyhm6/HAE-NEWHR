/**
 * Định nghĩa các cột số của bảng Tổng hợp lương bản HAE - dùng chung cho
 * viewPaResultList (cá nhân) và viewDeptPaResultList (phòng ban). Thứ tự và key i18n giữ đúng
 * viewPaResultList.jsp / viewDeptPaResultList.jsp (nhánh LoginUser.cpnyId eq 'HAE') của dự án cũ;
 * field = tên cột PA_SUMMARY_HAE (backend trả Map với key là tên cột - xem PaSalaryResultMapper.xml).
 */
export interface PaResultColumn {
  field: string;
  key: string;
  fallback: string;
  /** Cột tiền - định dạng #,##0 giống fmt:formatNumber bản gốc; cột ngày/giờ hiển thị nguyên giá trị */
  money?: boolean;
}

/** Cột ngày / giờ chấm công - key ess.viewArPersonalYearList.{FIELD}.b */
const att = (field: string, fallback: string): PaResultColumn => ({
  field,
  key: `ess.viewArPersonalYearList.${field}.b`,
  fallback,
});

/** Cột tiền - key pa.paSummary.{FIELD}.b */
const sum = (field: string, fallback: string): PaResultColumn => ({
  field,
  key: `pa.paSummary.${field}.b`,
  fallback,
  money: true,
});

/** Cột tiền dùng key i18n riêng của bản gốc */
const money = (field: string, key: string, fallback: string): PaResultColumn => ({ field, key, fallback, money: true });

export const PA_RESULT_AMOUNT_COLUMNS: PaResultColumn[] = [
  att('PROBATION_DAYS', 'Thử việc'),
  att('REGULAR_DAYS', 'Chính thức'),
  { field: 'WORK_SCHEDULE_DAYS', key: 'ess.infoApply.yingchuqintianshu', fallback: 'Ngày công chuẩn' },
  att('PROB_WORKDAYOT150_HOURS', 'Tăng ca ngày thường 150% kỳ thử việc'),
  att('WORKDAYOT150_HOURS', 'Tăng ca ngày thường 150%'),
  att('PROB_WORKDAYOT200_HOURS', 'Tăng ca ngày thường 200% kỳ thử việc'),
  att('WORKDAYOT200_HOURS', 'Tăng ca ngày thường 200%'),
  att('PROB_WORKDAYOT210_HOURS', 'Tăng ca ngày thường 210% kỳ thử việc'),
  att('WORKDAYOT210_HOURS', 'Tăng ca ngày thường 210%'),
  att('PROB_SATURDAYOT200_HOURS', 'Tăng ca ngày hưởng lương 200% thử việc'),
  att('SATURDAYOT200_HOURS', 'Tăng ca ngày hưởng lương 200%'),
  att('PROB_SATURDAYOT270_HOURS', 'Tăng ca ngày hưởng lương 270% thử việc'),
  att('SATURDAYOT270_HOURS', 'Tăng ca ngày hưởng lương 270%'),
  att('PROB_WEEKLYOT200_HOURS', 'Tăng ca cuối tuần 200% kỳ thử việc'),
  att('WEEKLYOT200_HOURS', 'Tăng ca cuối tuần 200%'),
  att('PROB_WEEKLYOT270_HOURS', 'Tăng ca cuối tuần 270% kỳ thử việc'),
  att('WEEKLYOT270_HOURS', 'Tăng ca cuối tuần 270%'),
  att('PROB_HOLIDAYOT300_HOURS', 'Tăng ca ngày lễ 300% kỳ thử việc'),
  att('HOLIDAYOT300_HOURS', 'Tăng ca ngày lễ 300%'),
  att('PROB_HOLIDAYOT390_HOURS', 'Tăng ca ngày lễ 390% kỳ thử việc'),
  att('HOLIDAYOT390_HOURS', 'Tăng ca ngày lễ 390%'),
  att('RESIGN_ANNUALLEAVE_PAY_DAYS', 'Số ngày trả lương nghỉ phép năm'),
  att('PROB_PERSONALLEAVE_DAYS', 'Nghỉ việc riêng kỳ thử việc'),
  att('PERSONALLEAVE_DAYS', 'Nghỉ việc riêng'),
  att('PROB_SICKLEAVE_DAYS', 'Nghỉ ốm thường kỳ thử việc'),
  att('SICKLEAVE_DAYS', 'Nghỉ ốm thường'),
  att('PROB_CHILD_SICKLEAVE_DAYS', 'Nghỉ con ốm kỳ thử việc'),
  att('CHILD_SICKLEAVE_DAYS', 'Nghỉ con ốm'),
  att('PROB_LONG_SICKLEAVE_DAYS', 'Nghỉ ốm dài ngày kỳ thử việc'),
  att('LONG_SICKLEAVE_DAYS', 'Nghỉ ốm dài ngày'),
  att('MATERNITYLEAVE_DAYS', 'Nghỉ thai sản'),
  att('PROB_ABSENTEEISM_DAYS', 'Nghỉ không phép kỳ thử việc'),
  att('ABSENTEEISM_DAYS', 'Nghỉ không phép'),
  att('PROB_LATE_ARRIVE_MINUTES', 'Số phút đến muộn kỳ thử việc'),
  att('LATE_ARRIVE_MINUTES', 'Đến muộn'),
  att('PROB_EARLY_LEAVE_MINUTES', 'Về sớm kỳ thử việc'),
  att('EARLY_LEAVE_MINUTES', 'Về sớm'),
  att('UNPAIDLEAVE_DAYS', 'Nghỉ không lương'),
  money('BASIC_SALARY', 'pa.salary.canShu.jibengongzi', 'Lương cơ bản'),
  money('POSITION_ALLOWANCE', 'pa.insurance.title.zhizejintie', 'Phụ cấp chức vụ'),
  money('TRANSPORTATION_ALLOWANCE', 'pa.viewPaResultList.JIAOTONGBUZHU.C', 'Trợ cấp đi lại'),
  money('FULL_ATTENDANCE_BONUS', 'pa.viewPaResultList.MANQINJIANG.C', 'Phụ cấp chuyên cần'),
  sum('EVALUATION_BONUS', 'Tiền thưởng'),
  sum('LUNCH_ALLOWANCE', 'Phụ cấp ăn trưa'),
  sum('HOUSING_ALLOWANCE', 'Phụ cấp nhà ở'),
  sum('ADDITIONAL_ALLOWANCE', 'Phụ cấp bổ sung'),
  sum('WOMEN_SPECIAL_ALLOWANCE', 'Hỗ trợ NV nữ'),
  sum('P_LANGUAGE_ALLOWANCE', 'Phụ cấp ngôn ngữ'),
  sum('P_OTHER_PLUS', 'Trợ cấp khác'),
  sum('P_CONDOLENCES', 'Phúc lợi khác'),
  sum('P_BONUS', 'Bonus'),
  sum('P_PRE_TAX_PLUS', 'Khoản bổ sung trước thuế'),
  sum('P_PRE_TAX_MINUS', 'Khoản trừ trước thuế'),
  sum('PROB_WORKDAYOT150_FEE', 'Lương OT ngày thường 150% thử việc'),
  sum('WORKDAYOT150_FEE', 'Lương OT ngày thường 150%'),
  sum('PROB_WORKDAYOT200_FEE', 'Lương OT ngày thường 200% thử việc'),
  sum('WORKDAYOT200_FEE', 'Lương OT ngày thường 200%'),
  sum('PROB_WORKDAYOT210_FEE', 'Lương OT ngày thường 210% thử việc'),
  sum('WORKDAYOT210_FEE', 'Lương OT ngày thường 210%'),
  sum('WORKDAYOT_FEE_TOTAL', 'Tổng lương OT ngày thường'),
  sum('PROB_SATURDAYOT200_FEE', 'Lương OT ngày hưởng lương 200% thử việc'),
  sum('SATURDAYOT200_FEE', 'Lương OT ngày hưởng lương 200%'),
  sum('PROB_SATURDAYOT270_FEE', 'Lương OT ngày hưởng lương 270% thử việc'),
  sum('SATURDAYOT270_FEE', 'Lương OT ngày hưởng lương 270%'),
  sum('SATURDAYOT_FEE_TOTAL', 'Tổng lương tăng ca ngày hưởng lương'),
  sum('PROB_WEEKLYOT200_FEE', 'Lương OT tăng ca cuối tuần 200% thử việc'),
  sum('WEEKLYOT200_FEE', 'Lương OT cuối tuần 200%'),
  sum('PROB_WEEKLYOT270_FEE', 'Lương OT tăng ca cuối tuần 270% thử việc'),
  sum('WEEKLYOT270_FEE', 'Lương OT cuối tuần 270%'),
  sum('WEEKLYOT_FEE_TOTAL', 'Tổng lương OT cuối tuần'),
  sum('PROB_HOLIDAYOT300_FEE', 'Lương OT tăng ca ngày lễ 300% thử việc'),
  sum('HOLIDAYOT300_FEE', 'Lương OT ngày lễ 300%'),
  sum('PROB_HOLIDAYOT390_FEE', 'Lương OT tăng ca ngày lễ 390% thử việc'),
  sum('HOLIDAYOT390_FEE', 'Lương OT ngày lễ 390%'),
  sum('HOLIDAYOT_FEE_TOTAL', 'Tổng lương OT ngày lễ'),
  sum('OT_FEE_TOTAL', 'Tổng lương OT'),
  sum('ANNUALLEAVE_CLEAR_PAY', 'Lương nghỉ phép năm'),
  sum('RESIGN_ANNUALLEAVE_PAY', 'Lương nghỉ phép năm khi thôi việc'),
  sum('PROB_PERSONALLEAVE_DEDUCT', 'Khoản trừ nghỉ việc riêng kỳ thử việc'),
  money('PERSONALLEAVE_DEDUCT', 'pa.viewPaResultList.SHIJIAKOUCHU.C', 'Khoản trừ nghỉ việc riêng'),
  sum('PROB_SICKLEAVE_DEDUCT', 'Khoản trừ nghỉ ốm kỳ thử việc'),
  money('SICKLEAVE_DEDUCT', 'pa.viewPaResultList.BINGJIAKOUCHU.C', 'Khoản trừ nghỉ ốm'),
  money('MATERNITYLEAVE_DEDUCT', 'pa.viewPaResultList.CHANJIAKOUCHU.C', 'Khoản trừ nghỉ thai sản'),
  sum('PROB_ABSENT_DEDUCT', 'Khoản trừ nghỉ không phép kỳ thử việc'),
  money('ABSENT_DEDUCT', 'pa.viewPaResultList.KUANGGONGKOUCHU.C', 'Khoản trừ nghỉ không phép'),
  sum('PROB_LATEEARLY_DEDUCT', 'Khoản trừ đến muộn về sớm kỳ thử việc'),
  money('LATEEARLY_DEDUCT', 'pa.viewPaResultList.CHIDAOZAOTUIKOUCHU.C', 'Khoản trừ đến muộn về sớm'),
  money('ATT_DEDUCT_TOTAL', 'pa.viewPaResultList.KAOQINKOUCHUHEJI.C', 'Tổng khoản trừ'),
  money('INCOME_BEFORE_TAX', 'pa.viewPaResultList.SHUIQIANGONGZI.C', 'Thu nhập trước thuế'),
  sum('OT_SALARY_NOT_PIT', 'Lương OT miễn thuế'),
  sum('P_RENT_FEES', 'Phụ cấp nhà ở'),
  sum('TAXABLE_INCOME15', '15% TN chịu thuế'),
  sum('P_ONLY_FOR_DEDUCT_TAX', 'Khoản tiền tính thuế'),
  money('TAXABLE_INCOME', 'pa.viewResultConfirmSonList.YINGNASHUISUODEE.b', 'Thu nhập tính thuế'),
  sum('PT_TAX_RATE', 'Thuế suất cá nhân'),
  money('QUICK_DEDUCTION_TAX', 'pa.viewResultConfirmSonList.SUSUANKOUCHUSHU.b', 'Số tiền trừ nhanh'),
  money('PERSONAL_TAX', 'ess.viewpersonalpainfo.gerensuodeshui', 'Thuế TNCN'),
  sum('PIT_SETTLEMENT', 'Quyết toán thuế'),
  sum('SEVERANCE_ALLOWANCE', 'Trợ cấp thôi việc'),
  money('REAL_WAGES', 'pa.viewPaResultList.SHIDEGONGZI.C', 'Lương thực lĩnh'),
  sum('TRADE_UNION', 'Phí công đoàn'),
  sum('TRADE_UNION_CORP', 'Phí công đoàn(công ty)'),
  sum('INSURANCE_BASE', 'Lương tính BH'),
  money('SOCIAL_INS_PERSONAL', 'pa.viewResultConfirmSonList.SHEHUIBAOXIANGEREN.b', 'BHXH (cá nhân)'),
  money('MEDICAL_INS_PERSONAL', 'pa.viewResultConfirmSonList.YILIAOBAOXIANGEREN.b', 'BHYT (cá nhân)'),
  money('UNEMPLOYMENT_INS_PERSONAL', 'pa.viewResultConfirmSonList.SHIYEBAOXIANGEREN.b', 'BHTN (cá nhân)'),
  money('PERSONAL_INS_TOTAL', 'pa.viewResultConfirmSonList.GERENSHEBAOHEJI.b', 'Tổng BHXH cá nhân'),
  sum('SOCIAL_INS_COMPANY', 'BHXH (công ty)'),
  sum('MEDICAL_INS_COMPANY', 'BHYT (công ty)'),
  sum('UNEMPLOYMENT_INS_COMPANY', 'BHTN (công ty)'),
  sum('COMPANY_INS_TOTAL', 'Tổng BH'),
];

/** Định dạng ô số của bảng tổng hợp lương: cột tiền #,##0, cột khác giữ nguyên. */
export function formatPaResultCell(value: unknown, isMoney?: boolean): string {
  if (value === null || value === undefined || value === '') return '';
  if (!isMoney) return String(value);
  const num = Number(value);
  return isNaN(num) ? String(value) : Math.round(num).toLocaleString('en-US');
}
