package hanwha.neo.branch.ss.att.service;

public class NeoHrWsImplServiceSoapBindingStub extends org.apache.axis.client.Stub
        implements hanwha.neo.branch.ss.att.service.NeoHrWs {

    private java.util.Vector cachedSerClasses = new java.util.Vector();
    private java.util.Vector cachedSerQNames = new java.util.Vector();
    private java.util.Vector cachedSerFactories = new java.util.Vector();
    private java.util.Vector cachedDeserFactories = new java.util.Vector();

    static org.apache.axis.description.OperationDesc[] _operations;

    static {
        _operations = new org.apache.axis.description.OperationDesc[1];
        _initOperationDesc1();
    }

    private static void _initOperationDesc1() {
        org.apache.axis.description.OperationDesc oper;
        org.apache.axis.description.ParameterDesc param;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("syncHrOffData");
        param = new org.apache.axis.description.ParameterDesc(
                new javax.xml.namespace.QName("http://service.att.ss.branch.neo.hanwha/", "request"),
                org.apache.axis.description.ParameterDesc.IN,
                new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "SyncHrOffDataRequest"),
                hanwha.neo.branch.ss.att.vo.SyncHrOffDataRequest.class,
                false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        oper.setReturnClass(java.lang.String.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://service.att.ss.branch.neo.hanwha/", "return"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                new javax.xml.namespace.QName("http://service.att.ss.branch.neo.hanwha/", "WsException"),
                "hanwha.neo.branch.ss.common.vo.WsException",
                new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"),
                true));
        _operations[0] = oper;
    }

    public NeoHrWsImplServiceSoapBindingStub() throws org.apache.axis.AxisFault {
        this(null);
    }

    public NeoHrWsImplServiceSoapBindingStub(java.net.URL endpointURL, javax.xml.rpc.Service service)
            throws org.apache.axis.AxisFault {
        this(service);
        super.cachedEndpoint = endpointURL;
    }

    public NeoHrWsImplServiceSoapBindingStub(javax.xml.rpc.Service service) throws org.apache.axis.AxisFault {
        if (service == null) {
            super.service = new org.apache.axis.client.Service();
        } else {
            super.service = service;
        }
        java.lang.Class cls;
        javax.xml.namespace.QName qName;
        javax.xml.namespace.QName qName2;
        Class beansf = org.apache.axis.encoding.ser.BeanSerializerFactory.class;
        Class beandf = org.apache.axis.encoding.ser.BeanDeserializerFactory.class;
        Class sf;
        Class df;

        // Register SyncHrOffDataRequest
        qName = new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "SyncHrOffDataRequest");
        cachedSerQNames.add(qName);
        cls = hanwha.neo.branch.ss.att.vo.SyncHrOffDataRequest.class;
        cachedSerClasses.add(cls);
        cachedSerFactories.add(beansf);
        cachedDeserFactories.add(beandf);

        // Register ArraysHrOffVo
        qName = new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "ArraysHrOffVo");
        cachedSerQNames.add(qName);
        cls = hanwha.neo.branch.ss.att.vo.ArraysHrOffVo.class;
        cachedSerClasses.add(cls);
        cachedSerFactories.add(beansf);
        cachedDeserFactories.add(beandf);

        // Register HrOffListVo
        qName = new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "HrOffListVo");
        cachedSerQNames.add(qName);
        cls = hanwha.neo.branch.ss.att.vo.HrOffListVo.class;
        cachedSerClasses.add(cls);
        cachedSerFactories.add(beansf);
        cachedDeserFactories.add(beandf);

        // Register HrOffCodeVo
        qName = new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "HrOffCodeVo");
        cachedSerQNames.add(qName);
        cls = hanwha.neo.branch.ss.att.vo.HrOffCodeVo.class;
        cachedSerClasses.add(cls);
        cachedSerFactories.add(beansf);
        cachedDeserFactories.add(beandf);

        // Register WsException
        qName = new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException");
        cachedSerQNames.add(qName);
        cls = hanwha.neo.branch.ss.common.vo.WsException.class;
        cachedSerClasses.add(cls);
        cachedSerFactories.add(beansf);
        cachedDeserFactories.add(beandf);
    }

    protected org.apache.axis.client.Call createCall() throws java.rmi.RemoteException {
        try {
            org.apache.axis.client.Call _call = super._createCall();
            if (super.maintainSessionSet) {
                _call.setMaintainSession(super.maintainSession);
            }
            if (super.cachedUsername != null) {
                _call.setUsername(super.cachedUsername);
            }
            if (super.cachedPassword != null) {
                _call.setPassword(super.cachedPassword);
            }
            if (super.cachedEndpoint != null) {
                _call.setTargetEndpointAddress(super.cachedEndpoint);
            }
            if (super.cachedTimeout != null) {
                _call.setTimeout(super.cachedTimeout);
            }
            if (super.cachedPortName != null) {
                _call.setPortName(super.cachedPortName);
            }
            java.util.Enumeration keys = super.cachedProperties.keys();
            while (keys.hasMoreElements()) {
                java.lang.String key = (java.lang.String) keys.nextElement();
                _call.setProperty(key, super.cachedProperties.get(key));
            }
            // Register serializers for all cached types
            // Note: BeanSerializerFactory has no no-arg constructor; use createFactory() instead
            for (int i = 0; i < cachedSerClasses.size(); ++i) {
                Class cls = (Class) cachedSerClasses.get(i);
                javax.xml.namespace.QName qName = (javax.xml.namespace.QName) cachedSerQNames.get(i);
                java.lang.Object x = cachedSerFactories.get(i);
                if (x instanceof Class) {
                    Class sfClass = (Class) x;
                    Class dfClass = (Class) cachedDeserFactories.get(i);
                    _call.registerTypeMapping(cls, qName,
                            org.apache.axis.encoding.ser.BaseSerializerFactory.createFactory(sfClass, cls, qName),
                            org.apache.axis.encoding.ser.BaseDeserializerFactory.createFactory(dfClass, cls, qName),
                            false);
                } else if (x instanceof org.apache.axis.encoding.SerializerFactory) {
                    Class dfClass = (Class) cachedDeserFactories.get(i);
                    org.apache.axis.encoding.DeserializerFactory dfFactory =
                            org.apache.axis.encoding.ser.BaseDeserializerFactory.createFactory(dfClass, cls, qName);
                    _call.registerTypeMapping(cls, qName,
                            (org.apache.axis.encoding.SerializerFactory) x, dfFactory, false);
                }
            }
            return _call;
        } catch (java.lang.Throwable _t) {
            throw new org.apache.axis.AxisFault("Failure trying to get the Call object", _t);
        }
    }

    public java.lang.String syncHrOffData(hanwha.neo.branch.ss.att.vo.SyncHrOffDataRequest request)
            throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call;
        try {
            _call = createCall();
        } catch (java.rmi.RemoteException re) {
            throw re;
        }
        _call.setOperation(_operations[0]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://service.att.ss.branch.neo.hanwha/", "syncHrOffData"));

        setRequestHeaders(_call);
        setAttachments(_call);
        try {
            java.lang.Object _resp = _call.invoke(new java.lang.Object[]{request});
            if (_resp instanceof java.rmi.RemoteException) {
                throw (java.rmi.RemoteException) _resp;
            } else {
                extractAttachments(_call);
                try {
                    return (java.lang.String) _resp;
                } catch (java.lang.Exception _exception) {
                    return (java.lang.String) org.apache.axis.utils.JavaUtils.convert(_resp, java.lang.String.class);
                }
            }
        } catch (org.apache.axis.AxisFault axisFaultException) {
            if (axisFaultException.detail != null) {
                if (axisFaultException.detail instanceof java.rmi.RemoteException) {
                    throw (java.rmi.RemoteException) axisFaultException.detail;
                }
                if (axisFaultException.detail instanceof hanwha.neo.branch.ss.common.vo.WsException) {
                    throw (hanwha.neo.branch.ss.common.vo.WsException) axisFaultException.detail;
                }
            }
            throw axisFaultException;
        }
    }
}
