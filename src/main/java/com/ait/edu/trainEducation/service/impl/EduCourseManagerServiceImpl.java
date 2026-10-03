package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduCourseManagerMapper;
import com.ait.edu.trainEducation.mapper.EduSystemManagerMapper;
import com.ait.edu.trainEducation.model.EduCourseManager;
import com.ait.edu.trainEducation.model.EduSystemManager;
import com.ait.edu.trainEducation.service.EduCourseManagerService;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EduCourseManagerServiceImpl implements EduCourseManagerService {
    private static final Logger log = LoggerFactory.getLogger(EduCourseManagerServiceImpl.class);

    /** Số chữ số của phần thứ tự trong COURSE_NUMBER (VD: SVP000001-0001). */
    private static final int COURSE_SEQ_DIGITS = 4;

    @Autowired
    private EduCourseManagerMapper eduCourseManagerMapper;

    @Autowired
    private EduSystemManagerMapper eduSystemManagerMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduCourseManager> findList(String trainDiffCode, String trainTypeCode, String courseName) {
        log.info("Tim danh sach khoa hoc, trainDiffCode={}, trainTypeCode={}, courseName={}",
                trainDiffCode, trainTypeCode, courseName);
        try {
            return eduCourseManagerMapper.findList(trainDiffCode, trainTypeCode, trimToNull(courseName));
        } catch (Exception e) {
            log.error("Loi khi tim danh sach khoa hoc", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduCourseManager getDetail(String courseNo) {
        log.info("Lay chi tiet khoa hoc, courseNo={}", courseNo);
        try {
            return eduCourseManagerMapper.findByCourseNo(courseNo);
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet khoa hoc, courseNo={}", courseNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String add(EduCourseManager entity) throws BusinessException {
        log.info("Them moi khoa hoc, sysmanaNo={}, courseName={}", entity.getSysmanaNo(), entity.getCourseNameCode());
        try {
            EduSystemManager system = entity.getSysmanaNo() == null ? null
                    : eduSystemManagerMapper.findBySysmanaNo(entity.getSysmanaNo());
            if (system == null) {
                throw new BusinessException(ERR_SYSTEM_NOT_FOUND, "Vui lòng chọn Loại hình.");
            }
            entity.setTrainTypeCode(system.getTrainTypeCode());
            entity.setTrainTypeNo(system.getTrainTypeNo());
            entity.setCourseNameCode(entity.getCourseNameCode().trim());
            entity.setRemark(trimToNull(entity.getRemark()));
            entity.setCourseNumber(buildNextCourseNumber(system.getTrainTypeNo(), system.getTrainTypeCode()));
            eduCourseManagerMapper.insert(entity);
            log.info("Them moi khoa hoc thanh cong, courseNumber={}", entity.getCourseNumber());
            return entity.getCourseNumber();
        } catch (DuplicateKeyException e) {
            log.warn("Trung ten khoa hoc: {}", entity.getCourseNameCode());
            throw new BusinessException(ERR_DUPLICATE, "Tên khóa học không được trùng lặp!", e);
        } catch (BusinessException e) {
            log.warn("Them moi khoa hoc that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi them moi khoa hoc", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduCourseManager entity) throws BusinessException {
        log.info("Cap nhat khoa hoc, courseNo={}", entity.getCourseNo());
        try {
            entity.setCourseNameCode(entity.getCourseNameCode().trim());
            entity.setRemark(trimToNull(entity.getRemark()));
            if (eduCourseManagerMapper.update(entity) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
            // Đồng bộ tên khóa học sang Kế hoạch đào tạo và Thông tin cơ bản như bản gốc
            eduCourseManagerMapper.updatePlanCourseName(entity.getCourseNo(), entity.getCourseNameCode());
            eduCourseManagerMapper.updateBasicInfoCourseName(entity.getCourseNo(), entity.getCourseNameCode());
        } catch (DuplicateKeyException e) {
            log.warn("Trung ten khoa hoc khi cap nhat: {}", entity.getCourseNameCode());
            throw new BusinessException(ERR_DUPLICATE, "Tên khóa học không được trùng lặp!", e);
        } catch (BusinessException e) {
            log.warn("Cap nhat khoa hoc that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat khoa hoc, courseNo={}", entity.getCourseNo(), e);
            throw e;
        }
    }

    /** COURSE_NUMBER = TRAIN_TYPE_NO + "-" + (4 chữ số cuối của MAX(COURSE_NUMBER) + 1). */
    private String buildNextCourseNumber(String trainTypeNo, String trainTypeCode) {
        String maxNo = eduCourseManagerMapper.findMaxCourseNumber(trainTypeCode);
        int next = 1;
        if (maxNo != null && maxNo.length() >= COURSE_SEQ_DIGITS) {
            String tail = maxNo.substring(maxNo.length() - COURSE_SEQ_DIGITS);
            if (tail.matches("\\d+")) {
                next = Integer.parseInt(tail) + 1;
            }
        }
        return trainTypeNo + "-" + String.format("%0" + COURSE_SEQ_DIGITS + "d", next);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
