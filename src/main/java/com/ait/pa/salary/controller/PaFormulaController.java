package com.ait.pa.salary.controller;

import com.ait.pa.salary.dto.PaFormulaDto;
import com.ait.pa.salary.service.PaFormulaService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/pa/salary")
public class PaFormulaController {

    private static final Logger log = LoggerFactory.getLogger(PaFormulaController.class);

    @Autowired
    private PaFormulaService paFormulaService;

    @GetMapping("/viewPaFormula")
    public String viewPaFormula() {
        return "pa/salary/viewPaFormula";
    }

    @GetMapping("/formula/api/itemList")
    @ResponseBody
    public ResponseEntity<?> getItemList() {
        try {
            return ResponseEntity.ok(paFormulaService.getItemList());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục tính: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/formula/api/toolItems")
    @ResponseBody
    public ResponseEntity<?> getToolItems() {
        try {
            return ResponseEntity.ok(paFormulaService.getToolItems());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách công cụ công thức: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/formula/api/allItemNames")
    @ResponseBody
    public ResponseEntity<?> getAllItemNames() {
        try {
            return ResponseEntity.ok(paFormulaService.getAllItemNames());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách ITEM_NAME: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/formula/api/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) String itemNo,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaFormulaDto params = new PaFormulaDto();
            params.setItemNo(itemNo);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaFormulaDto> result = paFormulaService.getPagedFormularList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách công thức itemNo={}: {}", itemNo, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    @GetMapping("/formula/api/{formularNo}")
    @ResponseBody
    public ResponseEntity<?> getOne(@PathVariable Long formularNo) {
        try {
            PaFormulaDto dto = paFormulaService.getOneFormular(formularNo);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy công thức formularNo={}: {}", formularNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/formula/api/insert")
    @ResponseBody
    public ResponseEntity<?> insert(@RequestBody PaFormulaDto dto) {
        try {
            if (dto.getItemNo() == null || dto.getItemNo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chưa chọn hạng mục!"));
            }
            if (dto.getFormular() == null || dto.getFormular().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập công thức!"));
            }
            paFormulaService.insertFormular(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Thêm mới thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới công thức: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/formula/api/update")
    @ResponseBody
    public ResponseEntity<?> update(@RequestBody PaFormulaDto dto) {
        try {
            if (dto.getFormularNo() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin FORMULAR_NO!"));
            }
            if (dto.getFormular() == null || dto.getFormular().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng nhập công thức!"));
            }
            paFormulaService.updateFormular(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật công thức formularNo={}: {}", dto.getFormularNo(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/formula/api/delete/{formularNo}")
    @ResponseBody
    public ResponseEntity<?> delete(@PathVariable Long formularNo) {
        try {
            paFormulaService.deleteFormular(formularNo);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa công thức formularNo={}: {}", formularNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/formula/api/swapSeq")
    @ResponseBody
    public ResponseEntity<?> swapSeq(@RequestBody Map<String, String> body) {
        try {
            String formularNoStr = body.get("formularNo");
            String itemNo        = body.get("itemNo");
            String direction     = body.get("direction");
            if (formularNoStr == null || itemNo == null || direction == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin!"));
            }
            paFormulaService.swapConditionSeq(Long.parseLong(formularNoStr), itemNo, direction);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Lỗi khi hoán đổi trình tự tính: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
