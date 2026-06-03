package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrWorkExperience;

import java.util.List;

@Mapper
public interface HrWorkExperienceMapper {

    /**
     * Lấy danh sách kinh nghiệm làm việc theo personId
     */
    List<HrWorkExperience> getByPersonId(@Param("personId") String personId);

    /**
     * Tìm kiếm thông tin kinh nghiệm làm việc
     */
    List<HrWorkExperience> searchWorkExperience(@Param("empId") String empId,
            @Param("localName") String localName,
            @Param("companyName") String companyName);

    /**
     * Thêm mới
     */
    int insert(HrWorkExperience record);

    /**
     * Cập nhật
     */
    int update(HrWorkExperience record);

    /**
     * Xóa
     */
    int delete(@Param("workExpNo") Long workExpNo);

    /**
     * Lấy chi tiết
     */
    HrWorkExperience getById(@Param("workExpNo") Long workExpNo);
}
