package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduCourseSubject;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Service Môn học đào tạo (EDU_TRAIN_SUBJECT).
 */
public interface EduCourseSubjectService {

    /** Trùng mã môn học (bản gốc: alert.message.add_fail_repart). */
    String ERR_DUPLICATE = "EDU_COURSE_SUBJECT_DUPLICATE";
    String ERR_NOT_FOUND = "EDU_COURSE_SUBJECT_NOT_FOUND";

    List<EduCourseSubject> findList(String subjectNo, String subjectName, String mainBusiness);

    EduCourseSubject getDetail(String subjectId);

    void add(EduCourseSubject entity) throws BusinessException;

    void update(EduCourseSubject entity) throws BusinessException;

    void delete(String subjectId) throws BusinessException;
}
