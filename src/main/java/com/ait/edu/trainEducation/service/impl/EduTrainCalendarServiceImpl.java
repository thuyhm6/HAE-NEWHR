package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduTrainCalendarMapper;
import com.ait.edu.trainEducation.model.EduCalendarDetail;
import com.ait.edu.trainEducation.model.EduCalendarItem;
import com.ait.edu.trainEducation.model.EduPlanManager;
import com.ait.edu.trainEducation.service.EduPlanManagerService;
import com.ait.edu.trainEducation.service.EduTrainCalendarService;
import com.ait.edu.trainEducation.util.EduCurrentUser;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EduTrainCalendarServiceImpl implements EduTrainCalendarService {
    private static final Logger log = LoggerFactory.getLogger(EduTrainCalendarServiceImpl.class);

    @Autowired
    private EduTrainCalendarMapper eduTrainCalendarMapper;

    /** Tái sử dụng chi tiết kế hoạch + lịch học của màn Kế hoạch đào tạo. */
    @Autowired
    private EduPlanManagerService eduPlanManagerService;

    @Override
    @Transactional(readOnly = true)
    public List<EduCalendarItem> findMonthItems(int year, int month) throws BusinessException {
        log.info("Lay lich dao tao theo thang, year={}, month={}", year, month);
        return queryMonth(year, month, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduCalendarItem> findPersonalMonthItems(int year, int month) throws BusinessException {
        String empid = EduCurrentUser.empid();
        log.info("Lay lich dao tao ca nhan, year={}, month={}, empid={}", year, month, empid);
        if (empid == null || empid.isEmpty()) {
            throw new BusinessException(ERR_NO_EMPLOYEE, "Tài khoản đăng nhập không gắn với nhân viên.");
        }
        return queryMonth(year, month, empid);
    }

    private List<EduCalendarItem> queryMonth(int year, int month, String empid) throws BusinessException {
        if (year < 1900 || year > 9999 || month < 1 || month > 12) {
            throw new BusinessException(ERR_INVALID_MONTH, "Tháng/năm không hợp lệ.");
        }
        try {
            return eduTrainCalendarMapper.findMonthItems(String.format("%04d%02d", year, month), empid);
        } catch (Exception e) {
            log.error("Loi khi lay lich dao tao, year={}, month={}, empid={}", year, month, empid, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduCalendarDetail getDetail(String planNo) throws BusinessException {
        log.info("Lay chi tiet lich dao tao, planNo={}", planNo);
        try {
            EduPlanManager plan = eduPlanManagerService.getDetail(planNo);
            if (plan == null) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy kế hoạch đào tạo.");
            }
            EduCalendarDetail detail = eduTrainCalendarMapper.findPlanFlags(planNo);
            if (detail == null) {
                detail = new EduCalendarDetail();
            }
            detail.setPlan(plan);
            detail.setSyllabus(eduPlanManagerService.findSyllabus(planNo));
            return detail;
        } catch (BusinessException e) {
            log.warn("Lay chi tiet lich dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet lich dao tao, planNo={}", planNo, e);
            throw e;
        }
    }
}
