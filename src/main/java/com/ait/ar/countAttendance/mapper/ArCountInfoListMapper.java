package com.ait.ar.countAttendance.mapper;

import com.ait.ar.countAttendance.dto.ArCountInfoListOtDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArCountInfoListMapper {
    /** Tổng hợp tăng ca theo tháng của nhân viên (tab "Tăng ca"). */
    List<ArCountInfoListOtDto> selectOtSummaryList(ArCountInfoListOtDto params);
}
