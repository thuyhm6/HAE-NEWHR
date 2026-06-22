package com.ait.sy.sys.service;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

public interface SendEmailService {
	
	
	public List<Object> getAffirmInfoEmailApproval(HttpServletRequest request, String applyNo);
	
	/**
	 * 获取需要在eagleoffice里面取消申请的信息
	 */
	public List<Object> getNeedCancelApprovalInfo(HttpServletRequest request,String type);
	
	public void synchronizationApprovalStatus();
	
	public List<Object> getNeedCancelApprovaledInfo(List<String> applyNos);
	//<!-- 2018/07 End EagleOffice 连接HR System -->
}

