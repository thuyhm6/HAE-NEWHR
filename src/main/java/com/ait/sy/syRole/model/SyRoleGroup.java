package com.ait.sy.syRole.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * SyRoleGroup Model - Bảng SY_ROLE_GROUP
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyRoleGroup {
    private String roleGroupNo;
    private String roleGroupId;
    private Integer joinDefault;
    private String cpnyId;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer orderNo;
    private Integer activity;
    private Integer sysType;

    public boolean isActive() {
        return this.activity != null && this.activity == 1;
    }
}
