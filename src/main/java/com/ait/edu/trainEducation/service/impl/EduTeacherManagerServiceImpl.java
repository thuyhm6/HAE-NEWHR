package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduCommonMapper;
import com.ait.edu.trainEducation.mapper.EduTeacherManagerMapper;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduTeacherManager;
import com.ait.edu.trainEducation.service.EduTeacherManagerService;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EduTeacherManagerServiceImpl implements EduTeacherManagerService {
    private static final Logger log = LoggerFactory.getLogger(EduTeacherManagerServiceImpl.class);

    @Autowired
    private EduTeacherManagerMapper eduTeacherManagerMapper;

    @Autowired
    private EduCommonMapper eduCommonMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduTeacherManager> findList(String keyword, String teachFieldCode, String teachLevelCode,
            String teachStatusCode) {
        log.info("Tim danh sach giang vien, keyword={}, field={}, level={}, status={}",
                keyword, teachFieldCode, teachLevelCode, teachStatusCode);
        try {
            return eduTeacherManagerMapper.findList(trimToNull(keyword), teachFieldCode, teachLevelCode, teachStatusCode);
        } catch (Exception e) {
            log.error("Loi khi tim danh sach giang vien", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduTeacherManager getDetail(String teacherNo) {
        log.info("Lay chi tiet giang vien, teacherNo={}", teacherNo);
        try {
            return eduTeacherManagerMapper.findByTeacherNo(teacherNo);
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet giang vien, teacherNo={}", teacherNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(EduTeacherManager entity) throws BusinessException {
        log.info("Them moi giang vien, external={}, empid={}", entity.getExternal(), entity.getEmpid());
        try {
            if (Boolean.TRUE.equals(entity.getExternal())) {
                // Giảng viên bên ngoài: chỉ nhập tên, mã sinh từ sequence
                if (trimToNull(entity.getTeacherName()) == null) {
                    throw new BusinessException(ERR_NO_PERSON, "Vui lòng chọn nhân viên trước khi thêm!");
                }
                entity.setTeacherName(entity.getTeacherName().trim());
                entity.setPersonId(null);
                entity.setEmpid(eduTeacherManagerMapper.nextExternalEmpid());
            } else {
                // Giảng viên nội bộ: lấy lại thông tin từ HR_EMPLOYEE để tránh dữ liệu client sai lệch
                EduEmployeeLookup emp = trimToNull(entity.getEmpid()) == null ? null
                        : eduCommonMapper.findEmployeeByEmpid(entity.getEmpid().trim());
                if (emp == null) {
                    throw new BusinessException(ERR_NO_PERSON, "Vui lòng chọn nhân viên trước khi thêm!");
                }
                entity.setEmpid(emp.getEmpid());
                entity.setPersonId(emp.getPersonId());
                entity.setTeacherName(emp.getLocalName());
            }
            // Kinh nghiệm = năm * 12 + tháng (BUSINESS_ACT_TIME bản gốc)
            int year = entity.getBusinessYear() == null ? 0 : Math.max(entity.getBusinessYear(), 0);
            int month = entity.getBusinessMonth() == null ? 0 : Math.max(entity.getBusinessMonth(), 0);
            entity.setBusinessActTime(String.valueOf(year * 12 + month));
            entity.setRemark(trimToNull(entity.getRemark()));
            entity.setTeacherNo(eduTeacherManagerMapper.nextTeacherNo());
            eduTeacherManagerMapper.insert(entity);
            log.info("Them moi giang vien thanh cong, teacherNo={}", entity.getTeacherNo());
        } catch (BusinessException e) {
            log.warn("Them moi giang vien that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi them moi giang vien", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduTeacherManager entity) throws BusinessException {
        log.info("Cap nhat giang vien, teacherNo={}", entity.getTeacherNo());
        try {
            entity.setRemark(trimToNull(entity.getRemark()));
            if (eduTeacherManagerMapper.update(entity) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
        } catch (BusinessException e) {
            log.warn("Cap nhat giang vien that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat giang vien, teacherNo={}", entity.getTeacherNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String teacherNo) throws BusinessException {
        log.info("Xoa giang vien, teacherNo={}", teacherNo);
        try {
            if (eduTeacherManagerMapper.softDelete(teacherNo) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
        } catch (BusinessException e) {
            log.warn("Xoa giang vien that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa giang vien, teacherNo={}", teacherNo, e);
            throw e;
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
