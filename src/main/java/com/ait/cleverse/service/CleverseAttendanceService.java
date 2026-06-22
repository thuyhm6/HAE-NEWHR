package com.ait.cleverse.service;

import hanwha.neo.branch.ss.att.vo.HrOffCodeVo;
import hanwha.neo.branch.ss.att.vo.HrOffListVo;
import hanwha.neo.branch.ss.att.vo.SyncHrOffDataRequest;

import java.util.List;

public interface CleverseAttendanceService {

    /**
     * Gửi danh sách loại nghỉ phép (HrOffCodeVo) đến Cleverse.
     */
    String syncHrOffData(SyncHrOffDataRequest request);

    /**
     * Build request và gửi danh sách chấm công từ HR system đến Cleverse.
     */
    String syncAttendanceList(List<HrOffListVo> hrOffList, List<HrOffCodeVo> hrOffCodeList);
}
