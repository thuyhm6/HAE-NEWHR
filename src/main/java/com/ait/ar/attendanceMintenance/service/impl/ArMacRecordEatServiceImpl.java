package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArMacRecordEatDto;
import com.ait.ar.attendanceMintenance.mapper.ArMacRecordEatMapper;
import com.ait.ar.attendanceMintenance.service.ArMacRecordEatService;
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
public class ArMacRecordEatServiceImpl implements ArMacRecordEatService {

    private static final Logger log = LoggerFactory.getLogger(ArMacRecordEatServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private ArMacRecordEatMapper mapper;

    @Override
    public DataTablesResponse<ArMacRecordEatDto> getPageList(ArMacRecordEatDto dto) {
        try {
            if (dto == null) {
                dto = new ArMacRecordEatDto();
            }
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<ArMacRecordEatDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[ArMacRecordEatService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1, "Lỗi hệ thống khi tải danh sách tra cứu suất ăn.");
        }
    }

    @Override
    public List<ArMacRecordEatDto> getExportList(ArMacRecordEatDto dto) {
        try {
            if (dto == null) {
                dto = new ArMacRecordEatDto();
            }
            applyDefaultDateRange(dto);
            return mapper.selectListAll(dto);
        } catch (Exception e) {
            log.error("[ArMacRecordEatService] getExportList error", e);
            return Collections.emptyList();
        }
    }

    private static final String DEVICE_DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    private static final String DEVICE_URL    = "jdbc:sqlserver://10.43.7.249\\WISENETACS:1433;databaseName=WACS;encrypt=false";
    private static final String DEVICE_USER   = "hrsystem";
    private static final String DEVICE_PASS   = "5tkatjd!";

    private static final DateTimeFormatter CARD_TIME_FMT = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm");

    @Override
    @Transactional
    public Map<String, Object> importFromDevice(String fromDate, String toDate) {
        Map<String, Object> result = new HashMap<>();
        int total = 0, imported = 0, skipped = 0, notFound = 0;
        log.info("[importMealFromDevice] Bắt đầu đọc dữ liệu suất ăn, fromDate={}, toDate={}", fromDate, toDate);

        String fromDatetime = fromDate + " 00:00:00";
        String toDatetime   = toDate   + " 23:59:59";

        String sql = " SELECT P.EmployeeNo, P.FirstName, CR.ReaderIDX AS ReaderCode, CR.ReaderName, CR.DoorID, CR.DoorName,"
                   + " DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) AS LocalDateTime,"
                   + " E.OccuredDateTime AS UTCDateTime, P.DepartmentID, P.DepartmentID AS DeptName"
                   + " FROM ACS_CARDHOLDER_VIEW P"
                   + " JOIN ACS_EVENT_ACCESS_VIEW E ON P.PSNID = E.PSNId"
                   + " RIGHT JOIN ("
                   + "   SELECT DV.LoopID, DV.DeviceID, RD.ReaderIDX, RD.ReaderID, RD.ReaderName, DR.DoorID, DR.DoorName"
                   + "   FROM ACS_DEVICE_DR_VIEW DR"
                   + "   JOIN ACS_DEVICE_DR_RD_VIEW RD ON DR.DoorID = RD.DoorID"
                   + "   JOIN ACS_DEVICE_VIEW DV ON DV.DeviceIDX = RD.DeviceIDX"
                   + "   WHERE RD.DeviceIDX IN ('1033','1034')"
                   + " ) CR ON E.ControllerId = CR.LoopID AND E.BoardNo = CR.DeviceID AND E.IoIndex = CR.ReaderID"
                   + " WHERE DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) >= ?"
                   + "   AND DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) <= ?"
                   + " ORDER BY E.OccuredDateTime DESC";

        try {
            Class.forName(DEVICE_DRIVER);
            try (Connection conn = DriverManager.getConnection(DEVICE_URL, DEVICE_USER, DEVICE_PASS);
                 PreparedStatement ps = conn.prepareStatement(sql)) {

                ps.setString(1, fromDatetime);
                ps.setString(2, toDatetime);

                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        total++;
                        String empId        = rs.getString("EmployeeNo");
                        String firstName    = rs.getString("FirstName");
                        String doorName     = rs.getString("DoorName");
                        String deptName     = rs.getString("DeptName");
                        Timestamp tsLocal   = rs.getTimestamp("LocalDateTime");

                        if (empId == null || tsLocal == null) {
                            notFound++;
                            continue;
                        }

                        LocalDateTime ldt = tsLocal.toLocalDateTime();
                        String cardTime   = ldt.format(CARD_TIME_FMT);

                        // Kiểm tra trùng dữ liệu theo EMPID + CARD_TIME + DOOR_NAME
                        ArMacRecordEatDto checkDto = new ArMacRecordEatDto();
                        checkDto.setEmpId(empId.trim());
                        checkDto.setCardTime(cardTime);
                        checkDto.setDoorName(doorName);
                        if (mapper.countDuplicateEat(checkDto) > 0) {
                            skipped++;
                            continue;
                        }

                        // Lưu vào AR_MAC_RECORDS_HTSV_EAT với INSERT_BY='M'
                        ArMacRecordEatDto insertDto = new ArMacRecordEatDto();
                        insertDto.setEmpId(empId.trim());
                        insertDto.setEmployeeName(firstName);
                        insertDto.setCardTime(cardTime);
                        insertDto.setDoorName(doorName);
                        insertDto.setDepartName(deptName);
                        mapper.insertFromDevice(insertDto);
                        imported++;
                    }
                }
            }

            log.info("[importMealFromDevice] Hoàn tất: total={}, imported={}, skipped={}, notFound={}",
                    total, imported, skipped, notFound);
            result.put("success",  true);
            result.put("total",    total);
            result.put("imported", imported);
            result.put("skipped",  skipped);
            result.put("notFound", notFound);
            result.put("message",  "Hoàn tất: " + imported + " bản ghi mới, " + skipped + " bỏ qua (trùng), " + notFound + " không hợp lệ.");

        } catch (ClassNotFoundException e) {
            log.error("[importMealFromDevice] Không tìm thấy driver SQL Server", e);
            result.put("success", false);
            result.put("message", "Không tìm thấy driver kết nối SQL Server.");
        } catch (Exception e) {
            log.error("[importMealFromDevice] Lỗi kết nối hoặc xử lý dữ liệu", e);
            result.put("success", false);
            result.put("message", "Lỗi kết nối máy chủ suất ăn: " + e.getMessage());
        }
        return result;
    }

    private void applyDefaultDateRange(ArMacRecordEatDto dto) {
        LocalDate today = LocalDate.now();
        if (dto.getFromDate() == null || dto.getFromDate().isBlank()) {
            dto.setFromDate(today.format(DATE_FORMAT));
        }
        if (dto.getToDate() == null || dto.getToDate().isBlank()) {
            dto.setToDate(today.format(DATE_FORMAT));
        }
    }
}
