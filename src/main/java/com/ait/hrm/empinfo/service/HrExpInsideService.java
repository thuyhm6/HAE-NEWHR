package com.ait.hrm.empinfo.service;

import com.ait.hrm.empinfo.dto.HrExpInsideDto;
import com.ait.sy.sys.dto.DataTablesResponse;
import java.util.List;
import java.util.Map;

public interface HrExpInsideService {

    HrExpInsideDto searchEmployee(HrExpInsideDto dto);

    DataTablesResponse<HrExpInsideDto> getDecisionList(HrExpInsideDto dto);

    HrExpInsideDto getDecisionBySeq(Long seq);

    List<HrExpInsideDto> getAllDecisionsByPersonId(String personId);

    Map<String, Object> saveDecision(HrExpInsideDto dto);

    Map<String, Object> deleteDecision(Long seq);
}
