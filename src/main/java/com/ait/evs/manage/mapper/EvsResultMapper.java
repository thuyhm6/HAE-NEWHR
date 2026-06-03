package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsResultDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface EvsResultMapper {

    /** Danh sách kết quả đánh giá theo resumeSeq */
    List<EvsResultDto> selectList(EvsResultDto dto);

    /** Thống kê tiến độ đánh giá (tổng, bản thân, lần 1, lần 2, hoàn thành, kết thúc) */
    Map<String, Object> selectProgressSummary(EvsResultDto dto);

    /** Phân bổ cấp đánh giá của lần 1 (l1) */
    Map<String, Object> selectGradeDistL1(EvsResultDto dto);

    /** Phân bổ cấp đánh giá của lần 2 (l2) */
    Map<String, Object> selectGradeDistL2(EvsResultDto dto);

    /** Phân bổ cấp đánh giá cuối (HR - FINAL_GRADE) */
    Map<String, Object> selectGradeDistHr(EvsResultDto dto);

    /** Tỷ lệ tiêu chuẩn từ EVS_SCORE */
    Map<String, Object> selectStandardRate(EvsResultDto dto);

    /** Gọi PR_EVS_END để kết thúc đánh giá */
    void callEvaluateEnd(EvsResultDto dto);

    /** Cập nhật trạng thái ACTIVITY cho danh sách SEQ */
    void updateActivityBatch(EvsResultDto dto);

    /** Gọi PR_COPY_GRADE để sao chép cấp đánh giá */
    void callCopyGrade(EvsResultDto dto);

    /** Cập nhật FINAL_GRADE và FINAL_AFFIRM_CONTENT cho một bản ghi EVS_OBJECT */
    void updateFinalResult(EvsResultDto dto);
}
