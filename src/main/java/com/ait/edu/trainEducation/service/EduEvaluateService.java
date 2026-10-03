package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.model.EduEvalCourse;
import com.ait.edu.trainEducation.model.EduFreeEmployee;
import com.ait.edu.trainEducation.model.EduImportResult;
import com.ait.edu.trainEducation.model.EduScoreStat;
import com.ait.edu.trainEducation.model.EduTeacherCheck;
import com.ait.edu.trainEducation.model.EduTrainResult;
import com.ait.exception.BusinessException;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Service 3 màn đánh giá đào tạo: Đánh giá học viên (studentEvaluate), Đánh giá giảng
 * viên (teacherEvaluate), Kết quả đào tạo (trainResult) - port từ Hanwha_HTSV.
 */
public interface EduEvaluateService {

    String TYPE_STUDENT = "1";
    String TYPE_TEACHER = "2";
    String TYPE_RESULT = "3";

    String ERR_NOT_FOUND = "EDU_EVALUATE_NOT_FOUND";
    String ERR_INVALID = "EDU_EVALUATE_INVALID";

    /** Danh sách khóa theo loại đánh giá, đã lọc theo quyền người đăng nhập như bản gốc. */
    List<EduEvalCourse> findCourses(String evalType, String startDate, String endDate);

    /** Thông tin chung của khóa (tiêu đề các popup đánh giá). */
    EduBasicInformation getCourse(String basicNo);

    // ===== Đánh giá học viên =====
    List<EduFreeEmployee> getStudents(String basicNo);

    /** Lưu điểm thi: key = FREE_NO, value = điểm (0-100, rỗng = xóa điểm). */
    void saveStudentScores(String basicNo, Map<String, String> scores) throws BusinessException;

    EduImportResult importStudentScores(String basicNo, InputStream in) throws IOException;

    byte[] buildStudentTemplate() throws IOException;

    byte[] exportStudents(String basicNo) throws IOException;

    // ===== Đánh giá giảng viên =====
    List<EduScoreStat> getTeacherStats(String basicNo);

    List<EduTeacherCheck> getTeacherChecks(String basicNo, String teaEmpid);

    EduImportResult importTeacherScores(String basicNo, String teaEmpid, InputStream in) throws IOException;

    byte[] buildTeacherTemplate() throws IOException;

    byte[] exportTeacherStats(String basicNo) throws IOException;

    // ===== Kết quả đào tạo =====
    List<EduScoreStat> getResultStats(String basicNo);

    /** Phiếu kết quả; onlyEvaluated = chỉ phiếu đã chấm, kèm file báo cáo theo từng phiếu. */
    List<EduTrainResult> getTrainResults(String basicNo, boolean onlyEvaluated);

    EduImportResult importResultScores(String basicNo, InputStream in) throws IOException;

    byte[] buildResultTemplate() throws IOException;

    byte[] exportResults(String basicNo) throws IOException;
}
