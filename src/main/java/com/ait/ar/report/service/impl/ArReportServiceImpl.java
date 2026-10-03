package com.ait.ar.report.service.impl;

import com.ait.ar.report.service.ArReportService;
import com.ait.edu.trainEducation.mapper.EduTrainReportMapper;
import com.ait.edu.trainEducation.model.EduTrainReportMenu;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dùng lại EduTrainReportMapper#findMenu (cùng câu SQL SY_CODE + REPORT_CENTER của
 * getCodeListByParentCode + getreportList bản gốc, chỉ khác mã cha) thay vì viết mapper mới.
 */
@Service
public class ArReportServiceImpl implements ArReportService {

    private static final Logger log = LoggerFactory.getLogger(ArReportServiceImpl.class);

    /** menuNo -> mã cha loại báo cáo (SY_CODE), giữ đúng bảng ánh xạ của ArReportCtroller bản gốc. */
    private static final Map<String, String> MENU_PARENT_CODES = new HashMap<>();

    static {
        MENU_PARENT_CODES.put("14013782", "22116");    // Báo cáo lương
        MENU_PARENT_CODES.put("14013665", "14015311"); // Báo cáo nhân sự
        MENU_PARENT_CODES.put("14013758", "22114");    // Báo cáo chấm công
        MENU_PARENT_CODES.put("14014477", "14015405"); // Báo cáo đào tạo
    }

    @Autowired
    private EduTrainReportMapper eduTrainReportMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainReportMenu> findMenu(String menuNo) {
        String parentCode = menuNo == null ? null : MENU_PARENT_CODES.get(menuNo.trim());
        log.info("Lấy cây loại báo cáo, menuNo={}, parentCode={}", menuNo, parentCode);
        if (parentCode == null) {
            return Collections.emptyList();
        }
        try {
            return eduTrainReportMapper.findMenu(parentCode);
        } catch (Exception e) {
            log.error("Lỗi khi lấy cây loại báo cáo menuNo={}", menuNo, e);
            throw e;
        }
    }
}
