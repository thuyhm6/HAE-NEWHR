package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduSystemManager;
import com.ait.edu.trainEducation.service.EduSystemManagerService;
import com.ait.exception.BusinessException;
import com.ait.util.AngularIndexService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

/**
 * Hệ thống đào tạo (/edu/traineducation/systemManager) - port từ
 * TrainEducationCtroller (Hanwha_HAE). Thêm/Sửa dùng modal trên trang Angular.
 */
@Controller
@RequestMapping("/edu")
public class EduSystemManagerController {
    private static final Logger log = LoggerFactory.getLogger(EduSystemManagerController.class);

    @Autowired
    private EduSystemManagerService eduSystemManagerService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/systemManager")
    public String viewSystemManager(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/systemManager/list")
    @ResponseBody
    public List<EduSystemManager> getList(@RequestParam(required = false) String trainDiffCode,
            @RequestParam(required = false) String trainTypeCode) {
        return eduSystemManagerService.findList(trainDiffCode, trainTypeCode);
    }

    @GetMapping("/api/systemManager/detail")
    @ResponseBody
    public EduSystemManager getDetail(@RequestParam String sysmanaNo) {
        return eduSystemManagerService.getDetail(sysmanaNo);
    }

    @PostMapping("/api/systemManager/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduSystemManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            String trainTypeNo = eduSystemManagerService.add(entity);
            result.put("success", true);
            result.put("trainTypeNo", trainTypeNo);
        } catch (BusinessException e) {
            result.put("success", false);
            result.put("errorCode", e.getErrorCode());
            result.put("message", e.getUserMessage());
        } catch (Exception e) {
            log.error("Loi khi them moi he thong dao tao", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi he thong dao tao.");
        }
        return result;
    }

    @PostMapping("/api/systemManager/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduSystemManager entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduSystemManagerService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            result.put("success", false);
            result.put("errorCode", e.getErrorCode());
            result.put("message", e.getUserMessage());
        } catch (Exception e) {
            log.error("Loi khi cap nhat he thong dao tao, sysmanaNo={}", entity.getSysmanaNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat he thong dao tao.");
        }
        return result;
    }

    @PostMapping("/api/systemManager/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String sysmanaNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduSystemManagerService.delete(sysmanaNo);
            result.put("success", true);
        } catch (BusinessException e) {
            result.put("success", false);
            result.put("errorCode", e.getErrorCode());
            result.put("message", e.getUserMessage());
        } catch (Exception e) {
            log.error("Loi khi xoa he thong dao tao, sysmanaNo={}", sysmanaNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa he thong dao tao.");
        }
        return result;
    }
}
