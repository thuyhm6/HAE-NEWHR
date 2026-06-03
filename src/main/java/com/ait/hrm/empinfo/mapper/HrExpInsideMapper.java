package com.ait.hrm.empinfo.mapper;

import com.ait.hrm.empinfo.dto.HrExpInsideDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface HrExpInsideMapper {

    int countDecisionList(HrExpInsideDto dto);

    List<HrExpInsideDto> selectDecisionListPage(HrExpInsideDto dto);

    HrExpInsideDto selectDecisionBySeq(@Param("seq") Long seq);

    List<HrExpInsideDto> selectAllDecisionsByPersonId(@Param("personId") String personId);

    void insertDecision(HrExpInsideDto dto);

    void updateDecision(HrExpInsideDto dto);

    void deleteDecision(@Param("seq") Long seq);

    HrExpInsideDto selectEmployeeByKeyword(HrExpInsideDto dto);

    void callExperienceExecuteSingle();
}
