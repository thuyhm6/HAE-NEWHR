package com.ait.ess.infoApply.dto;

import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Body của POST /ess/infoApply/api/abnormalAnyApprover/apply
 * (jsonData + affirmJsonData của addAbnormalApplyByAnyApprover ở bản JSP cũ).
 */
@Data
@NoArgsConstructor
public class EssAbnormalAnyApproverRequest {

    /** Các dòng chấm công bất thường được chọn */
    @NotEmpty
    private List<EssAttendanceExForBatchDto> items = new ArrayList<>();

    /** Dây chuyền duyệt: {personId, empId, localName, approvType} theo thứ tự cấp duyệt */
    @NotEmpty
    private List<Map<String, Object>> approvers = new ArrayList<>();
}
