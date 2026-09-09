package com.ait.util;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

/**
 * Đọc và phục vụ file index.html của ứng dụng Angular (build ra
 * classpath:static/ng/index.html) cho các route do Java controller quản lý
 * (/login, /dashboard) thay cho Thymeleaf. Nội dung được cache trong bộ nhớ,
 * nhưng lastModified của file được kiểm tra lại mỗi request để tự nạp lại khi
 * `npm run watch` build lại Angular (server không restart vì static/** nằm
 * trong exclude mặc định của Spring Boot DevTools).
 */
@Component
public class AngularIndexService {

    private static final Logger log = LoggerFactory.getLogger(AngularIndexService.class);
    private static final String INDEX_RESOURCE_PATH = "static/ng/index.html";

    private volatile String cachedIndexHtml;
    private volatile long cachedLastModified = -1;

    public void writeIndexHtml(HttpServletResponse response) throws IOException {
        response.setContentType("text/html;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        response.getWriter().write(getIndexHtml());
    }

    private String getIndexHtml() {
        ClassPathResource resource = new ClassPathResource(INDEX_RESOURCE_PATH);
        long lastModified = resourceLastModified(resource);
        String html = cachedIndexHtml;
        if (html == null || lastModified != cachedLastModified) {
            synchronized (this) {
                if (cachedIndexHtml == null || lastModified != cachedLastModified) {
                    cachedIndexHtml = loadIndexHtml(resource);
                    cachedLastModified = lastModified;
                }
                html = cachedIndexHtml;
            }
        }
        return html;
    }

    private long resourceLastModified(ClassPathResource resource) {
        try {
            return resource.exists() ? resource.lastModified() : -1;
        } catch (IOException e) {
            return -1;
        }
    }

    private String loadIndexHtml(ClassPathResource resource) {
        if (!resource.exists()) {
            log.warn("Khong tim thay {} - chua build Angular. Chay 'npm run build' trong thu muc frontend/.",
                    INDEX_RESOURCE_PATH);
            return "<html><body><h3>Angular chua duoc build.</h3>"
                    + "<p>Chay <code>npm install &amp;&amp; npm run build</code> trong thu muc <code>frontend/</code> "
                    + "roi khoi dong lai ung dung.</p></body></html>";
        }
        try {
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Loi doc file {}", INDEX_RESOURCE_PATH, e);
            return "<html><body><h3>Loi doc giao dien Angular.</h3></body></html>";
        }
    }
}
