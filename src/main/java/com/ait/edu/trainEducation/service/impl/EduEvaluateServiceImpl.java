package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduBasicInfoMapper;
import com.ait.edu.trainEducation.mapper.EduEvaluateMapper;
import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.model.EduEvalCourse;
import com.ait.edu.trainEducation.model.EduFile;
import com.ait.edu.trainEducation.model.EduFreeEmployee;
import com.ait.edu.trainEducation.model.EduImportResult;
import com.ait.edu.trainEducation.model.EduScoreStat;
import com.ait.edu.trainEducation.model.EduTeacherCheck;
import com.ait.edu.trainEducation.model.EduTrainResult;
import com.ait.edu.trainEducation.service.EduCommonService;
import com.ait.edu.trainEducation.service.EduEvaluateService;
import com.ait.edu.trainEducation.util.EduCurrentUser;
import com.ait.edu.trainEducation.util.EduExcelHelper;
import com.ait.edu.trainEducation.util.EduImportValidator;
import com.ait.exception.BusinessException;
import com.ait.util.I18nUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EduEvaluateServiceImpl implements EduEvaluateService {
    private static final Logger log = LoggerFactory.getLogger(EduEvaluateServiceImpl.class);

    /** Tiêu chí Kết quả đào tạo - thứ tự cột file import giữ nguyên importTrainResultEV bản gốc. */
    static final String CRITERIA_SATISFACTION = "DIFFICULTY";
    static final String CRITERIA_EASY = "CONTENT_RICH";
    static final String CRITERIA_TIME = "TIME_MODERATE";
    static final String CRITERIA_PRACTICAL = "PRACTICABILITY";

    private static final Map<String, String> CRITERIA_LABEL_KEYS = new LinkedHashMap<>();
    static {
        CRITERIA_LABEL_KEYS.put(CRITERIA_SATISFACTION, "edu.trainResult.KECHENGDEZHENGTIMANYIDU.a");
        CRITERIA_LABEL_KEYS.put(CRITERIA_EASY, "edu.trainResult.KECHENGYIZHANGWODECHENGDU.a");
        CRITERIA_LABEL_KEYS.put(CRITERIA_TIME, "edu.trainResult.KECHENGDESHIJIANCHANGDU.a");
        CRITERIA_LABEL_KEYS.put(CRITERIA_PRACTICAL, "edu.trainResult.KECHENGNEIRONGSHIFOUSHIYONG.a");
    }

    @Autowired
    private EduEvaluateMapper eduEvaluateMapper;

    @Autowired
    private EduBasicInfoMapper eduBasicInfoMapper;

    @Autowired
    private EduCommonService eduCommonService;

    // ================= Danh sách khóa =================

    @Override
    @Transactional(readOnly = true)
    public List<EduEvalCourse> findCourses(String evalType, String startDate, String endDate) {
        String empid = EduCurrentUser.empid();
        log.info("Tim danh sach khoa danh gia, evalType={}, empid={}", evalType, empid);
        try {
            boolean privileged = EduCurrentUser.isPrivileged();
            String restrict = null;
            if (!privileged) {
                restrict = TYPE_STUDENT.equals(evalType) ? "EVA_TEACHER" : "STUDENT";
            }
            List<EduEvalCourse> list = eduEvaluateMapper.findCourses(evalType, trimToNull(startDate), trimToNull(endDate),
                    restrict, empid, EduCurrentUser.personId());
            if (TYPE_RESULT.equals(evalType)) {
                // Bản gốc: quản trị (1111111x) không đánh giá; phụ trách đào tạo đánh giá khi khóa có học viên;
                // người khác (đã lọc là học viên của khóa) luôn được đánh giá
                for (EduEvalCourse c : list) {
                    if (EduCurrentUser.isAdmin()) {
                        c.setCanEvaluate(false);
                    } else if (EduCurrentUser.isOfficer()) {
                        c.setCanEvaluate(c.getStudentCount() != null && c.getStudentCount() > 0);
                    } else {
                        c.setCanEvaluate(true);
                    }
                }
            }
            return list;
        } catch (Exception e) {
            log.error("Loi khi tim danh sach khoa danh gia, evalType={}", evalType, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduBasicInformation getCourse(String basicNo) {
        log.info("Lay thong tin khoa, basicNo={}", basicNo);
        try {
            return eduBasicInfoMapper.findById(basicNo);
        } catch (Exception e) {
            log.error("Loi khi lay thong tin khoa, basicNo={}", basicNo, e);
            throw e;
        }
    }

    // ================= Đánh giá học viên =================

    @Override
    @Transactional(readOnly = true)
    public List<EduFreeEmployee> getStudents(String basicNo) {
        log.info("Lay danh sach hoc vien, basicNo={}", basicNo);
        try {
            return eduBasicInfoMapper.findFreeEmployees(basicNo);
        } catch (Exception e) {
            log.error("Loi khi lay danh sach hoc vien, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveStudentScores(String basicNo, Map<String, String> scores) throws BusinessException {
        log.info("Luu diem thi hoc vien, basicNo={}, count={}", basicNo, scores == null ? 0 : scores.size());
        try {
            if (scores == null || scores.isEmpty()) {
                throw new BusinessException(ERR_INVALID, "Thêm điểm số sau đó lưu!");
            }
            for (Map.Entry<String, String> e : scores.entrySet()) {
                String score = trimToNull(e.getValue());
                if (score != null && !isInRange(score, 0, 100)) {
                    throw new BusinessException(ERR_INVALID, "Điểm phải trong khoảng 0 - 100.");
                }
                eduEvaluateMapper.updateEvaResult(basicNo, e.getKey(), score);
            }
        } catch (BusinessException e) {
            log.warn("Luu diem thi that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi luu diem thi, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EduImportResult importStudentScores(String basicNo, InputStream in) throws IOException {
        log.info("Import diem thi hoc vien, basicNo={}", basicNo);
        try {
            EduImportResult result = new EduImportResult();
            List<String[]> rows = readRows(in, 3, result);
            if (!result.isSuccess()) {
                return result;
            }
            for (String[] r : rows) {
                if (EduImportValidator.required(result.getErrors(), r[0], r[1], "alert.pa.pasalarycanshu.shehao")) {
                    EduImportValidator.range(result.getErrors(), r[0], r[3], "edu.studentEvaluate.KAOSHICHENGJI.a", 0, 100);
                }
            }
            if (!result.isSuccess()) {
                return result;
            }
            for (String[] r : rows) {
                int n = eduEvaluateMapper.updateEvaResultByEmpid(basicNo, r[1], trimToNull(r[3]));
                countOrWarn(result, r, n);
            }
            log.info("Import diem thi xong, basicNo={}, updated={}", basicNo, result.getUpdatedCount());
            return result;
        } catch (IOException e) {
            log.error("Loi doc file import diem thi, basicNo={}", basicNo, e);
            throw e;
        } catch (Exception e) {
            log.error("Loi khi import diem thi, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    public byte[] buildStudentTemplate() throws IOException {
        log.info("Tao file mau import diem thi");
        List<String> headers = Arrays.asList(
                label("alert.pa.pasalarycanshu.shehao") + " (*)",
                label("alert.pa.pasalarycanshu.xingming"),
                label("edu.studentEvaluate.KAOSHICHENGJI.a") + " (0-100)");
        return EduExcelHelper.write("studentEva", headers,
                Collections.singletonList(Arrays.<Object>asList("20000013", "Name", "90")));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportStudents(String basicNo) throws IOException {
        log.info("Xuat Excel diem thi hoc vien, basicNo={}", basicNo);
        List<String> headers = Arrays.asList(label("alert.pa.pasalarycanshu.shehao"), label("alert.pa.pasalarycanshu.xingming"),
                label("ar.attendanceView.viewNoSwipingCard.deptName"), label("ess.trans.title.postGradeName"),
                label("edu.studentEvaluate.KAOSHICHENGJI.a"));
        List<List<Object>> rows = new ArrayList<>();
        for (EduFreeEmployee s : getStudents(basicNo)) {
            rows.add(Arrays.<Object>asList(s.getEmpid(), s.getLocalName(), s.getDeptName(), s.getPostGradeName(), s.getEvaResult()));
        }
        return EduExcelHelper.write("studentEva", headers, rows);
    }

    // ================= Đánh giá giảng viên =================

    @Override
    @Transactional(readOnly = true)
    public List<EduScoreStat> getTeacherStats(String basicNo) {
        log.info("Thong ke danh gia giang vien, basicNo={}", basicNo);
        try {
            Map<String, List<EduTeacherCheck>> byTeacher = eduEvaluateMapper.findTeacherChecks(basicNo, null).stream()
                    .collect(Collectors.groupingBy(EduTeacherCheck::getTeaEmpid, LinkedHashMap::new, Collectors.toList()));
            List<EduScoreStat> stats = new ArrayList<>();
            for (Map.Entry<String, List<EduTeacherCheck>> e : byTeacher.entrySet()) {
                EduTeacherCheck first = e.getValue().get(0);
                EduScoreStat s = buildStat(e.getValue(), EduTeacherCheck::getGrooming);
                s.setKey(e.getKey());
                s.setName(first.getTeaLocalName());
                s.setDeptName(first.getTeaDeptName());
                s.setPostGradeName(first.getTeaPostGradeName());
                stats.add(s);
            }
            return stats;
        } catch (Exception e) {
            log.error("Loi khi thong ke danh gia giang vien, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduTeacherCheck> getTeacherChecks(String basicNo, String teaEmpid) {
        log.info("Lay phieu danh gia giang vien, basicNo={}, teaEmpid={}", basicNo, teaEmpid);
        try {
            return eduEvaluateMapper.findTeacherChecks(basicNo, teaEmpid);
        } catch (Exception e) {
            log.error("Loi khi lay phieu danh gia giang vien, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EduImportResult importTeacherScores(String basicNo, String teaEmpid, InputStream in) throws IOException {
        log.info("Import danh gia giang vien, basicNo={}, teaEmpid={}", basicNo, teaEmpid);
        try {
            EduImportResult result = new EduImportResult();
            List<String[]> rows = readRows(in, 3, result);
            if (!result.isSuccess()) {
                return result;
            }
            for (String[] r : rows) {
                if (EduImportValidator.required(result.getErrors(), r[0], r[1], "edu.teacherEvaluate.PINGJIAZHESHEHAO.a")) {
                    EduImportValidator.range(result.getErrors(), r[0], r[3], "hr.viewCompetence.title.MARK", 1, 5);
                }
            }
            if (!result.isSuccess()) {
                return result;
            }
            for (String[] r : rows) {
                int n = eduEvaluateMapper.updateGrooming(basicNo, teaEmpid, r[1], trimToNull(r[3]));
                countOrWarn(result, r, n);
            }
            return result;
        } catch (IOException e) {
            log.error("Loi doc file import danh gia giang vien, basicNo={}", basicNo, e);
            throw e;
        } catch (Exception e) {
            log.error("Loi khi import danh gia giang vien, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    public byte[] buildTeacherTemplate() throws IOException {
        log.info("Tao file mau import danh gia giang vien");
        List<String> headers = Arrays.asList(
                label("edu.teacherEvaluate.PINGJIAZHESHEHAO.a") + " (*)",
                label("edu.teacherEvaluate.PINGJIAZHEXINGMING.a"),
                label("hr.viewCompetence.title.MARK") + " (1-5)");
        return EduExcelHelper.write("TeacherEvaluate", headers,
                Collections.singletonList(Arrays.<Object>asList("20000013", "Name", "5")));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportTeacherStats(String basicNo) throws IOException {
        log.info("Xuat Excel thong ke danh gia giang vien, basicNo={}", basicNo);
        List<String> headers = Arrays.asList(label("alert.pa.pasalarycanshu.shehao"), label("alert.pa.pasalarycanshu.xingming"),
                label("ess.trans.title.postGradeName"), label("hr.viewPersonalInfo.title.DEPTNAME"),
                label("edu.teacherEvaluate.FEICHANGHAO.a"), label("edu.teacherEvaluate.BIJIAOHAO.a"),
                label("edu.teacherEvaluate.YIBAN.a"), label("edu.teacherEvaluate.BIJIAOBUHAO.a"),
                label("edu.teacherEvaluate.FEICHANGBUHAO.a"), label("edu.teacherEvaluate.MANYIDU.a"));
        List<List<Object>> rows = new ArrayList<>();
        for (EduScoreStat s : getTeacherStats(basicNo)) {
            rows.add(Arrays.<Object>asList(s.getKey(), s.getName(), s.getPostGradeName(), s.getDeptName(),
                    s.getRev05(), s.getRev04(), s.getRev03(), s.getRev02(), s.getRev01(), s.getRevTotal()));
        }
        return EduExcelHelper.write("TeacherEvaluate", headers, rows);
    }

    // ================= Kết quả đào tạo =================

    @Override
    @Transactional(readOnly = true)
    public List<EduScoreStat> getResultStats(String basicNo) {
        log.info("Thong ke ket qua dao tao, basicNo={}", basicNo);
        try {
            // Mẫu số = số phiếu có ít nhất 1 tiêu chí đã chấm (giống SQL trainResultInfoEveList bản gốc)
            List<EduTrainResult> evaluated = eduEvaluateMapper.findTrainResults(basicNo, true).stream()
                    .filter(r -> r.getDifficulty() != null || r.getContentRich() != null
                            || r.getPracticability() != null || r.getTimeModerate() != null)
                    .collect(Collectors.toList());
            List<EduScoreStat> stats = new ArrayList<>();
            stats.add(criteriaStat(CRITERIA_SATISFACTION, evaluated, EduTrainResult::getDifficulty));
            stats.add(criteriaStat(CRITERIA_EASY, evaluated, EduTrainResult::getContentRich));
            stats.add(criteriaStat(CRITERIA_TIME, evaluated, EduTrainResult::getTimeModerate));
            stats.add(criteriaStat(CRITERIA_PRACTICAL, evaluated, EduTrainResult::getPracticability));
            return stats;
        } catch (Exception e) {
            log.error("Loi khi thong ke ket qua dao tao, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainResult> getTrainResults(String basicNo, boolean onlyEvaluated) {
        log.info("Lay phieu ket qua dao tao, basicNo={}, onlyEvaluated={}", basicNo, onlyEvaluated);
        try {
            List<EduTrainResult> list = eduEvaluateMapper.findTrainResults(basicNo, onlyEvaluated);
            if (onlyEvaluated && !list.isEmpty()) {
                Map<String, List<EduFile>> files = eduCommonService.getFilesGrouped(EduCommonService.FILE_TYPE_RESULT,
                        list.stream().map(EduTrainResult::getResultNo).collect(Collectors.toList()));
                list.forEach(r -> r.setFiles(files.getOrDefault(r.getResultNo(), Collections.emptyList())));
            }
            return list;
        } catch (Exception e) {
            log.error("Loi khi lay phieu ket qua dao tao, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EduImportResult importResultScores(String basicNo, InputStream in) throws IOException {
        log.info("Import ket qua dao tao, basicNo={}", basicNo);
        try {
            EduImportResult result = new EduImportResult();
            List<String[]> rows = readRows(in, 6, result);
            if (!result.isSuccess()) {
                return result;
            }
            for (String[] r : rows) {
                if (EduImportValidator.required(result.getErrors(), r[0], r[1], "edu.teacherEvaluate.PINGJIAZHESHEHAO.a")) {
                    int i = 3;
                    for (String key : CRITERIA_LABEL_KEYS.values()) {
                        EduImportValidator.range(result.getErrors(), r[0], r[i++], key, 1, 5);
                    }
                }
            }
            if (!result.isSuccess()) {
                return result;
            }
            for (String[] r : rows) {
                EduTrainResult t = new EduTrainResult();
                t.setBasicNo(basicNo);
                t.setStuEmpid(r[1]);
                t.setDifficulty(trimToNull(r[3]));
                t.setContentRich(trimToNull(r[4]));
                t.setTimeModerate(trimToNull(r[5]));
                t.setPracticability(trimToNull(r[6]));
                countOrWarn(result, r, eduEvaluateMapper.updateTrainResultScores(t));
            }
            return result;
        } catch (IOException e) {
            log.error("Loi doc file import ket qua dao tao, basicNo={}", basicNo, e);
            throw e;
        } catch (Exception e) {
            log.error("Loi khi import ket qua dao tao, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    public byte[] buildResultTemplate() throws IOException {
        log.info("Tao file mau import ket qua dao tao");
        List<String> headers = new ArrayList<>(Arrays.asList(
                label("edu.teacherEvaluate.PINGJIAZHESHEHAO.a") + " (*)", label("edu.teacherEvaluate.PINGJIAZHEXINGMING.a")));
        CRITERIA_LABEL_KEYS.values().forEach(k -> headers.add(label(k) + " (1-5)"));
        return EduExcelHelper.write("trainResult", headers,
                Collections.singletonList(Arrays.<Object>asList("20000013", "Name", "5", "5", "5", "5")));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportResults(String basicNo) throws IOException {
        log.info("Xuat Excel ket qua dao tao, basicNo={}", basicNo);
        List<String> headers = new ArrayList<>(Arrays.asList(label("alert.pa.pasalarycanshu.shehao"), label("edu.trainResult.PINGJIAZHE.a")));
        CRITERIA_LABEL_KEYS.values().forEach(k -> headers.add(label(k)));
        headers.add(label("hrm.approve.AMOUNT"));
        headers.add(label("hr.viewSuggestion.title.Suggestion"));
        List<List<Object>> rows = new ArrayList<>();
        for (EduTrainResult r : eduEvaluateMapper.findTrainResults(basicNo, true)) {
            rows.add(Arrays.<Object>asList(r.getStuEmpid(), r.getStuLocalName(), r.getDifficulty(), r.getContentRich(),
                    r.getTimeModerate(), r.getPracticability(), r.getAllscore(), r.getOtherAdvise()));
        }
        return EduExcelHelper.write("trainResult", headers, rows);
    }

    // ================= Tiện ích =================

    private EduScoreStat criteriaStat(String key, List<EduTrainResult> rows, Function<EduTrainResult, String> getter) {
        // Mẫu số chung cho mọi tiêu chí = số phiếu đã đánh giá
        EduScoreStat s = buildStatWithDenominator(rows, getter, rows.size());
        s.setKey(key);
        s.setName(label(CRITERIA_LABEL_KEYS.get(key)));
        return s;
    }

    /** Thống kê theo giảng viên: mẫu số = số phiếu đã chấm của chính giảng viên đó. */
    private <T> EduScoreStat buildStat(List<T> rows, Function<T, String> getter) {
        int denominator = (int) rows.stream().filter(r -> trimToNull(getter.apply(r)) != null).count();
        return buildStatWithDenominator(rows, getter, denominator);
    }

    private <T> EduScoreStat buildStatWithDenominator(List<T> rows, Function<T, String> getter, int denominator) {
        int[] counts = new int[6];
        for (T r : rows) {
            String v = trimToNull(getter.apply(r));
            if (v == null) {
                continue;
            }
            try {
                int score = (int) Math.round(Double.parseDouble(v));
                if (score >= 1 && score <= 5) {
                    counts[score]++;
                }
            } catch (NumberFormatException e) {
                log.debug("Bo qua diem khong hop le: {}", v);
            }
        }
        EduScoreStat s = new EduScoreStat();
        s.setEvaluatedCount(denominator);
        s.setRev05(percent(counts[5], denominator));
        s.setRev04(percent(counts[4], denominator));
        s.setRev03(percent(counts[3], denominator));
        s.setRev02(percent(counts[2], denominator));
        s.setRev01(percent(counts[1], denominator));
        s.setRevTotal(percent(counts[5] + counts[4], denominator));
        return s;
    }

    /** Giống ROUND(x / y, 2) * 100 || '%' của bản gốc. */
    private static String percent(int count, int total) {
        if (total <= 0) {
            return "0%";
        }
        return Math.round(count * 100.0 / total) + "%";
    }

    private List<String[]> readRows(InputStream in, int columns, EduImportResult result) throws IOException {
        List<String[]> rows = EduExcelHelper.read(in, columns);
        if (rows.isEmpty()) {
            result.getErrors().add(I18nUtil.getMessage("edu.import.msg.noData"));
        }
        return rows;
    }

    private static void countOrWarn(EduImportResult result, String[] row, int updated) {
        if (updated > 0) {
            result.setUpdatedCount(result.getUpdatedCount() + updated);
        } else {
            result.getWarnings().add(EduImportValidator.msg(row[0], "edu.import.msg.notInCourse", row[1]));
        }
    }

    private static boolean isInRange(String value, double min, double max) {
        try {
            double v = Double.parseDouble(value);
            return v >= min && v <= max;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private static String label(String key) {
        return I18nUtil.getMessage(key);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
