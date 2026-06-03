package com.ait.hrm.empinfo.dto;

public class EmpMonthlyStatsDto {

    private int monthNum;
    private int empCount;
    private int newJoinerCount;
    private int leaverCount;

    public int getMonthNum() { return monthNum; }
    public void setMonthNum(int monthNum) { this.monthNum = monthNum; }

    public int getEmpCount() { return empCount; }
    public void setEmpCount(int empCount) { this.empCount = empCount; }

    public int getNewJoinerCount() { return newJoinerCount; }
    public void setNewJoinerCount(int newJoinerCount) { this.newJoinerCount = newJoinerCount; }

    public int getLeaverCount() { return leaverCount; }
    public void setLeaverCount(int leaverCount) { this.leaverCount = leaverCount; }
}
