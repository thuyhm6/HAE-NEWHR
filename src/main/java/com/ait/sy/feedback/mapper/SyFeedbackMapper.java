package com.ait.sy.feedback.mapper;

import com.ait.sy.feedback.dto.SyFeedbackDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SyFeedbackMapper {

    long countList(SyFeedbackDto params);

    List<SyFeedbackDto> selectListPage(SyFeedbackDto params);

    int insert(SyFeedbackDto dto);
}
