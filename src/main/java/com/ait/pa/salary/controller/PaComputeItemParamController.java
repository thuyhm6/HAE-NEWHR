package com.ait.pa.salary.controller;

import com.ait.pa.salary.dto.PaComputeItemParamDto;
import com.ait.pa.salary.service.PaComputeItemParamService;
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
@RequestMapping("/pa/salary")
public class PaComputeItemParamController {

    private static final Logger log = LoggerFactory.getLogger(PaComputeItemParamController.class);

    @Autowired
    private PaComputeItemParamService paComputeItemParamService;

    @GetMapping("/viewPaComputeItemParamList")
    public String viewPaComputeItemParamList() {
        return "pa/salary/viewPaComputeItemParamList";
    }

    @GetMapping("/computeitemparam/api/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) String aliasNameSearch,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaComputeItemParamDto params = new PaComputeItemParamDto();
            params.setAliasNameSearch(aliasNameSearch);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaComputeItemParamDto> result = paComputeItemParamService.getPagedList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách thông số mục tính toán: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    @GetMapping("/computeitemparam/api/{paramNo}")
    @ResponseBody
    public ResponseEntity<?> getOne(@PathVariable String paramNo) {
        try {
            PaComputeItemParamDto dto = paComputeItemParamService.getOne(paramNo);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông số mục tính toán paramNo={}: {}", paramNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/computeitemparam/api/insert")
    @ResponseBody
    public ResponseEntity<?> insert(@RequestBody PaComputeItemParamDto dto) {
        try {
            if (dto.getItemNo() == null || dto.getItemNo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin Tên hạng mục!"));
            }
            paComputeItemParamService.insert(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Thêm mới thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới thông số mục tính toán: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/computeitemparam/api/update")
    @ResponseBody
    public ResponseEntity<?> update(@RequestBody PaComputeItemParamDto dto) {
        try {
            if (dto.getParamNo() == null || dto.getParamNo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin PARAM_NO!"));
            }
            paComputeItemParamService.update(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật thông số mục tính toán: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/computeitemparam/api/deleteList")
    @ResponseBody
    public ResponseEntity<?> deleteList(@RequestBody List<String> paramNos) {
        try {
            if (paramNos == null || paramNos.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không có bản ghi được chọn!"));
            }
            paComputeItemParamService.deleteList(paramNos);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công " + paramNos.size() + " bản ghi"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa thông số mục tính toán: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/computeitemparam/api/itemList")
    @ResponseBody
    public ResponseEntity<?> getItemList() {
        try {
            return ResponseEntity.ok(paComputeItemParamService.getItemList());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách PA_ITEM: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/computeitemparam/api/applyTypeList")
    @ResponseBody
    public ResponseEntity<?> getApplyTypeList() {
        try {
            return ResponseEntity.ok(paComputeItemParamService.getApplyTypeList());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách APPLY_TYPE: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/computeitemparam/api/swapOrder")
    @ResponseBody
    public ResponseEntity<?> swapOrder(@RequestBody Map<String, String> body) {
        try {
            String paramNo   = body.get("paramNo");
            String direction = body.get("direction");
            if (paramNo == null || direction == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin paramNo hoặc direction!"));
            }
            paComputeItemParamService.swapOrder(paramNo, direction);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Lỗi khi hoán đổi thứ tự tính: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
