package com.ait.ar.attendanceMintenance.scheduler;

import com.ait.ar.attendanceMintenance.service.ArCardRecordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class ArCardRecordScheduler {

    private static final Logger log = LoggerFactory.getLogger(ArCardRecordScheduler.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // Chống chạy đồng thời nếu lần trước chưa xong
    private final AtomicBoolean running = new AtomicBoolean(false);

    @Autowired
    private ArCardRecordService arCardRecordService;

    /**
     * Chạy vào phút thứ 5 của mỗi giờ (08:05, 09:05, ...).
     * Chỉ đọc dữ liệu trong ngày hiện tại và 2 ngày trước để tránh tải dữ liệu cũ.
     * cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 5 * * * *")
    public void autoImportCardRecord() {
        if (!running.compareAndSet(false, true)) {
            log.warn("[AutoImport] Lần chạy trước chưa hoàn tất, bỏ qua lần này.");
            return;
        }
        try {
            LocalDate today = LocalDate.now();
            String toDate   = today.format(DATE_FORMAT);
            String fromDate = today.minusDays(2).format(DATE_FORMAT);

            log.info("[AutoImport] Bắt đầu tự động đọc dữ liệu quẹt thẻ: fromDate={}, toDate={}", fromDate, toDate);

            Map<String, Object> result = arCardRecordService.importFromDevice(fromDate, toDate);

            if (Boolean.TRUE.equals(result.get("success"))) {
                log.info("[AutoImport] Hoàn tất: imported={}, skipped={}, notFound={}, total={}",
                        result.get("imported"), result.get("skipped"), result.get("notFound"), result.get("total"));
            } else {
                log.error("[AutoImport] Thất bại: {}", result.get("message"));
            }
        } catch (Exception e) {
            log.error("[AutoImport] Lỗi không mong đợi khi tự động đọc dữ liệu quẹt thẻ", e);
        } finally {
            running.set(false);
        }
    }
}
