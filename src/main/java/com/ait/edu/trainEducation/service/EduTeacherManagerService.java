package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduTeacherManager;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Service Quản lý giảng viên (EDU_TEACHER_MANAGER).
 */
public interface EduTeacherManagerService {

    String ERR_NOT_FOUND = "EDU_TEACHER_MANAGER_NOT_FOUND";
    /** Chưa chọn nhân viên / chưa nhập tên (bản gốc: "请先选择人员,再进行添加!"). */
    String ERR_NO_PERSON = "EDU_TEACHER_MANAGER_NO_PERSON";

    List<EduTeacherManager> findList(String keyword, String teachFieldCode, String teachLevelCode, String teachStatusCode);

    EduTeacherManager getDetail(String teacherNo);

    void add(EduTeacherManager entity) throws BusinessException;

    void update(EduTeacherManager entity) throws BusinessException;

    void delete(String teacherNo) throws BusinessException;
}
