package com.ait.ess.infoApplyAttendance.mapper;

import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyDto;
import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EssAttendanceExForBatchMapper {
    List<EssAttendanceExForBatchDto> selectAttendanceExForBatchList(EssAttendanceExForBatchDto params);

    List<EssAttendanceExForBatchDto> selectCheckAttendanceExForBatchList(EssAttendanceExForBatchDto params);

    EssLeaveApplyDto selectCardApplyInfo(@Param("applyNo") String applyNo);

    List<SyAffirmEmailDto> selectCardApprovalInfo(@Param("applyNo") String applyNo,
            @Param("applyType") String applyType);

    Long getNextCardApplyNo();

    int insertCardApply(EssAttendanceExForBatchDto params);

    Integer checkAttExClash(@Param("personId") String personId,
                            @Param("arDateStr") String arDateStr);
}
