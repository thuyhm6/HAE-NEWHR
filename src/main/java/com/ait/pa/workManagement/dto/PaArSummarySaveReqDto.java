package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.util.List;

/** Request lưu giá trị ngoại lệ / ghi chú của các dòng tổng hợp chấm công đã chọn. */
@Data
@NoArgsConstructor
public class PaArSummarySaveReqDto {

    @NotBlank(message = "Vui lòng chọn kế hoạch trả lương!")
    private String payScheduleNo;

    @NotEmpty(message = "Vui lòng chọn dữ liệu cần lưu!")
    private List<PaArSummaryManageDto> items;
}
