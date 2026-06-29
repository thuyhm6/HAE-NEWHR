package com.ait.util;

import hanwha.neo.branch.ss.approval.axisws.ApprovalServiceProxy;
import hanwha.neo.branch.ss.approval.vo.ApprovalDocument;
import hanwha.neo.branch.ss.approval.vo.CancelApprovalDocument;
import hanwha.neo.branch.ss.approval.vo.ReceiverInfo;
import hanwha.neo.branch.ss.approval.vo.SignerInfo;
import hanwha.neo.branch.ss.approval.vo.WsApAttachFile;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.activation.FileDataSource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ait.sy.sys.mapper.SendEmailMapper;
import com.ait.sy.sys.service.SendEmailService;

/**
 * 审批信息邮箱发送
 * @author lipeng
 *
 */
@Service
public class MailSendApprovalManager {
	
	private static final Logger log = LoggerFactory.getLogger(MailSendApprovalManager.class);
			
	private String PASS = "通过";
	
	private String REJECT = "否决";

	@Autowired
	private MailManager mailManger;
    @Autowired
    private SendEmailMapper sendEmailMapper;
	@Autowired
    private SendEmailService sendEmailService;

    	
	/**
	 * 是否验证
	 * 	1：发送
	 *  0：不发送
	 */
    //@Value("${approval.send.flag}")
	private String APPROVAL_SEND_FLAG = "1";

	
	/**
	 *  获取需要发送待审批信息的审批者，发送到eagleoffice
	 * @param request
	 * @param response
	 * @return boolean
	 */
	@SuppressWarnings("unchecked")
	public boolean sendAffirmInfoEmailApproval(HttpServletRequest request, String applyNo){
		boolean resultBool = false;
		if("1".equals(APPROVAL_SEND_FLAG)){
			List<Object> sendList = sendEmailService.getAffirmInfoEmailApproval(request, applyNo);
			if(sendList != null){
				for(int i=0;i<sendList.size();i++){
					Map<String, Object> approvalMap = (Map<String, Object>) sendList.get(i);
					List<Object> approverList = (List<Object>) approvalMap.get("affirmList");
					List<Object> receiverList = (List<Object>) approvalMap.get("receiverList");
					List<Object> fileList = (List<Object>) approvalMap.get("fileList");
					String title = (String) approvalMap.get("TITLE");
					String content = (String) approvalMap.get("content");
					String misDocId = (String) approvalMap.get("MISDOCID");
					boolean sendResult = this.sendApproval(title, content,misDocId, approverList,receiverList,fileList);
					if(sendResult){
						String sentApplyNo = approvalMap.get("APPLY_NO").toString();
						this.sendEmailMapper.updateApplySendFlag(sentApplyNo);
					}
				}
				resultBool = true;
			}
		}
		return resultBool;
	}
	

	
	/**
	 *  获取需要到eagleoffice取消的待审批信息
	 * @param request
	 * @param response
	 * @return boolean
	 */
	@SuppressWarnings("unchecked")
	public boolean cancelMailApprovalInfo(HttpServletRequest request,String type){
		boolean resultBool = false;
		if("1".equals(APPROVAL_SEND_FLAG)){
			List<Object> cacelList = sendEmailService.getNeedCancelApprovalInfo(request,type);
			if(cacelList != null){
				for(int i=0;i<cacelList.size();i++){
					Map<String, Object> cancelMap = (Map<String, Object>) cacelList.get(i);
					String misDocId = (String) cancelMap.get("MISDOCID");
					String comment = " ";//(String) cancelMap.get("REMARK")
					this.cancelApproval(misDocId, comment);
				}
				resultBool = true;
			}
		}
		return resultBool;
	}
	
	/**
	 *  获取需要到eagleoffice取消的已审批信息(hr system已审批结束的信息)
	 * @param request
	 * @param response
	 * @return boolean
	 */
	@SuppressWarnings("unchecked")
	public boolean cancelMailApprovaledInfo(List<String> applyNos){
		boolean resultBool = false;
		if("1".equals(APPROVAL_SEND_FLAG)){
			List<Object> cacelList = sendEmailService.getNeedCancelApprovaledInfo(applyNos);
			if(cacelList != null){
				for(int i=0;i<cacelList.size();i++){
					Map<String, Object> cancelMap = (Map<String, Object>) cacelList.get(i);
					String misDocId = (String) cancelMap.get("MISDOCID");
					String comment = "Approval in the HR system has been completed!";
					this.cancelApproval(misDocId, comment);
				}
				resultBool = true;
			}
		}
		return resultBool;
	}
    
	/**
	 * 取消发送到eagleoffice的待审批信息，true:成功;false:失败
	 * @param misDocId	eagleoffice主键标识
	 * @param content	内容
	 * @return result   true(成功)/false(失败)
	 * @throws Exception 
	 */
	public boolean cancelApproval(String misDocId,String comment) {
		boolean result = false;
		if("1".equals(APPROVAL_SEND_FLAG)){
			try{
	            String message = "";
				
				ApprovalServiceProxy approvalServiceProxy = mailManger.getApprovalServiceProxy();
				
				CancelApprovalDocument celDoc = new CancelApprovalDocument();
				
				celDoc.setSystemId("HAE_VHR");					//由9位数字、英文组成的系统的固有模式
				celDoc.setMisDocId("HAEVHR_001_" + misDocId);	//由数字、英文组成的 “裁决文件固有的key”
				celDoc.setComment(comment);
				
				message = approvalServiceProxy.cancelApproval(celDoc);
				
				result = true;
			} catch(Exception e){
				log.error("取消申请操作异常:",e);
				e.printStackTrace();
				result = false;
			}
		}
		return result;
	}
	
	/**
	 * 发送审批信息到eagleoffice，true:成功;false:失败
	 * @param title		标题
	 * @param content	内容
	 * @param address	收件人地址
	 * @return result   true(成功)/false(失败)
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	public boolean sendApproval(String title,String content,String misDocId,List<Object> approverList,List<Object> receiverList,List<Object> fileList) {
		boolean result = false;
		try{
            String message = "";
			
			ApprovalServiceProxy approvalServiceProxy = mailManger.getApprovalServiceProxy();
			
			ApprovalDocument apprDoc =	new ApprovalDocument();
			apprDoc.setTitle(title);         //裁决题目
			apprDoc.setBodyContent(content);					 //裁决正文
			apprDoc.setBodyContentType(1);					 //正文类型( 1 : html, 2 : mht, default : 1 ）
			apprDoc.setMisDocId("HAEVHR_001_"+misDocId);     //由数字、英文组成的 “裁决文件固有的key”
			apprDoc.setSystemId("HAE_VHR");                  //由9位数字、英文组成的系统的固有模式
			apprDoc.setCompanyId("D11");					 //公司ID   COMPCD：D11   CORPCD：EB08
			apprDoc.setFlowCase("customized");               //审批流程类型  customized定制的必须传入signerInfos参数
			
			SignerInfo signerInfo;
			SignerInfo[] signerInfos = new SignerInfo[approverList == null ? 0:approverList.size()];
			ReceiverInfo receiverInfo;
			ReceiverInfo[] receiverInfos = new ReceiverInfo[receiverList == null ? 0:receiverList.size()];
			if(approverList != null){
				for(int i=0;i<approverList.size();i++){
                    Map<String, Object> approvalMap = (Map<String, Object>) approverList.get(i);
						signerInfo = new SignerInfo();
						signerInfo.setAssignType(Integer.parseInt(approvalMap.get("ASSIGN_TYPE").toString()));	//审批者审批类型 0:기안提案, 1:결재裁决, 2:협조결재裁决协助, 9:결재참조参照裁决 
						//hms 2019/10 AFFIRM_LEVEL_FORMAT
						signerInfo.setSequence(Integer.parseInt(approvalMap.get("AFFIRM_LEVEL").toString()));	//裁决顺序 （如果是并列的情况，一定要有相同的顺序，而上级的裁决必须要达到0，裁决及协助的顺序必须是第一的） 
						signerInfo.setUserkey((String)approvalMap.get("Userkey"));								//审批者userKey 如果不是..UseUserId方法   必须填写
						signerInfo.setUserId("");                        										//审批者userID	 如果是..UseUserId方法   必须填写
						signerInfo.setDelegeted(false);															//是否批准者代理
						signerInfo.setNotRemovable(true);														//不能在裁决程序上删除
						signerInfo.setNotEditable(true);														//是否不可能修正裁决程序上的“参与者”形态
						signerInfos[i] = signerInfo;
				}
			}
			if(receiverList != null){
				for(int i=0;i<receiverList.size();i++){
					Map<String, Object> receiverMap = (Map<String, Object>) receiverList.get(i);
						receiverInfo = new ReceiverInfo();
						receiverInfo.setRoleType(receiverMap.get("RECEIVER_TYPE").toString());					//通知者类型 referer:通告, receiver:接收
						receiverInfo.setReceiverKey((String)receiverMap.get("Userkey"));						//通知者userKey 如果不是..UseUserId方法   必须填写
						receiverInfo.setReceiverId("");															//通知者userID	 如果是..UseUserId方法   必须填写
						receiverInfos[i] = receiverInfo;
				}
			}
            
			apprDoc.setSignerInfos(signerInfos);
			apprDoc.setReceiverInfos(receiverInfos);
			
			/*附件添加*/
			WsApAttachFile file;
			WsApAttachFile[] attachFiles = new WsApAttachFile[fileList == null ? 0:fileList.size()];
			if(fileList != null){
				for(int i=0;i<fileList.size();i++){
					Map<String, Object> fileMap = (Map<String, Object>) fileList.get(i);
					file = new WsApAttachFile();
					file.setFileName((String)fileMap.get("FILE_NAME"));
					file.setSeqID(i);
					File uploadFile = new File((String)fileMap.get("FILE_URL"));
					FileDataSource fds = new FileDataSource(uploadFile);
					javax.activation.DataHandler dh = new javax.activation.DataHandler(fds);
					file.setFileInfo(dh);
					file.setFileSize(uploadFile.length()+"");
					attachFiles[i] = file;
				}
				
			}
			apprDoc.setAttachfiles(attachFiles);             
			/*********/
			message = approvalServiceProxy.submitApproval(apprDoc);
			result = true;
		} catch(Exception e){
			log.info("审批邮件发送异常:",e);
			e.printStackTrace();
			result = false;
		}
		return result;
	}
	


}
