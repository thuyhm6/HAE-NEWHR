package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrQualification;

import java.util.List;

@Mapper
public interface HrQualificationMapper {

    List<HrQualification> searchQualification(@Param("empId") String empId,
            @Param("localName") String localName,
            @Param("qualName") String qualName);

    List<HrQualification> getByPersonId(@Param("personId") String personId);

    /**
     * Lấy chi tiết
     */
    HrQualification getById(@Param("qualNo") Long qualNo);

    /**
     * Thêm mới
     */
    int insert(HrQualification record);

    /**
     * Cập nhật
     */
    int update(HrQualification record);

    /**
     * Xóa
     */
    int delete(@Param("qualNo") Long qualNo);
}
