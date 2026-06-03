package com.ait.hrm.recruitManage.controller;

import com.ait.hrm.recruitManage.dto.HrEmployeeRecruitDto;
import com.ait.hrm.recruitManage.dto.HrEducationRecruitDto;
import com.ait.hrm.recruitManage.dto.HrWorkExperienceRecruitDto;
import com.ait.hrm.recruitManage.dto.HrFamilyRecruitDto;
import com.ait.hrm.recruitManage.dto.HrExpInsideBatchDto;
import com.ait.hrm.recruitManage.dto.HrRecruitBatchDto;
import com.ait.hrm.recruitManage.service.HrRecruitManageService;
import com.ait.sy.sys.dto.DataTablesResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/hrm/recruitManage")
public class HrRecruitManageController {

    @Autowired
    private HrRecruitManageService service;

    @GetMapping("/viewRecruitList")
    public String viewRecruitList(Model model, HttpSession session) {
        model.addAttribute("title", "Quyết định nhận việc");
        return "hrm/recruitManage/viewRecruitList";
    }

    @GetMapping("/viewExperienceBatchList")
    public String viewExperienceBatchList(Model model) {
        model.addAttribute("title", "Quyết định hàng loạt");
        return "hrm/recruitManage/viewExperienceBatchList";
    }

    // ── Employee ─────────────────────────────────────────────────────────────

    @PostMapping("/api/employee/list")
    @ResponseBody
    public DataTablesResponse<HrEmployeeRecruitDto> getEmployeeList(@RequestBody HrEmployeeRecruitDto dto) {
        return service.getEmployeeList(dto);
    }

    @GetMapping("/api/employee/detail")
    @ResponseBody
    public HrEmployeeRecruitDto getEmployeeDetail(@RequestParam("personId") String personId) {
        return service.getEmployeeById(personId);
    }

    @PostMapping("/api/employee/save")
    @ResponseBody
    public Map<String, Object> saveEmployee(@RequestBody HrEmployeeRecruitDto dto) {
        return service.saveEmployee(dto);
    }

    // ── Education ─────────────────────────────────────────────────────────────

    @GetMapping("/api/education/list")
    @ResponseBody
    public List<HrEducationRecruitDto> getEducationList(@RequestParam("personId") String personId) {
        return service.getEducationList(personId);
    }

    @PostMapping("/api/education/save")
    @ResponseBody
    public Map<String, Object> saveEducation(@RequestBody HrEducationRecruitDto dto) {
        return service.saveEducation(dto);
    }

    @PostMapping("/api/education/delete")
    @ResponseBody
    public Map<String, Object> deleteEducation(@RequestParam("seq") Long seq) {
        return service.deleteEducation(seq);
    }

    // ── Work Experience ───────────────────────────────────────────────────────

    @GetMapping("/api/workexp/list")
    @ResponseBody
    public List<HrWorkExperienceRecruitDto> getWorkExpList(@RequestParam("personId") String personId) {
        return service.getWorkExpList(personId);
    }

    @PostMapping("/api/workexp/save")
    @ResponseBody
    public Map<String, Object> saveWorkExp(@RequestBody HrWorkExperienceRecruitDto dto) {
        return service.saveWorkExp(dto);
    }

    @PostMapping("/api/workexp/delete")
    @ResponseBody
    public Map<String, Object> deleteWorkExp(@RequestParam("seq") Long seq) {
        return service.deleteWorkExp(seq);
    }

    // ── Family ────────────────────────────────────────────────────────────────

    @GetMapping("/api/family/list")
    @ResponseBody
    public List<HrFamilyRecruitDto> getFamilyList(@RequestParam("personId") String personId) {
        return service.getFamilyList(personId);
    }

    @PostMapping("/api/family/save")
    @ResponseBody
    public Map<String, Object> saveFamily(@RequestBody HrFamilyRecruitDto dto) {
        return service.saveFamily(dto);
    }

    @PostMapping("/api/family/delete")
    @ResponseBody
    public Map<String, Object> deleteFamily(@RequestParam("seq") Long seq) {
        return service.deleteFamily(seq);
    }

    // ── Execute ───────────────────────────────────────────────────────────────

    @PostMapping("/api/execute")
    @ResponseBody
    public Map<String, Object> execute(
            @RequestParam("personIds") String personIds,
            @RequestParam("type") String type) {
        return service.executeRecruit(personIds, type);
    }

    // ── Quyết định hàng loạt (Experience Batch) ───────────────────────────────

    @GetMapping("/api/expBatch/registerList")
    @ResponseBody
    public List<HrExpInsideBatchDto> getRegisterList() {
        return service.getRegisterList();
    }

    @PostMapping("/api/expBatch/register")
    @ResponseBody
    public Map<String, Object> saveRegister(@RequestBody HrExpInsideBatchDto dto) {
        return service.saveRegister(dto);
    }

    @PostMapping("/api/expBatch/list")
    @ResponseBody
    public DataTablesResponse<HrExpInsideBatchDto> getBatchList(@RequestBody HrExpInsideBatchDto dto) {
        return service.getBatchList(dto);
    }

    @PostMapping("/api/expBatch/update")
    @ResponseBody
    public Map<String, Object> updateBatchItem(@RequestBody HrExpInsideBatchDto dto) {
        return service.updateBatchItem(dto);
    }

    @PostMapping("/api/expBatch/delete")
    @ResponseBody
    public Map<String, Object> deleteBatchItem(@RequestParam("seq") String seq) {
        return service.deleteBatchItem(seq);
    }

    @PostMapping("/api/expBatch/import")
    @ResponseBody
    public Map<String, Object> importBatchExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("registerSeq") String registerSeq) {
        return service.importBatchExcel(file, registerSeq);
    }

    // ── Nhận việc hàng loạt (Recruit Batch) ──────────────────────────────────

    @GetMapping("/viewRecruitBatchList")
    public String viewRecruitBatchList(Model model) {
        model.addAttribute("title", "Nhận việc hàng loạt");
        return "hrm/recruitManage/viewRecruitBatchList";
    }

    @GetMapping("/api/rblBatch/registerList")
    @ResponseBody
    public List<HrRecruitBatchDto> getRblRegisterList() {
        return service.getRblRegisterList();
    }

    @PostMapping("/api/rblBatch/register")
    @ResponseBody
    public Map<String, Object> saveRblRegister(@RequestBody HrRecruitBatchDto dto) {
        return service.saveRblRegister(dto);
    }

    @PostMapping("/api/rblBatch/list")
    @ResponseBody
    public DataTablesResponse<HrRecruitBatchDto> getRblBatchList(@RequestBody HrRecruitBatchDto dto) {
        return service.getRblBatchList(dto);
    }

    @PostMapping("/api/rblBatch/update")
    @ResponseBody
    public Map<String, Object> updateRblBatchItem(@RequestBody HrRecruitBatchDto dto) {
        return service.updateRblBatchItem(dto);
    }

    @PostMapping("/api/rblBatch/delete")
    @ResponseBody
    public Map<String, Object> deleteRblBatchItem(@RequestParam("seq") String seq) {
        return service.deleteRblBatchItem(seq);
    }

    @PostMapping("/api/rblBatch/import")
    @ResponseBody
    public Map<String, Object> importRblBatchExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("registerSeq") String registerSeq) {
        return service.importRblBatchExcel(file, registerSeq);
    }
}
