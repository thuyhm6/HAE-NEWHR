package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaSalaryDetailItemDto;
import com.ait.pa.workManagement.dto.PaSalaryEmpDto;
import com.ait.pa.workManagement.dto.PaSalaryResultQueryDto;

import java.util.List;
import java.util.Map;

/**
 * Kết quả lương - port từ viewPaParamSer (Hanwha_HAE): lương tháng / năm chi tiết, tổng hợp lương
 * (cá nhân / phòng ban).
 */
public interface PaSalaryResultService {

    /** Lương tháng chi tiết - danh sách nhân viên của 1 kỳ lương (detailmonthCountInfoLeft) */
    List<PaSalaryEmpDto> getMonthEmpList(PaSalaryResultQueryDto query);

    /** Lương năm chi tiết - các kỳ lương của 1 nhân viên trong khoảng tháng (detailYearCountInfoLeft) */
    List<PaSalaryEmpDto> getYearEmpList(PaSalaryResultQueryDto query);

    /** Chi tiết hạng mục lương tháng của 1 nhân viên (detailYearCountInfoRight?pFrom=month) */
    List<PaSalaryDetailItemDto> getMonthDetail(PaSalaryResultQueryDto query);

    /** Chi tiết hạng mục lương năm của 1 nhân viên (detailYearCountInfoRight?pFrom=year) */
    List<PaSalaryDetailItemDto> getYearDetail(PaSalaryResultQueryDto query);

    /** Tổng hợp lương (cá nhân) - trả về {list, sum} (viewPaResultList + viewPaResultListSum) */
    Map<String, Object> getPersonResult(PaSalaryResultQueryDto query);

    /** Tổng hợp lương (phòng ban) - trả về {list, sum} (viewDeptPaResultList + viewDeptPaResultListSum) */
    Map<String, Object> getDeptResult(PaSalaryResultQueryDto query);
}
