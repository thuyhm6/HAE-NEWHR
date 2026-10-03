package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduCourseManager;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Service Quản lý khóa học (EDU_COURSE_MANAGER).
 */
public interface EduCourseManagerService {

    /** Trùng tên khóa học (unique key UK_EDU_COURSE_MANAGER bản gốc). */
    String ERR_DUPLICATE = "EDU_COURSE_MANAGER_DUPLICATE";
    String ERR_NOT_FOUND = "EDU_COURSE_MANAGER_NOT_FOUND";
    String ERR_SYSTEM_NOT_FOUND = "EDU_SYSTEM_MANAGER_NOT_FOUND";

    List<EduCourseManager> findList(String trainDiffCode, String trainTypeCode, String courseName);

    EduCourseManager getDetail(String courseNo);

    /** Thêm mới, tự sinh COURSE_NUMBER. Trả về mã khóa học đã sinh. */
    String add(EduCourseManager entity) throws BusinessException;

    /** Sửa tên + ghi chú, đồng bộ tên sang Kế hoạch đào tạo / Thông tin cơ bản. */
    void update(EduCourseManager entity) throws BusinessException;
}
