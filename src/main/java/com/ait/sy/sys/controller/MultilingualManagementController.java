package com.ait.sy.sys.controller;

import com.ait.sy.basicMaintenance.model.SyCode;
import com.ait.sy.sys.service.MultilingualService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

/**
 * Controller API đa ngôn ngữ (JSON, Angular gọi trực tiếp) - trang quản lý/demo bằng Thymeleaf
 * (multilingual/management, multilingual/demo) đã xoá cùng toàn bộ Thymeleaf.
 */
@Controller
@RequestMapping("/multilingual")
public class MultilingualManagementController {
    private static final Logger log = LoggerFactory.getLogger(MultilingualManagementController.class);

    @Autowired
    private MultilingualService multilingualService;

    /**
     * Lấy dữ liệu đa ngôn ngữ theo mã số (generic)
     */
    @GetMapping("/data/by-no/{no}")
    @ResponseBody
    public Map<String, Object> getMultilingualDataByNo(@PathVariable String no) {
        // Lấy tất cả nội dung đa ngôn ngữ theo mã số
        Map<String, String> contents = multilingualService.getContentsByNo(no);

        return Map.of(
                "no", no,
                "contents", contents,
                "success", true);
    }

    /**
     * Lưu nội dung đa ngôn ngữ
     */
    @PostMapping("/save")
    @ResponseBody
    public Map<String, Object> saveContent(
            @RequestParam String no,
            @RequestParam String language,
            @RequestParam String content,
            HttpSession session) {
        try {
            multilingualService.saveContent(no, language, content);

            return Map.of(
                    "success", true,
                    "message", "Nội dung đã được lưu thành công");
        } catch (Exception e) {
            log.error("Failed to save multilingual content no={} language={}", no, language, e);
            return Map.of(
                    "success", false,
                    "message", "Loi he thong khi luu noi dung da ngon ngu.");
        }
    }

    /**
     * Cập nhật nội dung đa ngôn ngữ
     */
    @PutMapping("/update")
    @ResponseBody
    public Map<String, Object> updateContent(
            @RequestParam String no,
            @RequestParam String language,
            @RequestParam String content,
            HttpSession session) {
        try {
            multilingualService.updateContent(no, language, content);

            return Map.of(
                    "success", true,
                    "message", "Nội dung đã được cập nhật thành công");
        } catch (Exception e) {
            log.error("Failed to update multilingual content no={} language={}", no, language, e);
            return Map.of(
                    "success", false,
                    "message", "Loi he thong khi cap nhat noi dung da ngon ngu.");
        }
    }

    /**
     * Xóa nội dung đa ngôn ngữ
     */
    @DeleteMapping("/delete")
    @ResponseBody
    public Map<String, Object> deleteContent(
            @RequestParam String no,
            @RequestParam String language) {
        try {
            multilingualService.deleteContent(no, language);

            return Map.of(
                    "success", true,
                    "message", "Nội dung đã được xóa thành công");
        } catch (Exception e) {
            log.error("Failed to delete multilingual content no={} language={}", no, language, e);
            return Map.of(
                    "success", false,
                    "message", "Loi he thong khi xoa noi dung da ngon ngu.");
        }
    }

    /**
     * Lấy danh sách mã code theo nhóm
     */
    @GetMapping("/codes/group/{groupCode}")
    @ResponseBody
    public List<SyCode> getCodesByGroup(@PathVariable String groupCode) {
        return multilingualService.getCodesByGroup(groupCode);
    }

    /**
     * Lấy cây phân cấp mã code
     */
    @GetMapping("/codes/tree/{rootCodeNo}")
    @ResponseBody
    public List<SyCode> getCodeTree(@PathVariable String rootCodeNo) {
        return multilingualService.getCodeTree(rootCodeNo);
    }

    /**
     * Lấy dữ liệu con của một mã code
     */
    @GetMapping("/codes/children/{parentCodeNo}")
    @ResponseBody
    public List<SyCode> getChildCodes(@PathVariable String parentCodeNo) {
        return multilingualService.getChildCodes(parentCodeNo);
    }

    /**
     * Lấy dữ liệu đa ngôn ngữ theo mã code (cho hiển thị bên phải)
     */
    @GetMapping("/data/by-code/{codeNo}")
    @ResponseBody
    public Map<String, Object> getDataByCode(@PathVariable String codeNo) {
        // Lấy thông tin mã code
        SyCode syCode = multilingualService.getCodeByCodeNo(codeNo);

        // Lấy tất cả nội dung đa ngôn ngữ theo mã code
        Map<String, String> contents = multilingualService.getContentsByNo(codeNo);

        return Map.of(
                "codeInfo", syCode,
                "contents", contents,
                "success", true);
    }

}
