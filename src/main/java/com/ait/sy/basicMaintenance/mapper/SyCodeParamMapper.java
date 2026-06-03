package com.ait.sy.basicMaintenance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.ait.sy.basicMaintenance.dto.SyCodeParamDto;
import com.ait.sy.basicMaintenance.model.SyCodeParam;

import java.util.List;

/**
 * Mapper cho bảng SY_CODE_PARAM - Liên kết giữa SY_CODE và HR_COMPANY
 */
@Mapper
@Repository
public interface SyCodeParamMapper {

    /**
     * Lấy tất cả tham số code
     */
    List<SyCodeParam> findAll();

    /**
     * Lấy tham số code theo PARAM_NO
     */
    SyCodeParam findByParamNo(@Param("paramNo") String paramNo);

    /**
     * Lấy tham số code theo CODE_NO
     */
    List<SyCodeParam> findByCodeNo(@Param("codeNo") String codeNo);

    /**
     * Lấy tham số code theo CPNY_ID
     */
    List<SyCodeParam> findByCpnyId(@Param("cpnyId") String cpnyId);

    /**
     * Lấy tham số code theo CODE_NO và CPNY_ID
     */
    SyCodeParam findByCodeNoAndCpnyId(@Param("codeNo") String codeNo, @Param("cpnyId") String cpnyId);

    /**
     * Lấy danh sách công ty theo CODE_NO
     */
    List<String> getCpnyIdsByCodeNo(@Param("codeNo") String codeNo);

    /**
     * Lấy danh sách CODE_NO theo CPNY_ID
     */
    List<String> getCodeNosByCpnyId(@Param("cpnyId") String cpnyId);

    /**
     * Thêm mới tham số code
     */
    int insert(SyCodeParam syCodeParam);

    /**
     * Cập nhật tham số code
     */
    int update(SyCodeParam syCodeParam);

    /**
     * Xóa tham số code
     */
    int deleteByParamNo(@Param("paramNo") String paramNo);

    /**
     * Xóa tham số code theo CODE_NO và CPNY_ID
     */
    int deleteByCodeNoAndCpnyId(@Param("codeNo") String codeNo, @Param("cpnyId") String cpnyId);

    /**
     * Kiểm tra tồn tại tham số code
     */
    boolean existsByParamNo(@Param("paramNo") String paramNo);

    /**
     * Kiểm tra tồn tại liên kết CODE_NO và CPNY_ID
     */
    boolean existsByCodeNoAndCpnyId(@Param("codeNo") String codeNo, @Param("cpnyId") String cpnyId);

    /**
     * Lấy danh sách code kèm thông tin tham số theo Parent và Company
     */
    List<SyCodeParamDto> selectParamByParentAndCompany(@Param("parentCode") String parentCode,
            @Param("cpnyId") String cpnyId, @Param("lang") String lang);

}
