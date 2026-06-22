package com.ait.ess.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EssFileDto {

    private String fileNo;
    private String applyNo;
    private String applyType;
    private String fileUrl;
    private String fileName;
}
