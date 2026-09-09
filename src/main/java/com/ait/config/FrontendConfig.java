package com.ait.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;

import java.io.File;
import java.time.Duration;

/**
 * FrontendConfig - Configuration cho frontend optimization
 */
@Configuration
public class FrontendConfig implements WebMvcConfigurer {

        @Value("${cors.allowed-origins:http://localhost:8080,http://localhost:3000}")
        private String[] allowedOrigins;

        @Value("${app.photo.upload.path:./assets/images/users}")
        private String photoUploadPath;

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Serve ảnh đại diện nhân viên từ thư mục upload ngoài classpath
                // Đăng ký trước /assets/** để Spring ưu tiên path cụ thể hơn
                // Location thứ 2 (/assets/images/users/ trong webapp root) là fallback cho các ảnh mặc
                // định đóng gói sẵn (vd. dummy-avatar.jpg) không nằm trong thư mục upload - Spring thử
                // lần lượt từng location, location nào có file thì dùng, không thì mới trả 404. Nếu
                // thiếu fallback này, ảnh mặc định sẽ 404 vĩnh viễn vì handler cụ thể này che mất handler
                // /assets/** chung ở dưới (pattern cụ thể hơn luôn được Spring ưu tiên bất kể thứ tự
                // đăng ký).
                File uploadDir = new File(photoUploadPath);
                String uploadDirPath = uploadDir.getAbsolutePath().replace("\\", "/");
                if (!uploadDirPath.endsWith("/")) uploadDirPath += "/";
                registry.addResourceHandler("/assets/images/users/**")
                                .addResourceLocations("file:" + uploadDirPath, "/assets/images/users/")
                                .setCacheControl(CacheControl.maxAge(Duration.ofHours(1)));

                // Assets nằm trong webapp root (src/main/webapp/assets/)
                // Dùng "/" prefix để Spring MVC resolve từ ServletContext (webapp root)
                registry.addResourceHandler("/assets/**")
                                .addResourceLocations("/assets/")
                                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)));

                // CSS/JS từ classpath (src/main/resources/static/)
                registry.addResourceHandler("/css/**")
                                .addResourceLocations("classpath:/static/css/")
                                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)));

                registry.addResourceHandler("/js/**")
                                .addResourceLocations("classpath:/static/js/")
                                .setCacheControl(CacheControl.maxAge(Duration.ofDays(7)));
        }

        @Override
        public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                                .allowedOrigins(allowedOrigins)
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*")
                                .allowCredentials(true)
                                .maxAge(3600);
        }
}
