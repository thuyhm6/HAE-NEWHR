package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduTrainReportMenu;
import com.ait.edu.trainEducation.model.EduTrainReportQuery;
import com.ait.edu.trainEducation.model.EduTrainReportRow;
import com.ait.exception.BusinessException;

import java.io.IOException;
import java.util.List;

/**
 * Báo cáo đào tạo (/report/ar/viewTrainReport) - port từ ArReportCtroller.viewTrainReport
 * + TrainReportCtroller (Hanwha_HTSV).
 */
public interface EduTrainReportService {

    String ERR_INVALID_TYPE = "EDU_TRAIN_REPORT_INVALID_TYPE";

    /** Mã cha loại báo cáo đào tạo (menuNo 14014477 bản gốc). */
    String REPORT_TYPE_PARENT_CODE = "14015405";

    String TYPE_COURSE = "course";
    String TYPE_POST_GRADE = "postGrade";
    String TYPE_DEPT = "dept";
    String TYPE_YEAR = "year";
    String TYPE_MONTH = "month";
    String TYPE_FORM = "form";

    /** Cây loại báo cáo (SY_CODE + REPORT_CENTER). */
    List<EduTrainReportMenu> findMenu();

    List<EduTrainReportRow> findReport(String type, EduTrainReportQuery query) throws BusinessException;

    byte[] exportReport(String type, EduTrainReportQuery query) throws BusinessException, IOException;
}
