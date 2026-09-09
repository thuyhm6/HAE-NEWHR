package com.ait.sy.feedback.controller;

import com.ait.sy.feedback.dto.SyFeedbackDto;
import com.ait.sy.feedback.service.SyFeedbackService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/sys")
public class SyFeedbackController {

    private static final Logger log = LoggerFactory.getLogger(SyFeedbackController.class);

    @Autowired
    private SyFeedbackService syFeedbackService;

    @Autowired
    private com.ait.util.AngularIndexService angularIndexService;

    @GetMapping("/viewFeedback")
    public String viewFeedback(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    // ── Gửi góp ý từ trang đăng nhập (public, không yêu cầu đăng nhập) ─────
    @PostMapping("/feedback/submit")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> submitFeedback(@RequestBody SyFeedbackDto dto) {
        try {
            if (dto.getFeedbackContent() == null || dto.getFeedbackContent().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Vui lòng nhập nội dung góp ý!"));
            }
            syFeedbackService.submitFeedback(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Gửi góp ý thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi gửi góp ý: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Lỗi hệ thống khi gửi góp ý"));
        }
    }

    // ── Danh sách góp ý cho trang quản lý (DataTables server-side) ─────────
    @GetMapping("/api/feedback/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            SyFeedbackDto params = new SyFeedbackDto();
            params.setKeyword(keyword);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<SyFeedbackDto> result = syFeedbackService.getPagedList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách góp ý: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }
}
