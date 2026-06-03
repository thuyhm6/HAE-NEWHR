package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrPersonalInfo;

/**
 * HrPersonalInfoMapper - Mapper cho bảng hr_personal_info
 * Sử dụng XML mapper để định nghĩa các query phức tạp
 */
@Mapper
public interface HrPersonalInfoMapper {

    /**
     * Lấy thông tin personal info theo PERSON_ID
     */
    HrPersonalInfo findByPersonId(@Param("personId") String personId);

    /**
     * Lấy thông tin personal info kết hợp với employee info
     */
    HrPersonalInfo findByEmpNo(@Param("empNo") String empNo);

    /**
     * Lấy thông tin personal info kết hợp với user info
     */
    HrPersonalInfo findByUserNo(@Param("userNo") String userNo);

    /**
     * Cập nhật thông tin personal info (dynamic update)
     */
    int update(HrPersonalInfo info);
}
