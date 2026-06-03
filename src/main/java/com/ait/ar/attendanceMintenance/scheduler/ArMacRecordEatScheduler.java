package com.ait.ar.attendanceMintenance.scheduler;

import com.ait.ar.attendanceMintenance.service.ArMacRecordEatService;
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
public class ArMacRecordEatScheduler {

    private static final Logger log = LoggerFactory.getLogger(ArMacRecordEatScheduler.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final AtomicBoolean running = new AtomicBoolean(false);

    @Autowired
    private ArMacRecordEatService arMacRecordEatService;

    /**
     * Chạy lúc 07:00 và 14:00 hàng ngày.
     * Chỉ đọc dữ liệu trong ngày hiện tại và 2 ngày trước để tránh tải dữ liệu cũ.
     * cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 0 7,14 * * *")
    public void autoImportMealRecord() {
        if (!running.compareAndSet(false, true)) {
            log.warn("[AutoImportMeal] Lần chạy trước chưa hoàn tất, bỏ qua lần này.");
            return;
        }
        try {
            LocalDate today = LocalDate.now();
            String toDate   = today.format(DATE_FORMAT);
            String fromDate = today.minusDays(2).format(DATE_FORMAT);

            log.info("[AutoImportMeal] Bắt đầu tự động đọc dữ liệu suất ăn: fromDate={}, toDate={}", fromDate, toDate);

            Map<String, Object> result = arMacRecordEatService.importFromDevice(fromDate, toDate);

            if (Boolean.TRUE.equals(result.get("success"))) {
                log.info("[AutoImportMeal] Hoàn tất: imported={}, skipped={}, notFound={}, total={}",
                        result.get("imported"), result.get("skipped"), result.get("notFound"), result.get("total"));
            } else {
                log.error("[AutoImportMeal] Thất bại: {}", result.get("message"));
            }
        } catch (Exception e) {
            log.error("[AutoImportMeal] Lỗi không mong đợi khi tự động đọc dữ liệu suất ăn", e);
        } finally {
            running.set(false);
        }
    }
}
