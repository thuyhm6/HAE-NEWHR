package com.ait.sy.sys.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * PageRequest - Request object for pagination
 */
public class PageRequest {

    @Min(value = 0, message = "Page number không được âm")
    private int page = 0;

    @Min(value = 1, message = "Page size phải lớn hơn 0")
    @Max(value = 100, message = "Page size không được vượt quá 100")
    private int size = 20;

    private String sortBy;
    private String sortDirection = "ASC";

    // Constructors
    public PageRequest() {
    }

    public PageRequest(int page, int size) {
        this.page = page;
        this.size = size;
    }

    public PageRequest(int page, int size, String sortBy, String sortDirection) {
        this.page = page;
        this.size = size;
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
    }

    // Getters and Setters
    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }

    // Utility methods
    public int getOffset() {
        return page * size;
    }

    public boolean isAscending() {
        return "ASC".equalsIgnoreCase(sortDirection);
    }

    public boolean isDescending() {
        return "DESC".equalsIgnoreCase(sortDirection);
    }

    @Override
    public String toString() {
        return "PageRequest{" +
                "page=" + page +
                ", size=" + size +
                ", sortBy='" + sortBy + '\'' +
                ", sortDirection='" + sortDirection + '\'' +
                '}';
    }
}
