package com.ait.hrm.empinfo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoImportResultDto {
    private String fileName;
    private String empId;
    private String personId;
    private String localName;
    private boolean success;
    private String errorMessage;
}
