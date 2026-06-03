package com.ait.sy.basicMaintenance.mapper;

import com.ait.sy.basicMaintenance.dto.HrCompanyDto;
import com.ait.sy.basicMaintenance.model.HrCompany;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface HrCompanyMapper {

    List<HrCompanyDto> findAllWithNames(@Param("keyword") String keyword);

    List<HrCompany> findAll();

    List<HrCompany> searchCompanies(@Param("keyword") String keyword);

    HrCompany findByCpnyId(@Param("cpnyId") String cpnyId);

    HrCompany findByCpnyNo(@Param("cpnyNo") String cpnyNo);

    int insert(HrCompany hrCompany);

    int update(HrCompany hrCompany);

    int deleteByCpnyNo(@Param("cpnyNo") String cpnyNo);

    int deleteByCpnyId(@Param("cpnyId") String cpnyId);

    boolean existsByCpnyId(@Param("cpnyId") String cpnyId);

    /**
     * Lấy giá trị sequence SY_GLOBAL_NO_SEQ để sinh CPNY_NO
     */
    String getNextGlobalNoSeq();
}
