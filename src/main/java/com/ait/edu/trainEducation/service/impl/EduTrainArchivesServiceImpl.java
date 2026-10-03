package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduTrainArchivesMapper;
import com.ait.edu.trainEducation.model.EduFile;
import com.ait.edu.trainEducation.model.EduTrainArchive;
import com.ait.edu.trainEducation.model.EduTrainArchiveQuery;
import com.ait.edu.trainEducation.service.EduCommonService;
import com.ait.edu.trainEducation.service.EduTrainArchivesService;
import com.ait.edu.trainEducation.util.EduExcelHelper;
import com.ait.exception.BusinessException;
import com.ait.util.I18nUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class EduTrainArchivesServiceImpl implements EduTrainArchivesService {
    private static final Logger log = LoggerFactory.getLogger(EduTrainArchivesServiceImpl.class);

    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /** Mốc chuyển dữ liệu: trước ngày này đọc từ EDU_TRAIN_BASIC_HISTORY (giữ nguyên bản gốc). */
    private static final LocalDate HISTORY_DATE = LocalDate.of(2015, 8, 7);

    @Autowired
    private EduTrainArchivesMapper eduTrainArchivesMapper;

    @Autowired
    private EduCommonService eduCommonService;

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainArchive> findList(EduTrainArchiveQuery query) throws BusinessException {
        EduTrainArchiveQuery q = normalize(query);
        log.info("Tim ho so dao tao, query={}", q);
        try {
            LocalDate from = parse(q.getStartDate());
            LocalDate to = parse(q.getEndDate());
            // Chọn nguồn dữ liệu theo mốc HISTORY_DATE (trainArchives service bản gốc)
            boolean useCurrent = to.isAfter(HISTORY_DATE);
            boolean useHistory = !from.isAfter(HISTORY_DATE);

            List<EduTrainArchive> result = new ArrayList<>();
            if (useCurrent) {
                List<EduTrainArchive> current = eduTrainArchivesMapper.findList(q);
                attachFiles(current);
                result.addAll(current);
            }
            if (useHistory) {
                result.addAll(findHistory(q));
            }
            return result;
        } catch (BusinessException e) {
            log.warn("Tim ho so dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi tim ho so dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] export(EduTrainArchiveQuery query) throws BusinessException, IOException {
        log.info("Xuat Excel ho so dao tao");
        List<String> headers = Arrays.asList(label("ar.viewcycle.title.xuhao"), label("inct.salesman.empNo"),
                label("pa.title.message.empHrmName"), label("empsubject.sexName"), label("hrm.empinfo.ORG_NAME_LOCAL"),
                label("hrm.contract.Rank"), label("ess.empInfo.date_of_agency"),
                label("edu.trainArchives.KECHENGMINGCHENGQICI.a"), label("edu.planManager.PEIXUNNEIRONG.a"),
                label("edu.trainArchives.SHISHIQIJIAN.a"), label("edu.planManager.PEIXUNKESHI.a"),
                label("edu.planManager.ZHUGUANBUMEN.a"), label("empsubject.eduRm"),
                label("edu.trainArchives.ZONGHECHENGJI.a"), label("edu.trainArchives.PEIXUNFEI.a"),
                label("edu.trainArchives.BAOGAOSHU.a"));
        List<List<Object>> rows = new ArrayList<>();
        int idx = 1;
        for (EduTrainArchive a : findList(query)) {
            String files = a.getFiles() == null ? ""
                    : a.getFiles().stream().map(EduFile::getFileName).collect(Collectors.joining(", "));
            rows.add(Arrays.<Object>asList(idx++, a.getEmpid(), a.getLocalName(), a.getSexName(), a.getDeptName(),
                    a.getPostGradeName(), a.getDateStarted(), courseLabel(a), a.getTrainContent(), period(a),
                    classHour(a), a.getDepartManaName(), a.getTrainAddress(), a.getEvaResult(), a.getAllCost(), files));
        }
        return EduExcelHelper.write("trainArchives", headers, rows);
    }

    /**
     * Bảng EDU_TRAIN_BASIC_HISTORY chỉ có ở DB cũ - nếu lỗi (không tồn tại bảng...) thì
     * bỏ qua phần dữ liệu cũ, vẫn trả dữ liệu hiện hành.
     */
    private List<EduTrainArchive> findHistory(EduTrainArchiveQuery q) {
        try {
            List<EduTrainArchive> list = eduTrainArchivesMapper.findHistory(q);
            list.forEach(a -> a.setHistory(true));
            return list;
        } catch (Exception e) {
            log.warn("Khong doc duoc du lieu dao tao cu (EDU_TRAIN_BASIC_HISTORY): {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /** File báo cáo của học viên (APPLY_TYPE eduTrainResult, APPLY_NO = RESULT_NO - giống bản gốc). */
    private void attachFiles(List<EduTrainArchive> list) {
        List<String> resultNos = list.stream().map(EduTrainArchive::getResultNo).filter(Objects::nonNull)
                .distinct().collect(Collectors.toList());
        if (resultNos.isEmpty()) {
            return;
        }
        Map<String, List<EduFile>> files = eduCommonService.getFilesGrouped(EduCommonService.FILE_TYPE_RESULT, resultNos);
        list.forEach(a -> a.setFiles(a.getResultNo() == null ? null : files.get(a.getResultNo())));
    }

    /** Ngày rỗng -> mặc định đầu/cuối tháng hiện tại (giống bản gốc). */
    private static EduTrainArchiveQuery normalize(EduTrainArchiveQuery query) {
        EduTrainArchiveQuery q = query == null ? new EduTrainArchiveQuery() : query;
        LocalDate today = LocalDate.now();
        q.setKeyword(trimToNull(q.getKeyword()));
        q.setDeptNo(trimToNull(q.getDeptNo()));
        q.setCourseName(trimToNull(q.getCourseName()));
        q.setTrainContent(trimToNull(q.getTrainContent()));
        if (trimToNull(q.getStartDate()) == null) {
            q.setStartDate(today.withDayOfMonth(1).format(DMY));
        }
        if (trimToNull(q.getEndDate()) == null) {
            q.setEndDate(today.withDayOfMonth(today.lengthOfMonth()).format(DMY));
        }
        return q;
    }

    private static LocalDate parse(String value) throws BusinessException {
        try {
            return LocalDate.parse(value.trim(), DMY);
        } catch (DateTimeParseException e) {
            throw new BusinessException(ERR_INVALID_DATE, "Ngày không hợp lệ (DD/MM/YYYY): " + value);
        }
    }

    private static String courseLabel(EduTrainArchive a) {
        String period = a.getPeriodTime() == null ? ""
                : " (" + I18nUtil.getMessage("edu.planManager.periodLabel", new Object[] { a.getPeriodTime() }) + ")";
        return (a.getCourseNameCode() == null ? "" : a.getCourseNameCode()) + period;
    }

    private static String period(EduTrainArchive a) {
        return (a.getImpleStartDate() == null ? "" : a.getImpleStartDate()) + "~"
                + (a.getImpleEndDate() == null ? "" : a.getImpleEndDate());
    }

    private static String classHour(EduTrainArchive a) {
        if (a.getImpleClassHour() == null) {
            return "";
        }
        String unit;
        switch (a.getImpleClassUnit() == null ? "" : a.getImpleClassUnit()) {
            case "0":
                unit = label("display.mutual.month");
                break;
            case "1":
                unit = label("ar.viewsummaryparameteritem.title.day");
                break;
            case "2":
                unit = label("ar.viewsummaryparameteritem.title.hour");
                break;
            default:
                unit = "";
        }
        return (a.getImpleClassHour() + " " + unit).trim();
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
