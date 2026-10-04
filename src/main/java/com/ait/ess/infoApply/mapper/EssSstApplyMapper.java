package com.ait.ess.infoApply.mapper;

import com.ait.ess.infoApply.dto.EssSstApplyDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * Các câu SQL phụ trợ cho form xin phép SST (nghỉ phép / tăng ca thường / tăng ca vượt),
 * port từ sqlInfoApply.xml / sqlInfoApplyLeave.xml (Hanwha_HAE).
 */
@Mapper
public interface EssSstApplyMapper {

    /** getOtShiftTime - applyDate: YYYY-MM-DD */
    EssSstApplyDto selectOtShiftTime(@Param("applyDate") String applyDate);

    /** getOtLength - applyDate: YYYY-MM-DD, otFromTime/otToTime: YYYY-MM-DD HH24:MI */
    EssSstApplyDto selectOtLength(@Param("applyDate") String applyDate,
                                  @Param("otTypeCode") String otTypeCode,
                                  @Param("otFromTime") String otFromTime,
                                  @Param("otToTime") String otToTime,
                                  @Param("deductYn") String deductYn);

    /** AR_GET_OT_CLASH / AR_GET_OT_OVER_CLASH - otFromTime/otToTime: YYYY-MM-DD HH24:MI */
    Integer selectOtClash(@Param("otFromTime") String otFromTime,
                          @Param("otToTime") String otToTime,
                          @Param("offsetYn") String offsetYn,
                          @Param("over") boolean over);

    /** getOtCheckSST (CHECK_OT_TIME_{cpnyId}) - trả về 'OK' hoặc nội dung lỗi */
    String selectCheckOtTime(@Param("applyDate") String applyDate,
                             @Param("otFromTime") String otFromTime,
                             @Param("otToTime") String otToTime,
                             @Param("otTypeCode") String otTypeCode);

    /** getLeaveCheckSST (CHECK_LEAVE_TIME_{cpnyId}) - trả về 'OK' hoặc nội dung lỗi */
    String selectCheckLeaveTime(@Param("leaveFromTime") String leaveFromTime,
                                @Param("leaveToTime") String leaveToTime,
                                @Param("leaveTypeCode") String leaveTypeCode);
}
