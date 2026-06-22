/**
 * ApprovalServiceServiceLocator.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.axisws;

public class ApprovalServiceServiceLocator extends org.apache.axis.client.Service implements hanwha.neo.branch.ss.approval.axisws.ApprovalServiceService {

    public ApprovalServiceServiceLocator() {
    }


    public ApprovalServiceServiceLocator(org.apache.axis.EngineConfiguration config) {
        super(config);
    }

    public ApprovalServiceServiceLocator(java.lang.String wsdlLoc, javax.xml.namespace.QName sName) throws javax.xml.rpc.ServiceException {
        super(wsdlLoc, sName);
    }

    // Use to get a proxy class for ApprovalService
    private java.lang.String ApprovalService_address = "http://ci.eagleoffice.co.kr/api/services/ApprovalService";

    public java.lang.String getApprovalServiceAddress() {
        return ApprovalService_address;
    }

    // The WSDD service name defaults to the port name.
    private java.lang.String ApprovalServiceWSDDServiceName = "ApprovalService";

    public java.lang.String getApprovalServiceWSDDServiceName() {
        return ApprovalServiceWSDDServiceName;
    }

    public void setApprovalServiceWSDDServiceName(java.lang.String name) {
        ApprovalServiceWSDDServiceName = name;
    }

    public hanwha.neo.branch.ss.approval.axisws.ApprovalService getApprovalService() throws javax.xml.rpc.ServiceException {
       java.net.URL endpoint;
        try {
            endpoint = new java.net.URL(ApprovalService_address);
        }
        catch (java.net.MalformedURLException e) {
            throw new javax.xml.rpc.ServiceException(e);
        }
        return getApprovalService(endpoint);
    }

    public hanwha.neo.branch.ss.approval.axisws.ApprovalService getApprovalService(java.net.URL portAddress) throws javax.xml.rpc.ServiceException {
        try {
            hanwha.neo.branch.ss.approval.axisws.ApprovalServiceSoapBindingStub _stub = new hanwha.neo.branch.ss.approval.axisws.ApprovalServiceSoapBindingStub(portAddress, this);
            _stub.setPortName(getApprovalServiceWSDDServiceName());
            return _stub;
        }
        catch (org.apache.axis.AxisFault e) {
            return null;
        }
    }

    public void setApprovalServiceEndpointAddress(java.lang.String address) {
        ApprovalService_address = address;
    }

    /**
     * For the given interface, get the stub implementation.
     * If this service has no port for the given interface,
     * then ServiceException is thrown.
     */
    public java.rmi.Remote getPort(Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        try {
            if (hanwha.neo.branch.ss.approval.axisws.ApprovalService.class.isAssignableFrom(serviceEndpointInterface)) {
                hanwha.neo.branch.ss.approval.axisws.ApprovalServiceSoapBindingStub _stub = new hanwha.neo.branch.ss.approval.axisws.ApprovalServiceSoapBindingStub(new java.net.URL(ApprovalService_address), this);
                _stub.setPortName(getApprovalServiceWSDDServiceName());
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
        if ("ApprovalService".equals(inputPortName)) {
            return getApprovalService();
        }
        else  {
            java.rmi.Remote _stub = getPort(serviceEndpointInterface);
            ((org.apache.axis.client.Stub) _stub).setPortName(portName);
            return _stub;
        }
    }

    public javax.xml.namespace.QName getServiceName() {
        return new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "ApprovalServiceService");
    }

    private java.util.HashSet ports = null;

    public java.util.Iterator getPorts() {
        if (ports == null) {
            ports = new java.util.HashSet();
            ports.add(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "ApprovalService"));
        }
        return ports.iterator();
    }

    /**
    * Set the endpoint address for the specified port name.
    */
    public void setEndpointAddress(java.lang.String portName, java.lang.String address) throws javax.xml.rpc.ServiceException {
        
if ("ApprovalService".equals(portName)) {
            setApprovalServiceEndpointAddress(address);
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
