package com.ait.edu.trainEducation.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Kết quả import Excel cập nhật điểm: errors (sai định dạng -> không ghi gì),
 * warnings (dòng không khớp học viên/giảng viên của khóa -> bỏ qua, giống bản gốc).
 */
@Data
public class EduImportResult {
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private int updatedCount;

    public boolean isSuccess() {
        return errors.isEmpty();
    }
}
