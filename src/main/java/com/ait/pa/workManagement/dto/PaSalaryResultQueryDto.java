package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Điều kiện tra cứu dùng chung cho các màn kết quả lương port từ viewPaParamCtroller (Hanwha_HAE):
 * detailmonthCountInfoLeft / detailYearCountInfoLeft / detailYearCountInfoRight /
 * viewPaResultList / viewDeptPaResultList.
 */
@Data
@NoArgsConstructor
public class PaSalaryResultQueryDto {

    /** Kế hoạch trả lương (PAY_SCHEDULE_NO) */
    private String payScheduleNo;
    /** Mã NV / họ tên (seach_KEY bản gốc) */
    private String key;
    /** Phòng ban đơn - gồm cả phòng ban con (seach_DEPT_NO bản gốc) */
    private String deptNo;
    /** Nhiều phòng ban - gồm cả phòng ban con (seach_DEPTNO_Multi bản gốc) */
    private List<String> deptNos;
    private String personId;
    /** Khoảng tháng lương MM/YYYY (PAY_DATE_PRO / PAY_DATE bản gốc) */
    private String startMonth;
    private String endMonth;
    /** Ngày trả lương DD-MM-YYYY của 1 dòng lương năm (PAY_DATE bản gốc) */
    private String payDate;
    /** Loại hạng mục 1/2/3 truyền vào procedure PA_FOR_MY_SALARY_DETAIL_PAGE_P */
    private Integer itemType;
}
