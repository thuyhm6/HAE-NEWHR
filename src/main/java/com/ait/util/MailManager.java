package com.ait.util;

import hanwha.neo.branch.common.sso.service.NeoSloWsProxy;
import hanwha.neo.branch.ss.approval.axisws.ApprovalServiceProxy;
import hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus;
import hanwha.neo.branch.ss.approval.vo.MisKey;
import hanwha.neo.branch.ss.common.vo.WsAttachFile;
import hanwha.neo.branch.ss.common.vo.WsException;
import hanwha.neo.branch.ss.mail.service.MailServiceProxy;
import hanwha.neo.branch.ss.mail.service.WsMailInfo;
import hanwha.neo.branch.ss.mail.service.WsRecipient;
import hanwha.neo.branch.ss.org.service.NeoOrgWsProxy;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.rmi.RemoteException;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MailManager {

    private static final Logger logger = LoggerFactory.getLogger(MailManager.class);

    @Value("${serverIp}")
    private String SERVER_IP;

    @Value("${mail.send.flag}")
    private String MAIL_SEND_FLAG;

    @Value("${mail.from}")
    private String MAIL_FROM;

    @Value("${mail.login.host}")
    private String MAIL_LOGIN_HOST;

    @Value("${webservice.url}")
    private String WEBSERVICE_URL;


	/**
	 * 是否验证
	 * 	1：发送
	 *  0：不发送
	 */
    //@Value("${approval.send.flag}")
	private String APPROVAL_SEND_FLAG = "1";

	/**
     * approval web service url
     */
    //@Value("${approval.webservice.url}")
	//http://ci.eagleoffice.co.kr/api/services/ApprovalService
	//EagleOffice:  http://hanwha.eagleoffice.co.kr/api/services/ApprovalService
	//Circle: http://ep.circle.hanwha.com/api/axis/services/ApprovalService
    private String APPROVAL_WEBSERVICE_URL = "https://ep.cleverse.hanwha.com/soap/approval/axis/services/ApprovalService";
    
    /**
     * org web service url
     */
    //@Value("${org.webservice.url}")
    //http://ci.eagleoffice.co.kr/api/ss/org/service/NeoOrgWs
    //http://ep.circle.hanwha.com/api/ss/org?wsdl
    private String ORG_WEBSERVICE_URL = "https://ep.cleverse.hanwha.com/soap/org/neoOrgWs?wsdl";
    
    /**
     * slo web service url
     */
    //@Value("${slo.webservice.url}")
    //http://ci.eagleoffice.co.kr/api/ss/neoslo
    //http://ep.circle.hanwha.com/api/ss/neoslo
    private String SLO_WEBSERVICE_URL = "https://ep.cleverse.hanwha.com/soap/auth/neoslo";

    	/**
	 * 获取eagleoffice发送审批信息的代理
	 * @return result   ApprovalServiceProxy
	 * @throws Exception 
	 */
	public ApprovalServiceProxy getApprovalServiceProxy() {
		
		String END_POINT_URL = APPROVAL_WEBSERVICE_URL;
		ApprovalServiceProxy approvalServiceProxy = new ApprovalServiceProxy();
		approvalServiceProxy.setEndpoint(END_POINT_URL);
		
		return approvalServiceProxy;
	}
	
	/**
	 * 获取eagleoffice的组织查询代理
	 * @return result   NeoOrgWsProxy
	 * @throws Exception 
	 */
	public NeoOrgWsProxy getNeoOrgWsProxy() {
		
		String END_POINT_URL = ORG_WEBSERVICE_URL;
		NeoOrgWsProxy neoOrgWsProxy = new NeoOrgWsProxy();
		neoOrgWsProxy.setEndpoint(END_POINT_URL);
		
		return neoOrgWsProxy;
	}
	
	/**
	 * 获取eagleoffice的slo登陆代理
	 * @return result   NeoSloWsProxy
	 * @throws Exception
	 */
	public NeoSloWsProxy getNeoSloWsProxy() {

		String END_POINT_URL = SLO_WEBSERVICE_URL;
		NeoSloWsProxy neoSloWsProxy = new NeoSloWsProxy();
		neoSloWsProxy.setEndpoint(END_POINT_URL);

		return neoSloWsProxy;
	}

    	/**
	 *  获取需要到eagleoffice取消的待审批信息
	 * @param MisKey[]
	 * @return ApprovalDocumentStatus[]
	 */
	@SuppressWarnings("unchecked")
	public ApprovalDocumentStatus[] getMailApprovalInfo(MisKey[] misKeys){
		
		ApprovalDocumentStatus[] appDocStus = new ApprovalDocumentStatus[misKeys == null ? 0:misKeys.length];
		
		if("1".equals(APPROVAL_SEND_FLAG)){
			for(int i = 0;i < misKeys.length;i++){
				appDocStus[i] = this.getApprovalStatusByMisId(misKeys[i]);
			}
		}
		return appDocStus;
	}

    
	
	/**
	 *  获取申请的审批状态信息
	 * @param MisKey
	 * @return ApprovalDocumentStatus
	 */
	@SuppressWarnings("unchecked")
	public ApprovalDocumentStatus getApprovalStatusByMisId(MisKey misKey){
		
		ApprovalDocumentStatus appDocStu = new ApprovalDocumentStatus();
		
		ApprovalServiceProxy approvalServiceProxy = this.getApprovalServiceProxy();
		misKey.setSystemId("HAE_VHR");
		
		try {
			appDocStu = approvalServiceProxy.getStatusByMisId(misKey);
		} catch (WsException e) {
			e.printStackTrace();
		} catch (RemoteException e) {
			e.printStackTrace();
		}
		
		return appDocStu;
	}
    

    public boolean sendMail(String title, String content, String address) {
        boolean result = false;
        try {
            content = content.replace("{MAIL_LOGIN_HOST}", MAIL_LOGIN_HOST);
            if ("1".equals(MAIL_SEND_FLAG)) {
                this.sendMailWebService(title, content, address);
            } else {
                logger.warn("mail.send.flag={} không được hỗ trợ, email không được gửi tới: {}", MAIL_SEND_FLAG, address);
            }
            result = true;
        } catch (Exception e) {
            logger.error("Lỗi gửi email, emailAddress: {}", address, e);
        }
        return result;
    }

    public boolean sendMailWebService(String title, String content, String address) {
        boolean result = false;
        try {
            MailServiceProxy mailServiceProxy = new MailServiceProxy();
            mailServiceProxy.setEndpoint(WEBSERVICE_URL);

            WsMailInfo mailInfo = new WsMailInfo();
            mailInfo.setSubject(title);
            mailInfo.setSenderEmail(MAIL_FROM);
            mailInfo.setHtmlContent(true);
            mailInfo.setMhtContent(false);
            mailInfo.setImportant(false);

            WsRecipient[] receivers = new WsRecipient[1];
            receivers[0] = new WsRecipient();
            receivers[0].setSeqID(1);
            receivers[0].setRecvType("TO");
            receivers[0].setRecvEmail(address);
            receivers[0].setDept(false);

            mailInfo.setAttachCount(0);
            WsAttachFile[] attachFiles = new WsAttachFile[0];

            mailServiceProxy.sendMISMail(content, mailInfo, receivers, attachFiles);

            result = true;
        } catch (Exception e) {
            logger.error("Lỗi gửi email qua webservice, emailAddress: {}", address, e);
        }
        return result;
    }

    public boolean sendMailAttachment(String title, String content, String address, String attachPath) {
        boolean result = false;
        try {
            if ("1".equals(MAIL_SEND_FLAG)) {
                this.sendMailWebServiceAttachment(title, content, address, attachPath);
            }
            result = true;
        } catch (Exception e) {
            logger.error("Lỗi gửi email có đính kèm, emailAddress: {}", address, e);
        }
        return result;
    }

    public boolean sendMailWebServiceAttachment(String title, String content, String address, String attachPath) {
        boolean result = false;
        try {
            MailServiceProxy mailServiceProxy = new MailServiceProxy();
            mailServiceProxy.setEndpoint(WEBSERVICE_URL);

            WsMailInfo mailInfo = new WsMailInfo();
            mailInfo.setSubject(title);
            mailInfo.setSenderEmail(MAIL_FROM);
            mailInfo.setHtmlContent(true);
            mailInfo.setMhtContent(false);
            mailInfo.setImportant(false);

            WsRecipient[] receivers = new WsRecipient[1];
            receivers[0] = new WsRecipient();
            receivers[0].setSeqID(1);
            receivers[0].setRecvType("TO");
            receivers[0].setRecvEmail(address);
            receivers[0].setDept(false);

            String[] pathArray = attachPath.split(";");
            int pathCount = pathArray.length;
            mailInfo.setAttachCount(pathCount);
            WsAttachFile[] attachFiles = new WsAttachFile[pathCount];
            for (int i = 0; i < pathCount; i++) {
                attachFiles[i] = new WsAttachFile();
                attachFiles[i].setSeqID(i + 1);
                String fileName = pathArray[i].substring(pathArray[i].lastIndexOf("/") + 1);
                attachFiles[i].setFileName(fileName);
                File uploadFile = new File(pathArray[i]);
                FileDataSource fds = new FileDataSource(uploadFile);
                attachFiles[i].setFileInfo(new DataHandler(fds));
                attachFiles[i].setFileSize(uploadFile.length() + "");
            }

            mailServiceProxy.sendMISMail(content, mailInfo, receivers, attachFiles);

            result = true;
        } catch (Exception e) {
            logger.error("Lỗi gửi email có đính kèm qua webservice, emailAddress: {}", address, e);
        }
        return result;
    }

    public boolean sendmail(Map<String, String> map) {
        return this.sendMail(map.get("EMAIL_TITLE"), map.get("EMAIL_CONTENT"), map.get("EMAIL"));
    }

    public boolean sendmailattachment(Map<String, String> map) {
        return this.sendMailAttachment(map.get("EMAIL_TITLE"), map.get("EMAIL_CONTENT"), map.get("EMAIL"), map.get("ATTACH_PATH"));
    }

    @SuppressWarnings("rawtypes")
    public static String composeTemplate(String type, Map paramMap) {
        String template = MailManager.readTemplate(type);
        Pattern pattern = Pattern.compile("\\[(.*)\\]");
        Matcher matcher = pattern.matcher(template);
        while (matcher.find()) {
            Object val = paramMap.get(matcher.group(1));
            template = template.replace(matcher.group(), val == null ? "" : val.toString());
        }
        return template;
    }

    @SuppressWarnings("rawtypes")
    public static String composeTemplateByParam(String emailContent, Map paramMap) {
        String template = emailContent;
        Pattern pattern = Pattern.compile("\\[(.*)\\]");
        Matcher matcher = pattern.matcher(template);
        while (matcher.find()) {
            Object val = paramMap.get(matcher.group(1));
            template = template.replace(matcher.group(), val == null ? "" : val.toString());
        }
        return template;
    }

    public static String readTemplate(String type) {
        StringBuffer template = new StringBuffer();
        String templateName = "";
        String fileRealPath = MailManager.class.getResource("").getPath().split("WEB-INF")[0];

        if ("OT".equals(type)) {
            templateName = fileRealPath + "resources/template/mail/approvalOt.htm";
        } else if ("LEAVE".equals(type)) {
            templateName = fileRealPath + "resources/template/mail/approvalLeave.htm";
        } else if ("VAC".equals(type)) {
            templateName = fileRealPath + "resources/template/mail/approvalVac.htm";
        } else {
            templateName = fileRealPath + "resources/template/mail/" + type + ".htm";
        }

        if (!"".equals(templateName)) {
            Reader reader = null;
            try {
                char[] tempchars = new char[1024];
                int charread;
                reader = new InputStreamReader(new FileInputStream(templateName), "UTF-8");
                while ((charread = reader.read(tempchars)) != -1) {
                    if ((charread == tempchars.length) && (tempchars[tempchars.length - 1] != '\r')) {
                        template.append(tempchars);
                    } else {
                        for (int i = 0; i < charread; i++) {
                            if (tempchars[i] != '\r') {
                                template.append(tempchars[i]);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Lỗi đọc template email: {}", templateName, e);
            } finally {
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (IOException e) {
                        logger.warn("Lỗi đóng reader: {}", e.getMessage());
                    }
                }
            }
        }
        return template.toString();
    }
}
