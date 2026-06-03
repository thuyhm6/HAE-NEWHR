package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArCalender;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArCalenderDto extends ArCalender {
    private String companyName;
    private String ddateFormatted; // yyyy-MM-dd for input[type=date]
    private String adminID;
    // GET_GLOBAL_NAME resolved display names
    private String shiftName;
    private String typeidName;
    private String overtypeidName;
    private String typeidDefaultName;
    private String groupIdName;
}
