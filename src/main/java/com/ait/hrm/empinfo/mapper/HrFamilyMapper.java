package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrFamily;

import java.util.List;

@Mapper
public interface HrFamilyMapper {
    List<HrFamily> searchFamily(@Param("empId") String empId,
            @Param("personId") String personId,
            @Param("localName") String localName,
            @Param("famName") String famName);

    HrFamily getById(@Param("familyNo") Long familyNo);

    int insert(HrFamily info);

    int update(HrFamily info);

    int delete(@Param("familyNo") Long familyNo);
}
