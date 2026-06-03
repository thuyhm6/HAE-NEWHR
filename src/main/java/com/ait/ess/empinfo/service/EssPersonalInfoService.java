package com.ait.ess.empinfo.service;

import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;

import java.util.List;

/**
 * Service cho tính năng Xem thông tin cá nhân (ESS)
 */
public interface EssPersonalInfoService {

    /**
     * Lấy thông tin cá nhân và thông tin cơ bản
     */
    EssPersonalInfoDto getMyInfo(String personId);

    /**
     * Lấy danh sách địa chỉ của cá nhân
     */
    List<HrAddressMatters> getMyAddresses(String personId);

    /**
     * Lấy danh sách gia đình của cá nhân
     */
    List<HrFamily> getMyFamilies(String personId);

    /**
     * Lấy danh sách người liên hệ khẩn cấp
     */
    List<HrEmergencyAddress> getMyEmergencies(String personId);
}
