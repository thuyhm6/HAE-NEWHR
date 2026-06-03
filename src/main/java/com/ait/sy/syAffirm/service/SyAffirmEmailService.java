package com.ait.sy.syAffirm.service;

import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;

import java.util.List;
import java.util.Map;

public interface SyAffirmEmailService {
    List<SyAffirmEmailDto> getList(SyAffirmEmailDto dto);

    SyAffirmEmailDto getById(String seq);

    void save(SyAffirmEmailDto dto);

    void delete(String seq);

    List<SyAffirmEmailDto> findAffirmorList(String applyTypeNo, String personId, String applyTypeCode, String applyLength);

    List<SyAffirmEmailDto> getApprovalEmailList(SyAffirmEmailDto dto);

    List<SyAffirmEmailDto> getApprovaledEmailList(SyAffirmEmailDto dto);

    String executeAffirm(List<Map<String, Object>> items);

    Map<String, Integer> getPendingApprovalCounts();

    Map<String, Integer> getHrmPendingCounts();

    List<SyAffirmEmailDto> getNoticeedEmailList(SyAffirmEmailDto dto);
}
