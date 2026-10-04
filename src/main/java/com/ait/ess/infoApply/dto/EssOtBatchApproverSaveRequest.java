package com.ait.ess.infoApply.dto;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import java.util.List;

/** Body lưu tăng ca hàng loạt (saveOtApplyByAnyApproverForBatch / saveOTApplyInfoForBatchHAE) */
@Data
public class EssOtBatchApproverSaveRequest {

    @NotEmpty
    private List<ArOvertimeManagentDto> items;
}
