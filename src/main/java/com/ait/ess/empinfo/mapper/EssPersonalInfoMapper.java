package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.EssApplyInfoDto;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

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

    /**
     * Đếm tổng số bản ghi apply của nhân viên (UNION ALL toàn bộ bảng apply)
     */
    int countMyApplyList(EssApplyInfoDto dto);

    /**
     * Lấy danh sách phân trang các apply của nhân viên
     */
    List<EssApplyInfoDto> selectMyApplyListPage(EssApplyInfoDto dto);
}
