package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaPayObjDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaPayObjMapper {

    List<PaPayObjDto> selectList(PaPayObjDto params);

    List<PaPayObjDto> selectListPage(PaPayObjDto params);

    long countList(PaPayObjDto params);

    int countDuplicate(@Param("payScheduleNo") String payScheduleNo,
                       @Param("empId") String empId);

    PaPayObjDto selectEmployeeByEmpId(@Param("empId") String empId);

    void insert(PaPayObjDto dto);

    void updateIncludeType(PaPayObjDto dto);

    void deleteByKey(@Param("payScheduleNo") String payScheduleNo,
                     @Param("empId") String empId);
}
