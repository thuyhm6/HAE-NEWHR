package com.ait.cleverse.service.impl;

import com.ait.cleverse.service.CleverseAttendanceService;
import hanwha.neo.branch.ss.att.service.NeoHrWsProxy;
import hanwha.neo.branch.ss.att.vo.ArraysHrOffVo;
import hanwha.neo.branch.ss.att.vo.HrOffCodeVo;
import hanwha.neo.branch.ss.att.vo.HrOffListVo;
import hanwha.neo.branch.ss.att.vo.SyncHrOffDataRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CleverseAttendanceServiceImpl implements CleverseAttendanceService {

    private static final Logger log = LoggerFactory.getLogger(CleverseAttendanceServiceImpl.class);

    @Value("${cleverse.attendance.endpoint}")
    private String endpointUrl;

    @Override
    public String syncHrOffData(SyncHrOffDataRequest request) {
        try {
            log.info("Calling Cleverse syncHrOffData - endpoint: {}", endpointUrl);
            NeoHrWsProxy proxy = new NeoHrWsProxy(endpointUrl);
            String result = proxy.syncHrOffData(request);
            log.info("Cleverse syncHrOffData result: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Cleverse syncHrOffData error: {}", e.getMessage(), e);
            return "Fail";
        }
    }

    @Override
    public String syncAttendanceList(List<HrOffListVo> hrOffList, List<HrOffCodeVo> hrOffCodeList) {
        try {
            ArraysHrOffVo arraysHrOffVo = new ArraysHrOffVo();
            if (hrOffList != null && !hrOffList.isEmpty()) {
                arraysHrOffVo.setHrOffList(hrOffList.toArray(new HrOffListVo[0]));
            }
            if (hrOffCodeList != null && !hrOffCodeList.isEmpty()) {
                arraysHrOffVo.setHrOffCode(hrOffCodeList.toArray(new HrOffCodeVo[0]));
            }

            SyncHrOffDataRequest request = new SyncHrOffDataRequest();
            request.setArraysHrOffVo(arraysHrOffVo);

            return syncHrOffData(request);
        } catch (Exception e) {
            log.error("syncAttendanceList build request error: {}", e.getMessage(), e);
            return "Fail";
        }
    }
}
