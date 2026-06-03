package com.ait.sy.sys.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;
import java.util.HashMap;

/**
 * DTO cho DataTables server-side processing request
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class DataTablesRequest {

    @JsonProperty("draw")
    private int draw = 1;

    @JsonProperty("start")
    private int start = 0;

    @JsonProperty("length")
    private int length = 10;

    @JsonProperty("search")
    private Search search = new Search();

    @JsonProperty("order")
    private Order[] order = new Order[0];

    @JsonProperty("columns")
    private Column[] columns = new Column[0];

    // Generic search parameters - can be used for any model
    @JsonProperty("searchParams")
    private Map<String, Object> searchParams = new HashMap<>();

    // Additional fields for mapper
    private String orderColumn;
    private String orderDir;
    private String searchValue;
    private int offset;
    private int limit;

    // Getters and Setters
    public int getDraw() {
        return draw;
    }

    public void setDraw(int draw) {
        this.draw = draw;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public Search getSearch() {
        return search;
    }

    public void setSearch(Search search) {
        this.search = search;
    }

    public Order[] getOrder() {
        return order;
    }

    public void setOrder(Order[] order) {
        this.order = order;
    }

    public Column[] getColumns() {
        return columns;
    }

    public void setColumns(Column[] columns) {
        this.columns = columns;
    }

    // Generic search parameters getters and setters
    public Map<String, Object> getSearchParams() {
        return searchParams;
    }

    public void setSearchParams(Map<String, Object> searchParams) {
        this.searchParams = searchParams;
    }

    // Convenience methods for adding search parameters
    @com.fasterxml.jackson.annotation.JsonAnySetter
    public void addSearchParam(String key, Object value) {
        if (this.searchParams == null) {
            this.searchParams = new HashMap<>();
        }
        this.searchParams.put(key, value);
    }

    public Object getSearchParam(String key) {
        return this.searchParams != null ? this.searchParams.get(key) : null;
    }

    public String getSearchParamAsString(String key) {
        Object value = getSearchParam(key);
        return value != null ? value.toString() : null;
    }

    public void removeSearchParam(String key) {
        if (this.searchParams != null) {
            this.searchParams.remove(key);
        }
    }

    public boolean hasSearchParam(String key) {
        return this.searchParams != null && this.searchParams.containsKey(key);
    }

    // Additional field getters and setters
    public String getOrderColumn() {
        return orderColumn;
    }

    public void setOrderColumn(String orderColumn) {
        this.orderColumn = orderColumn;
    }

    public String getOrderDir() {
        return orderDir;
    }

    public void setOrderDir(String orderDir) {
        this.orderDir = orderDir;
    }

    public String getSearchValue() {
        return searchValue;
    }

    public void setSearchValue(String searchValue) {
        this.searchValue = searchValue;
    }

    public int getOffset() {
        return offset;
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    // Inner classes
    public static class Search {
        @JsonProperty("value")
        private String value = "";

        @JsonProperty("regex")
        private boolean regex = false;

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public boolean isRegex() {
            return regex;
        }

        public void setRegex(boolean regex) {
            this.regex = regex;
        }
    }

    public static class Order {
        @JsonProperty("column")
        private int column = 0;

        @JsonProperty("dir")
        private String dir = "asc";

        public int getColumn() {
            return column;
        }

        public void setColumn(int column) {
            this.column = column;
        }

        public String getDir() {
            return dir;
        }

        public void setDir(String dir) {
            this.dir = dir;
        }
    }

    public static class Column {
        @JsonProperty("data")
        private String data = "";

        @JsonProperty("name")
        private String name = "";

        @JsonProperty("searchable")
        private boolean searchable = true;

        @JsonProperty("orderable")
        private boolean orderable = true;

        @JsonProperty("search")
        private Search search = new Search();

        public String getData() {
            return data;
        }

        public void setData(String data) {
            this.data = data;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public boolean isSearchable() {
            return searchable;
        }

        public void setSearchable(boolean searchable) {
            this.searchable = searchable;
        }

        public boolean isOrderable() {
            return orderable;
        }

        public void setOrderable(boolean orderable) {
            this.orderable = orderable;
        }

        public Search getSearch() {
            return search;
        }

        public void setSearch(Search search) {
            this.search = search;
        }
    }

    @Override
    public String toString() {
        return "DataTablesRequest{" +
                "draw=" + draw +
                ", start=" + start +
                ", length=" + length +
                ", search=" + (search != null ? search.getValue() : "null") +
                ", order=" + (order != null ? order.length : 0) + " items" +
                ", columns=" + (columns != null ? columns.length : 0) + " items" +
                '}';
    }
}
