package com.ait.disc.autoExcel.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Model cho bảng SYS_SQL_MASTER (quản lý truy vấn SQL tự động xuất Excel).
 * Không khai báo field cpnyId ở đây vì CPNY_ID được LanguageParameterInterceptor
 * tự động inject vào tham số MyBatis (#{cpnyId}) - nếu khai báo field trùng tên
 * trên bean này, giá trị inject sẽ bị field null của bean che mất.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SqlMaster {

    /** SQL_SEQ - khóa chính, sinh theo MAX(TO_NUMBER(SQL_SEQ)) + 1 */
    private String sqlSeq;

    /** PGM_NM - Tên chương trình */
    private String pgmNm;

    /** SQL_NM - Tên truy vấn */
    private String sqlNm;

    /** SQL_STMT - Câu lệnh SQL đầy đủ (CLOB), chỉ chấp nhận SELECT/WITH */
    private String sqlStmt;

    /** SQL_FROM_STMT - Mệnh đề FROM bổ sung (tùy chọn) */
    private String sqlFromStmt;

    /** SQL_ORDER_BY_ID - Mã sắp xếp (tùy chọn) */
    private String sqlOrderById;

    /** SQL_DESC - Mô tả truy vấn */
    private String sqlDesc;

    /** SQL_STAT - Trạng thái SQL (tùy chọn, schema không quy định enum cụ thể) */
    private String sqlStat;

    /** RGST_DTIME - Ngày tạo */
    private LocalDateTime rgstDtime;

    /** UPDT_DTIME - Ngày cập nhật */
    private LocalDateTime updtDtime;

    /**
     * UPDT_USER - Người cập nhật gần nhất. Bảng không có cột người tạo riêng
     * nên màn hình danh sách dùng tạm cột này để hiển thị "Người tạo".
     */
    private String updtUser;

    /** USE_YN - Có đang sử dụng hay không (Y/N), mặc định Y */
    private String useYn;

    /** IS_SPECIAL - Cờ đặc biệt (tùy chọn, schema không quy định enum cụ thể) */
    private String isSpecial;
}
