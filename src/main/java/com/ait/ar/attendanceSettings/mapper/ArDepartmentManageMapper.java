package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArDepartmentManageDto;
import com.ait.ar.attendanceSettings.model.ArDepartmentManage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArDepartmentManageMapper {
        /**
         * Get department manage list combined with HR_DEPARTMENT by lock date
         */
        List<ArDepartmentManageDto> getDepartmentManageList(java.util.Map<String, Object> params);

        /**
         * Check if a record exists for this deptNo and lockDate
         */
        int checkExists(@Param("lockDate") String lockDate, @Param("deptNo") String deptNo);

        /**
         * Insert new department manage lock record
         */
        void insertDeptManage(ArDepartmentManage model);

        /**
         * Update existing department manage lock record
         */
        void updateDeptManage(ArDepartmentManage model);
}
