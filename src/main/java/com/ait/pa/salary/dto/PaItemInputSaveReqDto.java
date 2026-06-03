package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaItemInputSaveReqDto {
    private Integer           isUse;
    private Integer           itemType;
    private List<PaItemInputDto> items;
}
