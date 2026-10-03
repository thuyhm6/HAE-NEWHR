package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduCourseManager;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng EDU_COURSE_MANAGER (Quản lý khóa học).
 */
@Mapper
public interface EduCourseManagerMapper {

    List<EduCourseManager> findList(@Param("trainDiffCode") String trainDiffCode,
            @Param("trainTypeCode") String trainTypeCode,
            @Param("courseName") String courseName);

    EduCourseManager findByCourseNo(@Param("courseNo") String courseNo);

    /** MAX(COURSE_NUMBER) đang hoạt động theo Loại hình - dùng sinh mã khóa học kế tiếp. */
    String findMaxCourseNumber(@Param("trainTypeCode") String trainTypeCode);

    int insert(EduCourseManager entity);

    int update(EduCourseManager entity);

    /** Đồng bộ tên khóa học sang EDU_PLAN_MANAGER (giống updatePlanManager_course bản gốc). */
    int updatePlanCourseName(@Param("courseNo") String courseNo, @Param("courseNameCode") String courseNameCode);

    /** Đồng bộ tên khóa học sang EDU_BASIC_INFORMATION (giống updateBasicInformation_course bản gốc). */
    int updateBasicInfoCourseName(@Param("courseNo") String courseNo, @Param("courseNameCode") String courseNameCode);
}
