package com.ait.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * RequireLogin - Annotation để đánh dấu method cần đăng nhập
 * Sử dụng với AOP để tự động kiểm tra đăng nhập
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireLogin {

    /**
     * Thông báo lỗi khi chưa đăng nhập
     */
    String message() default "Vui lòng đăng nhập để truy cập trang này";

    /**
     * URL redirect khi chưa đăng nhập
     */
    String redirectUrl() default "/login";
}
