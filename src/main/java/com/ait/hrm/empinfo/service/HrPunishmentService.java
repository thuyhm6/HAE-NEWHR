package com.ait.hrm.empinfo.service;

import java.util.List;

import com.ait.hrm.empinfo.model.HrPunishment;

public interface HrPunishmentService {
    List<HrPunishment> searchPunishment(String empId, String localName, String punishCode);

    HrPunishment getById(Long punishNo);

    boolean savePunishment(HrPunishment info, boolean isNew);

    boolean deletePunishment(Long punishNo);
}
