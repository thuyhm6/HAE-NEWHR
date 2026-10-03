package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduCalendarDetail;
import com.ait.edu.trainEducation.model.EduCalendarItem;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Lịch đào tạo (/edu/trainfile/trainCalendar) - port từ TrainFileCtroller (Hanwha_HTSV).
 */
public interface EduTrainCalendarService {

    String ERR_INVALID_MONTH = "EDU_CALENDAR_INVALID_MONTH";
    String ERR_NOT_FOUND = "EDU_CALENDAR_NOT_FOUND";
    String ERR_NO_EMPLOYEE = "EDU_CALENDAR_NO_EMPLOYEE";

    /** Các kế hoạch có lịch học trong tháng. */
    List<EduCalendarItem> findMonthItems(int year, int month) throws BusinessException;

    /**
     * Lịch đào tạo cá nhân (/edu/trainfile/personalTrainCalendar): các kế hoạch trong tháng
     * mà người đăng nhập là học viên.
     */
    List<EduCalendarItem> findPersonalMonthItems(int year, int month) throws BusinessException;

    /** Chi tiết kế hoạch + lịch học (trainCalendarDetail / syllabusInfo bản gốc). */
    EduCalendarDetail getDetail(String planNo) throws BusinessException;
}
