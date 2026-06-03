package com.ait.org.orgManage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.org.orgManage.model.HrDepartment;

import java.util.List;

/**
 * HrDepartmentMapper - Interface cho các thao tác với bảng hr_department
 */
@Mapper
public interface HrDepartmentMapper {

    /**
     * Tìm phòng ban theo deptNo
     * 
     * @param deptNo Mã phòng ban
     * @return HrDepartment object hoặc null
     */
    HrDepartment findByDeptNo(@Param("deptNo") String deptNo);

    /**
     * Tìm phòng ban theo deptId
     * 
     * @param deptId ID phòng ban
     * @return HrDepartment object hoặc null
     */
    HrDepartment findByDeptId(@Param("deptId") String deptId);

    /**
     * Tìm phòng ban theo cpnyId
     * 
     * @param cpnyId ID công ty
     * @return List<HrDepartment>
     */
    List<HrDepartment> findByCpnyId(@Param("cpnyId") String cpnyId);

    /**
     * Tìm phòng ban theo parentDeptNo
     * 
     * @param parentDeptNo Mã phòng ban cha
     * @return List<HrDepartment>
     */
    List<HrDepartment> findByParentDeptNo(@Param("parentDeptNo") String parentDeptNo);

    /**
     * Kiểm tra phòng ban có tồn tại và hoạt động không
     * 
     * @param deptNo Mã phòng ban
     * @return true nếu tồn tại và hoạt động
     */
    boolean existsAndActiveByDeptNo(@Param("deptNo") String deptNo);

    /**
     * Lấy danh sách tất cả phòng ban hoạt động
     * 
     * @return List<HrDepartment>
     */
    List<HrDepartment> findAllActive();

    /**
     * Lấy cây phòng ban theo cấp
     * 
     * @param level Cấp phòng ban
     * @return List<HrDepartment>
     */
    List<HrDepartment> findByLevel(@Param("level") Integer level);

    /**
     * Lấy cây phòng ban
     * 
     * @return List<HrDepartment>
     */
    List<HrDepartment> getDepartmentTree();
}
