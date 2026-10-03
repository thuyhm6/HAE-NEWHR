package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduTrainReportMenu;
import com.ait.edu.trainEducation.model.EduTrainReportQuery;
import com.ait.edu.trainEducation.model.EduTrainReportRow;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper báo cáo đào tạo - port từ sqlTrainReport.xml + ArReportDao (Hanwha_HTSV).
 */
@Mapper
public interface EduTrainReportMapper {

    List<EduTrainReportMenu> findMenu(@Param("parentCodeNo") String parentCodeNo);

    List<EduTrainReportRow> findCourseReport(EduTrainReportQuery query);

    List<EduTrainReportRow> findPostGradeReport(EduTrainReportQuery query);

    List<EduTrainReportRow> findDeptReport(EduTrainReportQuery query);

    List<EduTrainReportRow> findYearReport(EduTrainReportQuery query);

    List<EduTrainReportRow> findMonthReport(EduTrainReportQuery query);

    List<EduTrainReportRow> findFormReport(EduTrainReportQuery query);
}
