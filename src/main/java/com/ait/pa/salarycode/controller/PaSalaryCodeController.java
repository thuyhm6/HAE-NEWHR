package com.ait.pa.salarycode.controller;

import com.ait.pa.salarycode.dto.PaSalaryCodeDto;
import com.ait.pa.salarycode.service.PaSalaryCodeService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/pa/salarycode")
public class PaSalaryCodeController {

    private static final Logger log = LoggerFactory.getLogger(PaSalaryCodeController.class);

    @Autowired
    private PaSalaryCodeService paSalaryCodeService;

    @GetMapping("/viewSalaryCodeList")
    public String viewSalaryCodeList() {
        return "pa/salarycode/viewSalaryCodeList";
    }

    @GetMapping("/api/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) String itemNameSearch,
            @RequestParam(required = false) Integer itemTypeSearch,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaSalaryCodeDto params = new PaSalaryCodeDto();
            params.setItemNameSearch(itemNameSearch);
            params.setItemTypeSearch(itemTypeSearch);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaSalaryCodeDto> result = paSalaryCodeService.getPagedList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    @GetMapping("/api/{itemType}/{itemNo}")
    @ResponseBody
    public ResponseEntity<?> getOne(
            @PathVariable Integer itemType,
            @PathVariable String itemNo) {
        try {
            PaSalaryCodeDto dto = paSalaryCodeService.getOne(itemType, itemNo);
            if (dto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết hạng mục lương itemType={}, itemNo={}: {}", itemType, itemNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/save")
    @ResponseBody
    public ResponseEntity<?> save(@RequestBody PaSalaryCodeDto dto) {
        try {
            if (dto.getItemType() == null || dto.getItemId() == null || dto.getItemId().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập đầy đủ thông tin bắt buộc!"));
            }
            paSalaryCodeService.save(dto);
            String msg = (dto.getItemNo() == null || dto.getItemNo().isEmpty())
                    ? "Thêm mới thành công"
                    : "Cập nhật thành công";
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            log.error("Lỗi khi lưu hạng mục lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/deleteList")
    @ResponseBody
    public ResponseEntity<?> deleteList(@RequestBody List<PaSalaryCodeDto> keys) {
        try {
            paSalaryCodeService.deleteList(keys);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công " + keys.size() + " bản ghi"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách hạng mục lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
