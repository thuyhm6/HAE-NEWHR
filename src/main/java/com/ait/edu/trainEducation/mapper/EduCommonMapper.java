package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduDeptNode;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduFile;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Tra cứu dùng chung cho module đào tạo: cây phòng ban, nhân viên, file đính kèm.
 */
@Mapper
public interface EduCommonMapper {

    /** Toàn bộ phòng ban đang hiệu lực của công ty. */
    List<EduDeptNode> findDeptTree();

    /**
     * Tìm nhân viên đang làm việc.
     *
     * @param keyword  mã NV hoặc họ tên (không dấu, không phân biệt hoa thường)
     * @param deptNos  danh sách phòng ban (khớp chính xác) - có thể rỗng
     * @param deptRoot phòng ban gốc (lấy cả phòng ban con) - có thể rỗng
     * @param orderBy  "E" = theo mã NV, còn lại theo họ tên
     */
    List<EduEmployeeLookup> findEmployees(@Param("keyword") String keyword,
            @Param("deptNos") List<String> deptNos,
            @Param("deptRoot") String deptRoot,
            @Param("orderBy") String orderBy);

    EduEmployeeLookup findEmployeeByEmpid(@Param("empid") String empid);

    List<EduFile> findFiles(@Param("applyType") String applyType, @Param("applyNos") List<String> applyNos);

    EduFile findFileByNo(@Param("fileNo") String fileNo);

    int softDeleteFile(@Param("fileNo") String fileNo);

    int softDeleteFilesByApply(@Param("applyType") String applyType, @Param("applyNo") String applyNo);
}
