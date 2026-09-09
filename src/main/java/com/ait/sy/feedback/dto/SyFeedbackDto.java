package com.ait.sy.feedback.dto;

import lombok.Data;

@Data
public class SyFeedbackDto {

    private String feedbackId;
    private String feedbackTitle;
    private String feedbackContent;
    private Integer activity;
    private String createDate;
    private String createdIp;
    private String createdBy;

    // Điều kiện tìm kiếm
    private String keyword;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
