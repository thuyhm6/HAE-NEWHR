package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrSpecialMatter;

import java.util.List;

@Mapper
public interface HrSpecialMatterMapper {

        /**
         * Lấy danh sách nhân viên nữ từ bảng HR_SPECIAL_MATTER
         * Join với bảng hr_employee để lấy thông tin nhân viên
         */
        List<HrSpecialMatter> getFemaleEmployeesList();

        /**
         * Lấy danh sách nhân viên nữ với phân trang
         */
        List<HrSpecialMatter> getFemaleEmployeesListWithPagination(
                        @Param("offset") int offset,
                        @Param("limit") int limit);

        /**
         * Đếm tổng số nhân viên nữ
         */
        int countFemaleEmployees();

        /**
         * Tìm kiếm nhân viên nữ theo tên hoặc mã nhân viên
         */
        List<HrSpecialMatter> searchFemaleEmployees(@Param("keyword") String keyword);

        /**
         * Tìm kiếm nhân viên nữ với nhiều điều kiện (cho export)
         */
        List<HrSpecialMatter> searchFemaleEmployeesWithConditions(
                        @Param("localName") String localName,
                        @Param("empId") String empId,
                        @Param("deptNo") String deptNo,
                        @Param("position") String position,
                        @Param("createDateFrom") String createDateFrom,
                        @Param("createDateTo") String createDateTo,
                        @Param("activity") String activity,
                        @Param("otFlag") String otFlag);

        /**
         * Lấy thông tin chi tiết của một nhân viên nữ
         */
        HrSpecialMatter getSpecialMatterById(@Param("specialNo") String specialNo);

        /**
         * Cập nhật thông tin nhân viên nữ
         */
        int updateSpecialMatter(HrSpecialMatter employee);

        /**
         * Thêm mới nhân viên nữ
         */
        int addSpecialMatter(HrSpecialMatter employee);

        /**
         * Xóa nhân viên nữ
         */
        int deleteSpecialMatter(@Param("specialNo") String specialNo);

        /**
         * DataTables server-side processing - Lấy danh sách với tìm kiếm và sắp xếp
         */
        List<HrSpecialMatter> getFemaleEmployeesForDataTables(
                        @Param("searchValue") String searchValue,
                        @Param("orderColumn") String orderColumn,
                        @Param("orderDir") String orderDir,
                        @Param("offset") int offset,
                        @Param("limit") int limit,
                        @Param("empName") String empName,
                        @Param("empCode") String empCode,
                        @Param("department") String department,
                        @Param("position") String position,
                        @Param("createDateFrom") String createDateFrom,
                        @Param("createDateTo") String createDateTo,
                        @Param("activity") String activity,
                        @Param("otFlag") String otFlag);

        /**
         * DataTables server-side processing - Đếm tổng số bản ghi sau khi lọc
         */
        int countFemaleEmployeesForDataTables(
                        @Param("searchValue") String searchValue,
                        @Param("localName") String localName,
                        @Param("empId") String empId,
                        @Param("deptNo") String deptNo,
                        @Param("position") String position,
                        @Param("createDateFrom") String createDateFrom,
                        @Param("createDateTo") String createDateTo,
                        @Param("activity") String activity,
                        @Param("otFlag") String otFlag);

        /**
         * DataTables server-side processing - Lấy danh sách với generic search
         * parameters
         */
        List<HrSpecialMatter> getFemaleEmployeesForDataTablesWithSearchParams(
                        @Param("searchValue") String searchValue,
                        @Param("orderColumn") String orderColumn,
                        @Param("orderDir") String orderDir,
                        @Param("offset") int offset,
                        @Param("limit") int limit,
                        @Param("localName") String localName,
                        @Param("empId") String empId,
                        @Param("deptNo") String deptNo,
                        @Param("position") String position,
                        @Param("createDateFrom") String createDateFrom,
                        @Param("createDateTo") String createDateTo,
                        @Param("activity") String activity,
                        @Param("otFlag") String otFlag);

        /**
         * DataTables server-side processing - Đếm tổng số bản ghi với generic search
         * parameters
         */
        int countFemaleEmployeesForDataTablesWithSearchParams(
                        @Param("searchValue") String searchValue,
                        @Param("localName") String localName,
                        @Param("empId") String empId,
                        @Param("deptNo") String deptNo,
                        @Param("position") String position,
                        @Param("createDateFrom") String createDateFrom,
                        @Param("createDateTo") String createDateTo,
                        @Param("activity") String activity,
                        @Param("otFlag") String otFlag);
}
