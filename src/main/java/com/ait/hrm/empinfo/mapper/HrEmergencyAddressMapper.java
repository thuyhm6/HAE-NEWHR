package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrEmergencyAddress;

import java.util.List;

@Mapper
public interface HrEmergencyAddressMapper {
    List<HrEmergencyAddress> searchEmergencyAddress(@Param("empId") String empId,
            @Param("personId") String personId,
            @Param("localName") String localName,
            @Param("emerName") String emerName);

    HrEmergencyAddress getById(@Param("emergencyNo") Long emergencyNo);

    int insert(HrEmergencyAddress info);

    int update(HrEmergencyAddress info);

    int delete(@Param("emergencyNo") Long emergencyNo);

    List<HrEmergencyAddress> findByPersonAndName(@Param("personId") String personId,
            @Param("emerName") String emerName);
}
