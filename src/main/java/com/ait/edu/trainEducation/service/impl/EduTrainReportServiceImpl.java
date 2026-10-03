package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduTrainReportMapper;
import com.ait.edu.trainEducation.model.EduTrainReportMenu;
import com.ait.edu.trainEducation.model.EduTrainReportQuery;
import com.ait.edu.trainEducation.model.EduTrainReportRow;
import com.ait.edu.trainEducation.service.EduTrainReportService;
import com.ait.edu.trainEducation.util.EduExcelHelper;
import com.ait.exception.BusinessException;
import com.ait.util.I18nUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

@Service
public class EduTrainReportServiceImpl implements EduTrainReportService {
    private static final Logger log = LoggerFactory.getLogger(EduTrainReportServiceImpl.class);

    /** Cột có đơn vị giờ - thêm "(Tiếng)" vào tiêu đề (bản gốc ghép vào từng ô). */
    private static final String HOUR_KEY = "ar.viewitemparameter.title.xiaoshi";

    @Autowired
    private EduTrainReportMapper eduTrainReportMapper;

    /** Một cột Excel: key i18n tiêu đề + cách lấy giá trị. */
    private static final class Col {
        final String key;
        final boolean hour;
        final Function<EduTrainReportRow, Object> value;

        Col(String key, boolean hour, Function<EduTrainReportRow, Object> value) {
            this.key = key;
            this.hour = hour;
            this.value = value;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainReportMenu> findMenu() {
        log.info("Lay cay loai bao cao dao tao, parentCode={}", REPORT_TYPE_PARENT_CODE);
        try {
            return eduTrainReportMapper.findMenu(REPORT_TYPE_PARENT_CODE);
        } catch (Exception e) {
            log.error("Loi khi lay cay loai bao cao dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainReportRow> findReport(String type, EduTrainReportQuery query) throws BusinessException {
        log.info("Lay bao cao dao tao, type={}, query={}", type, query);
        EduTrainReportQuery q = normalize(query);
        try {
            switch (type == null ? "" : type) {
                case TYPE_COURSE:
                    return eduTrainReportMapper.findCourseReport(q);
                case TYPE_POST_GRADE:
                    return eduTrainReportMapper.findPostGradeReport(q);
                case TYPE_DEPT:
                    return eduTrainReportMapper.findDeptReport(q);
                case TYPE_YEAR:
                    return eduTrainReportMapper.findYearReport(q);
                case TYPE_MONTH:
                    return eduTrainReportMapper.findMonthReport(q);
                case TYPE_FORM:
                    return eduTrainReportMapper.findFormReport(q);
                default:
                    throw new BusinessException(ERR_INVALID_TYPE, "Loại báo cáo không hợp lệ.");
            }
        } catch (BusinessException e) {
            log.warn("Lay bao cao dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi lay bao cao dao tao, type={}", type, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportReport(String type, EduTrainReportQuery query) throws BusinessException, IOException {
        log.info("Xuat Excel bao cao dao tao, type={}", type);
        List<EduTrainReportRow> list = findReport(type, query);
        List<Col> cols = columns(type);
        List<String> headers = new ArrayList<>();
        headers.add(label("ar.viewcycle.title.xuhao"));
        String hourSuffix = " (" + label(HOUR_KEY) + ")";
        cols.forEach(c -> headers.add(label(c.key) + (c.hour ? hourSuffix : "")));
        List<List<Object>> rows = new ArrayList<>();
        int idx = 1;
        for (EduTrainReportRow r : list) {
            List<Object> row = new ArrayList<>();
            row.add(idx++);
            cols.forEach(c -> row.add(c.value.apply(r)));
            rows.add(row);
        }
        return EduExcelHelper.write(type, headers, rows);
    }

    /** Cột theo từng báo cáo - giữ đúng thứ tự cột file Excel bản gốc (bản HAE). */
    private static List<Col> columns(String type) {
        Col counts = new Col("edu.trainreport.KECHENGSHULIANG.a", false, EduTrainReportRow::getCounts);
        Col times = new Col("edu.trainreport.KECHENGCISHU.a", false, EduTrainReportRow::getCounts);
        Col form = new Col("hrm.empinfo.Training_form", false, EduTrainReportRow::getTrainFormName);
        Col numb = new Col("edu.planManager.PEIXUNRENSHU.a", false, EduTrainReportRow::getNumb);
        Col avgCounts = new Col("edu.trainreport.RENJUNPEIXUNCISHU.a", false, EduTrainReportRow::getAvgCounts);
        Col allTime = new Col("edu.trainreport.ZONGPEIXUNSHIJIAN.a", true, EduTrainReportRow::getAllTime);
        Col totalPt = new Col("edu.trainreport.PEIXUNSHIJIANRENYUAN.a", true, EduTrainReportRow::getTotalPt);
        Col avgTime = new Col("edu.trainreport.RENJUNPEIXUNSHIJIAN.a", true, EduTrainReportRow::getAvgTime);
        Col direct = new Col("edu.trainCostMANAGER.ZHIJIEJINGFEI.a", false, EduTrainReportRow::getDirectCost);
        Col indirect = new Col("edu.trainCostMANAGER.JIANJIEJINGFEI.a", false, EduTrainReportRow::getIndirectCost);
        Col allCost = new Col("edu.trainreport.ZONGPEIXUNFEIYONG.a", false, EduTrainReportRow::getAllCost);
        Col avgCost = new Col("edu.trainreport.RENJUNPEIXUNFEIYONG.a", false, EduTrainReportRow::getAvgCost);
        switch (type) {
            case TYPE_COURSE:
                return Arrays.asList(
                        new Col("edu.trainreport.KECHENGQUFEN.a", false, EduTrainReportRow::getTrainDiffName),
                        new Col("edu.trainreport.KECHENGLEIBIE.a", false, EduTrainReportRow::getTrainTypeName),
                        new Col("empsubject.subjectNm", false, EduTrainReportRow::getCourseNameCode),
                        times, form, numb,
                        new Col("liang.hr.viewTraining.title.TRAINING_TIME", true, EduTrainReportRow::getAllTime),
                        totalPt, avgTime, direct, indirect, allCost, avgCost);
            case TYPE_POST_GRADE:
                return Arrays.asList(new Col("pa.insurance.title.postGrade", false, EduTrainReportRow::getGroupName),
                        form, counts, times, numb, allTime,
                        new Col("edu.trainreport.PEIXUNSHIJIANRENSHU.a", true, EduTrainReportRow::getTotalPt),
                        avgTime, direct, indirect, allCost, avgCost);
            case TYPE_DEPT:
                return Arrays.asList(new Col("ar.attendanceView.viewNoSwipingCard.deptName", false, EduTrainReportRow::getGroupName),
                        form, counts, times, numb, allTime,
                        new Col("edu.trainreport.PEIXUNSHIJIANRENSHU.a", true, EduTrainReportRow::getTotalPt),
                        avgTime, direct, indirect, allCost, avgCost);
            case TYPE_YEAR:
                return Arrays.asList(new Col("pa.salary.canShu.nianDu", false, EduTrainReportRow::getGroupName),
                        counts, times, form, numb, avgCounts, allTime, totalPt, avgTime, allCost, direct, indirect, avgCost);
            case TYPE_MONTH:
                return Arrays.asList(new Col("ar.excelexport.title.month", false, EduTrainReportRow::getGroupName),
                        counts, times, numb, form, avgCounts, allTime, totalPt, avgTime, direct, indirect, allCost, avgCost);
            default:
                return Arrays.asList(new Col("edu.trainreport.KECHENGXINGSHI.a", false, EduTrainReportRow::getGroupName),
                        counts, times, numb, avgCounts, allTime, totalPt, avgTime, allCost, direct, indirect, avgCost);
        }
    }

    private static EduTrainReportQuery normalize(EduTrainReportQuery query) {
        EduTrainReportQuery q = query == null ? new EduTrainReportQuery() : query;
        q.setTrainDiffCode(trimToNull(q.getTrainDiffCode()));
        q.setTrainTypeCode(trimToNull(q.getTrainTypeCode()));
        q.setCourseName(trimToNull(q.getCourseName()));
        q.setPostGradeName(trimToNull(q.getPostGradeName()));
        q.setDeptNo(trimToNull(q.getDeptNo()));
        q.setYear(trimToNull(q.getYear()));
        q.setMonth(trimToNull(q.getMonth()));
        q.setTrainFormCode(trimToNull(q.getTrainFormCode()));
        return q;
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
