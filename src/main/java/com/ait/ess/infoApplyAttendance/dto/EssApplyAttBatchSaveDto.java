package com.ait.ess.infoApplyAttendance.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Một dòng đơn nghỉ phép gửi lên khi bấm "Lưu" ở màn hình
 * viewApplyAttBatchByAnyApproverList (tương ứng 1 phần tử jsonData ở bản JSP cũ).
 */
@Data
@NoArgsConstructor
public class EssApplyAttBatchSaveDto {

    /** Rỗng = dòng mới, có giá trị = cập nhật đơn đã có */
    private String applyNo;

    @NotBlank
    private String personId;

    private String empId;
    private String localName;

    @NotBlank
    private String leaveTypeCode;

    /** Định dạng YYYY-MM-DD HH24:MI */
    @NotBlank
    private String leaveFromTime;

    /** Định dạng YYYY-MM-DD HH24:MI */
    @NotBlank
    private String leaveToTime;

    private String applyLength;
    private String leaveReason;

    @Valid
    @NotEmpty
    private List<Approver> approvers = new ArrayList<>();

    @Data
    @NoArgsConstructor
    public static class Approver {
        @NotBlank
        private String personId;
        private String empId;
        private String localName;
        /** '1' = Phê duyệt, '3' = Thông báo */
        private String approvType;
    }

    /** Chuyển sang Map để tái sử dụng EssLeaveApplyService#saveLeaveApply */
    public Map<String, Object> toSaveParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("applyNo", applyNo == null ? "" : applyNo);
        params.put("personId", personId);
        params.put("empId", empId);
        params.put("localName", localName);
        params.put("leaveTypeCode", leaveTypeCode);
        params.put("leaveFromTime", leaveFromTime);
        params.put("leaveToTime", leaveToTime);
        params.put("applyLength", applyLength);
        params.put("leaveReason", leaveReason);
        List<Map<String, Object>> approverMaps = new ArrayList<>();
        for (Approver a : approvers) {
            Map<String, Object> m = new HashMap<>();
            m.put("personId", a.getPersonId());
            m.put("empId", a.getEmpId());
            m.put("localName", a.getLocalName());
            m.put("approvType", a.getApprovType());
            approverMaps.add(m);
        }
        params.put("approvers", approverMaps);
        return params;
    }
}
