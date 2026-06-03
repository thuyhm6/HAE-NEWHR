package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.dto.EmpMonthlyStatsDto;
import com.ait.hrm.empinfo.dto.EmployeeSearchResponse;
import com.ait.hrm.empinfo.model.HrEmployee;

import java.util.List;

/**
 * HrEmployeeMapper - Interface cho các thao tác với bảng hr_employee
 */
@Mapper
public interface HrEmployeeMapper {

    /**
     * Tìm nhân viên theo personId
     * 
     * @param personId ID cá nhân
     * @return HrEmployee object hoặc null
     */
    HrEmployee findByPersonId(@Param("personId") String personId);

    /**
     * Tìm nhân viên theo empId
     * 
     * @param empId Mã nhân viên
     * @return HrEmployee object hoặc null
     */
    HrEmployee findByEmpId(@Param("empId") String empId);

    /**
     * Tìm nhân viên theo deptNo
     * 
     * @param deptNo Mã phòng ban
     * @return List<HrEmployee>
     */
    List<HrEmployee> findByDeptNo(@Param("deptNo") String deptNo);

    /**
     * Tìm nhân viên theo cpnyId
     * 
     * @param cpnyId ID công ty
     * @return List<HrEmployee>
     */
    List<HrEmployee> findByCpnyId(@Param("cpnyId") String cpnyId);

    /**
     * Kiểm tra nhân viên có tồn tại và hoạt động không
     * 
     * @param personId ID cá nhân
     * @return true nếu tồn tại và hoạt động
     */
    boolean existsAndActiveByPersonId(@Param("personId") String personId);

    /**
     * Kiểm tra deptNo có tồn tại trong bảng hr_employee không
     * 
     * @param deptNo Mã phòng ban
     * @return true nếu tồn tại
     */
    boolean existsDeptNo(@Param("deptNo") String deptNo);

    /**
     * Lấy tất cả nhân viên
     * 
     * @return List<HrEmployee>
     */
    List<HrEmployee> findAll();

    /**
     * Lấy danh sách nhân viên phân trang
     * 
     * @param offset Vị trí bắt đầu
     * @param limit  Số lượng bản ghi
     * @return List<HrEmployee>
     */
    List<HrEmployee> getEmployeesWithPagination(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * Tìm kiếm nhân viên theo từ khóa (dùng cho Service searchByKeyword)
     * 
     * @param keyword Từ khóa tìm kiếm
     * @return List<HrEmployee>
     */
    List<HrEmployee> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Tìm kiếm nhân viên từ HR_Employee
     */
    List<EmployeeSearchResponse> searchEmployees(@Param("empId") String empId,
            @Param("localName") String localName,
            @Param("deptNo") String deptNo,
            @Param("keyword") String keyword,
            @Param("deptCodes") List<String> deptCodes,
            @Param("empOffice") String empOffice);

    List<EmpMonthlyStatsDto> selectEmpMonthlyStats(@Param("year") int year);
}
