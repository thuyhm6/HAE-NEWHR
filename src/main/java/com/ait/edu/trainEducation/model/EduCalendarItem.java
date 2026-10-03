package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Một kế hoạch đào tạo có lịch học trong ngày (ô lịch của /edu/trainfile/trainCalendar).
 * Port từ getCalendarList (sqlCompanyCalendar.xml - Hanwha_HTSV).
 */
@Data
public class EduCalendarItem {

    /** COURSE_DATE - DD/MM/YYYY */
    private String courseDate;
    private String planNo;
    private String courseNameCode;
    private String periodTime;
}
