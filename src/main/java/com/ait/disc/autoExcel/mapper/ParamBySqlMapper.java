package com.ait.disc.autoExcel.mapper;

import com.ait.disc.autoExcel.model.ParamBySql;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng SYS_PARAM_BY_SQL.
 */
@Mapper
public interface ParamBySqlMapper {

    List<ParamBySql> findBySqlSeq(@Param("sqlSeq") String sqlSeq);

    void insert(ParamBySql paramBySql);

    void deleteBySqlSeq(@Param("sqlSeq") String sqlSeq);
}
