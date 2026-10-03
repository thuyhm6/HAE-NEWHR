package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduCommonMapper;
import com.ait.edu.trainEducation.mapper.EduCourseManagerMapper;
import com.ait.edu.trainEducation.mapper.EduPlanManagerMapper;
import com.ait.edu.trainEducation.model.EduCourseManager;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduPlanManager;
import com.ait.edu.trainEducation.model.EduTrainSyllabus;
import com.ait.edu.trainEducation.service.EduPlanManagerService;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EduPlanManagerServiceImpl implements EduPlanManagerService {
    private static final Logger log = LoggerFactory.getLogger(EduPlanManagerServiceImpl.class);

    /** Số cột của file import lịch học: Tên, Ngày, Giờ bắt đầu, Giờ kết thúc, Địa điểm. */
    private static final int SYLLABUS_COLUMNS = 5;

    @Autowired
    private EduPlanManagerMapper eduPlanManagerMapper;

    @Autowired
    private EduCourseManagerMapper eduCourseManagerMapper;

    @Autowired
    private EduCommonMapper eduCommonMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduPlanManager> findList(String trainDiffCode, String trainTypeCode, String courseName) {
        log.info("Tim danh sach ke hoach dao tao, trainDiffCode={}, trainTypeCode={}, courseName={}",
                trainDiffCode, trainTypeCode, courseName);
        try {
            return eduPlanManagerMapper.findList(trainDiffCode, trainTypeCode, trimToNull(courseName));
        } catch (Exception e) {
            log.error("Loi khi tim danh sach ke hoach dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduPlanManager getDetail(String planNo) {
        log.info("Lay chi tiet ke hoach dao tao, planNo={}", planNo);
        try {
            EduPlanManager plan = eduPlanManagerMapper.findByPlanNo(planNo);
            if (plan != null) {
                // Tách giảng viên giống planManagerInfo bản gốc (queryTeacherName / queryTeacherNameEmpid)
                if (isNotEmpty(plan.getTeacherNameEmpid())) {
                    plan.setTeacherDisplay(plan.getTeacherNameEmpid());
                    plan.setTeacherEmpid(plan.getTeacherName());
                } else {
                    plan.setTeacherDisplay(plan.getTeacherName());
                    plan.setTeacherEmpid(null);
                }
            }
            return plan;
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet ke hoach dao tao, planNo={}", planNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String nextPlanNo() {
        log.info("Sinh PLAN_NO moi");
        try {
            return eduPlanManagerMapper.nextPlanNo();
        } catch (Exception e) {
            log.error("Loi khi sinh PLAN_NO", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(EduPlanManager entity) throws BusinessException {
        log.info("Them moi ke hoach dao tao, planNo={}, courseNo={}", entity.getPlanNo(), entity.getCourseNo());
        try {
            EduCourseManager course = entity.getCourseNo() == null ? null
                    : eduCourseManagerMapper.findByCourseNo(entity.getCourseNo());
            if (course == null) {
                throw new BusinessException(ERR_COURSE_NOT_FOUND, "Vui lòng chọn Khóa học.");
            }
            // Giữ nguyên bản gốc: TRAIN_DIFF_CODE = 4 ký tự đầu của TRAIN_TYPE_NO
            String trainTypeNo = course.getTrainTypeNo() == null ? "" : course.getTrainTypeNo();
            entity.setTrainDiffCode(trainTypeNo.length() > 4 ? trainTypeNo.substring(0, 4) : trainTypeNo);
            entity.setTrainTypeCode(course.getTrainTypeCode());
            entity.setCourseNameCode(course.getCourseNameCode());
            entity.setCourseNumber(course.getCourseNumber());

            String maxPeriod = eduPlanManagerMapper.findMaxPeriodTime(course.getCourseNumber());
            entity.setPeriodTime(isNotEmpty(maxPeriod) ? String.valueOf(Integer.parseInt(maxPeriod) + 1) : "1");

            // Bản gốc: không chỉ định nhân viên thì lấy toàn bộ NV của các phòng ban chỉ định
            if (!isNotEmpty(entity.getDesEmployee()) && isNotEmpty(entity.getDesDepartment())) {
                List<String> deptNos = Arrays.stream(entity.getDesDepartment().split(","))
                        .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
                List<EduEmployeeLookup> emps = deptNos.isEmpty() ? Collections.emptyList()
                        : eduCommonMapper.findEmployees(null, deptNos, null, "L");
                entity.setDesEmployee(emps.stream().map(EduEmployeeLookup::getEmpid).collect(Collectors.joining(",")));
                entity.setDesEmployeeName(emps.stream().map(EduEmployeeLookup::getLocalName).collect(Collectors.joining(",")));
            }
            normalize(entity);
            eduPlanManagerMapper.insert(entity);
            log.info("Them moi ke hoach dao tao thanh cong, planNo={}, periodTime={}", entity.getPlanNo(), entity.getPeriodTime());
        } catch (BusinessException e) {
            log.warn("Them moi ke hoach dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi them moi ke hoach dao tao, planNo={}", entity.getPlanNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduPlanManager entity) throws BusinessException {
        log.info("Cap nhat ke hoach dao tao, planNo={}", entity.getPlanNo());
        try {
            normalize(entity);
            if (eduPlanManagerMapper.update(entity) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
            // Đồng bộ ngày thực hiện / hình thức / địa điểm sang Thông tin cơ bản như bản gốc
            eduPlanManagerMapper.updateBasicInformation(entity);
        } catch (BusinessException e) {
            log.warn("Cap nhat ke hoach dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat ke hoach dao tao, planNo={}", entity.getPlanNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String planNo) throws BusinessException {
        log.info("Xoa ke hoach dao tao, planNo={}", planNo);
        try {
            eduPlanManagerMapper.deleteSyllabusByPlan(planNo);
            if (eduPlanManagerMapper.softDelete(planNo) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
            // Xóa toàn bộ dữ liệu đào tạo phát sinh từ kế hoạch (giống deletePlanManager bản gốc)
            for (String basicNo : eduPlanManagerMapper.findBasicNosByPlan(planNo)) {
                if (!isNotEmpty(basicNo)) {
                    continue;
                }
                log.info("Xoa du lieu dao tao theo basicNo={}", basicNo);
                eduPlanManagerMapper.softDeleteBasicInformation(basicNo);
                eduPlanManagerMapper.deleteFreeEmployee(basicNo);
                eduPlanManagerMapper.deleteStudentCheck(basicNo);
                eduPlanManagerMapper.deleteTeacherCheck(basicNo);
                eduPlanManagerMapper.deleteTrainResult(basicNo);
                eduPlanManagerMapper.deleteCostManager(basicNo);
                eduPlanManagerMapper.deleteFinalStudent(basicNo);
                eduPlanManagerMapper.deleteTrainMakerByBasicNo(basicNo);
                eduPlanManagerMapper.deleteStudentApply(basicNo);
            }
        } catch (BusinessException e) {
            log.warn("Xoa ke hoach dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa ke hoach dao tao, planNo={}", planNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainSyllabus> findSyllabus(String planNo) {
        log.info("Lay lich hoc, planNo={}", planNo);
        try {
            return eduPlanManagerMapper.findSyllabus(planNo);
        } catch (Exception e) {
            log.error("Loi khi lay lich hoc, planNo={}", planNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSyllabus(String syllNo) throws BusinessException {
        log.info("Xoa lich hoc, syllNo={}", syllNo);
        try {
            if (eduPlanManagerMapper.deleteSyllabusByNo(syllNo) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
        } catch (BusinessException e) {
            log.warn("Xoa lich hoc that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa lich hoc, syllNo={}", syllNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<String> importSyllabus(String planNo, InputStream in) throws IOException, BusinessException {
        log.info("Import lich hoc, planNo={}", planNo);
        if (!isNotEmpty(planNo)) {
            throw new BusinessException(ERR_IMPORT, "Thiếu mã kế hoạch.");
        }
        try {
            List<String[]> rows = EduExcelHelper.read(in, SYLLABUS_COLUMNS);
            List<String> errors = new ArrayList<>();
            if (rows.isEmpty()) {
                errors.add(I18nUtil.getMessage("edu.import.msg.noData"));
                return errors;
            }
            List<EduTrainSyllabus> items = new ArrayList<>();
            for (String[] r : rows) {
                String row = r[0];
                EduTrainSyllabus s = new EduTrainSyllabus();
                s.setPlanNo(planNo);
                s.setCourseNameCode(r[1]);
                s.setCourseDate(r[2]);
                s.setCourseStartDate(EduImportValidator.normalizeTime(r[3]));
                s.setCourseEndDate(EduImportValidator.normalizeTime(r[4]));
                s.setDetailAddress(r[5]);
                EduImportValidator.required(errors, row, s.getCourseNameCode(), "empsubject.subjectNm");
                if (EduImportValidator.required(errors, row, s.getCourseDate(), "edu.planManager.KECHENGRIQI.a")) {
                    EduImportValidator.date(errors, row, s.getCourseDate(), "edu.planManager.KECHENGRIQI.a");
                }
                EduImportValidator.time(errors, row, s.getCourseStartDate(), "ess.infoApply.title.startTime");
                EduImportValidator.time(errors, row, s.getCourseEndDate(), "ess.infoApply.title.endTime");
                items.add(s);
            }
            if (!errors.isEmpty()) {
                log.warn("Import lich hoc co {} loi, planNo={}", errors.size(), planNo);
                return errors;
            }
            // Giống bản gốc: xóa lịch học cũ rồi ghi lại toàn bộ
            eduPlanManagerMapper.deleteSyllabusByPlan(planNo);
            for (EduTrainSyllabus s : items) {
                eduPlanManagerMapper.insertSyllabus(s);
            }
            log.info("Import lich hoc thanh cong {} dong, planNo={}", items.size(), planNo);
            return errors;
        } catch (IOException e) {
            log.error("Loi doc file import lich hoc, planNo={}", planNo, e);
            throw e;
        } catch (Exception e) {
            log.error("Loi khi import lich hoc, planNo={}", planNo, e);
            throw e;
        }
    }

    @Override
    public byte[] buildSyllabusTemplate() throws IOException {
        log.info("Tao file mau import lich hoc");
        try {
            List<String> headers = Arrays.asList(
                    I18nUtil.getMessage("empsubject.subjectNm"),
                    I18nUtil.getMessage("edu.planManager.KECHENGRIQI.a") + " (DD/MM/YYYY)",
                    I18nUtil.getMessage("ess.infoApply.title.startTime") + " (HH:mm)",
                    I18nUtil.getMessage("ess.infoApply.title.endTime") + " (HH:mm)",
                    I18nUtil.getMessage("edu.planManager.XIANGXIDIDIAN.a"));
            List<List<Object>> sample = Collections.singletonList(
                    Arrays.<Object>asList("Training...", "01/01/2018", "08:00", "10:00", "Room"));
            return EduExcelHelper.write("planCourse", headers, sample);
        } catch (IOException e) {
            log.error("Loi khi tao file mau import lich hoc", e);
            throw e;
        }
    }

    /** Chuẩn hóa dữ liệu form trước khi ghi (giảng viên, cờ Y/N, đánh giá). */
    private void normalize(EduPlanManager entity) {
        if (isNotEmpty(entity.getTeacherEmpid())) {
            entity.setTeacherName(entity.getTeacherEmpid());
            entity.setTeacherNameEmpid(trimToNull(entity.getTeacherDisplay()));
        } else {
            entity.setTeacherName(trimToNull(entity.getTeacherDisplay()));
            entity.setTeacherNameEmpid(null);
        }
        entity.setBudgetShow("Y".equals(entity.getBudgetShow()) ? "Y" : "N");
        entity.setIsnotApply("N".equals(entity.getIsnotApply()) ? "N" : "Y");
        if (!isNotEmpty(entity.getIsnotEvaluate())) {
            entity.setIsnotEvaluate("0");
        }
        if (!isNotEmpty(entity.getClassUnit())) {
            entity.setClassUnit("2");
        }
        entity.setTrainAddress(trimToNull(entity.getTrainAddress()));
        entity.setTrainPersonRemark(trimToNull(entity.getTrainPersonRemark()));
    }

    private static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
