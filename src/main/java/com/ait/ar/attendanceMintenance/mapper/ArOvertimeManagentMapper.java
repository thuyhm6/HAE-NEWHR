package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeImportTempDto;
import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ArOvertimeManagentMapper {

    List<ArOvertimeManagentDto> selectList(ArOvertimeManagentDto dto);

    ArOvertimeManagentDto selectDetail(@Param("applyNo") String applyNo);

    List<SyAffirmEmailDto> selectApprovalInfo(@Param("applyNo") String applyNo,
            @Param("applyType") String applyType);

    ArOvertimeManagentDto selectDefaultOtInfo(ArOvertimeManagentDto dto);

    ArOvertimeManagentDto selectAutoFillOtInfo(ArOvertimeManagentDto dto);

    List<ArOvertimeImportTempDto> selectImportTempList(@Param("errorOnly") String errorOnly);

    void callImportOtTemp(Map<String, Object> params);

    Long getNextApplySeq();

    void insertOvertimeApply(ArOvertimeManagentDto dto);

    void updateOvertimeApply(ArOvertimeManagentDto dto);

    void callDeleteOtConfirm(Map<String, Object> params);

    void cancelOvertimeApply(@Param("applyNo") String applyNo);

    SyAffirmEmailDto selectCancelAffirmEmail(@Param("applyNo") String applyNo);

    void callAffirmCancel(Map<String, Object> params);

    List<SyAffirmEmailDto> selectAffirmorListBySql(@Param("affirmSql") String affirmSql);

    void deleteOvertimeApplyByApplyNo(@Param("applyNo") String applyNo);

    void deleteApplyResultByApplyNo(@Param("applyNo") String applyNo);

    int countOverlapOt(ArOvertimeManagentDto dto);

    int checkOtClash(ArOvertimeManagentDto dto);

    ArOvertimeManagentDto selectOtTotals(ArOvertimeManagentDto dto);
}
