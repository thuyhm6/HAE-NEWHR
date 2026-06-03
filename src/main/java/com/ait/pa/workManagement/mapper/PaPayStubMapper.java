package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaPayStubDto;
import com.ait.pa.workManagement.dto.PaPayStubItemDto;
import com.ait.pa.workManagement.dto.PaPayStubOtherDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaPayStubMapper {

    List<PaPayStubDto> selectEmployeeList(PaPayStubDto params);

    List<PaPayStubDto> selectSelfEmployee(PaPayStubDto params);

    void callSalaryPagePackage(@Param("payScheduleNo") String payScheduleNo,
                               @Param("personId") String personId);

    List<PaPayStubItemDto> selectSalaryPageItems(@Param("personId") String personId,
                                                  @Param("lang") String lang);

    List<PaPayStubOtherDto> selectOtherItems(@Param("payScheduleNo") String payScheduleNo,
                                              @Param("personId") String personId);
}
