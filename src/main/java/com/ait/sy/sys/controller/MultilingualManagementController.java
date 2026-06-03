package com.ait.sy.sys.controller;

import com.ait.sy.basicMaintenance.model.SyCode;
import com.ait.sy.sys.service.MultilingualService;
import com.ait.util.MultilingualUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

/**
 * Controller cho giao diện quản lý đa ngôn ngữ
 */
@Controller
@RequestMapping("/multilingual")
public class MultilingualManagementController {
    private static final Logger log = LoggerFactory.getLogger(MultilingualManagementController.class);

    @Autowired
    private MultilingualService multilingualService;

    @Autowired
    private MultilingualUtil multilingualUtil;

    /**
     * Trang quản lý đa ngôn ngữ chính
     */
    @GetMapping("/management")
    public String managementPage(Model model, HttpSession session) {
        // Lấy ngôn ngữ hiện tại
        String currentLanguage = multilingualUtil.getCurrentLanguage();

        // Lấy danh sách mã code gốc (không có cha) để hiển thị trong sidebar
        List<SyCode> rootCodes = multilingualService.getAllCodes().stream()
                .filter(code -> code.getParentCodeNo() == null || code.getParentCodeNo().isEmpty())
                .collect(java.util.stream.Collectors.toList());

        // Lấy danh sách ngôn ngữ có sẵn
        List<String> availableLanguages = multilingualService.getAvailableLanguages();

        // Lấy danh sách mã số có đa ngôn ngữ
        List<String> availableNos = multilingualService.getAvailableNos();

        model.addAttribute("currentLanguage", currentLanguage);
        model.addAttribute("rootCodes", rootCodes);
        model.addAttribute("availableLanguages", availableLanguages);
        model.addAttribute("availableNos", availableNos);
        model.addAttribute("title", "Quản lý đa ngôn ngữ - HR System");

        return "multilingual/management";
    }

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

    /**
     * Trang demo đa ngôn ngữ
     */
    @GetMapping("/demo")
    public String demoPage(Model model, HttpSession session) {
        // Lấy ngôn ngữ hiện tại
        String currentLanguage = multilingualUtil.getCurrentLanguage();

        // Lấy danh sách ngôn ngữ có sẵn
        List<String> availableLanguages = multilingualService.getAvailableLanguages();

        model.addAttribute("currentLanguage", currentLanguage);
        model.addAttribute("availableLanguages", availableLanguages);
        model.addAttribute("title", "Demo Đa ngôn ngữ - HR System");

        return "multilingual/demo";
    }

    /**
     * Tạo dữ liệu mẫu cho demo
     */
    @PostMapping("/create-sample-data")
    @ResponseBody
    public Map<String, Object> createSampleData(HttpSession session) {
        try {
            // Tạo mã code mẫu
            SyCode rootCode = new SyCode("ROOT", "Root Code", null);
            rootCode.setDescription("Mã code gốc");
            rootCode.setRemark("Mã code gốc cho hệ thống");
            multilingualService.saveCode(rootCode);

            // Tạo mã code con
            SyCode employeeType = new SyCode("EMP_TYPE", "Loại nhân viên", "ROOT");
            employeeType.setDescription("Loại nhân viên");
            multilingualService.saveCode(employeeType);

            SyCode department = new SyCode("DEPT", "Phòng ban", "ROOT");
            department.setDescription("Phòng ban");
            multilingualService.saveCode(department);

            // Tạo mã code con của EMP_TYPE
            SyCode regular = new SyCode("REGULAR", "Nhân viên chính thức", "EMP_TYPE");
            regular.setDescription("Nhân viên chính thức");
            multilingualService.saveCode(regular);

            SyCode contract = new SyCode("CONTRACT", "Nhân viên hợp đồng", "EMP_TYPE");
            contract.setDescription("Nhân viên hợp đồng");
            multilingualService.saveCode(contract);

            // Tạo nội dung đa ngôn ngữ
            multilingualService.saveContent("ROOT", "vi", "Mã code gốc");
            multilingualService.saveContent("ROOT", "en", "Root Code");
            multilingualService.saveContent("ROOT", "zh", "根代码");
            multilingualService.saveContent("ROOT", "ko", "루트 코드");

            multilingualService.saveContent("EMP_TYPE", "vi", "Loại nhân viên");
            multilingualService.saveContent("EMP_TYPE", "en", "Employee Type");
            multilingualService.saveContent("EMP_TYPE", "zh", "员工类型");
            multilingualService.saveContent("EMP_TYPE", "ko", "직원 유형");

            multilingualService.saveContent("DEPT", "vi", "Phòng ban");
            multilingualService.saveContent("DEPT", "en", "Department");
            multilingualService.saveContent("DEPT", "zh", "部门");
            multilingualService.saveContent("DEPT", "ko", "부서");

            multilingualService.saveContent("REGULAR", "vi", "Nhân viên chính thức");
            multilingualService.saveContent("REGULAR", "en", "Regular Employee");
            multilingualService.saveContent("REGULAR", "zh", "正式员工");
            multilingualService.saveContent("REGULAR", "ko", "정규직");

            multilingualService.saveContent("CONTRACT", "vi", "Nhân viên hợp đồng");
            multilingualService.saveContent("CONTRACT", "en", "Contract Employee");
            multilingualService.saveContent("CONTRACT", "zh", "合同员工");
            multilingualService.saveContent("CONTRACT", "ko", "계약직");

            return Map.of(
                    "success", true,
                    "message", "Dữ liệu mẫu đã được tạo thành công");
        } catch (Exception e) {
            log.error("Failed to create multilingual sample data", e);
            return Map.of(
                    "success", false,
                    "message", "Loi he thong khi tao du lieu mau da ngon ngu.");
        }
    }
}
