package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduPlanManager;
import com.ait.edu.trainEducation.model.EduTrainSyllabus;
import com.ait.exception.BusinessException;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Service Kế hoạch đào tạo (EDU_PLAN_MANAGER) + Lịch học (EDU_TRAIN_SYLLABUS).
 */
public interface EduPlanManagerService {

    String ERR_NOT_FOUND = "EDU_PLAN_MANAGER_NOT_FOUND";
    String ERR_COURSE_NOT_FOUND = "EDU_COURSE_MANAGER_NOT_FOUND";
    String ERR_IMPORT = "EDU_PLAN_SYLLABUS_IMPORT_INVALID";

    List<EduPlanManager> findList(String trainDiffCode, String trainTypeCode, String courseName);

    /** Chi tiết kế hoạch, đã tách sẵn teacherDisplay / teacherEmpid để hiển thị trên form. */
    EduPlanManager getDetail(String planNo);

    /** Sinh trước PLAN_NO (bản gốc sinh khi mở form thêm mới để import lịch học trước khi lưu). */
    String nextPlanNo();

    void add(EduPlanManager entity) throws BusinessException;

    void update(EduPlanManager entity) throws BusinessException;

    /** Xóa kế hoạch + lịch học + toàn bộ dữ liệu đào tạo phát sinh theo kế hoạch (giống bản gốc). */
    void delete(String planNo) throws BusinessException;

    List<EduTrainSyllabus> findSyllabus(String planNo);

    void deleteSyllabus(String syllNo) throws BusinessException;

    /**
     * Import lịch học từ Excel: xóa lịch học cũ của kế hoạch rồi ghi mới (giống importTrainPlan bản gốc).
     * Có lỗi dữ liệu thì không ghi gì và trả về danh sách lỗi theo dòng.
     */
    List<String> importSyllabus(String planNo, InputStream in) throws IOException, BusinessException;

    /** File mẫu import lịch học (.xlsx). */
    byte[] buildSyllabusTemplate() throws IOException;
}
