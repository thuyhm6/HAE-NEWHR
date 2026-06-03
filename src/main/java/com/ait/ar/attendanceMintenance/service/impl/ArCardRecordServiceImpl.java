package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordDto;
import com.ait.ar.attendanceMintenance.mapper.ArCardRecordMapper;
import com.ait.ar.attendanceMintenance.service.ArCardRecordService;
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
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ArCardRecordServiceImpl implements ArCardRecordService {

    private static final Logger log = LoggerFactory.getLogger(ArCardRecordServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private ArCardRecordMapper mapper;

    @Override
    public DataTablesResponse<ArCardRecordDto> getPageList(ArCardRecordDto dto) {
        try {
            if (dto == null) {
                dto = new ArCardRecordDto();
            }
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<ArCardRecordDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[ArCardRecordService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1, "Lỗi hệ thống khi tải danh sách lịch sử ra vào.");
        }
    }

    @Override
    public ArCardRecordDto getByRecordNo(Long recordNo) {
        try {
            return mapper.getByRecordNo(recordNo);
        } catch (Exception e) {
            log.error("[ArCardRecordService] getByRecordNo error, recordNo={}", recordNo, e);
            return null;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> insertRecord(ArCardRecordDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            int rows = mapper.insertRecord(dto);
            if (rows > 0) {
                result.put("success", true);
                result.put("message", "Thêm bản ghi thành công.");
            } else {
                result.put("success", false);
                result.put("message", "Không thêm được bản ghi.");
            }
        } catch (Exception e) {
            log.error("[ArCardRecordService] insertRecord error", e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống khi thêm bản ghi: " + e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updateRecord(ArCardRecordDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            int rows = mapper.updateRecord(dto);
            if (rows > 0) {
                result.put("success", true);
                result.put("message", "Cập nhật bản ghi thành công.");
            } else {
                result.put("success", false);
                result.put("message", "Không tìm thấy bản ghi để cập nhật.");
            }
        } catch (Exception e) {
            log.error("[ArCardRecordService] updateRecord error", e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống khi cập nhật bản ghi: " + e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteByRecordNo(Long recordNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            int rows = mapper.deleteByRecordNo(recordNo);
            if (rows > 0) {
                result.put("success", true);
                result.put("message", "Xóa bản ghi thành công.");
            } else {
                result.put("success", false);
                result.put("message", "Không tìm thấy bản ghi để xóa.");
            }
        } catch (Exception e) {
            log.error("[ArCardRecordService] deleteByRecordNo error, recordNo={}", recordNo, e);
            result.put("success", false);
            result.put("message", "Lỗi hệ thống khi xóa bản ghi: " + e.getMessage());
        }
        return result;
    }

    private static final String DEVICE_DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    private static final String DEVICE_URL    = "jdbc:sqlserver://10.43.7.249\\WISENETACS:1433;databaseName=WACS;encrypt=false";
    private static final String DEVICE_USER   = "hrsystem";
    private static final String DEVICE_PASS   = "5tkatjd!";

    private static final DateTimeFormatter SWIPE_FMT   = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm");
    private static final DateTimeFormatter AR_DATE_FMT  = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    @Override
    @Transactional
    public Map<String, Object> importFromDevice(String fromDate, String toDate) {
        Map<String, Object> result = new HashMap<>();
        int total = 0, imported = 0, skipped = 0, notFound = 0;
        log.info("[importFromDevice] Bắt đầu đọc dữ liệu quẹt thẻ từ máy chủ, fromDate={}, toDate={}", fromDate, toDate);

        String fromDatetime = fromDate + " 00:00:00";
        String toDatetime   = toDate   + " 23:59:59";

        String sql = " SELECT P.EmployeeNo, P.FirstName, CR.ReaderIDX AS ReaderCode, CR.ReaderName,"
                   + " DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) AS LocalDateTime,"
                   + " E.OccuredDateTime AS UTCDateTime,"
                   + " P.MiddleName, P.LastName, CR.DeviceType, CR.DeviceName"
                   + " FROM ACS_CARDHOLDER_VIEW P"
                   + " JOIN ACS_EVENT_ACCESS_VIEW E ON P.PSNID = E.PSNId"
                   + " RIGHT JOIN ("
                   + "   SELECT DV.LoopID, DV.DeviceID, DV.DeviceType, DV.DeviceName, RD.ReaderIDX, RD.ReaderID, RD.ReaderName"
                   + "   FROM ACS_COMPANY_EXIT_READER_VIEW AR"
                   + "   JOIN ACS_DEVICE_DR_RD_VIEW RD ON AR.ReaderId = RD.ReaderIDX"
                   + "   JOIN ACS_DEVICE_VIEW DV ON DV.DeviceIDX = RD.DeviceIDX"
                   + " ) CR ON E.ControllerId = CR.LoopID AND E.BoardNo = CR.DeviceID AND E.IoIndex = CR.ReaderID"
                   + " WHERE DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) >= ?"
                   + "   AND DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) <= ?";

        try {
            Class.forName(DEVICE_DRIVER);
            try (Connection conn = DriverManager.getConnection(DEVICE_URL, DEVICE_USER, DEVICE_PASS);
                 PreparedStatement ps = conn.prepareStatement(sql)) {

                ps.setString(1, fromDatetime);
                ps.setString(2, toDatetime);

                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        total++;
                        String empId      = rs.getString("EmployeeNo");
                        String readerName = rs.getString("ReaderName");
                        Timestamp tsLocal = rs.getTimestamp("LocalDateTime");

                        if (empId == null || tsLocal == null) {
                            notFound++;
                            continue;
                        }

                        // Xác định DOOR_TYPE từ ReaderName
                        String upperReader = readerName != null ? readerName.toUpperCase() : "";
                        String doorType;
                        if (upperReader.contains("IN")) {
                            doorType = "IN";
                        } else if (upperReader.contains("OUT")) {
                            doorType = "OUT";
                        } else {
                            doorType = "  ";
                        }

                        LocalDateTime ldt = tsLocal.toLocalDateTime();
                        String swipeDatetime = ldt.format(SWIPE_FMT);
                        String arDateStr     = ldt.format(AR_DATE_FMT);

                        // Tìm PERSON_ID từ HR_EMPLOYEE
                        String personId = mapper.findPersonIdByEmpId(empId.trim());
                        if (personId == null) {
                            log.warn("[importFromDevice] Không tìm thấy PERSON_ID cho EMPID={}", empId);
                            notFound++;
                            continue;
                        }

                        // Kiểm tra trùng dữ liệu
                        ArCardRecordDto checkDto = new ArCardRecordDto();
                        checkDto.setCardNo(empId.trim());
                        checkDto.setSwipeDatetime(swipeDatetime);
                        checkDto.setDoorType(doorType);
                        if (mapper.countDuplicate(checkDto) > 0) {
                            skipped++;
                            continue;
                        }

                        // Lưu vào AR_MAC_RECORDS_HTSV với INSERT_BY='M'
                        ArCardRecordDto insertDto = new ArCardRecordDto();
                        insertDto.setCardNo(empId.trim());
                        insertDto.setPersonId(personId);
                        insertDto.setDoorType(doorType);
                        insertDto.setArDateStr(arDateStr);
                        insertDto.setSwipeDatetime(swipeDatetime);
                        mapper.insertFromDevice(insertDto);
                        imported++;
                    }
                }
            }

            log.info("[importFromDevice] Hoàn tất: total={}, imported={}, skipped={}, notFound={}", total, imported, skipped, notFound);
            result.put("success", true);
            result.put("total", total);
            result.put("imported", imported);
            result.put("skipped", skipped);
            result.put("notFound", notFound);
            result.put("message", "Hoàn tất: " + imported + " bản ghi mới, " + skipped + " bỏ qua (trùng), " + notFound + " không tìm thấy nhân viên.");

        } catch (ClassNotFoundException e) {
            log.error("[importFromDevice] Không tìm thấy driver SQL Server", e);
            result.put("success", false);
            result.put("message", "Không tìm thấy driver kết nối SQL Server.");
        } catch (Exception e) {
            log.error("[importFromDevice] Lỗi kết nối hoặc xử lý dữ liệu", e);
            result.put("success", false);
            result.put("message", "Lỗi kết nối máy chủ quẹt thẻ: " + e.getMessage());
        }
        return result;
    }

    private void applyDefaultDateRange(ArCardRecordDto dto) {
        LocalDate today = LocalDate.now();
        if (dto.getFromDate() == null || dto.getFromDate().isBlank()) {
            dto.setFromDate(today.format(DATE_FORMAT));
        }
        if (dto.getToDate() == null || dto.getToDate().isBlank()) {
            dto.setToDate(today.format(DATE_FORMAT));
        }
    }
}
