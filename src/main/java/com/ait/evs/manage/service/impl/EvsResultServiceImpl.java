package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsResultDto;
import com.ait.evs.manage.mapper.EvsResultMapper;
import com.ait.evs.manage.service.EvsResultService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EvsResultServiceImpl implements EvsResultService {

    private static final Logger log = LoggerFactory.getLogger(EvsResultServiceImpl.class);

    @Autowired
    private EvsResultMapper mapper;

    @Override
    public List<EvsResultDto> getList(EvsResultDto params) {
        try {
            log.info("Lấy danh sách kết quả đánh giá: resumeSeq={}, empSearch={}, statusFilter={}",
                    params.getResumeSeq(), params.getEmpSearch(), params.getStatusFilter());
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kết quả đánh giá: resumeSeq={}, {}",
                    params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Map<String, Object> getSummary(EvsResultDto params) {
        try {
            log.info("Lấy tóm tắt kết quả đánh giá: resumeSeq={}", params.getResumeSeq());

            Map<String, Object> result = new HashMap<>();

            // Tiến độ đánh giá theo giai đoạn
            Map<String, Object> progress = mapper.selectProgressSummary(params);
            Map<String, Object> progressData = new HashMap<>();
            if (progress != null) {
                progressData.put("total", toInt(progress.get("TOTAL")));
                progressData.put("self",  toInt(progress.get("SELF_COUNT")));
                progressData.put("l1",    toInt(progress.get("L1_COUNT")));
                progressData.put("l2",    toInt(progress.get("L2_COUNT")));
                progressData.put("done",  toInt(progress.get("DONE_COUNT")));
                progressData.put("end",   toInt(progress.get("END_COUNT")));
            }
            result.put("progress", progressData);

            // Tỷ lệ tiêu chuẩn từ EVS_SCORE
            Map<String, Object> std = mapper.selectStandardRate(params);
            result.put("std", buildGradeDist(std, null));

            // Phân bổ cấp đánh giá HR (FINAL_GRADE)
            Map<String, Object> hr = mapper.selectGradeDistHr(params);
            result.put("hr", buildGradeDist(hr, toInt(progress != null ? progress.get("TOTAL") : 0)));

            // Phân bổ cấp đánh giá lần 2
            Map<String, Object> l2 = mapper.selectGradeDistL2(params);
            result.put("l2", buildGradeDist(l2, null));

            // Phân bổ cấp đánh giá lần 1
            Map<String, Object> l1 = mapper.selectGradeDistL1(params);
            result.put("l1", buildGradeDist(l1, null));

            return result;
        } catch (Exception e) {
            log.error("Lỗi khi lấy tóm tắt kết quả đánh giá: resumeSeq={}, {}",
                    params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void evaluateEnd(EvsResultDto dto) {
        try {
            dto.setMessage(null);
            mapper.callEvaluateEnd(dto);
            log.info("PR_EVS_END: resumeSeq={}, message={}", dto.getResumeSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi kết thúc đánh giá: resumeSeq={}, {}", dto.getResumeSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void changeStatus(EvsResultDto dto) {
        try {
            if (dto.getSeqList() == null || dto.getSeqList().isEmpty()) {
                throw new RuntimeException("Danh sách SEQ không được rỗng.");
            }
            if (dto.getStatus() == null || dto.getStatus().isEmpty()) {
                throw new RuntimeException("Trạng thái không được rỗng.");
            }
            log.info("Thay đổi trạng thái: status={}, seqCount={}", dto.getStatus(), dto.getSeqList().size());
            mapper.updateActivityBatch(dto);
        } catch (Exception e) {
            log.error("Lỗi khi thay đổi trạng thái: status={}, {}", dto.getStatus(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void copyGrade(EvsResultDto dto) {
        try {
            dto.setMessage(null);
            mapper.callCopyGrade(dto);
            log.info("PR_COPY_GRADE: resumeSeq={}, message={}", dto.getResumeSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi sao chép cấp đánh giá: resumeSeq={}, {}", dto.getResumeSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    public Map<String, Object> getStandardRate(EvsResultDto params) {
        try {
            log.info("Lấy tỷ lệ tiêu chuẩn EVS_SCORE: resumeSeq={}", params.getResumeSeq());
            Map<String, Object> raw = mapper.selectStandardRate(params);
            return raw != null ? raw : new HashMap<>();
        } catch (Exception e) {
            log.error("Lỗi khi lấy tỷ lệ tiêu chuẩn: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveFinalResult(List<EvsResultDto> list) {
        try {
            if (list == null || list.isEmpty()) {
                throw new RuntimeException("Danh sách bản ghi không được rỗng.");
            }
            log.info("Lưu kết quả đánh giá cuối: count={}", list.size());
            for (EvsResultDto item : list) {
                mapper.updateFinalResult(item);
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu kết quả đánh giá cuối: {}", e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    // ── Helper: chuyển đổi giá trị Number sang int an toàn ──────────────────
    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return 0; }
    }

    // ── Helper: xây dựng map phân bổ cấp từ kết quả query ──────────────────
    private Map<String, Object> buildGradeDist(Map<String, Object> raw, Integer overrideTotal) {
        Map<String, Object> dist = new HashMap<>();
        if (raw == null) {
            dist.put("total", 0);
            for (String g : new String[]{"EX", "VG", "GD", "NI", "UN"}) {
                dist.put(g + "_cnt", 0);
                dist.put(g + "_pct", 0);
            }
            return dist;
        }
        int total = overrideTotal != null ? overrideTotal : toInt(raw.get("TOTAL"));
        dist.put("total", total);

        String[] grades = {"EX", "VG", "GD", "NI", "UN"};
        for (String g : grades) {
            int cnt = toInt(raw.get(g + "_CNT"));
            dist.put(g + "_cnt", cnt);
            // Nếu query trả về PCT (từ EVS_SCORE), dùng trực tiếp; ngược lại tự tính
            Object pct = raw.get(g + "_PCT");
            if (pct != null && toInt(pct) > 0) {
                dist.put(g + "_pct", toInt(pct));
            } else {
                dist.put(g + "_pct", total > 0 ? Math.round(cnt * 100.0 / total * 10) / 10.0 : 0);
            }
        }
        return dist;
    }
}
