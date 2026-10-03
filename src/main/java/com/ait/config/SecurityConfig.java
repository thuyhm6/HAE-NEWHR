package com.ait.config;

import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeRequests(authz -> authz
                        .antMatchers(
                                "/", "/login", "/auth/login", "/logout",
                                "/assets/**", "/static/**", "/webjars/**", "/ng/**",
                                "/error/**", "/favicon.ico",
                                "/actuator/health", "/api/health", "/api/csrf-token", "/api/auth/login",
                                "/api/i18n/**",
                                "/change-language", "/api/current-language", "/api/supported-languages",
                                "/sys/feedback/submit")
                        .permitAll()
                        .antMatchers(HttpMethod.GET, "/sys/api/code/list", "/sys/api/code/tree", "/sys/api/menu/list",
                                "/sys/api/getCode/list")
                        .authenticated()
                        .antMatchers("/sy/excel/api/**")
                        .authenticated()
                        .antMatchers("/sys/rightsManagement/viewLoginUser", "/sys/api/user/**")
                        .hasAnyRole("ADMIN", "SYS", "HRM")
                        .antMatchers(
                                "/api/admin/**",
                                "/api/monitoring/**",
                                "/api/performance/**",
                                "/api/database/**",
                                "/multilingual/**",
                                "/sys/api/**")
                        .hasAnyRole("ADMIN", "SYS")
                        .antMatchers(HttpMethod.POST, "/api/multilingual/content", "/api/multilingual/code-param/link")
                        .hasAnyRole("ADMIN", "SYS")
                        .antMatchers(HttpMethod.PUT, "/api/multilingual/content")
                        .hasAnyRole("ADMIN", "SYS")
                        .antMatchers(HttpMethod.DELETE, "/api/multilingual/code-param/unlink")
                        .hasAnyRole("ADMIN", "SYS")
                        .antMatchers(HttpMethod.POST, "/org/api/process/execute", "/org/api/resume/add", "/org/api/resume/update")
                        .hasAnyRole("ADMIN", "SYS")
                        .antMatchers(HttpMethod.DELETE, "/org/api/resume/delete/**")
                        .hasAnyRole("ADMIN", "SYS")
                        .anyRequest().authenticated())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> response.sendRedirect("/login")))
                .addFilterBefore(new SessionAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(new AuthenticationInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/", "/login", "/auth/login", "/logout",
                        "/assets/**", "/static/**", "/webjars/**", "/ng/**",
                        "/error/**", "/favicon.ico", "/actuator/**",
                        "/api/health", "/api/csrf-token", "/api/auth/login", "/api/i18n/**",
                        "/sys/feedback/submit");
    }

    public static class AuthenticationInterceptor implements HandlerInterceptor {

        @Override
        public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                @NonNull Object handler) throws Exception {
            HttpSession session = request.getSession(false);
            String requestUri = request.getRequestURI();
            if (isPublicUrl(requestUri)) {
                return true;
            }

            if (session == null || session.getAttribute("currentHrUser") == null) {
                response.sendRedirect("/login");
                return false;
            }

            // Bắt buộc đổi mật khẩu nếu password chưa mã hoá: không còn redirect sang
            // "/dashboard" (route Thymeleaf cũ) vì sẽ làm hỏng mọi request API (XHR nhận
            // về HTML thay vì JSON, kể cả GET /api/auth/me khiến authGuard bounce về
            // /login). Việc chặn tương tác nay do modal "Bắt buộc đổi mật khẩu" ở
            // app-shell.component.ts đảm nhiệm (không thể đóng/click ra ngoài); ở đây chỉ
            // chặn cứng các API làm thay đổi dữ liệu để tránh bypass modal, trả JSON 423
            // thay vì redirect để phía Angular parse được.
            if (Boolean.TRUE.equals(session.getAttribute("requirePasswordChange"))
                    && !"GET".equalsIgnoreCase(request.getMethod())
                    && !requestUri.equals("/api/change-first-password")) {
                response.setStatus(423); // 423 Locked - javax.servlet không có hằng số SC_LOCKED
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(
                        "{\"success\":false,\"message\":\"Vui lòng đổi mật khẩu trước khi tiếp tục.\"}");
                return false;
            }

            long lastAccessedTime = session.getLastAccessedTime();
            long currentTime = System.currentTimeMillis();
            long sessionTimeout = 30L * 60L * 1000L;

            if (currentTime - lastAccessedTime > sessionTimeout) {
                session.invalidate();
                response.sendRedirect("/login?timeout=true");
                return false;
            }

            return true;
        }

        private boolean isPublicUrl(String uri) {
            return uri.equals("/") ||
                    uri.equals("/login") ||
                    uri.equals("/logout") ||
                    uri.startsWith("/assets/") ||
                    uri.startsWith("/static/") ||
                    uri.startsWith("/webjars/") ||
                    uri.startsWith("/ng/") ||
                    uri.startsWith("/error/") ||
                    uri.startsWith("/actuator/") ||
                    uri.equals("/favicon.ico") ||
                    uri.equals("/api/health") ||
                    uri.equals("/api/csrf-token") ||
                    uri.equals("/api/auth/login") ||
                    uri.startsWith("/api/i18n/") ||
                    uri.equals("/change-language") ||
                    uri.equals("/api/current-language") ||
                    uri.equals("/api/supported-languages") ||
                    uri.equals("/sys/feedback/submit");
        }
    }

    public static class SessionAuthenticationFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                @NonNull FilterChain filterChain) throws ServletException, IOException {

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                HttpSession session = request.getSession(false);
                if (session != null) {
                    HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
                    if (currentHrUser != null && currentHrUser.getSyUser() != null) {
                        String username = currentHrUser.getSyUser().getUserName();
                        List<GrantedAuthority> authorities = new ArrayList<>();

                        String userType = currentHrUser.getSyUser().getUserType();
                        if (userType != null && !userType.trim().isEmpty()) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + userType.toUpperCase()));
                        }

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(username, null, authorities);
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }

            filterChain.doFilter(request, response);
        }
    }
}
