package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyDto;
import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyImportTempDto;
import java.util.List;
import java.util.Map;


public interface EssLeaveApplyService {
    List<EssLeaveApplyDto> getList(EssLeaveApplyDto dto);
    void saveLeaveApply(Map<String, Object> params);
    Map<String, Object> getLeaveApplyDetail(String applyNo, String applyType);
    List<EssLeaveApplyImportTempDto> getImportTempList(String errorOnly);
    String importTempToOfficial();
    Map<String, Object> getMyVacationInfo(String personId);
    Map<String, Object> calculateLeaveLength(String fromDateTime, String toDateTime, String leaveTypeCode);
    List<EssLeaveApplyDto> getMyLeaveApplyList(EssLeaveApplyDto dto);
    int cancelMyLeaveApplyList(List<String> applyNos);

    Map<String, Object> getEmpDefaultInfo(String personId);

    Map<String, Object> calcLeaveLengthForPerson(String personId, String fromTime, String toTime, String leaveTypeCode);

    void cancelLeaveApplyByApplyNo(String applyNo);

    void resubmitLeaveApply(Map<String, Object> params);
}
