package com.ait.pa.salary.controller;

import com.ait.pa.salary.dto.PaInputItemDataDto;
import com.ait.pa.salary.dto.PaParamDataTempDto;
import com.ait.pa.salary.service.PaInputItemDataService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.ui.Model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/pa/salary")
public class PaInputItemDataController {

    private static final Logger log = LoggerFactory.getLogger(PaInputItemDataController.class);

    @Autowired
    private PaInputItemDataService paInputItemDataService;

    @GetMapping("/viewPaInputItemData")
    public String viewPaInputItemData(
            @RequestParam(required = false, defaultValue = "") String itemType,
            Model model) {
        model.addAttribute("itemType", itemType);
        return "pa/salary/viewPaInputItemData";
    }

    @GetMapping("/inputItemData/api/itemList")
    @ResponseBody
    public ResponseEntity<?> getParamItemList(
            @RequestParam(required = false) String itemType) {
        try {
            PaInputItemDataDto dto = new PaInputItemDataDto();
            dto.setItemType(itemType);
            return ResponseEntity.ok(paInputItemDataService.getParamItemList(dto));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục tiêu chuẩn: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/inputItemData/api/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) String paramNo,
            @RequestParam(required = false) String payMonth,
            @RequestParam(required = false) String empOfficeSearch,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String empSearch,
            @RequestParam(defaultValue = "1")  int draw,
            @RequestParam(defaultValue = "0")  int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaInputItemDataDto params = new PaInputItemDataDto();
            params.setParamNo(paramNo);
            params.setPayMonth(payMonth);
            params.setEmpOfficeSearch(empOfficeSearch);
            params.setDeptNos(deptNos);
            params.setEmpSearch(empSearch);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaInputItemDataDto> result = paInputItemDataService.getPagedParamDataList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách dữ liệu tiêu chuẩn paramNo={}: {}", paramNo, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    @GetMapping("/inputItemData/api/{paramDataNo}")
    @ResponseBody
    public ResponseEntity<?> getOne(@PathVariable Long paramDataNo) {
        try {
            PaInputItemDataDto dto = paInputItemDataService.getParamDataOne(paramDataNo);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy dữ liệu tiêu chuẩn paramDataNo={}: {}", paramDataNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/inputItemData/api/insert")
    @ResponseBody
    public ResponseEntity<?> insert(@RequestBody PaInputItemDataDto dto) {
        try {
            if (dto.getParamNo() == null || dto.getParamNo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chưa chọn hạng mục tiêu chuẩn!"));
            }
            if (dto.getPersonId() == null || dto.getPersonId().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập mã nhân viên!"));
            }
            if (dto.getReturnValue() == null || dto.getReturnValue().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập giá trị!"));
            }
            if (dto.getStartMonth() == null || dto.getStartMonth().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập tháng bắt đầu!"));
            }
            paInputItemDataService.insertParamData(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Thêm mới thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới dữ liệu tiêu chuẩn: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/inputItemData/api/update")
    @ResponseBody
    public ResponseEntity<?> update(@RequestBody PaInputItemDataDto dto) {
        try {
            if (dto.getParamDataNo() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin PARAM_DATA_NO!"));
            }
            if (dto.getReturnValue() == null || dto.getReturnValue().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập giá trị!"));
            }
            if (dto.getStartMonth() == null || dto.getStartMonth().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập tháng bắt đầu!"));
            }
            paInputItemDataService.updateParamData(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật dữ liệu tiêu chuẩn paramDataNo={}: {}", dto.getParamDataNo(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/inputItemData/api/delete/{paramDataNo}")
    @ResponseBody
    public ResponseEntity<?> delete(@PathVariable Long paramDataNo) {
        try {
            paInputItemDataService.deleteParamData(paramDataNo);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa dữ liệu tiêu chuẩn paramDataNo={}: {}", paramDataNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/viewImportExcelTempPaParamList")
    public String viewImportExcelTempPaParamList() {
        return "pa/salary/viewImportExcelTempPaParamList";
    }

    @PostMapping("/inputItemData/api/importExcel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importExcel(
            @RequestParam("paramNo") String paramNo,
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (file == null || file.isEmpty()) {
                result.put("success", false);
                result.put("message", "Vui lòng chọn file Excel để import.");
                return ResponseEntity.badRequest().body(result);
            }
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.toLowerCase().endsWith(".xlsx") && !filename.toLowerCase().endsWith(".xls"))) {
                result.put("success", false);
                result.put("message", "Chỉ hỗ trợ file Excel .xlsx hoặc .xls.");
                return ResponseEntity.badRequest().body(result);
            }
            if (paramNo == null || paramNo.isBlank()) {
                result.put("success", false);
                result.put("message", "Vui lòng chọn hạng mục tiêu chuẩn trước khi import.");
                return ResponseEntity.badRequest().body(result);
            }

            List<String> errors = paInputItemDataService.importParamDataExcel(paramNo, file);
            if (errors.isEmpty()) {
                result.put("success", true);
                result.put("message", "Import thành công!");
            } else {
                result.put("success", false);
                result.put("errors", errors);
                result.put("message", "Import hoàn tất nhưng có " + errors.size() + " lỗi.");
            }
        } catch (Exception e) {
            log.error("Lỗi khi import Excel PA_PARAM_DATA_TEMP, paramNo={}: {}", paramNo, e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống khi xử lý file import.");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/inputItemData/api/importTemp/list")
    @ResponseBody
    public ResponseEntity<List<PaParamDataTempDto>> getImportTempList(
            @RequestParam(required = false) String errorOnly) {
        try {
            PaParamDataTempDto dto = new PaParamDataTempDto();
            dto.setErrorOnly(errorOnly);
            return ResponseEntity.ok(paInputItemDataService.getParamDataTempList(dto));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách PA_PARAM_DATA_TEMP: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/inputItemData/api/importTemp/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveImportTemp(
            @RequestParam(required = false) String paramNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            String message = paInputItemDataService.saveParamDataTemp(paramNo);
            if (message != null && !message.isBlank()) {
                response.put("success", false);
                response.put("error", message);
            } else {
                response.put("success", true);
                response.put("message", "Lưu thành công");
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu PA_PARAM_DATA_TEMP sang chính thức, paramNo={}: {}", paramNo, e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống khi lưu dữ liệu.");
        }
        return ResponseEntity.ok(response);
    }
}
