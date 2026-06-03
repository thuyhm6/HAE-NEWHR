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
                File uploadDir = new File(photoUploadPath);
                String uploadDirPath = uploadDir.getAbsolutePath().replace("\\", "/");
                if (!uploadDirPath.endsWith("/")) uploadDirPath += "/";
                registry.addResourceHandler("/assets/images/users/**")
                                .addResourceLocations("file:" + uploadDirPath)
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
