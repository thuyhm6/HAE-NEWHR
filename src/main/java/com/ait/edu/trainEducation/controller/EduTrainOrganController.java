package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduTrainOrgan;
import com.ait.edu.trainEducation.service.EduTrainOrganService;
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
 * Đơn vị đào tạo (/edu/traineducation/trainOrgan) - port từ
 * TrainEducationCtroller (Hanwha_HTSV). File đính kèm dùng /edu/api/files/*.
 */
@Controller
@RequestMapping("/edu")
public class EduTrainOrganController {
    private static final Logger log = LoggerFactory.getLogger(EduTrainOrganController.class);

    @Autowired
    private EduTrainOrganService eduTrainOrganService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/traineducation/trainOrgan")
    public String viewTrainOrgan(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/trainOrgan/list")
    @ResponseBody
    public List<EduTrainOrgan> getList(@RequestParam(required = false) String organName,
            @RequestParam(required = false) String address) {
        return eduTrainOrganService.findList(organName, address);
    }

    @GetMapping("/api/trainOrgan/detail")
    @ResponseBody
    public EduTrainOrgan getDetail(@RequestParam String organNo) {
        return eduTrainOrganService.getDetail(organNo);
    }

    @PostMapping("/api/trainOrgan/add")
    @ResponseBody
    public Map<String, Object> add(@Valid @RequestBody EduTrainOrgan entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("organNo", eduTrainOrganService.add(entity));
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi them moi don vi dao tao", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi them moi don vi dao tao.");
        }
        return result;
    }

    @PostMapping("/api/trainOrgan/update")
    @ResponseBody
    public Map<String, Object> update(@Valid @RequestBody EduTrainOrgan entity) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTrainOrganService.update(entity);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi cap nhat don vi dao tao, organNo={}", entity.getOrganNo(), e);
            result.put("success", false);
            result.put("message", "Loi he thong khi cap nhat don vi dao tao.");
        }
        return result;
    }

    @PostMapping("/api/trainOrgan/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam String organNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            eduTrainOrganService.delete(organNo);
            result.put("success", true);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
        } catch (Exception e) {
            log.error("Loi khi xoa don vi dao tao, organNo={}", organNo, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xoa don vi dao tao.");
        }
        return result;
    }
}
