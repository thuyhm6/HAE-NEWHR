package hanwha.neo.branch.ss.att.service;

public class NeoHrWsImplServiceLocator extends org.apache.axis.client.Service
        implements hanwha.neo.branch.ss.att.service.NeoHrWsImplService {

    public NeoHrWsImplServiceLocator() {}

    public NeoHrWsImplServiceLocator(org.apache.axis.EngineConfiguration config) {
        super(config);
    }

    public NeoHrWsImplServiceLocator(java.lang.String wsdlLoc, javax.xml.namespace.QName sName)
            throws javax.xml.rpc.ServiceException {
        super(wsdlLoc, sName);
    }

    // Endpoint mặc định (Dev) — override bằng setEndpoint trong Proxy
    private java.lang.String NeoHrWsImplPort_address = "https://epdev.cleverse.kr/soap/org/neoHrWs";

    public java.lang.String getNeoHrWsImplPortAddress() {
        return NeoHrWsImplPort_address;
    }

    private java.lang.String NeoHrWsImplPortWSDDServiceName = "NeoHrWsImplPort";

    public java.lang.String getNeoHrWsImplPortWSDDServiceName() {
        return NeoHrWsImplPortWSDDServiceName;
    }

    public void setNeoHrWsImplPortWSDDServiceName(java.lang.String name) {
        NeoHrWsImplPortWSDDServiceName = name;
    }

    public hanwha.neo.branch.ss.att.service.NeoHrWs getNeoHrWsImplPort() throws javax.xml.rpc.ServiceException {
        java.net.URL endpoint;
        try {
            endpoint = new java.net.URL(NeoHrWsImplPort_address);
        } catch (java.net.MalformedURLException e) {
            throw new javax.xml.rpc.ServiceException(e);
        }
        return getNeoHrWsImplPort(endpoint);
    }

    public hanwha.neo.branch.ss.att.service.NeoHrWs getNeoHrWsImplPort(java.net.URL portAddress)
            throws javax.xml.rpc.ServiceException {
        try {
            hanwha.neo.branch.ss.att.service.NeoHrWsImplServiceSoapBindingStub _stub =
                    new hanwha.neo.branch.ss.att.service.NeoHrWsImplServiceSoapBindingStub(portAddress, this);
            _stub.setPortName(getNeoHrWsImplPortWSDDServiceName());
            return _stub;
        } catch (org.apache.axis.AxisFault e) {
            return null;
        }
    }

    public void setNeoHrWsImplPortEndpointAddress(java.lang.String address) {
        NeoHrWsImplPort_address = address;
    }

    public java.rmi.Remote getPort(Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        try {
            if (hanwha.neo.branch.ss.att.service.NeoHrWs.class.isAssignableFrom(serviceEndpointInterface)) {
                hanwha.neo.branch.ss.att.service.NeoHrWsImplServiceSoapBindingStub _stub =
                        new hanwha.neo.branch.ss.att.service.NeoHrWsImplServiceSoapBindingStub(
                                new java.net.URL(NeoHrWsImplPort_address), this);
                _stub.setPortName(getNeoHrWsImplPortWSDDServiceName());
                return _stub;
            }
        } catch (java.lang.Throwable t) {
            throw new javax.xml.rpc.ServiceException(t);
        }
        throw new javax.xml.rpc.ServiceException(
                "There is no stub implementation for the interface:  " +
                (serviceEndpointInterface == null ? "null" : serviceEndpointInterface.getName()));
    }

    public java.rmi.Remote getPort(javax.xml.namespace.QName portName, Class serviceEndpointInterface)
            throws javax.xml.rpc.ServiceException {
        if (portName == null) {
            return getPort(serviceEndpointInterface);
        }
        java.lang.String inputPortName = portName.getLocalPart();
        if ("NeoHrWsImplPort".equals(inputPortName)) {
            return getNeoHrWsImplPort();
        } else {
            java.rmi.Remote _stub = getPort(serviceEndpointInterface);
            ((org.apache.axis.client.Stub) _stub).setPortName(portName);
            return _stub;
        }
    }

    public javax.xml.namespace.QName getServiceName() {
        return new javax.xml.namespace.QName("http://service.att.ss.branch.neo.hanwha/", "NeoHrWsImplService");
    }

    private java.util.HashSet ports = null;

    public java.util.Iterator getPorts() {
        if (ports == null) {
            ports = new java.util.HashSet();
            ports.add(new javax.xml.namespace.QName("http://service.att.ss.branch.neo.hanwha/", "NeoHrWsImplPort"));
        }
        return ports.iterator();
    }

    public void setEndpointAddress(java.lang.String portName, java.lang.String address)
            throws javax.xml.rpc.ServiceException {
        if ("NeoHrWsImplPort".equals(portName)) {
            setNeoHrWsImplPortEndpointAddress(address);
        } else {
            throw new javax.xml.rpc.ServiceException(" Cannot set Endpoint Address for Unknown Port" + portName);
        }
    }

    public void setEndpointAddress(javax.xml.namespace.QName portName, java.lang.String address)
            throws javax.xml.rpc.ServiceException {
        setEndpointAddress(portName.getLocalPart(), address);
    }
}
