package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaSalaryDetailItemDto;
import com.ait.pa.workManagement.dto.PaSalaryEmpDto;
import com.ait.pa.workManagement.dto.PaSalaryResultQueryDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

/**
 * Kết quả lương - port từ sqlViewPaParam.xml (Hanwha_HAE, nhánh HAE): lương tháng / năm chi tiết,
 * tổng hợp lương (cá nhân / phòng ban).
 */
@Mapper
public interface PaSalaryResultMapper {

    /** Lương tháng chi tiết - bên trái (detailPersonCountInfoLeft) */
    List<PaSalaryEmpDto> selectMonthEmpList(PaSalaryResultQueryDto query);

    /** Lương năm chi tiết - bên trái (detailYearCountInfoLeft) */
    List<PaSalaryEmpDto> selectYearEmpList(PaSalaryResultQueryDto query);

    /** Sinh dữ liệu chi tiết lương tháng vào PA_MY_SALARY_PAGE_DATA (callDetailMonthCountInfoRight) */
    void callMonthDetailProc(PaSalaryResultQueryDto query);

    /** Sinh dữ liệu chi tiết lương năm vào PA_MY_SALARY_PAGE_DATA (callDetailYearCountInfoRight) */
    void callYearDetailProc(PaSalaryResultQueryDto query);

    /** Đọc dữ liệu chi tiết vừa sinh (detailMonthYearCountInfoRight) */
    List<PaSalaryDetailItemDto> selectDetailItemList(PaSalaryResultQueryDto query);

    /**
     * Tổng hợp lương (cá nhân) - viewPaResultList. Trả về Map vì bảng có hơn 120 cột lương
     * (key = tên cột PA_SUMMARY_HAE, giống bản gốc), vẫn map tường minh qua ResultMap.
     */
    List<Map<String, Object>> selectPersonResultList(PaSalaryResultQueryDto query);

    Map<String, Object> selectPersonResultSum(PaSalaryResultQueryDto query);

    /** Tổng hợp lương (phòng ban) - viewDeptPaResultList */
    List<Map<String, Object>> selectDeptResultList(PaSalaryResultQueryDto query);

    Map<String, Object> selectDeptResultSum(PaSalaryResultQueryDto query);
}
