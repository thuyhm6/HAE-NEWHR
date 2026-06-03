package com.ait.hrm.empinfo.service;

import com.ait.hrm.empinfo.model.HrPersonalInfo;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

/**
 * HrPersonalInfoService - Service xử lý thông tin cá nhân nhân viên
 */
public interface HrPersonalInfoService {

    /**
     * Lấy thông tin personal info theo PERSON_ID
     */
    HrPersonalInfo getPersonalInfoByPersonId(String personId);

    /**
     * Lấy thông tin personal info theo EMP_NO
     */
    HrPersonalInfo getPersonalInfoByEmpNo(String empNo);

    /**
     * Lấy thông tin personal info theo USER_NO
     */
    HrPersonalInfo getPersonalInfoByUserNo(String userNo);

    /**
     * Lấy thông tin personal info từ HrUserInfo
     */
    HrPersonalInfo getPersonalInfoFromHrUserInfo(HrUserInfo hrUserInfo);

    /**
     * Kiểm tra có thông tin personal info không
     */
    boolean hasPersonalInfo(String userNo);

    /**
     * Cập nhật thông tin personal info
     */
    boolean updatePersonalInfo(HrPersonalInfo info);

}
