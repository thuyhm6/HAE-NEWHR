package com.ait.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * CacheConfig - Configuration cho caching system
 */
@Configuration
@EnableCaching
public class CacheConfig {

        /**
         * Cache manager với Caffeine
         */
        @Bean
        @SuppressWarnings("unchecked")
        public CacheManager cacheManager() {
                CaffeineCacheManager cacheManager = new CaffeineCacheManager();

                // Cấu hình cache cho user permissions (30 phút)
                cacheManager.registerCustomCache("userPermissions",
                                Caffeine.newBuilder()
                                                .maximumSize(500)
                                                .expireAfterWrite(30, TimeUnit.MINUTES)
                                                .expireAfterAccess(10, TimeUnit.MINUTES)
                                                .recordStats()
                                                .build());

                // Cấu hình cache cho menu (1 giờ)
                cacheManager.registerCustomCache("menuCache",
                                Caffeine.newBuilder()
                                                .maximumSize(100)
                                                .expireAfterWrite(60, TimeUnit.MINUTES)
                                                .expireAfterAccess(15, TimeUnit.MINUTES)
                                                .recordStats()
                                                .build());

                // Cấu hình cache cho departments (2 giờ)
                cacheManager.registerCustomCache("departmentCache",
                                Caffeine.newBuilder()
                                                .maximumSize(200)
                                                .expireAfterWrite(120, TimeUnit.MINUTES)
                                                .expireAfterAccess(30, TimeUnit.MINUTES)
                                                .recordStats()
                                                .build());

                // Cấu hình cache cho employees (15 phút)
                cacheManager.registerCustomCache("employeeCache",
                                Caffeine.newBuilder()
                                                .maximumSize(1000)
                                                .expireAfterWrite(15, TimeUnit.MINUTES)
                                                .expireAfterAccess(5, TimeUnit.MINUTES)
                                                .recordStats()
                                                .build());

                return cacheManager;
        }
}
