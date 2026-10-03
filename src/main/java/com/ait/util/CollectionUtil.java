package com.ait.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Thay thế cho java.util.List.of/Map.of/Set.of (Java 9+) để tương thích JDK 8
 * (bắt buộc do JEUS 7.0 không hỗ trợ JDK 9+).
 */
public final class CollectionUtil {

    private CollectionUtil() {
    }

    @SafeVarargs
    public static <T> List<T> listOf(T... elements) {
        return Collections.unmodifiableList(Arrays.asList(elements));
    }

    @SafeVarargs
    public static <T> Set<T> setOf(T... elements) {
        return Collections.unmodifiableSet(new LinkedHashSet<>(Arrays.asList(elements)));
    }

    public static <K, V> Map<K, V> mapOf() {
        return Collections.emptyMap();
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1) {
        return Collections.singletonMap(k1, v1);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        map.put(k4, v4);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        map.put(k4, v4);
        map.put(k5, v5);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5,
                                          K k6, V v6) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        map.put(k4, v4);
        map.put(k5, v5);
        map.put(k6, v6);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5,
                                          K k6, V v6, K k7, V v7) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        map.put(k4, v4);
        map.put(k5, v5);
        map.put(k6, v6);
        map.put(k7, v7);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5,
                                          K k6, V v6, K k7, V v7, K k8, V v8) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        map.put(k4, v4);
        map.put(k5, v5);
        map.put(k6, v6);
        map.put(k7, v7);
        map.put(k8, v8);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5,
                                          K k6, V v6, K k7, V v7, K k8, V v8, K k9, V v9) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        map.put(k4, v4);
        map.put(k5, v5);
        map.put(k6, v6);
        map.put(k7, v7);
        map.put(k8, v8);
        map.put(k9, v9);
        return Collections.unmodifiableMap(map);
    }

    public static <K, V> Map<K, V> mapOf(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5,
                                          K k6, V v6, K k7, V v7, K k8, V v8, K k9, V v9, K k10, V v10) {
        Map<K, V> map = new LinkedHashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        map.put(k3, v3);
        map.put(k4, v4);
        map.put(k5, v5);
        map.put(k6, v6);
        map.put(k7, v7);
        map.put(k8, v8);
        map.put(k9, v9);
        map.put(k10, v10);
        return Collections.unmodifiableMap(map);
    }
}
