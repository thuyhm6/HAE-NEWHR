package com.ait.org.orgManage.service.impl;

import com.ait.hrm.empinfo.mapper.HrEmployeeMapper;
import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.org.orgManage.dto.OrgNode;
import com.ait.org.orgManage.mapper.HrDepartmentMapper;
import com.ait.org.orgManage.model.HrDepartment;
import com.ait.org.orgManage.service.CurrentOrgService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CurrentOrgServiceImpl implements CurrentOrgService {

    @Autowired
    private HrDepartmentMapper deptMapper;

    @Autowired
    private HrEmployeeMapper empMapper;

    @Override
    public List<HrDepartment> getOrgTree() {
        return deptMapper.getDepartmentTree();
    }

    @Override
    public List<HrEmployee> getEmployeeList(String deptNo) {
        return empMapper.findByDeptNo(deptNo);
    }

    @Override
    public List<OrgNode> getVisualOrgTree() {
        List<HrDepartment> depts = deptMapper.getDepartmentTree();
        List<HrEmployee> emps = empMapper.findAll();

        Map<String, List<HrEmployee>> empMap = emps.stream()
                .filter(e -> e.getDeptNo() != null)
                .collect(Collectors.groupingBy(HrEmployee::getDeptNo));

        Map<String, OrgNode> nodeMap = new HashMap<>();
        List<OrgNode> roots = new ArrayList<>();

        // 1. Create Nodes
        for (HrDepartment d : depts) {
            OrgNode node = new OrgNode();
            node.setId(d.getDeptNo());
            node.setParentId(d.getParentDeptNo());
            node.setName(d.getOrgNameLocal());
            node.setCode(d.getDeptNo());
            node.setType("DEPT");
            node.setLevel(d.getDeptLevel() != null ? d.getDeptLevel() : 0);
            node.setManagerId(d.getManagerEmpId());
            node.setManagerName(d.getManagerEmpName());

            nodeMap.put(d.getDeptNo(), node);
        }

        // 2. Add Employees as Children (Leaves)
        for (Map.Entry<String, OrgNode> entry : nodeMap.entrySet()) {
            OrgNode deptNode = entry.getValue();
            List<HrEmployee> deptEmps = empMap.get(deptNode.getId());
            if (deptEmps != null) {
                for (HrEmployee e : deptEmps) {
                    OrgNode empNode = new OrgNode();
                    empNode.setId(e.getEmpId());
                    empNode.setParentId(deptNode.getId());
                    empNode.setName(e.getLocalName());
                    empNode.setCode(e.getEmpId());
                    empNode.setType("EMP");
                    empNode.setTitle(e.getPosition());
                    empNode.setLevel(deptNode.getLevel() + 1);
                    deptNode.getChildren().add(empNode);
                }
            }
        }

        // 3. Link Depts to Parents with Cycle Detection
        for (HrDepartment d : depts) {
            OrgNode node = nodeMap.get(d.getDeptNo());
            String pId = node.getParentId();

            if (pId != null && nodeMap.containsKey(pId)) {
                // Check cycle: Is 'node' an ancestor of 'pId' (i.e. pId is descendant of node)?
                // Or rather, does 'node' already contain 'pId' in its subtree?
                if (!hasDescendant(node, pId)) {
                    nodeMap.get(pId).getChildren().add(node);
                } else {
                    // Cycle detected or implied. Treat as root to break cycle.
                    roots.add(node);
                    // Optionally log this
                }
            } else {
                roots.add(node);
            }
        }

        return roots;
    }

    private boolean hasDescendant(OrgNode start, String targetId) {
        if (start.getChildren() == null || start.getChildren().isEmpty())
            return false;
        for (OrgNode child : start.getChildren()) {
            if (targetId.equals(child.getId()))
                return true; // Found target in children
            // Only traverse DEPT nodes to save time, assuming EMPs are leaves
            if ("DEPT".equals(child.getType())) {
                if (hasDescendant(child, targetId))
                    return true;
            }
        }
        return false;
    }
}
