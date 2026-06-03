package com.ait.ess.arConfirm.mapper;

import com.ait.ess.arConfirm.dto.EssLeaveConfirmDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface EssLeaveConfirmMapper {

    int countList(EssLeaveConfirmDto dto);

    List<EssLeaveConfirmDto> selectListPage(EssLeaveConfirmDto dto);

    void callLeaveConfirm(Map<String, Object> params);
}
