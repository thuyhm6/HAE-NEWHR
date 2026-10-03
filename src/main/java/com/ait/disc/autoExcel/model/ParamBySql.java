package com.ait.disc.autoExcel.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Model cho bảng SYS_PARAM_BY_SQL (tham số truyền vào câu lệnh SQL của SYS_SQL_MASTER).
 * PARAM là tên tham số dùng trực tiếp trong SQL_STMT dưới dạng named parameter
 * (ví dụ PARAM="tuNgay" thì SQL_STMT viết ":tuNgay").
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParamBySql {

    /** SQL_SEQ - FK tới SYS_SQL_MASTER */
    private String sqlSeq;

    /** SQL_PARAM_NO - số thứ tự tham số trong truy vấn, gán tự động theo vị trí khi lưu */
    private String sqlParamNo;

    /** PARAM - tên tham số (named parameter) dùng trong SQL_STMT, ví dụ :tuNgay */
    private String param;

    /** EN_SQL_PARAM_DESC - mô tả tham số (Tiếng Anh) */
    private String enSqlParamDesc;

    /** CN_SQL_PARAM_DESC - mô tả tham số (Tiếng Trung) */
    private String cnSqlParamDesc;

    /** SQL_PARAM_TP - kiểu dữ liệu tham số: VARCHAR2 / NUMBER / DATE */
    private String sqlParamTp;

    /** SQL_PARAM_TP_DESC - mô tả chi tiết tham số, dùng làm gợi ý hiển thị mặc định */
    private String sqlParamTpDesc;

    /** DEFAULT_VAL - giá trị mặc định */
    private String defaultVal;

    /** SORT_CD - thứ tự hiển thị, gán tự động theo vị trí khi lưu */
    private String sortCd;

    /** RGST_DTIME - Ngày tạo */
    private LocalDateTime rgstDtime;

    /** UPDT_DTIME - Ngày cập nhật */
    private LocalDateTime updtDtime;

    /** UPDT_USER - Người cập nhật */
    private String updtUser;

    /** USE_YN - Có sử dụng tham số này khi xuất Excel hay không (Y/N) */
    private String useYn;
}
