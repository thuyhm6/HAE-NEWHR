package com.ait.sy.syRole.dto;

import lombok.Data;
import java.util.List;

@Data
public class SyUserDto {
    private String userNo;
    private String personId;
    private String cpnyId;
    private String userName;
    private String password;
    private String userType;
    private Integer activity;
    private String empName;
    private String deptName;
    private List<String> roleGroupNos;
}
