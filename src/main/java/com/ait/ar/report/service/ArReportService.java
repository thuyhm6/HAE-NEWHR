package com.ait.ar.report.service;

import com.ait.edu.trainEducation.model.EduTrainReportMenu;

import java.util.List;

/**
 * Trung tâm báo cáo (/report/ar/viewArReportsList) - port từ ArReportCtroller.viewArReportsList
 * (Hanwha_HAE): cây loại báo cáo theo menu (lương / nhân sự / chấm công / đào tạo).
 */
public interface ArReportService {

    /**
     * Cây loại báo cáo (SY_CODE con của mã cha tương ứng menuNo + REPORT_CENTER).
     * menuNo không thuộc 4 menu báo cáo của bản gốc -> trả về danh sách rỗng.
     */
    List<EduTrainReportMenu> findMenu(String menuNo);
}
