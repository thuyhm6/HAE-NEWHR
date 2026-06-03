package com.ait.sy.sys.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO cho DataTables server-side processing response
 */
public class DataTablesResponse<T> {

    @JsonProperty("draw")
    private int draw;

    @JsonProperty("recordsTotal")
    private long recordsTotal;

    @JsonProperty("recordsFiltered")
    private long recordsFiltered;

    @JsonProperty("data")
    private List<T> data;

    @JsonProperty("error")
    private String error;

    @JsonProperty("allProcessed")
    private boolean allProcessed;

    // Constructors
    public DataTablesResponse() {
    }

    public DataTablesResponse(int draw, long recordsTotal, long recordsFiltered, List<T> data) {
        this.draw = draw;
        this.recordsTotal = recordsTotal;
        this.recordsFiltered = recordsFiltered;
        this.data = data;
    }

    public DataTablesResponse(int draw, String error) {
        this.draw = draw;
        this.error = error;
    }

    // Getters and Setters
    public int getDraw() {
        return draw;
    }

    public void setDraw(int draw) {
        this.draw = draw;
    }

    public long getRecordsTotal() {
        return recordsTotal;
    }

    public void setRecordsTotal(long recordsTotal) {
        this.recordsTotal = recordsTotal;
    }

    public long getRecordsFiltered() {
        return recordsFiltered;
    }

    public void setRecordsFiltered(long recordsFiltered) {
        this.recordsFiltered = recordsFiltered;
    }

    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public boolean isAllProcessed() {
        return allProcessed;
    }

    public void setAllProcessed(boolean allProcessed) {
        this.allProcessed = allProcessed;
    }
}
