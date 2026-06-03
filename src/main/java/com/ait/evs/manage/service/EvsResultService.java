package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsResultDto;

import java.util.List;
import java.util.Map;

public interface EvsResultService {

    /** Lấy danh sách kết quả đánh giá theo resumeSeq và điều kiện lọc */
    List<EvsResultDto> getList(EvsResultDto params);

    /** Lấy dữ liệu tóm tắt: phân bổ cấp và tiến độ giai đoạn */
    Map<String, Object> getSummary(EvsResultDto params);

    /** Kết thúc đánh giá cho đợt resumeSeq */
    void evaluateEnd(EvsResultDto dto);

    /** Thay đổi trạng thái ACTIVITY cho danh sách SEQ được chọn */
    void changeStatus(EvsResultDto dto);

    /** Sao chép cấp đánh giá (gọi PR_COPY_GRADE) */
    void copyGrade(EvsResultDto dto);

    /** Lấy tỷ lệ tiêu chuẩn từ EVS_SCORE (cột A-E tương ứng EX-UN) */
    Map<String, Object> getStandardRate(EvsResultDto params);

    /** Lưu FINAL_GRADE và FINAL_AFFIRM_CONTENT cho danh sách bản ghi được chọn */
    void saveFinalResult(List<EvsResultDto> list);
}
