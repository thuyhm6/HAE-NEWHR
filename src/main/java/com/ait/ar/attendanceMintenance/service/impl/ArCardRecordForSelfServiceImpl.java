package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordForSelfDto;
import com.ait.ar.attendanceMintenance.mapper.ArCardRecordForSelfMapper;
import com.ait.ar.attendanceMintenance.service.ArCardRecordForSelfService;
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
public class ArCardRecordForSelfServiceImpl implements ArCardRecordForSelfService {

    private static final Logger log = LoggerFactory.getLogger(ArCardRecordForSelfServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT  = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter SWIPE_FMT   = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm");
    private static final DateTimeFormatter AR_DATE_FMT  = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private static final String DEVICE_DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    private static final String DEVICE_URL    = "jdbc:sqlserver://10.43.7.249\\WISENETACS:1433;databaseName=WACS;encrypt=false";
    private static final String DEVICE_USER   = "hrsystem";
    private static final String DEVICE_PASS   = "5tkatjd!";

    @Autowired
    private ArCardRecordForSelfMapper mapper;

    @Override
    public DataTablesResponse<ArCardRecordForSelfDto> getPageList(ArCardRecordForSelfDto dto) {
        try {
            if (dto == null) {
                dto = new ArCardRecordForSelfDto();
            }
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<ArCardRecordForSelfDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[ArCardRecordForSelfService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1, "Lỗi hệ thống khi tải danh sách lịch sử ra vào.");
        }
    }

    @Override
    public List<ArCardRecordForSelfDto> getExportList(ArCardRecordForSelfDto dto) {
        try {
            if (dto == null) {
                dto = new ArCardRecordForSelfDto();
            }
            applyDefaultDateRange(dto);
            return mapper.selectListAll(dto);
        } catch (Exception e) {
            log.error("[ArCardRecordForSelfService] getExportList error", e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> importFromDevice(String fromDate, String toDate) {
        Map<String, Object> result = new HashMap<>();
        int total = 0, imported = 0, skipped = 0, notFound = 0;
        log.info("[ArCardRecordForSelfService] importFromDevice fromDate={}, toDate={}", fromDate, toDate);

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
                        String deviceName = rs.getString("DeviceName");
                        Timestamp tsLocal = rs.getTimestamp("LocalDateTime");

                        if (empId == null || tsLocal == null) {
                            notFound++;
                            continue;
                        }

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

                        // Kiểm tra trùng dữ liệu trước khi insert
                        ArCardRecordForSelfDto checkDto = new ArCardRecordForSelfDto();
                        checkDto.setCardNo(empId.trim());
                        checkDto.setSwipeDatetime(swipeDatetime);
                        checkDto.setDoorType(doorType);
                        if (mapper.countDuplicate(checkDto) > 0) {
                            skipped++;
                            continue;
                        }

                        String personId = mapper.findPersonIdByEmpId(empId.trim());
                        if (personId == null) {
                            log.warn("[ArCardRecordForSelfService] Không tìm thấy PERSON_ID cho EMPID={}", empId);
                            notFound++;
                            continue;
                        }

                        ArCardRecordForSelfDto insertDto = new ArCardRecordForSelfDto();
                        insertDto.setCardNo(empId.trim());
                        insertDto.setPersonId(personId);
                        insertDto.setDoorType(doorType);
                        insertDto.setArDateStr(arDateStr);
                        insertDto.setSwipeDatetime(swipeDatetime);
                        insertDto.setEmployeeName(empId.trim());
                        insertDto.setDeviceName(deviceName);
                        mapper.insertFromDevice(insertDto);
                        imported++;
                    }
                }
            }

            log.info("[ArCardRecordForSelfService] importFromDevice hoàn tất: total={}, imported={}, skipped={}, notFound={}",
                    total, imported, skipped, notFound);
            result.put("success", true);
            result.put("total", total);
            result.put("imported", imported);
            result.put("skipped", skipped);
            result.put("notFound", notFound);
            result.put("message", "Hoàn tất: " + imported + " bản ghi mới, " + skipped + " bỏ qua (trùng), " + notFound + " không tìm thấy nhân viên.");

        } catch (ClassNotFoundException e) {
            log.error("[ArCardRecordForSelfService] Không tìm thấy driver SQL Server", e);
            result.put("success", false);
            result.put("message", "Không tìm thấy driver kết nối SQL Server.");
        } catch (Exception e) {
            log.error("[ArCardRecordForSelfService] Lỗi kết nối hoặc xử lý dữ liệu", e);
            result.put("success", false);
            result.put("message", "Lỗi kết nối máy chủ quẹt thẻ: " + e.getMessage());
        }
        return result;
    }

    private void applyDefaultDateRange(ArCardRecordForSelfDto dto) {
        LocalDate today = LocalDate.now();
        if (dto.getFromDate() == null || dto.getFromDate().isBlank()) {
            dto.setFromDate(today.format(DATE_FORMAT));
        }
        if (dto.getToDate() == null || dto.getToDate().isBlank()) {
            dto.setToDate(today.format(DATE_FORMAT));
        }
    }
}
