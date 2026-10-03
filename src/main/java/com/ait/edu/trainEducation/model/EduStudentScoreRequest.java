package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.Map;

/**
 * Yêu cầu lưu điểm thi học viên: scores key = FREE_NO, value = điểm (0-100).
 */
@Data
public class EduStudentScoreRequest {
    @NotBlank(message = "BASIC_NO không được để trống")
    private String basicNo;
    private Map<String, String> scores;
}
