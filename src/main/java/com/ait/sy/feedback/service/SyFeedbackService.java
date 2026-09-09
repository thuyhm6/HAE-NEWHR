package com.ait.sy.feedback.service;

import com.ait.sy.feedback.dto.SyFeedbackDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface SyFeedbackService {

    DataTablesResponse<SyFeedbackDto> getPagedList(SyFeedbackDto params);

    void submitFeedback(SyFeedbackDto dto);
}
