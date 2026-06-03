package com.ait.pa.salary.controller;

import com.ait.pa.salary.dto.PaInputItemParamDto;
import com.ait.pa.salary.service.PaInputItemParamService;
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
public class PaInputItemParamController {

    private static final Logger log = LoggerFactory.getLogger(PaInputItemParamController.class);

    @Autowired
    private PaInputItemParamService paInputItemParamService;

    @GetMapping("/viewPaInputItemParam")
    public String viewPaInputItemParam() {
        return "pa/salary/viewPaInputItemParam";
    }

    @GetMapping("/inputitemparam/api/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) Integer itemTypeSearch,
            @RequestParam(required = false) String aliasNameSearch,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaInputItemParamDto params = new PaInputItemParamDto();
            params.setItemTypeSearch(itemTypeSearch);
            params.setAliasNameSearch(aliasNameSearch);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaInputItemParamDto> result = paInputItemParamService.getPagedList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách thông số mục nhập: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    @GetMapping("/inputitemparam/api/{paramNo}")
    @ResponseBody
    public ResponseEntity<?> getOne(@PathVariable String paramNo) {
        try {
            PaInputItemParamDto dto = paInputItemParamService.getOne(paramNo);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông số mục nhập paramNo={}: {}", paramNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/inputitemparam/api/update")
    @ResponseBody
    public ResponseEntity<?> update(@RequestBody PaInputItemParamDto dto) {
        try {
            if (dto.getParamNo() == null || dto.getParamNo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin PARAM_NO!"));
            }
            paInputItemParamService.update(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật thông số mục nhập: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/inputitemparam/api/distinctList")
    @ResponseBody
    public ResponseEntity<?> getDistinctList() {
        try {
            return ResponseEntity.ok(paInputItemParamService.getDistinctList());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách distinct list: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/inputitemparam/api/deleteList")
    @ResponseBody
    public ResponseEntity<?> deleteList(@RequestBody List<String> paramNos) {
        try {
            if (paramNos == null || paramNos.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không có bản ghi được chọn!"));
            }
            paInputItemParamService.deleteList(paramNos);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công " + paramNos.size() + " bản ghi"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa thông số mục nhập: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
