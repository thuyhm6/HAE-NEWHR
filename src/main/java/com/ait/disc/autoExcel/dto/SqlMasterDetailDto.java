package com.ait.disc.autoExcel.dto;

import com.ait.disc.autoExcel.model.ParamBySql;
import com.ait.disc.autoExcel.model.SqlMaster;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * DTO chi tiết truy vấn SQL, gồm thông tin SYS_SQL_MASTER và danh sách
 * tham số SYS_PARAM_BY_SQL - dùng cho màn hình Chi tiết (xem/lưu).
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SqlMasterDetailDto extends SqlMaster {
    private List<ParamBySql> params;
}
