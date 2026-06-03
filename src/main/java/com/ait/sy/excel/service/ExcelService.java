package com.ait.sy.excel.service;

import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ExcelService {
    Workbook buildTemplate(List<Map<String, Object>> shiftList, List<Map<String, Object>> typeList,
            String templateName);

    Workbook buildCardRecordTemplate();

    List<Map<String, Object>> getDeptList();

    Workbook buildStartPointTemplate(List<List<String[]>> groups, String templateName);

    Workbook buildNewEmpTemplate(List<List<String[]>> groups, String templateName);

    List<String> importTemplate(String templateName, MultipartFile file) throws IOException;
}
