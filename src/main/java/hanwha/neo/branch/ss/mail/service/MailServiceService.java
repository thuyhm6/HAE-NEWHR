/**
 * MailServiceService.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.mail.service;

public interface MailServiceService extends javax.xml.rpc.Service {
    public java.lang.String getMailServiceAddress();

    public hanwha.neo.branch.ss.mail.service.MailService getMailService() throws javax.xml.rpc.ServiceException;

    public hanwha.neo.branch.ss.mail.service.MailService getMailService(java.net.URL portAddress) throws javax.xml.rpc.ServiceException;
}
