package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduPlanManager;
import com.ait.edu.trainEducation.model.EduTrainSyllabus;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho EDU_PLAN_MANAGER (Kế hoạch đào tạo) + EDU_TRAIN_SYLLABUS (Lịch học)
 * + các bảng liên quan cần xóa dây chuyền khi xóa kế hoạch.
 */
@Mapper
public interface EduPlanManagerMapper {

    List<EduPlanManager> findList(@Param("trainDiffCode") String trainDiffCode,
            @Param("trainTypeCode") String trainTypeCode,
            @Param("courseName") String courseName);

    EduPlanManager findByPlanNo(@Param("planNo") String planNo);

    String nextPlanNo();

    /** MAX(PERIOD_TIME) theo mã khóa học - sinh "Kỳ thứ" kế tiếp. */
    String findMaxPeriodTime(@Param("courseNumber") String courseNumber);

    int insert(EduPlanManager entity);

    int update(EduPlanManager entity);

    /** Đồng bộ ngày/hình thức/địa điểm sang EDU_BASIC_INFORMATION (updateBasicInformation bản gốc). */
    int updateBasicInformation(EduPlanManager entity);

    int softDelete(@Param("planNo") String planNo);

    // ===== Lịch học =====
    List<EduTrainSyllabus> findSyllabus(@Param("planNo") String planNo);

    int deleteSyllabusByNo(@Param("syllNo") String syllNo);

    int deleteSyllabusByPlan(@Param("planNo") String planNo);

    int insertSyllabus(EduTrainSyllabus syllabus);

    // ===== Xóa dây chuyền theo BASIC_NO (deletePlanManager bản gốc) =====
    List<String> findBasicNosByPlan(@Param("planNo") String planNo);

    int softDeleteBasicInformation(@Param("basicNo") String basicNo);

    int deleteFreeEmployee(@Param("basicNo") String basicNo);

    int deleteStudentCheck(@Param("basicNo") String basicNo);

    int deleteTeacherCheck(@Param("basicNo") String basicNo);

    int deleteTrainResult(@Param("basicNo") String basicNo);

    int deleteCostManager(@Param("basicNo") String basicNo);

    int deleteFinalStudent(@Param("basicNo") String basicNo);

    int deleteTrainMakerByBasicNo(@Param("basicNo") String basicNo);

    int deleteStudentApply(@Param("basicNo") String basicNo);
}
