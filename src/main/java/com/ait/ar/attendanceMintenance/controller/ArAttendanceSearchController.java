package com.ait.ar.attendanceMintenance.controller;

import com.ait.ar.attendanceMintenance.dto.ArAttendanceSearchDto;
import com.ait.ar.attendanceMintenance.dto.ArCardRecordDayDto;
import com.ait.ar.attendanceMintenance.dto.ArCardRecordDto;
import com.ait.ar.attendanceMintenance.dto.ArCardRecordForSelfDto;
import com.ait.ar.attendanceMintenance.dto.ArMacRecordEatDto;
import com.ait.ar.attendanceMintenance.dto.ArMacRecordTempDto;
import com.ait.ar.attendanceMintenance.service.ArAttendanceSearchService;
import com.ait.ar.attendanceMintenance.service.ArCardRecordDayService;
import com.ait.ar.attendanceMintenance.service.ArCardRecordForSelfService;
import com.ait.ar.attendanceMintenance.service.ArCardRecordService;
import com.ait.ar.attendanceMintenance.service.ArMacRecordEatService;
import com.ait.ar.attendanceMintenance.service.ArMacRecordTempService;
import com.ait.sy.sys.dto.DataTablesResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ar/attendanceMintenance")
public class ArAttendanceSearchController {

    private static final Logger log = LoggerFactory.getLogger(ArAttendanceSearchController.class);

    @Autowired
    private ArAttendanceSearchService service;

    @Autowired
    private ArCardRecordService arCardRecordService;

    @Autowired
    private ArMacRecordTempService arMacRecordTempService;

    @Autowired
    private ArCardRecordForSelfService arCardRecordForSelfService;

    @Autowired
    private ArMacRecordEatService arMacRecordEatService;

    @Autowired
    private ArCardRecordDayService arCardRecordDayService;

    @GetMapping("/viewAttendanceManagentForSerchInfoList")
    public String viewAttendanceManagentForSerchInfoList() {
        return "ar/attendanceMintenance/viewAttendanceManagentForSerchInfoList";
    }

    @GetMapping("/viewSearchApplyOtInfoList")
    public String viewSearchApplyOtInfoList() {
        return "ar/attendanceMintenance/viewSearchApplyOtInfoList";
    }

    @GetMapping("/api/attendanceSearch/list")
    @ResponseBody
    public ResponseEntity<List<ArAttendanceSearchDto>> getAttendanceSearchList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String postFamily,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String itemNo) {
        ArAttendanceSearchDto params = new ArAttendanceSearchDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setFromDate(fromDate);
        params.setToDate(toDate);
        params.setPostFamily(postFamily);
        params.setShiftNo(shiftNo);
        params.setItemNo(itemNo);
        return ResponseEntity.ok(service.getAttendanceSearchList(params));
    }

    @GetMapping("/api/attendanceSearch/otList")
    @ResponseBody
    public ResponseEntity<List<ArAttendanceSearchDto>> getAttendanceOtSearchList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String postFamily,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String itemNo) {
        ArAttendanceSearchDto params = new ArAttendanceSearchDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setFromDate(fromDate);
        params.setToDate(toDate);
        params.setPostFamily(postFamily);
        params.setShiftNo(shiftNo);
        params.setItemNo(itemNo);
        return ResponseEntity.ok(service.getAttendanceOtSearchList(params));
    }

    @GetMapping("/viewArCardRecord")
    public String viewArCardRecord(HttpSession session, Model model) {
        String sysMode = (String) session.getAttribute("sysMode");
        model.addAttribute("sysMode", sysMode != null ? sysMode : "hrm");
        return "ar/attendanceMintenance/viewArCardRecord";
    }

    private boolean isEssMode(HttpSession session) {
        return "ess".equals(session.getAttribute("sysMode"));
    }

    private ResponseEntity<Map<String, Object>> essAccessDenied() {
        Map<String, Object> err = new java.util.HashMap<>();
        err.put("success", false);
        err.put("message", "Bạn không có quyền thực hiện thao tác này.");
        return ResponseEntity.status(403).body(err);
    }

    @GetMapping("/api/cardRecord/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<ArCardRecordDto>> getCardRecordList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {
        ArCardRecordDto dto = new ArCardRecordDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setShiftNo(shiftNo);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);
        return ResponseEntity.ok(arCardRecordService.getPageList(dto));
    }

    @GetMapping("/api/cardRecord/detail")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCardRecordDetail(@RequestParam Long recordNo, HttpSession session) {
        if (isEssMode(session)) return essAccessDenied();
        Map<String, Object> result = new java.util.HashMap<>();
        try {
            ArCardRecordDto dto = arCardRecordService.getByRecordNo(recordNo);
            if (dto != null) {
                result.put("success", true);
                result.put("data", dto);
            } else {
                result.put("success", false);
                result.put("message", "Không tìm thấy bản ghi.");
            }
        } catch (Exception e) {
            log.error("[CardRecord] getDetail error recordNo={}", recordNo, e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống khi lấy thông tin bản ghi.");
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/cardRecord/insert")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> insertCardRecord(@RequestBody ArCardRecordDto dto, HttpSession session) {
        if (isEssMode(session)) return essAccessDenied();
        return ResponseEntity.ok(arCardRecordService.insertRecord(dto));
    }

    @PostMapping("/api/cardRecord/update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCardRecord(@RequestBody ArCardRecordDto dto, HttpSession session) {
        if (isEssMode(session)) return essAccessDenied();
        return ResponseEntity.ok(arCardRecordService.updateRecord(dto));
    }

    @PostMapping("/api/cardRecord/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteCardRecord(@RequestBody ArCardRecordDto dto, HttpSession session) {
        if (isEssMode(session)) return essAccessDenied();
        Map<String, Object> result = new java.util.HashMap<>();
        if (dto == null || dto.getRecordNo() == null) {
            result.put("success", false);
            result.put("message", "Thiếu thông tin bản ghi cần xóa.");
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.ok(arCardRecordService.deleteByRecordNo(dto.getRecordNo()));
    }

    @PostMapping("/api/cardRecord/importFromDevice")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importCardRecordFromDevice(
            @RequestParam String fromDate,
            @RequestParam String toDate,
            HttpSession session) {
        if (isEssMode(session)) return essAccessDenied();
        if (fromDate == null || fromDate.isBlank() || toDate == null || toDate.isBlank()) {
            Map<String, Object> err = new java.util.HashMap<>();
            err.put("success", false);
            err.put("message", "Vui lòng nhập khoảng thời gian cần đọc dữ liệu.");
            return ResponseEntity.ok(err);
        }
        log.info("[importFromDevice] fromDate={}, toDate={}", fromDate, toDate);
        return ResponseEntity.ok(arCardRecordService.importFromDevice(fromDate, toDate));
    }

    @GetMapping("/viewImportExcelTempMacRecordsList")
    public String viewImportExcelTempMacRecordsList() {
        return "ar/attendanceMintenance/viewImportExcelTempMacRecordsList";
    }

    @PostMapping("/api/macRecordTemp/uploadExcel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> uploadMacRecordExcel(@RequestParam("file") MultipartFile file, HttpSession session) {
        if (isEssMode(session)) return essAccessDenied();
        log.info("[macRecordTemp] uploadExcel file={}", file != null ? file.getOriginalFilename() : "null");
        return ResponseEntity.ok(arMacRecordTempService.uploadExcel(file));
    }

    @GetMapping("/api/macRecordTemp/list")
    @ResponseBody
    public ResponseEntity<List<ArMacRecordTempDto>> getMacRecordTempList(
            @RequestParam(required = false) String errorOnly) {
        return ResponseEntity.ok(arMacRecordTempService.getList(errorOnly));
    }

    @GetMapping("/viewArCardRecordForSelf")
    public String viewArCardRecordForSelf() {
        return "ar/attendanceMintenance/viewArCardRecordForSelf";
    }

    @GetMapping("/api/cardRecordForSelf/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<ArCardRecordForSelfDto>> getCardRecordForSelfList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {
        ArCardRecordForSelfDto dto = new ArCardRecordForSelfDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);
        return ResponseEntity.ok(arCardRecordForSelfService.getPageList(dto));
    }

    @GetMapping("/api/cardRecordForSelf/exportExcel")
    public void exportCardRecordForSelfExcel(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            HttpServletResponse response) throws IOException {
        ArCardRecordForSelfDto dto = new ArCardRecordForSelfDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);

        List<ArCardRecordForSelfDto> list = arCardRecordForSelfService.getExportList(dto);

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Lich_su_ra_vao");

            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] headers = {"STT", "Mã nhân viên", "Họ tên", "Phòng ban",
                                "Ngày quẹt thẻ", "Thời gian quẹt thẻ", "Loại", "Nguồn dữ liệu"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (ArCardRecordForSelfDto item : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rowIdx - 1);
                row.createCell(1).setCellValue(item.getEmpId() != null ? item.getEmpId() : "");
                row.createCell(2).setCellValue(item.getLocalName() != null ? item.getLocalName() : "");
                row.createCell(3).setCellValue(item.getDeptName() != null ? item.getDeptName() : "");
                row.createCell(4).setCellValue(item.getSwipeDate() != null ? item.getSwipeDate() : "");
                row.createCell(5).setCellValue(item.getSwipeTime() != null ? item.getSwipeTime() : "");
                row.createCell(6).setCellValue(item.getDoorType() != null ? item.getDoorType() : "");
                row.createCell(7).setCellValue(item.getDataSourceName() != null ? item.getDataSourceName() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            String fileName = URLEncoder.encode("lich_su_ra_vao_sst.xlsx", StandardCharsets.UTF_8);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + fileName);
            wb.write(response.getOutputStream());
        } catch (Exception e) {
            log.error("[cardRecordForSelf] exportExcel error", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/api/cardRecordForSelf/importFromDevice")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importCardRecordForSelfFromDevice(
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        if (fromDate == null || fromDate.isBlank() || toDate == null || toDate.isBlank()) {
            Map<String, Object> err = new java.util.HashMap<>();
            err.put("success", false);
            err.put("message", "Vui lòng nhập khoảng thời gian cần đọc dữ liệu.");
            return ResponseEntity.ok(err);
        }
        log.info("[cardRecordForSelf] importFromDevice fromDate={}, toDate={}", fromDate, toDate);
        return ResponseEntity.ok(arCardRecordForSelfService.importFromDevice(fromDate, toDate));
    }

    @PostMapping("/api/macRecordTemp/confirm")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirmMacRecordTemp() {
        log.info("[macRecordTemp] confirm called");
        return ResponseEntity.ok(arMacRecordTempService.confirm());
    }

    @GetMapping("/viewArCardRecordDay")
    public String viewArCardRecordDay() {
        return "ar/attendanceMintenance/viewArCardRecordDay";
    }

    @GetMapping("/api/cardRecordDay/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<ArCardRecordDayDto>> getCardRecordDayList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String shiftNoFilter,
            @RequestParam(required = false) String missingCard,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "50") int length) {
        ArCardRecordDayDto dto = new ArCardRecordDayDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setShiftNoFilter(shiftNoFilter);
        dto.setMissingCard(missingCard);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);
        return ResponseEntity.ok(arCardRecordDayService.getPageList(dto));
    }

    @GetMapping("/viewArCardRecordMeal")
    public String viewArCardRecordMeal() {
        return "ar/attendanceMintenance/viewArCardRecordMeal";
    }

    @PostMapping("/api/macRecordEat/importFromDevice")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importMealFromDevice(
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        if (fromDate == null || fromDate.isBlank() || toDate == null || toDate.isBlank()) {
            Map<String, Object> err = new java.util.HashMap<>();
            err.put("success", false);
            err.put("message", "Vui lòng nhập khoảng thời gian cần đọc dữ liệu.");
            return ResponseEntity.ok(err);
        }
        log.info("[macRecordEat] importFromDevice fromDate={}, toDate={}", fromDate, toDate);
        return ResponseEntity.ok(arMacRecordEatService.importFromDevice(fromDate, toDate));
    }

    @GetMapping("/api/macRecordEat/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<ArMacRecordEatDto>> getMacRecordEatList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String eatDate,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {
        ArMacRecordEatDto dto = new ArMacRecordEatDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setEatDate(eatDate);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);
        return ResponseEntity.ok(arMacRecordEatService.getPageList(dto));
    }

    @GetMapping("/api/macRecordEat/exportExcel")
    public void exportMacRecordEatExcel(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String eatDate,
            HttpServletResponse response) throws IOException {
        ArMacRecordEatDto dto = new ArMacRecordEatDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setEatDate(eatDate);

        List<ArMacRecordEatDto> list = arMacRecordEatService.getExportList(dto);

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Tra_cuu_suat_an");

            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            XSSFFont headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] headers = {"STT", "Mã nhân viên", "Họ tên", "Phòng ban", "Chức vụ",
                                "Ngày công", "Ngày quẹt thẻ", "Giờ quẹt thẻ",
                                "Dish Name", "Phân loại", "Amount", "Thời gian ra", "Ghi chú"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (ArMacRecordEatDto item : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rowIdx - 1);
                row.createCell(1).setCellValue(item.getEmpId()         != null ? item.getEmpId()         : "");
                row.createCell(2).setCellValue(item.getLocalName()     != null ? item.getLocalName()     : "");
                row.createCell(3).setCellValue(item.getDeptName()      != null ? item.getDeptName()      : "");
                row.createCell(4).setCellValue(item.getPostGradeName() != null ? item.getPostGradeName() : "");
                row.createCell(5).setCellValue(item.getAttendanceDate()!= null ? item.getAttendanceDate(): "");
                row.createCell(6).setCellValue(item.getRDate()         != null ? item.getRDate()         : "");
                row.createCell(7).setCellValue(item.getRTime()         != null ? item.getRTime()         : "");
                row.createCell(8).setCellValue(item.getEatName()       != null ? item.getEatName()       : "");
                row.createCell(9).setCellValue(item.getEatDate()       != null ? item.getEatDate()       : "");
                row.createCell(10).setCellValue(item.getAmount()       != null ? item.getAmount()        : 0);
                row.createCell(11).setCellValue(item.getOutdoorTime()  != null ? item.getOutdoorTime()   : "");
                row.createCell(12).setCellValue(item.getRemark()       != null ? item.getRemark()        : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            String fileName = URLEncoder.encode("tra_cuu_suat_an.xlsx", StandardCharsets.UTF_8);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + fileName);
            wb.write(response.getOutputStream());
        } catch (Exception e) {
            log.error("[macRecordEat] exportExcel error", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

}
