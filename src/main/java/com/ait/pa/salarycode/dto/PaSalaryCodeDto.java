package com.ait.pa.salarycode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaSalaryCodeDto {

    private Integer itemType;
    private String itemNo;
    private String itemId;
    private String mapCode;
    private String itemName;   // tên theo ngôn ngữ hiện tại (dùng cho danh sách)
    private String nameEn;
    private String nameKo;
    private String nameVi;
    private String nameZh;
    private String dataType;
    private String descr;
    private String createdBy;
    private String createDate;
    private Integer activity;

    // Danh sách công ty sử dụng (HTSV, HAE) - dùng cho modal form
    private List<String> companyUsage;
    // Chuỗi gộp công ty sử dụng - dùng để hiển thị trên danh sách
    private String companyUsageStr;

    // Search conditions
    private String itemNameSearch;
    private Integer itemTypeSearch;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
