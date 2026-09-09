package com.ait.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Đăng ký resource handler cho /assets/**, /static/**, /webjars/** - tách ra từ ThymeleafConfig cũ (đã
 * xoá cùng toàn bộ Thymeleaf) vì các đường dẫn này vẫn được nhiều trang Angular tham chiếu trực tiếp
 * (ảnh mặc định, favicon, ...), không liên quan đến việc render template phía server.
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("/assets/");
        registry.addResourceHandler("/static/**")
                .addResourceLocations("/static/");
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("/webjars/");
    }
}
