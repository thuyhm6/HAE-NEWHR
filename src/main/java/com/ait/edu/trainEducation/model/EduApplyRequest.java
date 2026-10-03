package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * Đăng ký khóa đào tạo (addCourseApply bản gốc): các khóa được chọn + lý do
 * từng khóa + danh sách người phê duyệt theo thứ tự cấp.
 */
@Data
public class EduApplyRequest {

    @NotEmpty
    @Valid
    private List<Item> items;

    @NotEmpty
    @Valid
    private List<EduApplyMaker> makers;

    @Data
    public static class Item {
        @NotBlank
        private String basicNo;
        @Size(max = 500)
        private String applyTask;
    }
}
