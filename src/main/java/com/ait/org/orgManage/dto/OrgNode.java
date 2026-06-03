package com.ait.org.orgManage.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class OrgNode {
    private String id;
    private String parentId;
    private String name;
    private String title;
    private String type; // "DEPT", "EMP"
    private String code;
    private String managerName;
    private String managerId;
    private String imageUrl;
    private int level;
    private List<OrgNode> children = new ArrayList<>();
}
