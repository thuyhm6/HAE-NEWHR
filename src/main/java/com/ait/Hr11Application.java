package com.ait;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAspectJAutoProxy
@EnableScheduling
public class Hr11Application extends SpringBootServletInitializer {

    private static final String INIT_FLAG = Hr11Application.class.getName() + ".initialized";

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        // Chống double-startup: nếu context đã được khởi tạo thì bỏ qua lần gọi thứ 2
        if (servletContext.getAttribute(INIT_FLAG) != null) {
            return;
        }
        servletContext.setAttribute(INIT_FLAG, Boolean.TRUE);
        super.onStartup(servletContext);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        setRegisterErrorPageFilter(false);
        return application.sources(Hr11Application.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(Hr11Application.class, args);
    }

}
