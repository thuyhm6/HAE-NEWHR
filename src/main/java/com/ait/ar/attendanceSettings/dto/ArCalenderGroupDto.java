package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArCalenderGroup;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArCalenderGroupDto extends ArCalenderGroup {
    private String companyName;
    private String ddateFormatted;
    private String shiftName;
    private String typeidName;
    private String overtypeidName;
    private String typeidDefaultName;
    private String groupName;
}
