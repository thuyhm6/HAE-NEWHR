/**
 * MailServiceServiceLocator.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.mail.service;

public class MailServiceServiceLocator extends org.apache.axis.client.Service implements hanwha.neo.branch.ss.mail.service.MailServiceService {

    public MailServiceServiceLocator() {
    }


    public MailServiceServiceLocator(org.apache.axis.EngineConfiguration config) {
        super(config);
    }

    public MailServiceServiceLocator(java.lang.String wsdlLoc, javax.xml.namespace.QName sName) throws javax.xml.rpc.ServiceException {
        super(wsdlLoc, sName);
    }

    // Use to get a proxy class for MailService
    private java.lang.String MailService_address = "http://ci.eagleoffice.co.kr/api/services/MailService";

    public java.lang.String getMailServiceAddress() {
        return MailService_address;
    }

    // The WSDD service name defaults to the port name.
    private java.lang.String MailServiceWSDDServiceName = "MailService";

    public java.lang.String getMailServiceWSDDServiceName() {
        return MailServiceWSDDServiceName;
    }

    public void setMailServiceWSDDServiceName(java.lang.String name) {
        MailServiceWSDDServiceName = name;
    }

    public hanwha.neo.branch.ss.mail.service.MailService getMailService() throws javax.xml.rpc.ServiceException {
       java.net.URL endpoint;
        try {
            endpoint = new java.net.URL(MailService_address);
        }
        catch (java.net.MalformedURLException e) {
            throw new javax.xml.rpc.ServiceException(e);
        }
        return getMailService(endpoint);
    }

    public hanwha.neo.branch.ss.mail.service.MailService getMailService(java.net.URL portAddress) throws javax.xml.rpc.ServiceException {
        try {
            hanwha.neo.branch.ss.mail.service.MailServiceSoapBindingStub _stub = new hanwha.neo.branch.ss.mail.service.MailServiceSoapBindingStub(portAddress, this);
            _stub.setPortName(getMailServiceWSDDServiceName());
            return _stub;
        }
        catch (org.apache.axis.AxisFault e) {
            return null;
        }
    }

    public void setMailServiceEndpointAddress(java.lang.String address) {
        MailService_address = address;
    }

    /**
     * For the given interface, get the stub implementation.
     * If this service has no port for the given interface,
     * then ServiceException is thrown.
     */
    public java.rmi.Remote getPort(Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        try {
            if (hanwha.neo.branch.ss.mail.service.MailService.class.isAssignableFrom(serviceEndpointInterface)) {
                hanwha.neo.branch.ss.mail.service.MailServiceSoapBindingStub _stub = new hanwha.neo.branch.ss.mail.service.MailServiceSoapBindingStub(new java.net.URL(MailService_address), this);
                _stub.setPortName(getMailServiceWSDDServiceName());
                return _stub;
            }
        }
        catch (java.lang.Throwable t) {
            throw new javax.xml.rpc.ServiceException(t);
        }
        throw new javax.xml.rpc.ServiceException("There is no stub implementation for the interface:  " + (serviceEndpointInterface == null ? "null" : serviceEndpointInterface.getName()));
    }

    /**
     * For the given interface, get the stub implementation.
     * If this service has no port for the given interface,
     * then ServiceException is thrown.
     */
    public java.rmi.Remote getPort(javax.xml.namespace.QName portName, Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        if (portName == null) {
            return getPort(serviceEndpointInterface);
        }
        java.lang.String inputPortName = portName.getLocalPart();
        if ("MailService".equals(inputPortName)) {
            return getMailService();
        }
        else  {
            java.rmi.Remote _stub = getPort(serviceEndpointInterface);
            ((org.apache.axis.client.Stub) _stub).setPortName(portName);
            return _stub;
        }
    }

    public javax.xml.namespace.QName getServiceName() {
        return new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "MailServiceService");
    }

    private java.util.HashSet ports = null;

    public java.util.Iterator getPorts() {
        if (ports == null) {
            ports = new java.util.HashSet();
            ports.add(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "MailService"));
        }
        return ports.iterator();
    }

    /**
    * Set the endpoint address for the specified port name.
    */
    public void setEndpointAddress(java.lang.String portName, java.lang.String address) throws javax.xml.rpc.ServiceException {
        
if ("MailService".equals(portName)) {
            setMailServiceEndpointAddress(address);
        }
        else 
{ // Unknown Port Name
            throw new javax.xml.rpc.ServiceException(" Cannot set Endpoint Address for Unknown Port" + portName);
        }
    }

    /**
    * Set the endpoint address for the specified port name.
    */
    public void setEndpointAddress(javax.xml.namespace.QName portName, java.lang.String address) throws javax.xml.rpc.ServiceException {
        setEndpointAddress(portName.getLocalPart(), address);
    }

}
