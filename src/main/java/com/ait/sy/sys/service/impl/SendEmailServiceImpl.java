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
import com.ait.util.MailSendApprovalManager;

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
	MailSendApprovalManager mailSendApprovalManager;
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
		NeoOrgWsProxy neoOrgWsProxy = mailSendApprovalManager.getNeoOrgWsProxy();
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
	
	/**
	 * 同步eagleoffice中审批信息的状态（HAE）
	 * @param request
	 * @return List
	 */
	public void synchronizationApprovalStatus(){
		/*获得web service服务*/
		NeoOrgWsProxy neoOrgWsProxy = mailSendApprovalManager.getNeoOrgWsProxy();
		
		List approvalList = this.sendEmailMapper.getSynchronizationApprovalList();
		
		Map paramMap = new LinkedHashMap();
		MisKey misKey;
		MisKey[] misKeys = new MisKey[approvalList==null?0:approvalList.size()];
		
		if(approvalList!=null){
			for(int i = 0;i<approvalList.size();i++){
				Map approvalMap = (Map) approvalList.get(i);
				misKey = new MisKey();
				misKey.setMisDocId("HAEVHR_001_"+checkNull(approvalMap.get("MISDOCID")));
				misKeys[i] = misKey;
			}
		
			ApprovalDocumentStatus[] appDocStus = this.mailSendApprovalManager.getMailApprovalInfo(misKeys);
			
			for(int i=0;i<appDocStus.length;i++){
				for(int j = 0;j<approvalList.size();j++){
					Map approvalMap = (Map) approvalList.get(i);
					if(("HAEVHR_001_"+checkNull(approvalMap.get("MISDOCID"))).equals(appDocStus[i].getMisDocId())){
						if(!"4".equals(checkNull(appDocStus[i].getStatus()))){
							SignerInfo[] signerInfos = appDocStus[i].getSignerInfos();
							
							paramMap.put("APPLY_NO", checkNull(approvalMap.get("APPLY_NO")));
							List affirmList = this.sendEmailMapper.getAffirmListByApplyNo(paramMap);
							if(affirmList != null){
								for(int k=0;k<affirmList.size();k++){
									Map affirmMap = (Map) affirmList.get(k);
									for(int a=0;a<signerInfos.length;a++){
										if ("0".equals(checkNull(affirmMap.get("AFFIRM_FLAG"))) && "2".equals(checkNull(affirmMap.get("AFFIRM_LEVEL")))
												&& "1".equals(checkNull(approvalMap.get("TIME_FLAG")))) {
											this.sendAttendanceEmail(approvalMap);
											String updateAttendace = this.sendEmailMapper.updateAttendace(approvalMap);
										}
										if(signerInfos[a].getStatus() != 0 
												&& "0".equals(checkNull(affirmMap.get("AFFIRM_FLAG")))
												&& (checkNull(affirmMap.get("EMAIL")).equals(checkNull(signerInfos[a].getEmailAddr()))
													|| checkNull(affirmMap.get("AFFIRM_LEVEL")).equals(checkNull(signerInfos[a].getSequence()))) //hms 2019/10ROW_LEVEL
												&& "1".equals(checkNull(affirmMap.get("AFFIRM_TYPE")))){
											
											paramMap.put("applyType", checkNull(affirmMap.get("APPLY_TYPE")));
											paramMap.put("applyFlag", checkNull(affirmMap.get("APPLY_FLAG")));
											paramMap.put("flag", String.valueOf(signerInfos[a].getStatus()));
											paramMap.put("affirmContent", signerInfos[a].getComment() == null ? "" : signerInfos[a].getComment());
											paramMap.put("adminID", "");
											paramMap.put("adminIP", "hanwha.eagleoffice");
											paramMap.put("affirmLevel", checkNull(affirmMap.get("AFFIRM_LEVEL")));
											try {
												syAffirmEmailMapper.callAffirmExecute(paramMap);
											} catch (Exception e) {
												// TODO Auto-generated catch block
												e.printStackTrace();
											}
										}
									}
								}
							}
							
							
						}
					}
				}
			}
		
		}
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
