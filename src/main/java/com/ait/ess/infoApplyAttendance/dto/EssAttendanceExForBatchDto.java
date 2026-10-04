package com.ait.ess.infoApplyAttendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssAttendanceExForBatchDto {
    private String arDateStr;
    private String dateStr;
    private String applyNo; //pkNo
    private String personId;
    private String fromDateTime;
    private String toDateTime;
    private String workHour;
    private String itemNo;
    private String itemNoName;
    private String createDate;
    private String createdName;
    private String updateDate;
    private String updatedName;
    private String inDoorTime;
    private String outDoorTime;
    private String shiftStartTime;
    private String shiftEndTime;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String postGradeName;
    private String postFamily;
    private String postFamilyName;
    private String createdBy;
    private String updatedBy;
    private String lockYn;
    private String shiftNo;
    private String shiftName;
    private String remark;
    /** Thời gian làm việc của ca (GET_AR_SHIFTNO_WORKTIME) */
    private String shiftTime;
    /** Đơn nghỉ phép đang có trùng ngày công: nội dung + số đơn (xem chi tiết) */
    private String leaveContent;
    private String leaveApplyNo;
    /** Dây chuyền duyệt do người dùng chọn cho từng dòng: {personId, empId, localName, approvType} */
    private List<Map<String, Object>> approvers;

    private String keyword;
    private String deptNos;
    private String fromDate;
    private String toDate;
}
