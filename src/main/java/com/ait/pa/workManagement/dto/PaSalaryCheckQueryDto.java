package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Điều kiện tra cứu dùng chung cho nhóm màn "Đối chiếu lương" port từ viewPaParamCtroller /
 * PaMonthChainCtroller (Hanwha_HAE): monthPersonCountInfoList, viewPaMonthChain,
 * viewVerificationList, detailPersonCountInfo(Left), detailItemCountInfo, detailItemDifCountInfo,
 * viewResultConfirmList.
 */
@Data
@NoArgsConstructor
public class PaSalaryCheckQueryDto {

    /** Phân loại lương (SALARY_DISTIN_NO) */
    private String salaryDistinNo;
    /** Ngày trả lương tháng này DD-MM-YYYY (PAY_DATE bản gốc) */
    private String payDate;
    /** Ngày trả lương tháng trước DD-MM-YYYY (PAY_DATE_PRO bản gốc) */
    private String payDatePro;
    /** Kế hoạch trả lương (PAY_SCHEDULE_NO) */
    private String payScheduleNo;
    private String personId;
    /** Mã NV / họ tên (seach_KEY bản gốc) */
    private String key;
    /** Phòng ban - gồm cả phòng ban con (seach_DEPT_NO bản gốc) */
    private String deptNo;

    /** NV tham gia tính lương: add = tăng, delete = giảm (strFlag bản gốc) */
    private String changeFlag;
    /** Loại tăng / giảm: HIRE, RESIGN, OTHER */
    private String changeType;

    /** Loại hạng mục: 1 chi trả, 2 khấu trừ, 3 bảo hiểm (ITEM_TYPE) */
    private String itemType;
    /** Mã hạng mục = tên cột PA_SUMMARY_HAE (ITEM_ID) */
    private String itemId;
    /** PAGE_TYPE của procedure PA_MONTH_DIF_ITEM_VIEW: 1 khoản tiền thay đổi, 2 đối chiếu kết quả, 3 các khoản chi trả */
    private String pageType;
    /** 0 đối tượng mới, 1 hạng mục thêm mới, 2 hạng mục ngoại lệ, 3 không đổi, 4 thay đổi số tiền */
    private String monthDif;
    /** PERSON_NUM, PERSON_NUM_PRO, COUNT_UP, COUNT_LOW, PERSON_UP, PERSON_LOW (SELECT_TYPE bản gốc) */
    private String selectType;

    /** Khoảng chấm công YYYY/MM/DD - chi tiết tăng ca (viewResultConfirmList2Bottom) */
    private String arStartDate;
    private String arEndDate;
}
