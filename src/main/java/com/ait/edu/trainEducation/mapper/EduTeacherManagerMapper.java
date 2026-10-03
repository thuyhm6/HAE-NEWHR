package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduTeacherManager;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng EDU_TEACHER_MANAGER (Quản lý giảng viên).
 */
@Mapper
public interface EduTeacherManagerMapper {

    List<EduTeacherManager> findList(@Param("keyword") String keyword,
            @Param("teachFieldCode") String teachFieldCode,
            @Param("teachLevelCode") String teachLevelCode,
            @Param("teachStatusCode") String teachStatusCode);

    EduTeacherManager findByTeacherNo(@Param("teacherNo") String teacherNo);

    String nextTeacherNo();

    /** Mã giảng viên bên ngoài (querySheWaiEmpid bản gốc). */
    String nextExternalEmpid();

    int insert(EduTeacherManager entity);

    int update(EduTeacherManager entity);

    int softDelete(@Param("teacherNo") String teacherNo);
}
