package com.ait.sy.sys.controller;

import com.ait.sy.basicMaintenance.model.HrCompany;
import com.ait.sy.basicMaintenance.model.SyCode;
import com.ait.sy.sys.service.MultilingualService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller xử lý đa ngôn ngữ
 */
@RestController
@RequestMapping("/api/multilingual")
public class MultilingualController {

    @Autowired
    private MultilingualService multilingualService;

    // ========== API cho đa ngôn ngữ ==========

    /**
     * Lấy nội dung đa ngôn ngữ
     */
    @GetMapping("/content/{no}/{language}")
    public ResponseEntity<Map<String, String>> getContent(
            @PathVariable String no,
            @PathVariable String language) {
        String content = multilingualService.getContent(no, language);
        Map<String, String> result = new HashMap<>();
        result.put("content", content);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy tất cả nội dung đa ngôn ngữ theo mã số
     */
    @GetMapping("/content/{no}")
    public ResponseEntity<Map<String, String>> getContentsByNo(@PathVariable String no) {
        Map<String, String> contents = multilingualService.getContentsByNo(no);
        return ResponseEntity.ok(contents);
    }

    /**
     * Lưu nội dung đa ngôn ngữ
     */
    @PostMapping("/content")
    public ResponseEntity<Map<String, String>> saveContent(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        String no = request.get("no");
        String language = request.get("language");
        String content = request.get("content");
        multilingualService.saveContent(no, language, content);

        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "Nội dung đã được lưu thành công");
        return ResponseEntity.ok(result);
    }

    /**
     * Cập nhật nội dung đa ngôn ngữ
     */
    @PutMapping("/content")
    public ResponseEntity<Map<String, String>> updateContent(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        String no = request.get("no");
        String language = request.get("language");
        String content = request.get("content");
        multilingualService.updateContent(no, language, content);

        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "Nội dung đã được cập nhật thành công");
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách ngôn ngữ có sẵn
     */
    @GetMapping("/languages")
    public ResponseEntity<List<String>> getAvailableLanguages() {
        List<String> languages = multilingualService.getAvailableLanguages();
        return ResponseEntity.ok(languages);
    }

    /**
     * Set ngôn ngữ cho session
     */
    @PostMapping("/set-language")
    public ResponseEntity<Map<String, String>> setLanguage(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        String language = request.get("language");
        if (multilingualService.isLanguageSupported(language)) {
            session.setAttribute("language", language);
            Map<String, String> result = new HashMap<>();
            result.put("status", "success");
            result.put("message", "Ngôn ngữ đã được thay đổi thành công");
            return ResponseEntity.ok(result);
        } else {
            Map<String, String> result = new HashMap<>();
            result.put("status", "error");
            result.put("message", "Ngôn ngữ không được hỗ trợ");
            return ResponseEntity.badRequest().body(result);
        }
    }

    // ========== API cho mã code ==========

    /**
     * Lấy tất cả mã code
     */
    @GetMapping("/codes")
    public ResponseEntity<List<SyCode>> getAllCodes() {
        List<SyCode> codes = multilingualService.getAllCodes();
        return ResponseEntity.ok(codes);
    }

    /**
     * Lấy mã code theo nhóm
     */
    @GetMapping("/codes/group/{groupCode}")
    public ResponseEntity<List<SyCode>> getCodesByGroup(@PathVariable String groupCode) {
        List<SyCode> codes = multilingualService.getCodesByGroup(groupCode);
        return ResponseEntity.ok(codes);
    }

    /**
     * Lấy cây phân cấp mã code
     */
    @GetMapping("/codes/tree/{rootCodeNo}")
    public ResponseEntity<List<SyCode>> getCodeTree(@PathVariable String rootCodeNo) {
        List<SyCode> codes = multilingualService.getCodeTree(rootCodeNo);
        return ResponseEntity.ok(codes);
    }

    // ========== API cho công ty ==========

    /**
     * Lấy tất cả công ty
     */
    @GetMapping("/companies")
    public ResponseEntity<List<HrCompany>> getAllCompanies() {
        List<HrCompany> companies = multilingualService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    /**
     * Tìm kiếm công ty
     */
    @GetMapping("/companies/search")
    public ResponseEntity<List<HrCompany>> searchCompanies(@RequestParam String keyword) {
        List<HrCompany> companies = multilingualService.searchCompanies(keyword);
        return ResponseEntity.ok(companies);
    }

    // ========== API cho liên kết CODE và COMPANY ==========

    /**
     * Lấy danh sách công ty theo CODE_NO
     */
    @GetMapping("/code-param/companies/{codeNo}")
    public ResponseEntity<List<String>> getCompanyIdsByCodeNo(@PathVariable String codeNo) {
        List<String> companyIds = multilingualService.getCompanyIdsByCodeNo(codeNo);
        return ResponseEntity.ok(companyIds);
    }

    /**
     * Lấy danh sách CODE_NO theo CPNY_ID
     */
    @GetMapping("/code-param/codes/{cpnyId}")
    public ResponseEntity<List<String>> getCodeNosByCompanyId(@PathVariable String cpnyId) {
        List<String> codeNos = multilingualService.getCodeNosByCompanyId(cpnyId);
        return ResponseEntity.ok(codeNos);
    }

    /**
     * Liên kết CODE và COMPANY
     */
    @PostMapping("/code-param/link")
    public ResponseEntity<Map<String, String>> linkCodeAndCompany(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        String codeNo = request.get("codeNo");
        String cpnyId = request.get("cpnyId");
        multilingualService.linkCodeAndCompany(codeNo, cpnyId);

        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "Liên kết đã được tạo thành công");
        return ResponseEntity.ok(result);
    }

    /**
     * Hủy liên kết CODE và COMPANY
     */
    @DeleteMapping("/code-param/unlink")
    public ResponseEntity<Map<String, String>> unlinkCodeAndCompany(
            @RequestParam String codeNo,
            @RequestParam String cpnyId) {
        multilingualService.unlinkCodeAndCompany(codeNo, cpnyId);

        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "Liên kết đã được hủy thành công");
        return ResponseEntity.ok(result);
    }
}
