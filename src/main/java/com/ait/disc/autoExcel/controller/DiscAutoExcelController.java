package com.ait.disc.autoExcel.controller;

import com.ait.disc.autoExcel.dto.SqlMasterDetailDto;
import com.ait.disc.autoExcel.model.SqlMaster;
import com.ait.disc.autoExcel.service.SqlMasterService;
import com.ait.util.AngularIndexService;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;

/**
 * Quản lý truy vấn SQL tự động xuất Excel (viewRetrieveSqlMasterList).
 * Thêm/Sửa/Tham số được thao tác bằng modal ngay trên trang danh sách
 * (Angular), không có trang Chi tiết riêng.
 */
@Controller
@RequestMapping("/disc")
public class DiscAutoExcelController {
    private static final Logger log = LoggerFactory.getLogger(DiscAutoExcelController.class);

    @Autowired
    private SqlMasterService sqlMasterService;

    @Autowired
    private AngularIndexService angularIndexService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/autoExcel/viewRetrieveSqlMasterList")
    public String viewRetrieveSqlMasterList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/sqlMaster/list")
    @ResponseBody
    public List<SqlMaster> getList(@RequestParam(required = false) String keyword,
            @RequestParam(required = false) String pgmNm) {
        return sqlMasterService.findAll(keyword, pgmNm);
    }

    @GetMapping("/api/sqlMaster/detail")
    @ResponseBody
    public SqlMasterDetailDto getDetail(@RequestParam String sqlSeq) {
        return sqlMasterService.getDetail(sqlSeq);
    }

    @PostMapping("/api/sqlMaster/save")
    @ResponseBody
    public Map<String, Object> save(@RequestBody SqlMasterDetailDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            String sqlSeq = sqlMasterService.save(dto);
            result.put("success", true);
            result.put("message", "Lưu thành công!");
            result.put("sqlSeq", sqlSeq);
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        } catch (Exception e) {
            log.error("Loi khi luu truy van SQL, sqlSeq={}", dto.getSqlSeq(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi luu truy van SQL.");
        }
        return result;
    }

    @PostMapping("/api/sqlMaster/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String sqlSeq) {
        Map<String, Object> result = new HashMap<>();
        try {
            sqlMasterService.delete(sqlSeq);
            result.put("success", true);
            result.put("message", "Xóa thành công!");
        } catch (Exception e) {
            log.error("Loi khi xoa truy van SQL, sqlSeq={}", sqlSeq, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa truy van SQL.");
        }
        return result;
    }

    @GetMapping("/api/sqlMaster/export")
    public ResponseEntity<byte[]> export(@RequestParam String sqlSeq,
                                          @RequestParam(required = false) String paramsJson) {
        try {
            Map<String, String> paramValues = null;
            if (paramsJson != null && !paramsJson.isEmpty()) {
                paramValues = objectMapper.readValue(paramsJson, new TypeReference<Map<String, String>>() {
                });
            }
            byte[] bytes = sqlMasterService.exportExcel(sqlSeq, paramValues);
            String filename = URLEncoder.encode("SqlMasterExport_" + sqlSeq + ".xlsx", StandardCharsets.UTF_8.name());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        } catch (IllegalArgumentException e) {
            log.warn("Yeu cau xuat Excel khong hop le, sqlSeq={}: {}", sqlSeq, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Loi khi xuat Excel truy van SQL, sqlSeq={}", sqlSeq, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
