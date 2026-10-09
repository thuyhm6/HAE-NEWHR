package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordCompanyDto;
import com.ait.ar.attendanceMintenance.mapper.ArCardRecordCompanyMapper;
import com.ait.ar.attendanceMintenance.service.ArCardRecordCompanyService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Port từ ArCardRecordSerImp#getArCardRecordCompanyList và
 * ArReadCardSerImp#readMacRecordCompanyList/readMacRecordDLList của dự án cũ.
 */
@Service
public class ArCardRecordCompanyServiceImpl implements ArCardRecordCompanyService {

    private static final Logger log = LoggerFactory.getLogger(ArCardRecordCompanyServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter SWIPE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final String DEVICE_DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    private static final String DEVICE_URL    = "jdbc:sqlserver://10.44.7.241\\WISENETACS:1433;databaseName=WACS;encrypt=false";
    private static final String DEVICE_USER   = "sa";
    private static final String DEVICE_PASS   = "Hae@2018";

    /** Đầu đọc cổng công ty (DeviceIDX 2083-2086). DOOR_TYPE xác định theo ReaderName chứa "Entry"/"Exit". */
    private static final String SQL_GATE_READER =
            " SELECT P.EmployeeNo, P.FirstName, P.MiddleName, P.LastName, CR.ReaderName, CR.DeviceName,"
          + " DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) AS LocalDateTime"
          + " FROM ACS_CARDHOLDER_VIEW P"
          + " JOIN ACS_EVENT_ACCESS_VIEW E ON P.PSNID = E.PSNId"
          + " RIGHT JOIN ("
          + "   SELECT DV.LoopID, DV.DeviceID, DV.DeviceName, RD.ReaderID, RD.ReaderName"
          + "   FROM ACS_DEVICE_DR_RD_VIEW RD"
          + "   JOIN ACS_DEVICE_VIEW DV ON DV.DeviceIDX = RD.DeviceIDX"
          + "   WHERE RD.DeviceIDX IN ('2083','2084','2085','2086')"
          + " ) CR ON E.ControllerId = CR.LoopID AND E.BoardNo = CR.DeviceID AND E.IoIndex = CR.ReaderID"
          + " WHERE DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) >= ?"
          + "   AND DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) <= ?"
          + " ORDER BY LocalDateTime";

    /** Cửa ControllerId = 8, BoardNo = 5. DOOR_TYPE lấy theo DoorName (giống bản cũ). */
    private static final String SQL_DOOR_CONTROLLER =
            " SELECT P.EmployeeNo, P.FirstName, P.MiddleName, P.LastName, DR.DoorName, DV.DeviceName,"
          + " DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) AS LocalDateTime"
          + " FROM ACS_EVENT_ACCESS_VIEW E"
          + " JOIN ACS_CARDHOLDER_VIEW P ON E.PSNId = P.PSNID"
          + " JOIN ACS_DEVICE_VIEW DV ON E.BoardNo = DV.DeviceID AND E.ControllerId = DV.LoopID"
          + " JOIN ACS_DEVICE_DR_VIEW DR ON DV.DeviceIDX = DR.DeviceIDX"
          + " WHERE E.ControllerId = 8 AND E.BoardNo = 5"
          + "   AND DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) >= ?"
          + "   AND DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) <= ?"
          + " ORDER BY LocalDateTime";

    @Autowired
    private ArCardRecordCompanyMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public DataTablesResponse<ArCardRecordCompanyDto> getPageList(ArCardRecordCompanyDto dto) {
        try {
            if (dto == null) {
                dto = new ArCardRecordCompanyDto();
            }
            applyDefaultDateRange(dto);
            log.info("[ArCardRecordCompanyService] getPageList keyword={}, deptNos={}, fromDate={}, toDate={}",
                    dto.getKeyword(), dto.getDeptNos(), dto.getFromDate(), dto.getToDate());
            int total = mapper.countList(dto);
            List<ArCardRecordCompanyDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[ArCardRecordCompanyService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1, "Lỗi hệ thống khi tải danh sách quẹt thẻ cổng công ty.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArCardRecordCompanyDto> getExportList(ArCardRecordCompanyDto dto) {
        try {
            if (dto == null) {
                dto = new ArCardRecordCompanyDto();
            }
            applyDefaultDateRange(dto);
            log.info("[ArCardRecordCompanyService] getExportList fromDate={}, toDate={}", dto.getFromDate(), dto.getToDate());
            return mapper.selectListAll(dto);
        } catch (Exception e) {
            log.error("[ArCardRecordCompanyService] getExportList error", e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> importFromDevice(String fromDate, String toDate) {
        Map<String, Object> result = new HashMap<>();
        int[] counters = new int[4]; // total, imported, skipped, notFound
        log.info("[importCompanyFromDevice] Bắt đầu đọc dữ liệu quẹt thẻ cổng công ty, fromDate={}, toDate={}", fromDate, toDate);

        String fromDatetime = fromDate + " 00:00:00";
        String toDatetime   = toDate   + " 23:59:59";

        try {
            Class.forName(DEVICE_DRIVER);
            try (Connection conn = DriverManager.getConnection(DEVICE_URL, DEVICE_USER, DEVICE_PASS)) {
                readAndInsert(conn, SQL_GATE_READER, fromDatetime, toDatetime, true, counters);
                readAndInsert(conn, SQL_DOOR_CONTROLLER, fromDatetime, toDatetime, false, counters);
            }

            log.info("[importCompanyFromDevice] Hoàn tất: total={}, imported={}, skipped={}, notFound={}",
                    counters[0], counters[1], counters[2], counters[3]);
            result.put("success",  true);
            result.put("total",    counters[0]);
            result.put("imported", counters[1]);
            result.put("skipped",  counters[2]);
            result.put("notFound", counters[3]);
            result.put("message",  "Hoàn tất: " + counters[1] + " bản ghi mới, " + counters[2] + " bỏ qua (trùng), "
                    + counters[3] + " không hợp lệ.");
        } catch (ClassNotFoundException e) {
            log.error("[importCompanyFromDevice] Không tìm thấy driver SQL Server", e);
            result.put("success", false);
            result.put("message", "Không tìm thấy driver kết nối SQL Server.");
        } catch (Exception e) {
            log.error("[importCompanyFromDevice] Lỗi kết nối hoặc xử lý dữ liệu", e);
            result.put("success", false);
            result.put("message", "Lỗi kết nối máy chủ quẹt thẻ: " + e.getMessage());
        }
        return result;
    }

    /**
     * @param byReaderName true: DOOR_TYPE suy ra từ ReaderName (Entry → IN, Exit → OUT);
     *                     false: DOOR_TYPE = DoorName (cột thứ 5 của câu SQL).
     */
    private void readAndInsert(Connection conn, String sql, String fromDatetime, String toDatetime,
                               boolean byReaderName, int[] counters) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, fromDatetime);
            ps.setString(2, toDatetime);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    counters[0]++;
                    String empId      = rs.getString("EmployeeNo");
                    Timestamp tsLocal = rs.getTimestamp("LocalDateTime");
                    if (empId == null || empId.trim().isEmpty() || tsLocal == null) {
                        counters[3]++;
                        continue;
                    }

                    String col5 = rs.getString(5);
                    String doorType;
                    if (byReaderName) {
                        String reader = col5 != null ? col5 : "";
                        doorType = reader.contains("Entry") ? "IN" : reader.contains("Exit") ? "OUT" : "";
                    } else {
                        doorType = col5;
                    }

                    ArCardRecordCompanyDto insertDto = new ArCardRecordCompanyDto();
                    insertDto.setCardNo(empId.trim());
                    insertDto.setEmployeeName(joinName(rs.getString("FirstName"), rs.getString("MiddleName"), rs.getString("LastName")));
                    insertDto.setDoorType(doorType);
                    insertDto.setSwipeDatetime(tsLocal.toLocalDateTime().format(SWIPE_FMT));
                    insertDto.setDeviceName(rs.getString("DeviceName"));

                    if (mapper.insertFromDevice(insertDto) > 0) {
                        counters[1]++;
                    } else {
                        counters[2]++;
                    }
                }
            }
        }
    }

    private String joinName(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p != null && !p.trim().isEmpty()) {
                if (sb.length() > 0) {
                    sb.append(' ');
                }
                sb.append(p.trim());
            }
        }
        return sb.toString();
    }

    /** Giống bản cũ: chỉ mặc định "hôm nay" khi không nhập từ khóa tìm kiếm. */
    private void applyDefaultDateRange(ArCardRecordCompanyDto dto) {
        if (dto.getKeyword() != null && !dto.getKeyword().trim().isEmpty()) {
            return;
        }
        LocalDate today = LocalDate.now();
        if (dto.getFromDate() == null || dto.getFromDate().trim().isEmpty()) {
            dto.setFromDate(today.format(DATE_FORMAT));
        }
        if (dto.getToDate() == null || dto.getToDate().trim().isEmpty()) {
            dto.setToDate(today.format(DATE_FORMAT));
        }
    }
}
