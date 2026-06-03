package com.ait.sy.basicMaintenance.mapper;

import com.ait.sy.basicMaintenance.dto.SyCodeDto;
import com.ait.sy.basicMaintenance.model.SyCode;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * Mapper cho bảng SY_CODE - Xử lý mã code phân cấp
 */
@Mapper
public interface SyCodeMapper {

    /**
     * Lấy tất cả mã code
     */
    List<SyCode> findAll();

    /**
     * Lấy mã code theo CODE_NO
     */
    SyCode findByCodeNo(@Param("codeNo") String codeNo);

    /**
     * Lấy mã code theo nhóm
     */
    List<SyCode> findByGroupCode(@Param("groupCode") String groupCode);

    /**
     * Lấy mã code con theo mã code cha
     */
    List<SyCode> findByParentCodeNo(@Param("parentCodeNo") String parentCodeNo);

    /**
     * Lấy mã code gốc (không có cha)
     */
    List<SyCode> findRootCodes();

    /**
     * Lấy cây phân cấp mã code
     */
    List<SyCode> findCodeTree(@Param("rootCodeNo") String rootCodeNo);

    /**
     * Lấy mã code theo độ sâu
     */
    List<SyCode> findByDepth(@Param("depth") Integer depth);

    /**
     * Lấy mã code hoạt động
     */
    List<SyCode> findActiveCodes();

    /**
     * Thêm mới mã code
     */
    int insert(SyCode syCode);

    /**
     * Cập nhật mã code
     */
    int update(SyCode syCode);

    /**
     * Xóa mã code
     */
    int deleteByCodeNo(@Param("codeNo") String codeNo);

    /**
     * Kiểm tra tồn tại mã code
     */
    boolean existsByCodeNo(@Param("codeNo") String codeNo);

    /**
     * Lấy danh sách nhóm code
     */
    List<String> getDistinctGroupCodes();

    /**
     * Lấy mã code theo hoạt động và nhóm
     */
    List<SyCode> findByActivityAndGroupCode(@Param("activity") String activity, @Param("groupCode") String groupCode);

    /**
     * Lấy danh sách code kèm theo tên đa ngôn ngữ
     */
    List<SyCodeDto> findCodeWithParentNo(@Param("parentCodeNo") String parentCodeNo);

    List<SyCodeDto> searchCodeWithNames(@Param("keyword") String keyword);

    /**
     * Lấy giá trị sequence SY_GLOBAL_NO_SEQ
     */
    String getNextGlobalNoSeq();
}
