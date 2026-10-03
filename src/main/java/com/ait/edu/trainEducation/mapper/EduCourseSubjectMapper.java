package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduCourseSubject;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng EDU_TRAIN_SUBJECT (Môn học đào tạo).
 */
@Mapper
public interface EduCourseSubjectMapper {

    List<EduCourseSubject> findList(@Param("subjectNo") String subjectNo,
            @Param("subjectName") String subjectName,
            @Param("mainBusiness") String mainBusiness);

    EduCourseSubject findById(@Param("subjectId") String subjectId);

    /** Đếm môn học đang hoạt động trùng mã (loại trừ chính bản ghi đang sửa nếu có). */
    int countBySubjectNo(@Param("subjectNo") String subjectNo, @Param("excludeId") String excludeId);

    int insert(EduCourseSubject entity);

    int update(EduCourseSubject entity);

    int softDelete(@Param("subjectId") String subjectId);
}
