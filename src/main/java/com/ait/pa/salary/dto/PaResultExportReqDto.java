package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Tham số xuất Excel kết quả tính lương (viewPaResult) - tương ứng các tham số
 * alias/aliasName/aliasSort/aliasExpFlag của /pa/excelExport/exportResult bản cũ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaResultExportReqDto {
    private String       payScheduleNo;
    private String       deptNo;
    private List<Column> columns;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Column {
        /** Tên cột trong PA_SUMMARY_HAE */
        private String  itemId;
        /** Tiêu đề cột */
        private String  itemName;
        /** Thứ tự cột (null = 999) */
        private Integer orderNo;
        /** true: định dạng số 0.00000 (hạng mục nhập/tính) */
        private Boolean decimal;
    }
}
