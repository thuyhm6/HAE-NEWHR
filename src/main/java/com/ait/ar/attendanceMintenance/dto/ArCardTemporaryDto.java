package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Thẻ chấm công tạm thời (bảng AR_MAC_CARDS_LINK) - port từ select
 * "getArCardTemporaryList"/"getArCardTemporaryInfoS" (sqlArCardRecord.xml) dự án cũ.
 * Dùng chung làm DTO kết quả và tham số lọc tìm kiếm.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCardTemporaryDto {
    // ── Kết quả ────────────────────────────────────────────────────────
    private Long recordNo;
    private String personId;
    private String empId;
    private String localName;
    private String cardNo;
    private String remark;
    /** 1: sử dụng, 0: không sử dụng. */
    private String activity;
    private String deptName;
    private String postGradeName;
    private String createdBy;
    private String createdName;
    private String createDate;
    private String updatedBy;
    private String updatedName;
    private String updateDate;

    // ── Tham số lọc ────────────────────────────────────────────────────
    /** Mã NV / họ tên (seach_KEY bản cũ). */
    private String keyword;
    /** Lọc theo trạng thái (ACTIVITY bản cũ), rỗng = tất cả. */
    private String filterActivity;
}
