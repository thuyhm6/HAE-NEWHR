package com.ait.disc.autoExcel.service;

import com.ait.disc.autoExcel.dto.SqlMasterDetailDto;
import com.ait.disc.autoExcel.model.SqlMaster;

import java.util.List;
import java.util.Map;

/**
 * Service quản lý truy vấn SQL tự động xuất Excel (SYS_SQL_MASTER / SYS_PARAM_BY_SQL).
 */
public interface SqlMasterService {

    List<SqlMaster> findAll(String keyword, String pgmNm);

    SqlMasterDetailDto getDetail(String sqlSeq);

    /** Lưu (thêm mới/cập nhật) truy vấn SQL và toàn bộ danh sách tham số. Trả về SQL_SEQ. */
    String save(SqlMasterDetailDto dto);

    void delete(String sqlSeq);

    /** Thực thi câu lệnh SQL đã lưu với các giá trị tham số người dùng nhập, trả về file Excel (.xlsx). */
    byte[] exportExcel(String sqlSeq, Map<String, String> paramValues);
}
