package com.ait.org.orgManage.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrgResumeInfo {
    private String seq;
    private String no;
    // CHANGE_DATE lưu dạng VARCHAR2 trong DB (không phải kiểu DATE thật) - dùng String thay vì LocalDate
    // để tránh lỗi "Invalid conversion requested" khi driver Oracle đọc cột bằng CharCommonAccessor
    // (đúng convention đã dùng cho các cột "date" dạng VARCHAR2 tương tự, ví dụ HrContract.changeDate).
    private String changeDate;
    private String resumeName;
    private String isCurrentOrg;
    private String changeReason;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String activity;
    private String cpnyId;
    private String updatedIp;
    private String fromNo;
    private String remark;
    private String createdIp;
    private String experienceType;

    // Additional fields for display if needed (e.g. formatted dates)
}
