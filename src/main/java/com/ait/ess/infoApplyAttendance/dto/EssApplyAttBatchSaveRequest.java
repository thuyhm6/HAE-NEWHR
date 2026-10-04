package com.ait.ess.infoApplyAttendance.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

/** Body của POST /ess/infoApplyAttendance/api/applyAttBatch/save */
@Data
@NoArgsConstructor
public class EssApplyAttBatchSaveRequest {

    @Valid
    @NotEmpty
    private List<EssApplyAttBatchSaveDto> items = new ArrayList<>();
}
