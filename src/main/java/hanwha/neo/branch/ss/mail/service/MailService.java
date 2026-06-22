/**
 * MailService.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.mail.service;

public interface MailService extends java.rmi.Remote {
    public hanwha.neo.branch.ss.mail.service.WsMailStatus[] getMailStatusCounts(java.lang.String[] mailKey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public java.lang.String sendMISMail(java.lang.String mailBody, hanwha.neo.branch.ss.mail.service.WsMailInfo mailInfo, hanwha.neo.branch.ss.mail.service.WsRecipient[] receivers, hanwha.neo.branch.ss.common.vo.WsAttachFile[] attachFile) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public java.lang.String cancelMISMailByRecipient(java.lang.String mailKey, java.lang.String[] receiverForCancel, hanwha.neo.branch.ss.mail.service.WsResource senderInfo) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
}
