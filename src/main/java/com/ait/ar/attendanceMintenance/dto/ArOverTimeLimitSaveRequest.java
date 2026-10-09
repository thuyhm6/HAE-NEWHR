package com.ait.ar.attendanceMintenance.dto;

import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.util.List;

/**
 * Payload lưu các dòng giới hạn tăng ca đã tick chọn trên lưới (thay cho cơ
 * chế viewCheck + OT_LIMIT_MONTH_{index} của form JSP cũ).
 */
@Data
public class ArOverTimeLimitSaveRequest {

    @NotEmpty
    @Valid
    private List<Item> items;

    @Data
    public static class Item {
        @NotBlank
        private String otLimitNo;

        @Pattern(regexp = "^[01]?$")
        private String otLimitMonth;

        @Pattern(regexp = "^[01]?$")
        private String otLimitYear;
    }
}
