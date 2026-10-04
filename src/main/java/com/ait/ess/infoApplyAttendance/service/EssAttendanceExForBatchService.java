package com.ait.ess.infoApplyAttendance.service;

import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;

import java.util.List;
import java.util.Map;

public interface EssAttendanceExForBatchService {
    List<EssAttendanceExForBatchDto> getAttendanceExForBatchList(EssAttendanceExForBatchDto params);

    List<EssAttendanceExForBatchDto> getCheckAttendanceExForBatchList(EssAttendanceExForBatchDto params);

    Map<String, Object> getCardApplyDetail(String applyNo, String applyType);

    int applyAttendanceExForBatch(List<EssAttendanceExForBatchDto> selectedRows);

    /**
     * Xin phép chấm công bất thường với dây chuyền duyệt do người dùng tự chọn
     * (/ess/infoApply/viewAbnormalApplyByAnyApprover - addAbnormalApplyByAnyApprover ở bản cũ).
     * approvers: danh sách {personId, empId, localName, approvType} theo thứ tự cấp duyệt.
     */
    /**
     * Xin phép chấm công bất thường hàng loạt thay nhân viên, mỗi dòng mang dây chuyền duyệt riêng
     * (/ess/infoApplyAttendance/viewAttendanceExForBatchInfoList - saveAttenanceExBatchInfo ở bản cũ).
     */
    int applyAttendanceExWithRowApprovers(List<EssAttendanceExForBatchDto> selectedRows);

    int applyAbnormalByAnyApprover(List<EssAttendanceExForBatchDto> selectedRows, List<Map<String, Object>> approvers);
}
