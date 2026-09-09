package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.ManageEmpPositionInfoDto;
import com.ait.ess.viewDept.dto.ManageEmpPositionInsideDto;
import com.ait.ess.viewDept.mapper.ManageEmpPositionInfoMapper;
import com.ait.ess.viewDept.service.ManageEmpPositionInfoService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManageEmpPositionInfoServiceImpl implements ManageEmpPositionInfoService {

    private static final Logger log = LoggerFactory.getLogger(ManageEmpPositionInfoServiceImpl.class);

    private static final String[] EXPORT_HEADERS = {
            "STT", "Mã NV", "Họ tên", "Phòng ban", "Nhóm NV", "Loại NV", "Chức vụ",
            "Chức danh", "Vị trí", "Quốc tịch", "Trạng thái", "Ngày vào làm", "Quản lý"
    };

    @Autowired
    private ManageEmpPositionInfoMapper mapper;

    @Override
    public List<ManageEmpPositionInfoDto> getList(ManageEmpPositionInfoDto params) {
        log.info("Lay danh sach chuc vu nhan vien, params={}", params);
        return mapper.selectManageEmpPositionInfoList(params);
    }

    @Override
    public List<ManageEmpPositionInsideDto> getInsideExperienceList(String personId) {
        log.info("Lay danh sach qua trinh noi bo, personId={}", personId);
        return mapper.selectInsideExperienceList(personId);
    }

    @Override
    public Workbook exportExcel(ManageEmpPositionInfoDto params) {
        log.info("Xuat excel danh sach chuc vu nhan vien, params={}", params);
        try {
            List<ManageEmpPositionInfoDto> list = mapper.selectManageEmpPositionInfoList(params);

            XSSFWorkbook workbook = new XSSFWorkbook();
            XSSFSheet sheet = workbook.createSheet("ManageEmpPositionInfo");

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < EXPORT_HEADERS.length; i++) {
                headerRow.createCell(i).setCellValue(EXPORT_HEADERS[i]);
            }

            int rowIdx = 1;
            for (ManageEmpPositionInfoDto dto : list) {
                Row row = sheet.createRow(rowIdx);
                row.createCell(0).setCellValue(rowIdx);
                row.createCell(1).setCellValue(nvl(dto.getEmpId()));
                row.createCell(2).setCellValue(nvl(dto.getLocalName()));
                row.createCell(3).setCellValue(nvl(dto.getDeptName()));
                row.createCell(4).setCellValue(nvl(dto.getPostFamilyName()));
                row.createCell(5).setCellValue(nvl(dto.getEmpTypeName()));
                row.createCell(6).setCellValue(nvl(dto.getDutyName()));
                row.createCell(7).setCellValue(nvl(dto.getPostGradeNo()));
                row.createCell(8).setCellValue(nvl(dto.getPositionNoName() != null ? dto.getPositionNoName() : dto.getPositionName()));
                row.createCell(9).setCellValue(nvl(dto.getNationalityName()));
                row.createCell(10).setCellValue(nvl(dto.getEmpOfficeName()));
                row.createCell(11).setCellValue(nvl(dto.getDateStarted()));
                row.createCell(12).setCellValue(nvl(dto.getManagerName()));
                rowIdx++;
            }

            for (int i = 0; i < EXPORT_HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            return workbook;
        } catch (Exception e) {
            log.error("Loi xuat excel danh sach chuc vu nhan vien, params={}", params, e);
            throw new RuntimeException("Loi he thong khi xuat excel danh sach chuc vu nhan vien.", e);
        }
    }

    private String nvl(String value) {
        return value == null ? "" : value;
    }
}
