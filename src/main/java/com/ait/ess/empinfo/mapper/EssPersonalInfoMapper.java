package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * Mapper cho ESS - thông tin cá nhân (chỉ đọc dữ liệu của chính user)
 */
@Mapper
public interface EssPersonalInfoMapper {

    /**
     * Lấy thông tin cơ bản + cá nhân theo personId
     * Join HR_EMPLOYEE + HR_PERSONAL_INFO + HR_DEPARTMENT
     */
    EssPersonalInfoDto findMyInfo(@Param("personId") String personId);
}
