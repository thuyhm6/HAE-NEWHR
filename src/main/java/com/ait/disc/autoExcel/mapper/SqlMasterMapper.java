package com.ait.disc.autoExcel.mapper;

import com.ait.disc.autoExcel.model.SqlMaster;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng SYS_SQL_MASTER.
 */
@Mapper
public interface SqlMasterMapper {

    List<SqlMaster> findAll(@Param("keyword") String keyword, @Param("pgmNm") String pgmNm);

    SqlMaster findBySqlSeq(@Param("sqlSeq") String sqlSeq);

    /** Sinh SQL_SEQ tiếp theo = MAX(TO_NUMBER(SQL_SEQ)) + 1 (hoặc 1 nếu bảng rỗng). */
    String getNextSqlSeq();

    void insert(SqlMaster sqlMaster);

    void update(SqlMaster sqlMaster);

    void deleteBySqlSeq(@Param("sqlSeq") String sqlSeq);
}
