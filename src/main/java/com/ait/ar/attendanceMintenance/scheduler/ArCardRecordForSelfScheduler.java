package com.ait.ar.attendanceMintenance.scheduler;

import com.ait.ar.attendanceMintenance.service.ArCardRecordForSelfService;
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
public class ArCardRecordForSelfScheduler {

    private static final Logger log = LoggerFactory.getLogger(ArCardRecordForSelfScheduler.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final AtomicBoolean running = new AtomicBoolean(false);

    @Autowired
    private ArCardRecordForSelfService arCardRecordForSelfService;

    /**
     * Chạy lúc 03:00 hàng ngày, đọc dữ liệu quẹt thẻ của ngày hôm trước.
     * cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void autoImportCardRecordForSelf() {
        if (!running.compareAndSet(false, true)) {
            log.warn("[AutoImportForSelf] Lần chạy trước chưa hoàn tất, bỏ qua lần này.");
            return;
        }
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            String fromDate = yesterday.format(DATE_FORMAT);
            String toDate   = yesterday.format(DATE_FORMAT);

            log.info("[AutoImportForSelf] Bắt đầu tự động đọc dữ liệu quẹt thẻ cá nhân: fromDate={}, toDate={}", fromDate, toDate);

            Map<String, Object> result = arCardRecordForSelfService.importFromDevice(fromDate, toDate);

            if (Boolean.TRUE.equals(result.get("success"))) {
                log.info("[AutoImportForSelf] Hoàn tất: imported={}, skipped={}, notFound={}, total={}",
                        result.get("imported"), result.get("skipped"), result.get("notFound"), result.get("total"));
            } else {
                log.error("[AutoImportForSelf] Thất bại: {}", result.get("message"));
            }
        } catch (Exception e) {
            log.error("[AutoImportForSelf] Lỗi không mong đợi khi tự động đọc dữ liệu quẹt thẻ cá nhân", e);
        } finally {
            running.set(false);
        }
    }
}
