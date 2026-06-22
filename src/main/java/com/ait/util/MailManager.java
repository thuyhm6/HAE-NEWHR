package com.ait.util;

import hanwha.neo.branch.ss.common.vo.WsAttachFile;
import hanwha.neo.branch.ss.mail.service.MailServiceProxy;
import hanwha.neo.branch.ss.mail.service.WsMailInfo;
import hanwha.neo.branch.ss.mail.service.WsRecipient;

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
