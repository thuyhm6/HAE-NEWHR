package com.ait.sy.sys.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.sy.sys.model.SyGlobalName;

import java.util.List;

/**
 * Mapper cho bảng SY_GLOBAL_NAME - Xử lý đa ngôn ngữ
 */
@Mapper
public interface SyGlobalNameMapper {

    /**
     * Lấy tất cả bản ghi đa ngôn ngữ
     */
    List<SyGlobalName> findAll();

    /**
     * Lấy bản ghi đa ngôn ngữ theo mã số và ngôn ngữ
     */
    SyGlobalName findByNoAndLanguage(@Param("no") String no, @Param("language") String language);

    /**
     * Lấy tất cả bản ghi đa ngôn ngữ theo mã số
     */
    List<SyGlobalName> findByNo(@Param("no") String no);

    /**
     * Lấy tất cả bản ghi đa ngôn ngữ theo ngôn ngữ
     */
    List<SyGlobalName> findByLanguage(@Param("language") String language);

    /**
     * Lấy nội dung đa ngôn ngữ theo mã số và ngôn ngữ
     */
    String getContentByNoAndLanguage(@Param("no") String no, @Param("language") String language);

    /**
     * Lấy tất cả nội dung đa ngôn ngữ theo mã số (Map<String, String>)
     */
    List<SyGlobalName> getContentsByNo(@Param("no") String no);

    /**
     * Thêm mới bản ghi đa ngôn ngữ
     */
    int insert(SyGlobalName syGlobalName);

    /**
     * Cập nhật bản ghi đa ngôn ngữ
     */
    int update(SyGlobalName syGlobalName);

    /**
     * Xóa bản ghi đa ngôn ngữ theo mã số và ngôn ngữ
     */
    int deleteByNoAndLanguage(@Param("no") String no, @Param("language") String language);

    /**
     * Xóa tất cả bản ghi đa ngôn ngữ theo mã số
     */
    int deleteByNo(@Param("no") String no);

    /**
     * Kiểm tra tồn tại bản ghi theo mã số và ngôn ngữ
     */
    boolean existsByNoAndLanguage(@Param("no") String no, @Param("language") String language);

    /**
     * Lấy danh sách mã số có đa ngôn ngữ
     */
    List<String> getDistinctNos();

    /**
     * Lấy danh sách ngôn ngữ có sẵn
     */
    List<String> getAvailableLanguages();

    /**
     * Lấy sequence cho NO
     */
    String getNextNoSeq();
}
