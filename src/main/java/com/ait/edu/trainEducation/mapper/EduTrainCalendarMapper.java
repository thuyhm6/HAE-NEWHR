package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduCalendarDetail;
import com.ait.edu.trainEducation.model.EduCalendarItem;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper lịch đào tạo (EDU_TRAIN_SYLLABUS + EDU_PLAN_MANAGER).
 */
@Mapper
public interface EduTrainCalendarMapper {

    /**
     * Các kế hoạch có lịch học trong tháng (yearMonth dạng YYYYMM).
     * empid khác null: chỉ lấy kế hoạch mà nhân viên này là học viên (lịch cá nhân).
     */
    List<EduCalendarItem> findMonthItems(@Param("yearMonth") String yearMonth, @Param("empid") String empid);

    /** Các cờ riêng của màn chi tiết (ISNOT_TEST, ISNOT_REPORT, TRAIN_CONTENT). */
    EduCalendarDetail findPlanFlags(@Param("planNo") String planNo);
}
