package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArShift020;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArShift020Dto extends ArShift020 {
    private String fromTimeStr;
    private String toTimeStr;
    private String itemName;
    private String adminID;
}
