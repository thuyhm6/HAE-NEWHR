package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrAddressMatters;

import java.util.List;

@Mapper
public interface HrAddressMattersMapper {
    List<HrAddressMatters> searchAddress(@Param("empId") String empId,
            @Param("personId") String personId,
            @Param("localName") String localName,
            @Param("addressContent") String addressContent);

    HrAddressMatters getById(@Param("addressNo") Long addressNo);

    int insert(HrAddressMatters info);

    int update(HrAddressMatters info);

    int delete(@Param("addressNo") Long addressNo);
}
