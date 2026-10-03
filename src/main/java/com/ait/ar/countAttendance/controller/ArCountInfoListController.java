package com.ait.ar.countAttendance.controller;

import com.ait.ar.countAttendance.dto.ArCountInfoListOtDto;
import com.ait.ar.countAttendance.service.ArCountInfoListService;
import com.ait.util.AngularIndexService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Hiện trạng chấm công của nhân viên (/ar/countAttendance/arCountInfoList) -
 * tab "Nghỉ phép" tái sử dụng nguyên vẹn API arPersonalList (xem
 * EssViewDeptController), tab "Tăng ca" dùng API mới ở đây (tổng hợp tăng ca
 * theo tháng, hàm GET_AR_OT_TOTAIL).
 */
@Controller
@RequestMapping("/ar/countAttendance")
public class ArCountInfoListController {

    @Autowired
    private ArCountInfoListService arCountInfoListService;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/arCountInfoList")
    public String viewArCountInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/otSummary")
    @ResponseBody
    public ResponseEntity<List<ArCountInfoListOtDto>> getOtSummary(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String empTypeCode,
            @RequestParam(required = false) String startTime) {
        ArCountInfoListOtDto params = new ArCountInfoListOtDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setEmpTypeCode(empTypeCode);
        params.setStartTime(startTime);
        return ResponseEntity.ok(arCountInfoListService.getOtSummaryList(params));
    }
}
