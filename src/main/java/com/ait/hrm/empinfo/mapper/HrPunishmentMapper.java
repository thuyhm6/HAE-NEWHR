package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrPunishment;

import java.util.List;

@Mapper
public interface HrPunishmentMapper {
    List<HrPunishment> searchPunishment(@Param("empId") String empId,
            @Param("localName") String localName,
            @Param("punishCode") String punishCode);

    HrPunishment getById(@Param("punishNo") Long punishNo);

    int insert(HrPunishment info);

    int update(HrPunishment info);

    int delete(@Param("punishNo") Long punishNo);
}
