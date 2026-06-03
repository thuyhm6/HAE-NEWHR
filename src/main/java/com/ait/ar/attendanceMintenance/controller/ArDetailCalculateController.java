package com.ait.ar.attendanceMintenance.controller;

import com.ait.ar.attendanceMintenance.dto.ArDetailCalculateDto;
import com.ait.ar.attendanceMintenance.service.ArDetailCalculateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/ar/attendanceMintenance")
public class ArDetailCalculateController {

    private static final Logger log = LoggerFactory.getLogger(ArDetailCalculateController.class);

    @Autowired
    private ArDetailCalculateService arDetailCalculateService;

    @GetMapping("/viewArDetailCalculate")
    public String viewArDetailCalculate() {
        return "ar/attendanceMintenance/viewArDetailCalculate";
    }

    @PostMapping("/api/detailCalculate/run")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> runDetailCalculate(@RequestBody ArDetailCalculateDto params) {
        Map<String, Object> response = new HashMap<>();
        try {
            ArDetailCalculateDto result = arDetailCalculateService.runDetailCalculate(params);
            response.put("success", true);
            response.put("message", "Tính toán thành công");
            response.put("personId", result.getPersonId());
        } catch (Exception e) {
            log.error("Failed to run AR_DETAIL_CAL_P", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi thực hiện tính toán."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}
