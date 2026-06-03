package com.ait.ess.arConfirm.mapper;

import com.ait.ess.arConfirm.dto.EssAttendanceExConfirmDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface EssAttendanceExConfirmMapper {

    int countList(EssAttendanceExConfirmDto dto);

    List<EssAttendanceExConfirmDto> selectListPage(EssAttendanceExConfirmDto dto);

    void callAttendanceExConfirm(Map<String, Object> params);
}
