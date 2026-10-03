package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduEvalCourse;
import com.ait.edu.trainEducation.model.EduTeacherCheck;
import com.ait.edu.trainEducation.model.EduTrainResult;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper các màn đánh giá đào tạo: Đánh giá học viên (EDU_FREE_EMPLOYEE.EVA_RESULT),
 * Đánh giá giảng viên (EDU_TEACHER_CHECK), Kết quả đào tạo (EDU_TRAIN_RESULT).
 */
@Mapper
public interface EduEvaluateMapper {

    /**
     * Danh sách khóa cần đánh giá.
     *
     * @param evalType  '1' học viên / '2' giảng viên / '3' kết quả (EDU_PLAN_MANAGER.ISNOT_EVALUATE)
     * @param restrict  EVA_TEACHER: chỉ khóa có người đăng nhập là giảng viên đánh giá;
     *                  STUDENT: chỉ khóa có người đăng nhập là học viên; null: không giới hạn
     */
    List<EduEvalCourse> findCourses(@Param("evalType") String evalType,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("restrict") String restrict,
            @Param("empid") String empid,
            @Param("personId") String personId);

    // ===== Đánh giá học viên =====
    int updateEvaResult(@Param("basicNo") String basicNo, @Param("freeNo") String freeNo,
            @Param("evaResult") String evaResult);

    int updateEvaResultByEmpid(@Param("basicNo") String basicNo, @Param("empid") String empid,
            @Param("evaResult") String evaResult);

    // ===== Đánh giá giảng viên =====
    List<EduTeacherCheck> findTeacherChecks(@Param("basicNo") String basicNo, @Param("teaEmpid") String teaEmpid);

    int updateGrooming(@Param("basicNo") String basicNo, @Param("teaEmpid") String teaEmpid,
            @Param("stuEmpid") String stuEmpid, @Param("grooming") String grooming);

    // ===== Kết quả đào tạo =====
    List<EduTrainResult> findTrainResults(@Param("basicNo") String basicNo, @Param("onlyEvaluated") boolean onlyEvaluated);

    int updateTrainResultScores(EduTrainResult result);
}
