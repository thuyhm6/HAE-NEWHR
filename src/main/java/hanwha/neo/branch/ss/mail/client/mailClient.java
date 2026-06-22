package hanwha.neo.branch.ss.mail.client;

import hanwha.neo.branch.ss.common.vo.WsAttachFile;
import hanwha.neo.branch.ss.common.vo.WsException;
import hanwha.neo.branch.ss.mail.service.MailServiceProxy;
import hanwha.neo.branch.ss.mail.service.WsMailInfo;
import hanwha.neo.branch.ss.mail.service.WsMailStatus;
import hanwha.neo.branch.ss.mail.service.WsRecipient;
import hanwha.neo.branch.ss.mail.service.WsResource;

import java.io.File;
import java.rmi.RemoteException;
import java.security.MessageDigest;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;

import org.apache.axis.encoding.Base64;

public class mailClient {
	
	public static void main(String[] args) {

		// Proxy 객체 생성 (End Point 설정)
		String END_POINT_URL = "http://ci.eagleoffice.co.kr:80/api/services/MailService";
		MailServiceProxy mailServiceProxy = new MailServiceProxy();
		mailServiceProxy.setEndpoint(END_POINT_URL);

		/* 1. 메일 발송 테스트 		*/ 
		// 기본 메일 정보 처리
		WsMailInfo mailInfo = new WsMailInfo();
		mailInfo.setSubject("JAVA Client");								// 메일 제목
		mailInfo.setSenderEmail("yangkyu@ci.eagleoffice.co.kr");		// 발신자 메일 주소
		mailInfo.setHtmlContent(true);									// 메일 본문 종류(true:HTML, false:Text)
		mailInfo.setMhtContent(false);									// MHT 본문 사용 여부(true:MHT)
		mailInfo.setImportant(false);									// 중요 메일 여부(true:중요, false:일반)
		String mailBody = "Mail Client Test<br/><br/>Mail Client Test";	// 메일 본문
		
		// 메일 수신자 처리
		WsRecipient[] receivers = new WsRecipient[1];
		receivers[0] = new WsRecipient();
		receivers[0].setSeqID(1);										// 순번
		receivers[0].setRecvType("TO");									// 수신자 형태(TO:수신, CC:참조, BCC:숨은참조)
		//receivers[0].setRecvEmail("dept9876543@ci.eagleoffice.co.kr");
		//receivers[0].setRecvEmail("dept10013050@ci.eagleoffice.co.kr");
		receivers[0].setRecvEmail("peng.xing@ci.eagleoffice.co.kr");		// 수신자 메일 주소
		receivers[0].setDept(false);									// 부서 수신자 여부(true:부서, false:사용자)
		/*
		receivers[1] = new WsRecipient();
		receivers[1].setSeqID(2);
		receivers[1].setRecvType("TO");
		receivers[1].setRecvEmail("yangkyu@ci.eagleoffice.co.kr");
		receivers[1].setDept(false);
		receivers[2] = new WsRecipient();
		receivers[2].setSeqID(3);
		receivers[2].setRecvType("CC");
		receivers[2].setRecvEmail("kwonnj@ci.eagleoffice.co.kr");
		receivers[2].setDept(false);
		receivers[3] = new WsRecipient();
		receivers[3].setSeqID(4);
		receivers[3].setRecvType("BCC");
		receivers[3].setRecvEmail("cylsh3452@ci.eagleoffice.co.kr");
		receivers[3].setDept(false);
		receivers[4] = new WsRecipient();
		receivers[4].setSeqID(5);
		receivers[4].setRecvType("CC");
		receivers[4].setRecvEmail("minso1215@ci.eagleoffice.co.kr");
		receivers[4].setDept(false);
		*/
		
		// 첨부 파일 처리
		mailInfo.setAttachCount(0);										// 첨부 파일 개수
		WsAttachFile[] attachFiles = new WsAttachFile[0];
		/*attachFiles[0] = new WsAttachFile();
		attachFiles[0].setSeqID(1);										// 순번
		attachFiles[0].setFileName("c_close.png");							// 파일 명
		attachFiles[0].setFileSize("16384");							// 파일 크기
		
		attachFiles[1] = new WsAttachFile();
		attachFiles[1].setSeqID(1);
		attachFiles[1].setFileName("Gain.JPG");
		attachFiles[1].setFileSize("36864");
		attachFiles[2] = new WsAttachFile();
		attachFiles[2].setSeqID(1);
		attachFiles[2].setFileName("suji.jpg");
		attachFiles[2].setFileSize("20480");
		attachFiles[3] = new WsAttachFile();
		attachFiles[3].setSeqID(1);
		attachFiles[3].setFileName("cat.jpg");
		attachFiles[3].setFileSize("98304");
		*/

		
		try {
			String resultMsg = mailServiceProxy.sendMISMail(mailBody, mailInfo, receivers, attachFiles);
			System.out.println("resultMsg >>> " + resultMsg);
			System.out.println();
			
		} catch (WsException e) {
			//e.printStackTrace();
			System.out.println("FaultActor() >>> " + e.getExceptionActor());
			System.out.println("ExceptionCode() >>> " + e.getExceptionCode());
			System.out.println("ExceptionMessage() >>> " + e.getExceptionMessage());
			
		} catch (RemoteException re) {
			//re.printStackTrace();
		}

		
		/* 2. 상황 조회(메일별) 테스트				*/	
		// TODO :: 메일 키 입력
		String[] mailKey = new String[1];
		mailKey[0] = "4d544d7a4d7a45794e6a45764c79394f";
		
		try {
			WsMailStatus[] mailStatus = mailServiceProxy.getMailStatusCounts(mailKey);
			
			WsMailStatus mailStatusTemp = new WsMailStatus();
			for ( int i=0; i<mailStatus.length; i++ ) {
				mailStatusTemp = (WsMailStatus) mailStatus[i];
				System.out.println("MailKey >>> " + mailStatusTemp.getMailKey());
				System.out.println("isDelivery >>> " + mailStatusTemp.isDelivery());
				System.out.println();
			}
			
		} catch (WsException e) {
			//e.printStackTrace();
			System.out.println("FaultActor() >>> " + e.getExceptionActor());
			System.out.println("ExceptionCode() >>> " + e.getExceptionCode());
			System.out.println("ExceptionMessage() >>> " + e.getExceptionMessage());
			
		} catch (RemoteException re) {
			//re.printStackTrace();
		}

	
		/* 3. 발송 취소 테스트  				
		// TODO :: 메일 키 입력
		String mailKeyForCancel = "4d544d7a4d7a45794e6a45764c79394f";
		
		// TODO :: 취소할 수신자 설정
		String[] receiverForCancel = new String[1];
		receiverForCancel[0] = "yangkyu@ci.eagleoffice.co.kr";
		
		// TODO :: 메일 발신자 설정
		WsResource senderInfo = new WsResource();
		senderInfo.setSenderEmail("yangkyu@ci.eagleoffice.co.kr");
		
		// TODO :: 메일 발신자 그룹웨어 비밀번호 입력
		String plainPassword = "";
		String senderEncodeRealPassword = null;
		try { 
			// MD5 Hash
			MessageDigest md = MessageDigest.getInstance("MD5");
			md.update(plainPassword.getBytes("UTF-8"));
			byte[] digest = md.digest();
			StringBuffer hexString = new StringBuffer();
		    for (int i = 0; i < digest.length; i++) {
		    	plainPassword = Integer.toHexString(0xFF & digest[i]);
		        hexString.append(plainPassword);
		    }
		    String senderMD5HashPassword = hexString.toString();
		    // Base64 Encode
			senderEncodeRealPassword = Base64.encode(senderMD5HashPassword.getBytes());
		} catch (Exception e) {
			e.printStackTrace();
		}
		senderInfo.setSenderPw(senderEncodeRealPassword);
		
		try {
			String resultMsg = mailServiceProxy.cancelMISMailByRecipient(mailKeyForCancel, receiverForCancel, senderInfo);
			System.out.println("resultMsg >>> " + resultMsg);
			
		} catch (WsException e) {
			//e.printStackTrace();
			System.out.println("FaultActor() >>> " + e.getExceptionActor());
			System.out.println("ExceptionCode() >>> " + e.getExceptionCode());
			System.out.println("ExceptionMessage() >>> " + e.getExceptionMessage());
			
		} catch (RemoteException re) {
			//re.printStackTrace();
		}*/
		
	}
}