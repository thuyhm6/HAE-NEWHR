package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduCourseSubjectMapper;
import com.ait.edu.trainEducation.model.EduCourseSubject;
import com.ait.edu.trainEducation.service.EduCourseSubjectService;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EduCourseSubjectServiceImpl implements EduCourseSubjectService {
    private static final Logger log = LoggerFactory.getLogger(EduCourseSubjectServiceImpl.class);

    @Autowired
    private EduCourseSubjectMapper eduCourseSubjectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduCourseSubject> findList(String subjectNo, String subjectName, String mainBusiness) {
        log.info("Tim danh sach mon hoc, subjectNo={}, subjectName={}, mainBusiness={}", subjectNo, subjectName, mainBusiness);
        try {
            return eduCourseSubjectMapper.findList(trimToNull(subjectNo), trimToNull(subjectName), trimToNull(mainBusiness));
        } catch (Exception e) {
            log.error("Loi khi tim danh sach mon hoc", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduCourseSubject getDetail(String subjectId) {
        log.info("Lay chi tiet mon hoc, subjectId={}", subjectId);
        try {
            return eduCourseSubjectMapper.findById(subjectId);
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet mon hoc, subjectId={}", subjectId, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(EduCourseSubject entity) throws BusinessException {
        log.info("Them moi mon hoc, subjectNo={}", entity.getSubjectNo());
        try {
            normalize(entity);
            if (eduCourseSubjectMapper.countBySubjectNo(entity.getSubjectNo(), null) > 0) {
                throw new BusinessException(ERR_DUPLICATE, "Mã môn học đã tồn tại.");
            }
            eduCourseSubjectMapper.insert(entity);
        } catch (BusinessException e) {
            log.warn("Them moi mon hoc that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi them moi mon hoc", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduCourseSubject entity) throws BusinessException {
        log.info("Cap nhat mon hoc, subjectId={}", entity.getSubjectId());
        try {
            normalize(entity);
            if (eduCourseSubjectMapper.countBySubjectNo(entity.getSubjectNo(), entity.getSubjectId()) > 0) {
                throw new BusinessException(ERR_DUPLICATE, "Mã môn học đã tồn tại.");
            }
            if (eduCourseSubjectMapper.update(entity) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
        } catch (BusinessException e) {
            log.warn("Cap nhat mon hoc that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat mon hoc, subjectId={}", entity.getSubjectId(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String subjectId) throws BusinessException {
        log.info("Xoa mon hoc, subjectId={}", subjectId);
        try {
            if (eduCourseSubjectMapper.softDelete(subjectId) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
        } catch (BusinessException e) {
            log.warn("Xoa mon hoc that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa mon hoc, subjectId={}", subjectId, e);
            throw e;
        }
    }

    private void normalize(EduCourseSubject entity) {
        entity.setSubjectNo(entity.getSubjectNo().trim());
        entity.setSubjectName(entity.getSubjectName().trim());
        entity.setMainBusiness(trimToNull(entity.getMainBusiness()));
        entity.setMainBusinessName(trimToNull(entity.getMainBusinessName()));
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
