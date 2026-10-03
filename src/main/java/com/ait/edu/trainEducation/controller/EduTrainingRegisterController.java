package com.ait.edu.trainEducation.controller;

import com.ait.edu.trainEducation.model.EduTrainingRegister;
import com.ait.edu.trainEducation.model.EduTrainingRegisterRequest;
import com.ait.edu.trainEducation.service.EduTrainingRegisterService;
import com.ait.exception.BusinessException;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.util.AngularIndexService;
import com.ait.util.MailSendApprovalManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

/**
 * Đăng ký đào tạo bên ngoài (/edu/traineducation/viewRegisterForTraining) - port từ
 * TrainEducationCtroller (Hanwha_HAE): viewRegisterForTraining (danh sách),
 * RegisterForTrainingView + addRegisterForTraining (thêm mới đơn + người phê duyệt).
 */
@Controller
@RequestMapping("/edu")
public class EduTrainingRegisterController {
    private static final Logger log = LoggerFactory.getLogger(EduTrainingRegisterController.class);

    @Autowired
    private EduTrainingRegisterService eduTrainingRegisterService;

    @Autowired
    private AngularIndexService angularIndexService;

    @Autowired
    private MailSendApprovalManager mailSendApprovalManager;

    @GetMapping("/traineducation/viewRegisterForTraining")
    public String view(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/registerTraining/list")
    @ResponseBody
    public List<EduTrainingRegister> list(@RequestParam(required = false) String trainingType) {
        return eduTrainingRegisterService.findMyList(trainingType);
    }

    @GetMapping("/api/registerTraining/defaultApprovers")
    @ResponseBody
    public List<SyAffirmEmailDto> defaultApprovers() {
        return eduTrainingRegisterService.findDefaultApprovers();
    }

    @PostMapping("/api/registerTraining/apply")
    @ResponseBody
    public Map<String, Object> apply(@Valid @RequestBody EduTrainingRegisterRequest body,
            HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        String applyNo;
        try {
            applyNo = eduTrainingRegisterService.apply(body);
            result.put("success", true);
            result.put("applyNo", applyNo);
        } catch (BusinessException e) {
            EduCourseManagerController.putError(result, e);
            return result;
        } catch (Exception e) {
            log.error("Loi khi dang ky dao tao", e);
            result.put("success", false);
            result.put("message", "Loi he thong khi dang ky dao tao.");
            return result;
        }
        // Gửi mail phê duyệt chỉ cho đơn vừa tạo (best-effort, giống bản gốc)
        try {
            mailSendApprovalManager.sendAffirmInfoEmailApproval(request, applyNo);
        } catch (Exception e) {
            log.warn("Gui mail phe duyet dang ky dao tao that bai, applyNo={}: {}", applyNo, e.getMessage());
        }
        return result;
    }
}
