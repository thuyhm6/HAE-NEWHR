package com.ait.ess.tempEmp.mapper;

import com.ait.ess.tempEmp.dto.MonthDetailDateDto;
import com.ait.ess.tempEmp.dto.MonthDetailListDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface MonthDetailListMapper {

    List<MonthDetailDateDto> selectFixedDateList(MonthDetailListDto params);

    List<Map<String, Object>> selectMonthDetailList(MonthDetailListDto params);

    List<Map<String, Object>> selectSalaryReport(MonthDetailListDto params);

    List<Map<String, Object>> selectBonus13thReport(MonthDetailListDto params);

    List<Map<String, Object>> selectReferralBonusNewEmpReport(MonthDetailListDto params);

    List<Map<String, Object>> selectReferralBonusDiligenceReport(MonthDetailListDto params);

    List<Map<String, Object>> selectWorkDurationReport(MonthDetailListDto params);

    List<Map<String, Object>> selectWorkOtPrintReport(MonthDetailListDto params);

    List<Map<String, Object>> selectDiligenceContinuingReport(MonthDetailListDto params);

    List<Map<String, Object>> selectDiligenceNewEmpReport(MonthDetailListDto params);

    List<Map<String, Object>> selectPrintTotalOtReport(MonthDetailListDto params);

    List<Map<String, Object>> selectMonthAttPrintReport(MonthDetailListDto params);

    List<Map<String, Object>> selectMonthOtOverReport(MonthDetailListDto params);

    List<Map<String, Object>> selectMonthAttTotalDayReport(MonthDetailListDto params);
}
