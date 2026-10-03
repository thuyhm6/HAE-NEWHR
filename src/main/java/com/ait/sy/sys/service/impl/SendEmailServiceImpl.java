package com.ait.sy.sys.service.impl;


import hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus;
import hanwha.neo.branch.ss.approval.vo.MisKey;
import hanwha.neo.branch.ss.approval.vo.SignerInfo;
import hanwha.neo.branch.ss.common.vo.WsException;
import hanwha.neo.branch.ss.org.service.NeoOrgWsProxy;
import hanwha.neo.branch.ss.org.vo.OrgUserVO;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.rmi.RemoteException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ait.ar.attendanceMintenance.mapper.EssLeaveApplyMapper;
import com.ait.sy.syAffirm.mapper.SyAffirmEmailMapper;
import com.ait.sy.sys.mapper.SendEmailMapper;
import com.ait.sy.sys.service.SendEmailService;
import com.ait.util.MailManager;

/**
 * 发送审批邮件
 *
 */
@Service
public class SendEmailServiceImpl implements SendEmailService{

	private static final Logger log = LoggerFactory.getLogger(SendEmailServiceImpl.class);

	private static String checkNull(Object obj) {
		return obj == null ? "" : obj.toString();
	}

	@Autowired
    private EssLeaveApplyMapper essLeaveApplymapper;
	@Autowired
	MailManager mailManger;
	@Autowired
    private SendEmailMapper sendEmailMapper;
	@Autowired
    private SyAffirmEmailMapper syAffirmEmailMapper;
	// @Autowired
	// private InfoApplyLeaveDao infoApplyLeaveDao;
	
	/**
	 * 工资条发送
	 */
	public void sendPayStubEmail(HttpServletRequest request, List resultList){

		//读取模板信息
		String template = MailManager.readTemplate("payStub");
		String path = request.getSession().getServletContext().getRealPath("/");
		//封装邮件信息并发送
		if(resultList != null && resultList.size() > 0){
			for (int i = 0;i < resultList.size(); i++){
				Map map = (Map)resultList.get(i);
				Map personInfo = (Map) map.get("personInfo");
				if(personInfo != null){
					String pdfPath = path+"/resources/template/payPdf/" + personInfo.get("EMPID")+"_"+personInfo.get("PAY_DATE")+".pdf";
					File file = new File(pdfPath);
					map.put("EMAIL_TITLE", "PHIẾU LƯƠNG " + personInfo.get("PAY_DATE"));
					map.put("EMAIL", personInfo.get("EMAIL"));
					map.put("ATTACH_PATH", pdfPath);
					map.put("EMAIL_CONTENT", "Tra cứu phiếu lương ở tệp đính kèm;<br/>Please check payroll in the attachment;");
					//封装模板信息
					//this.composeMailPayStubTemplate(request,template,map);
					//发送
					//mailManger.sendmail(map);
					if(file.exists()){
						mailManger.sendmailattachment(map);
					}
				}
			}
		}
	}
	
	/**
	 * 封装工资条信息
	 * @param map
	 * @return
	 */
	private void composeMailPayStubTemplate(HttpServletRequest request,String template,Map map){
		Map resultMap = new LinkedHashMap();
		
		String basePath = request.getSession().getServletContext().getRealPath("");
		String inputFile = basePath+"//resources//template//mail//payStub.htm";
		
		InputStream is = null;
		InputStreamReader isr = null;
		String result = "";
		/*读取模板*/
		int data=0;
		char[] ch =new char[1024];
		try {
			is = new FileInputStream(inputFile);
			isr = new InputStreamReader(is,"utf-8");
			result = "";
			while((data = isr.read(ch))!=-1){
	             result+=new String(ch,0,data);
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		//String result = MailManager.composeTemplateByParam(template, resultMap);
		
		String replaceStr = "";
		double replaceDou = 0;
		DecimalFormat decimalFormat = new DecimalFormat("#,##0");

		/*取三种项目最多的数量*/
		int maxDataCount = 0;
		int dataCount_1 = 0;
		int dataCount_2 = 0;
		int dataCount_3 = 0;

		Map personInfo = (Map) map.get("personInfo");
		result = result.replace("[PAY_DATE]", personInfo.get("PAY_DATE")==null?"":personInfo.get("PAY_DATE")+"");
		result = result.replace("[Name]", personInfo.get("LOCAL_NAME")==null?"":personInfo.get("LOCAL_NAME")+"");
		result = result.replace("[Employee No]", personInfo.get("EMPID")==null?"":personInfo.get("EMPID")+"");
		result = result.replace("[Department]", personInfo.get("DEPT_NAME")==null?"":personInfo.get("DEPT_NAME")+"");
		result = result.replace("[Employee type]", personInfo.get("EMP_TYPE_NAME")==null?"":personInfo.get("EMP_TYPE_NAME")+"");
		result = result.replace("[Post family]", personInfo.get("POST_FAMILY_NAME")==null?"":personInfo.get("POST_FAMILY_NAME")+"");
		result = result.replace("[Rank]", personInfo.get("POST_GRADE_NAME")==null?"":personInfo.get("POST_GRADE_NAME")+"");
		result = result.replace("[Position]", personInfo.get("POSITION_NAME")==null?"":personInfo.get("POSITION_NAME")+"");
		result = result.replace("[Employee office]", personInfo.get("EMP_OFFICE_NAME")==null?"":personInfo.get("EMP_OFFICE_NAME")+"");
		result = result.replace("[Actual payment]", personInfo.get("REAL_WAGES")==null?"":decimalFormat.format(personInfo.get("REAL_WAGES")));
		
		List paEmpVacInfo = (List) map.get("paEmpVacInfo");
		replaceStr = "";
		for(int j=0;j<paEmpVacInfo.size();j++){
			Map vacMap = (Map) paEmpVacInfo.get(j);
			replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+vacMap.get("TOTAL_VAC_CNT")+"</td>"
		                  + "<td style='text-align: center;' class='td_type'>"+vacMap.get("USED_VAC_CNT")+"</td>"
		                  + "<td style='text-align: center;' class='td_type'>"+vacMap.get("SHENGYU_VAC_CNT")+"</td></tr>";
		}
		result = result.replace("[Annual leave]", replaceStr);
		
		List paEmpAccount = (List) map.get("paEmpAccount");
		replaceStr = "";
		for(int j=0;j<paEmpAccount.size();j++){
			Map accMap = (Map) paEmpAccount.get(j);
			replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+accMap.get("ACCOUNT_TYPE")+"</td>"
		                  + "<td style='text-align: center;' class='td_type'>"+accMap.get("ACCOUNT_NO")+"</td></tr>";
		}
		result = result.replace("[Bank Account]", replaceStr);
		/*标准项目*/
		List payStubList = (List) map.get("payStubList");
		replaceStr = "";
		for(int j=0;j<payStubList.size();j++){
			Map paMap = (Map) payStubList.get(j);
			if("4".equals(paMap.get("ITEM_TYPE").toString())){
				replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+"</td>"
			                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
			}
		}
		result = result.replace("[Basic project]", replaceStr);
		/*基本工资+所有津贴*/
		replaceDou = 0;
		for(int j=0;j<payStubList.size();j++){
			Map paMap = (Map) payStubList.get(j);
			if("4".equals(paMap.get("ITEM_TYPE").toString())){
				replaceDou += Integer.parseInt(paMap.get("ITEM_VALUE").toString());
			}
		}
		result = result.replace("[Basic allowance]", decimalFormat.format(replaceDou));
		/*出勤明细*/
		replaceStr = "";
		for(int j=0;j<payStubList.size();j++){
			Map paMap = (Map) payStubList.get(j);
			if("1".equals(paMap.get("ITEM_TYPE").toString())){
				replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+"</td>"
			                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
				++dataCount_1;
			}
		}
		if(dataCount_1 > maxDataCount){
			maxDataCount = dataCount_1;
		}
		result = result.replace("[Attendance detail]", replaceStr);
		
		/*工资明细*/
		replaceStr = "";
		for(int j=0;j<payStubList.size();j++){
			Map paMap = (Map) payStubList.get(j);
			if("2".equals(paMap.get("ITEM_TYPE").toString())){
				replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+"</td>"
			                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
				++dataCount_2;
			}
		}
		if(dataCount_2 > maxDataCount){
			maxDataCount = dataCount_2;
		}
		result = result.replace("[Salary detail]", replaceStr);
		
		/*总工资*/
		replaceDou = 0;
		for(int j=0;j<payStubList.size();j++){
			Map paMap = (Map) payStubList.get(j);
			if("2".equals(paMap.get("ITEM_TYPE").toString())){
				replaceDou += Integer.parseInt(paMap.get("ITEM_VALUE").toString());
			}
		}
		result = result.replace("[Total Pay]", decimalFormat.format(replaceDou));
		
		/*扣除明细*/
		replaceStr = "";
		List insuranceRateList = (List) map.get("insuranceRateList");
		for(int j=0;j<payStubList.size();j++){
			Map paMap = (Map) payStubList.get(j);
			if("3".equals(paMap.get("ITEM_TYPE").toString())){
				for(int k=0;k<insuranceRateList.size();k++){
					Map inRateMap = (Map) insuranceRateList.get(k);
					if("570057".equals(paMap.get("ITEM_NO").toString())
							&& "540065".equals(inRateMap.get("PARAM_ITEM_NO").toString())){
								replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+" "+inRateMap.get("ITEM_VALUE")+"</td>"
				                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
					}
					if("570058".equals(paMap.get("ITEM_NO").toString())
							   && "540066".equals(inRateMap.get("PARAM_ITEM_NO").toString())){
								replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+" "+inRateMap.get("ITEM_VALUE")+"</td>"
				                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
					}
					if("570059".equals(paMap.get("ITEM_NO").toString())
							   && "540067".equals(inRateMap.get("PARAM_ITEM_NO").toString())){
								replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+" "+inRateMap.get("ITEM_VALUE")+"</td>"
				                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
					}
					if("570061".equals(paMap.get("ITEM_NO").toString())
							   && "540068".equals(inRateMap.get("PARAM_ITEM_NO").toString())){
								replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+" "+inRateMap.get("ITEM_VALUE")+"</td>"
				                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
					}
					if("570062".equals(paMap.get("ITEM_NO").toString())
							   && "540069".equals(inRateMap.get("PARAM_ITEM_NO").toString())){
								replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+" "+inRateMap.get("ITEM_VALUE")+"</td>"
				                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
					}
					if("570063".equals(paMap.get("ITEM_NO").toString())
							   && "540070".equals(inRateMap.get("PARAM_ITEM_NO").toString())){
								replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+" "+inRateMap.get("ITEM_VALUE")+"</td>"
				                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
					}
					if(k == insuranceRateList.size()-1
							&& !"570057".equals(paMap.get("ITEM_NO").toString())
							&& !"570058".equals(paMap.get("ITEM_NO").toString())
							&& !"570059".equals(paMap.get("ITEM_NO").toString())
							&& !"570061".equals(paMap.get("ITEM_NO").toString())
							&& !"570062".equals(paMap.get("ITEM_NO").toString())
							&& !"570063".equals(paMap.get("ITEM_NO").toString())){
						replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+paMap.get("ITEM_NAME")+"</td>"
		                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(paMap.get("ITEM_VALUE"))+"</td></tr>";
					}
					
				}
				++dataCount_3;
			}
		}
		if(dataCount_3 > maxDataCount){
			maxDataCount = dataCount_3;
		}
		result = result.replace("[Deduction detail]", replaceStr);
		
		/*总扣除*/
		replaceDou = 0;
		for(int j=0;j<payStubList.size();j++){
			Map paMap = (Map) payStubList.get(j);
			if("3".equals(paMap.get("ITEM_TYPE").toString())){
				replaceDou += Integer.parseInt(paMap.get("ITEM_VALUE").toString());
			}
		}
		result = result.replace("[Total deduct]", decimalFormat.format(replaceDou));
		
		/*其他福利*/
		List paInputItemList = (List) map.get("paInputItemList");
		replaceStr = "";
		for(int j=0;j<paInputItemList.size();j++){
			Map inputMap = (Map) paInputItemList.get(j);
			replaceStr += "<tr><td style='text-align: center;' class='td_type'>"+inputMap.get("REMARK")+"</td>"
		                  + "<td style='text-align: right;' class='td_type'>"+decimalFormat.format(inputMap.get("RETURN_VALUE"))+"</td></tr>";
		}
		result = result.replace("[Other benefits]", replaceStr);
		
		/*设置div最大高度*/
		result = result.replace("[maxHeightData]", (maxDataCount*25+50)+"");
	    /*特殊字符设置*/
		result = result.replace("&", "&amp;");
		result = result.replace("&amp;nbsp;", "&nbsp;");
		
		map.put("EMAIL_CONTENT", result);
	}
	
	/**
	 * HAE待审批发送到eagleoffice审批箱
	 */
	public List getAffirmInfoEmailApproval(HttpServletRequest request, String applyNo){
		/*获得web service服务*/
		NeoOrgWsProxy neoOrgWsProxy = mailManger.getNeoOrgWsProxy();
		List applyList = new ArrayList();
		try {
			OrgUserVO[] orgUser = neoOrgWsProxy.searchUserByEmpolyeeNo("20100196");
			if (orgUser.length <= 0) {
				return applyList;
			}

			//读取模板信息
			String template = MailManager.readTemplate("approvalInfo");
			Map replaceMap = new LinkedHashMap();
			// applyNo != null → chỉ lấy đơn vừa save; null → lấy tất cả đơn chờ gửi
			applyList= this.sendEmailMapper.getWaitSendApplyInfoList(applyNo);
			
			if(applyList != null){
				for(int i=0;i<applyList.size();i++){
					StringBuffer tempContent = new StringBuffer();
					StringBuffer infoContent = new StringBuffer();
					Map applyMap = (Map) applyList.get(i);
					//paramMap.put("APPLY_NO", applyMap.get("APPLY_NO"));
					List affirmList = this.sendEmailMapper.getAffirmListByApplyNo(applyMap);
					if(affirmList != null){
						for(int j = 0; j<affirmList.size();j++){
							Map affirmMap = (Map) affirmList.get(j);
							try {
								OrgUserVO[] orgUsers = neoOrgWsProxy.searchUserByEmpolyeeNo((String)affirmMap.get("AFFIRM_EMPID"));
								if (orgUsers.length <= 0) {
									continue;
								}
								affirmMap.put("Userkey", orgUsers[0].getUserKey());
							} catch (WsException e) {
								e.printStackTrace();
							} catch (RemoteException e) {
								e.printStackTrace();
							}
						}
					}
					List receiverList = this.sendEmailMapper.getReceiverListByApplyNo(applyMap);
					if(receiverList != null){
						for(int j = 0; j<receiverList.size();j++){
							Map receiverMap = (Map) receiverList.get(j);
							try {
								OrgUserVO[] orgUsers = neoOrgWsProxy.searchUserByEmpolyeeNo((String)receiverMap.get("AFFIRM_EMPID"));
								if (orgUsers.length <= 0) {
									continue;
								}
								receiverMap.put("Userkey", orgUsers[0].getUserKey());
							} catch (WsException e) {
								e.printStackTrace();
							} catch (RemoteException e) {
								e.printStackTrace();
							}
						}
					}
					// if("21".equals(checkNull(applyMap.get("APPLY_TYPE_NO")))){
					// 	paramMap.put("APPLY_TYPE", "LEAVE_APPLY");
					// }else{
					// 	paramMap.put("APPLY_TYPE", "");
					// }
					
					// List fileList = this.infoApplyLeaveDao.getEssFileList(paramMap);
					// if(fileList!=null){
					// 	for(int j=0;j<fileList.size();j++){
					// 		Map fileMap = (Map) fileList.get(j);
					// 		fileMap.put("FILE_URL", basePath + fileMap.get("FILE_URL"));
					// 	}
					// }
					
					infoContent.append("<tr>");
					infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("LOCAL_NAME")) + "</td>");
					infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("EMPID")) + "</td>");
					infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("DEPT_NAME")) + "</td>");
					infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("POSITION_NAME")) + "</td>");
					infoContent.append("</tr>");
					tempContent.append("<tr>");
					if ("310".equals(checkNull(applyMap.get("APPLY_TYPE_NO")))) {
						tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" +" (OT Over) " + checkNull(applyMap.get("APPLY_TYPE_NAME_KO"))
						 +" / "+ checkNull(applyMap.get("APPLY_TYPE_NAME_VI")) +"</td>");
					}else {
						tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("APPLY_TYPE_NAME_KO"))
						 +" / "+ checkNull(applyMap.get("APPLY_TYPE_NAME_VI")) +"</td>");
					}
					tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("FROM_TIME")) + "</td>");
					tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("TO_TIME")) + "</td>");
					if("21".equals(checkNull(applyMap.get("APPLY_TYPE_NO")))){
						tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("ATT_LENGTH")) + "</td>");
					}else {
						tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("OT_LENGTH")) + "(Total overtime in month: "+checkNull(applyMap.get("OT_TOTAIL_MONTH"))+")"+ "</td>");
					}
					tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("REMARK")) + "</td>");
					tempContent.append("</tr>");
					replaceMap.put("APPLY_PERSON_INFO", infoContent);
					replaceMap.put("APPAL_ATT_INFO", tempContent);
					applyMap.put("content", MailManager.composeTemplateByParam(template, replaceMap));
					applyMap.put("TITLE", applyMap.get("APPLY_TYPE_NAME").toString()
										  +" Application("+applyMap.get("LOCAL_NAME").toString()+")[Date: "
										  +applyMap.get("APPLY_TIME").toString()+"]");
					// applyMap.put("fileList", fileList);
					applyMap.put("affirmList", affirmList);
					applyMap.put("receiverList", receiverList);
				}
			}
		} catch (WsException e) {
			e.printStackTrace();
		} catch (RemoteException e) {
			e.printStackTrace();
		}
		
		
		
		return applyList;
		
	}
	
	/**
	 * 获取需要在eagleoffice里面取消申请的信息
	 * @param request
	 * @return List
	 */
	public List getNeedCancelApprovalInfo(HttpServletRequest request,String type){
		
		LinkedHashMap paramMap = new LinkedHashMap<>();
		String[] paramData = request.getParameterValues(type);
		String applyNos = "";
		for (int i = 0; i < paramData.length; i++) {
			if(applyNos.length() == 0){
				applyNos += paramData[i];
			}else{
				applyNos += "," + paramData[i];
			}
		}
		if(paramData.length > 1){
			applyNos = applyNos.substring(0, applyNos.length() - 1);
		}
		paramMap.put("APPLY_NOS", applyNos);
		
		List resultList = this.sendEmailMapper.getNeedCancelApprovalInfo(paramMap);
		
		return resultList;
	}
	
	/** Tiền tố MISDOCID khi gửi đơn sang Clever/EagleOffice */
	private static final String MIS_DOC_PREFIX = "HAEVHR_001_";
	/** Trạng thái văn bản trên Clever không cần đồng bộ */
	private static final String DOC_STATUS_SKIP = "4";
	/** Trạng thái người ký trên Clever: 0 = chưa xử lý */
	private static final int SIGNER_STATUS_PENDING = 0;
	/** FLAG của PR_AFFIRM_EXECUTE: 1 = duyệt */
	private static final int AFFIRM_FLAG_APPROVE = 1;

	/**
	 * Đồng bộ trạng thái phê duyệt từ Clever/EagleOffice về HR (HAE).
	 * 1. Lấy các đơn đang trong quá trình phê duyệt.
	 * 2. Tra cứu trạng thái trên Clever theo MISDOCID.
	 * 3. Khớp người ký trên Clever với các bước duyệt đang chờ để cập nhật.
	 *
	 * Không dùng @Transactional cho toàn bộ hàm: mỗi đơn được xử lý độc lập,
	 * lỗi ở một đơn không được rollback / chặn các đơn khác, và email đã gửi thì không thể rollback.
	 */
	public void synchronizationApprovalStatus() {
		List<Map<String, Object>> approvalList = this.sendEmailMapper.getSynchronizationApprovalList();
		if (approvalList == null || approvalList.isEmpty()) {
			log.info("[SyncApprovalStatus] Không có đơn nào cần đồng bộ.");
			return;
		}

		// Index đơn theo MISDOCID đầy đủ để tra cứu O(1) thay vì lồng vòng lặp
		Map<String, Map<String, Object>> approvalByMisDocId = new LinkedHashMap<String, Map<String, Object>>();
		for (Map<String, Object> approvalMap : approvalList) {
			approvalByMisDocId.put(MIS_DOC_PREFIX + checkNull(approvalMap.get("MISDOCID")), approvalMap);
		}

		MisKey[] misKeys = new MisKey[approvalByMisDocId.size()];
		int idx = 0;
		for (String misDocId : approvalByMisDocId.keySet()) {
			MisKey misKey = new MisKey();
			misKey.setMisDocId(misDocId);
			misKeys[idx++] = misKey;
		}

		ApprovalDocumentStatus[] appDocStus = mailManger.getMailApprovalInfo(misKeys);
		if (appDocStus == null) {
			log.warn("[SyncApprovalStatus] Không lấy được trạng thái phê duyệt từ Clever.");
			return;
		}

		int success = 0;
		int failed = 0;
		for (ApprovalDocumentStatus docStatus : appDocStus) {
			if (docStatus == null || docStatus.getMisDocId() == null) {
				continue;
			}
			Map<String, Object> approvalMap = approvalByMisDocId.get(docStatus.getMisDocId());
			if (approvalMap == null || DOC_STATUS_SKIP.equals(checkNull(docStatus.getStatus()))) {
				continue;
			}
			// Xử lý độc lập từng đơn: lỗi ở đơn này không ảnh hưởng các đơn khác
			try {
				syncOneApproval(approvalMap, docStatus.getSignerInfos());
				success++;
			} catch (Exception e) {
				failed++;
				log.error("[SyncApprovalStatus] Lỗi đồng bộ đơn APPLY_NO={}, MISDOCID={}",
						approvalMap.get("APPLY_NO"), docStatus.getMisDocId(), e);
			}
		}
		log.info("[SyncApprovalStatus] Tổng {} đơn, thành công {}, lỗi {}.", approvalList.size(), success, failed);
	}

	/**
	 * Đồng bộ một đơn: gửi email bảo vệ (nếu cần) và cập nhật các bước duyệt đã được ký trên Clever.
	 */
	private void syncOneApproval(Map<String, Object> approvalMap, SignerInfo[] signerInfos) {
		String applyNo = checkNull(approvalMap.get("APPLY_NO"));

		Map<String, Object> queryMap = new LinkedHashMap<String, Object>();
		queryMap.put("APPLY_NO", applyNo);
		// SQL đã lọc AFFIRM_FLAG = 0 và sắp xếp theo AFFIRM_LEVEL
		List<Map<String, Object>> affirmList = this.sendEmailMapper.getAffirmListByApplyNo(queryMap);
		if (affirmList == null || affirmList.isEmpty()) {
			return;
		}

		// 1. Email thông báo cho bảo vệ: tối đa 1 lần / đơn, không phụ thuộc người ký
		if ("1".equals(checkNull(approvalMap.get("TIME_FLAG")))) {
			for (Map<String, Object> affirmMap : affirmList) {
				if ("2".equals(checkNull(affirmMap.get("AFFIRM_LEVEL")))) {
					this.sendAttendanceEmail(approvalMap);
					this.sendEmailMapper.updateAttendace(approvalMap);
					log.info("[SyncApprovalStatus] Đã gửi email bảo vệ cho APPLY_NO={}", applyNo);
					break;
				}
			}
		}

		if (signerInfos == null || signerInfos.length == 0) {
			return;
		}

		// 2. Khớp từng bước duyệt đang chờ với người ký trên Clever
		for (Map<String, Object> affirmMap : affirmList) {
			if (!"1".equals(checkNull(affirmMap.get("AFFIRM_TYPE")))) {
				continue;
			}
			SignerInfo signer = findSigner(affirmMap, signerInfos);
			if (signer == null) {
				continue;
			}

			String affirmLevel = checkNull(affirmMap.get("AFFIRM_LEVEL"));
			Map<String, Object> execMap = new LinkedHashMap<String, Object>();
			execMap.put("applyNo", applyNo);
			execMap.put("applyType", checkNull(affirmMap.get("APPLY_TYPE")));
			execMap.put("applyFlag", checkNull(affirmMap.get("APPLY_FLAG")));
			execMap.put("flag", Integer.valueOf(signer.getStatus()));
			execMap.put("affirmContent", signer.getComment() == null ? "" : signer.getComment());
			execMap.put("adminID", "");
			execMap.put("adminIP", "hanwha.eagleoffice");
			execMap.put("affirmLevel", affirmLevel);
			execMap.put("message", "");

			syAffirmEmailMapper.callAffirmExecute(execMap);

			String message = checkNull(execMap.get("message"));
			if (message.length() > 0 && !"OK".equalsIgnoreCase(message)) {
				log.warn("[SyncApprovalStatus] PR_AFFIRM_EXECUTE trả về lỗi APPLY_NO={}, level={}: {}",
						applyNo, affirmLevel, message);
				break;
			}
			log.info("[SyncApprovalStatus] Cập nhật APPLY_NO={}, level={}, flag={}", applyNo, affirmLevel, signer.getStatus());

			// Bị từ chối (hoặc trạng thái khác duyệt) thì đơn đã kết thúc, không xử lý các cấp sau
			if (signer.getStatus() != AFFIRM_FLAG_APPROVE) {
				break;
			}
		}
	}

	/**
	 * Tìm người ký trên Clever tương ứng với một bước duyệt (khớp theo email hoặc thứ tự cấp duyệt).
	 * Chỉ trả về người ký đã xử lý (status != 0).
	 */
	private SignerInfo findSigner(Map<String, Object> affirmMap, SignerInfo[] signerInfos) {
		String email = checkNull(affirmMap.get("EMAIL"));
		String affirmLevel = checkNull(affirmMap.get("AFFIRM_LEVEL"));
		for (SignerInfo signer : signerInfos) {
			if (signer == null || signer.getStatus() == SIGNER_STATUS_PENDING) {
				continue;
			}
			boolean emailMatch = email.length() > 0 && email.equalsIgnoreCase(checkNull(signer.getEmailAddr()));
			boolean levelMatch = affirmLevel.equals(checkNull(signer.getSequence())); //hms 2019/10ROW_LEVEL
			if (emailMatch || levelMatch) {
				return signer;
			}
		}
		return null;
	}
	
	/**
	 * 获取需要在eagleoffice里面取消申请的信息(hr system审批结束的信息)
	 * @param request 
	 * @param String
	 * @return List
	 */
	public List getNeedCancelApprovaledInfo(List<String> applyNos){
		
		List resultList;
		
		resultList = sendEmailMapper.getNeedCancelApprovaledInfo(applyNos);
		return resultList;
	}
	
	public void sendAttendanceEmail(Map mapParameter){
		boolean flag = true;

			//String studentEmail = eduTrainDao.queryStudents(mapParameter, "queryStudents");
			Map map = new LinkedHashMap();//(Map) eduTrainDao.planManagerInfo(mapParameter);
			//map.put("EMAIL", "ait.vn@hanwha.com");
			map.put("EMAIL", "hae.security@hanwha.com");
			
			//map.put("EMAIL_TITLE", "Approve Info【YHR】Date：");
			map.put("EMAIL_TITLE", "Thông báo xin nghỉ phép");
			//封装模板信息
			String template = MailManager.readTemplate("approvalInfo");
			Map replaceMap = new LinkedHashMap();
			mapParameter.put("APPLY_NO", mapParameter.get("APPLY_NO"));
			List applyList= this.sendEmailMapper.getSendDataInfoList(mapParameter, "getApplyLeaveData");
			for(int i=0;i<applyList.size();i++){
				StringBuffer tempContent = new StringBuffer();
				StringBuffer infoContent = new StringBuffer();
				Map applyMap = (Map) applyList.get(i);
			infoContent.append("<tr>");
			infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("LOCAL_NAME")) + "</td>");
			infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("EMPID")) + "</td>");
			infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("DEPT_NAME")) + "</td>");
			infoContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("POSITION_NAME")) + "</td>");
			infoContent.append("</tr>");
			tempContent.append("<tr>");
			tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("APPLY_TYPE_NAME_KO"))
																					 +" / "+ checkNull(applyMap.get("APPLY_TYPE_NAME_VI")) +"</td>");
			tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("FROM_TIME")) + "</td>");
			tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("TO_TIME")) + "</td>");
			tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("APPLY_LENGTH")) + "</td>");
			tempContent.append("<td class=\"td_type\" style=\"text-align: center\">" + checkNull(applyMap.get("REMARK")) + "</td>");
			tempContent.append("</tr>");
			replaceMap.put("APPLY_PERSON_INFO", infoContent);
			replaceMap.put("APPAL_ATT_INFO", tempContent);
			map.put("EMAIL_CONTENT", MailManager.composeTemplateByParam(template, replaceMap));

			flag = mailManger.sendmail(map);
			}

	}
}
