package com.ait.ar.attendanceMintenance.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * Payload thêm mới / cập nhật thẻ tạm (thay cho form addArCardTemporaryInfoView.jsp
 * và updateArCardTemporaryView.jsp bản cũ).
 * - Thêm mới: bắt buộc personId; cardNo tùy chọn.
 * - Cập nhật: bắt buộc recordNo; chỉ đổi trạng thái activity (giống bản cũ).
 */
@Data
public class ArCardTemporarySaveRequest {

    private Long recordNo;

    private String personId;

    @Size(max = 50)
    private String cardNo;

    @NotBlank
    @Pattern(regexp = "^[01]$")
    private String activity;

    @Size(max = 500)
    private String remark;
}
