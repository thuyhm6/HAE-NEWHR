package com.ait.hrm.approve.controller;

import com.ait.ess.empinfo.dto.EssFileDto;
import com.ait.ess.empinfo.mapper.EssFileMapper;
import com.ait.hrm.approve.dto.HrmApproveApplyDto;
import com.ait.hrm.approve.service.HrmApproveService;
import com.ait.sy.sys.dto.DataTablesResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/hrm/approve")
public class HrmApproveController {

    @Autowired
    private HrmApproveService hrmApproveService;

    @Autowired
    private EssFileMapper essFileMapper;

    /**
     * Trang danh sách phê duyệt thay đổi thông tin cá nhân nhân viên
     */
    @GetMapping("/viewEssApplyInfo")
    public String viewEssApplyInfo() {
        return "hrm/approve/viewEssApplyInfo";
    }

    /**
     * API: Lấy danh sách phân trang các yêu cầu thay đổi (cho manager)
     */
    @GetMapping("/api/applyList")
    @ResponseBody
    public DataTablesResponse<HrmApproveApplyDto> getApplyList(HrmApproveApplyDto dto) {
        try {
            int total = hrmApproveService.countApplyList(dto);
            List<HrmApproveApplyDto> list = hrmApproveService.getApplyListPage(dto);
            return new DataTablesResponse<>(dto.getDraw(), total, total, list);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách apply cho manager", e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi hệ thống");
        }
    }

    /**
     * API: Lấy chi tiết apply (dữ liệu mới) và dữ liệu gốc để so sánh
     */
    @GetMapping("/api/applyDetail")
    @ResponseBody
    public Map<String, Object> getApplyDetail(@RequestParam String applyNo,
                                               @RequestParam String applyTableType) {
        Map<String, Object> result = new HashMap<>();
        try {
            Object applyData = hrmApproveService.getApplyDetail(applyNo, applyTableType);
            Map<String, Object> originalData = hrmApproveService.getOriginalData(applyNo, applyTableType);
            List<EssFileDto> files = essFileMapper.selectFilesByApplyNo(applyNo);
            result.put("success", true);
            result.put("applyData", applyData);
            result.put("originalData", originalData);
            result.put("files", files);
        } catch (Exception e) {
            log.error("Lỗi lấy chi tiết apply applyNo={} type={}", applyNo, applyTableType, e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống");
        }
        return result;
    }

    /**
     * API: Phê duyệt yêu cầu thay đổi thông tin
     * - Cập nhật ACTIVITY=2 trong bảng apply
     * - Sao chép dữ liệu vào bảng chính
     */
    @PostMapping("/api/approve")
    @ResponseBody
    public Map<String, Object> approve(@RequestParam String applyNo,
                                        @RequestParam String applyTableType) {
        Map<String, Object> result = new HashMap<>();
        try {
            hrmApproveService.approve(applyNo, applyTableType);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi phê duyệt applyNo={} type={}", applyNo, applyTableType, e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống");
        }
        return result;
    }

    /**
     * API: Từ chối yêu cầu thay đổi thông tin
     * - Chỉ cập nhật ACTIVITY=3 trong bảng apply
     */
    @PostMapping("/api/reject")
    @ResponseBody
    public Map<String, Object> reject(@RequestParam String applyNo,
                                       @RequestParam String applyTableType) {
        Map<String, Object> result = new HashMap<>();
        try {
            hrmApproveService.reject(applyNo, applyTableType);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi từ chối applyNo={} type={}", applyNo, applyTableType, e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống");
        }
        return result;
    }
}
