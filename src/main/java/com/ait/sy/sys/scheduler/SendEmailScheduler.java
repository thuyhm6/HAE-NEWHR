package com.ait.sy.sys.scheduler;

import com.ait.sy.sys.service.SendEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class SendEmailScheduler {

	private static final Logger log = LoggerFactory.getLogger(SendEmailScheduler.class);

	// Chống chạy đồng thời nếu lần trước chưa xong
	private final AtomicBoolean running = new AtomicBoolean(false);

	@Autowired
	private SendEmailService sendEmailService;

	/**
	 * Đồng bộ trạng thái phê duyệt từ EagleOffice mỗi 5 phút.
	 */
	@Scheduled(fixedRate = 5 * 60 * 1000)
	public void autoSynchronizationApprovalStatus() {
		if (!running.compareAndSet(false, true)) {
			log.warn("[SyncApprovalStatus] Lần chạy trước chưa hoàn tất, bỏ qua lần này.");
			return;
		}
		try {
			log.info("[SyncApprovalStatus] Bắt đầu đồng bộ trạng thái phê duyệt.");
			sendEmailService.synchronizationApprovalStatus();
			log.info("[SyncApprovalStatus] Hoàn tất đồng bộ trạng thái phê duyệt.");
		} catch (Exception e) {
			log.error("[SyncApprovalStatus] Lỗi không mong đợi khi đồng bộ trạng thái phê duyệt", e);
		} finally {
			running.set(false);
		}
	}
}
