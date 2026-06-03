package com.ait.sy.excel.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ExcelMapper {
    String getPersonIdByEmpId(@Param("empId") String empId);
    List<Map<String, Object>> getDeptList(Map<String, Object> params);
    void insertScheduleHtsv(Map<String, Object> row);
    void deleteAttendanceApplyTempByUploader(Map<String, Object> params);
    void insertAttendanceApplyTemp(Map<String, Object> row);
    void callValidateAttendanceApplyTemp(Map<String, Object> params);
    void deleteOvertimeApplyTempByUploader(Map<String, Object> params);
    void insertOvertimeApplyTemp(Map<String, Object> row);
    void callValidateOvertimeApplyTemp(Map<String, Object> params);
}
