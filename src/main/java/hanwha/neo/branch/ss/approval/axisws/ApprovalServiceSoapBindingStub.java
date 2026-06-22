/**
 * ApprovalServiceSoapBindingStub.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.axisws;

public class ApprovalServiceSoapBindingStub extends org.apache.axis.client.Stub implements hanwha.neo.branch.ss.approval.axisws.ApprovalService {
    private java.util.Vector cachedSerClasses = new java.util.Vector();
    private java.util.Vector cachedSerQNames = new java.util.Vector();
    private java.util.Vector cachedSerFactories = new java.util.Vector();
    private java.util.Vector cachedDeserFactories = new java.util.Vector();

    static org.apache.axis.description.OperationDesc [] _operations;

    static {
        _operations = new org.apache.axis.description.OperationDesc[11];
        _initOperationDesc1();
        _initOperationDesc2();
    }

    private static void _initOperationDesc1(){
        org.apache.axis.description.OperationDesc oper;
        org.apache.axis.description.ParameterDesc param;
        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("submitTempApproval");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "approvalDocument"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocument"), hanwha.neo.branch.ss.approval.vo.ApprovalDocument.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        oper.setReturnClass(java.lang.String.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitTempApprovalReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[0] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("getOriginUserIDUseUserId");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "miskey"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "MisKey"), hanwha.neo.branch.ss.approval.vo.MisKey.class, false, false);
        oper.addParameter(param);
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "delegatedSignerInfo"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "DelegatedSignerInfo"), hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "DelegatedSignerInfo"));
        oper.setReturnClass(hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getOriginUserIDUseUserIdReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[1] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("getListByUserKeyUseUserId");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "approvalUserKey"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalUserKey"), hanwha.neo.branch.ss.approval.vo.ApprovalUserKey.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentList"));
        oper.setReturnClass(hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[].class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getListByUserKeyUseUserIdReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[2] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("submitApprovalUseUserId");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "approvalDocument"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocument"), hanwha.neo.branch.ss.approval.vo.ApprovalDocument.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        oper.setReturnClass(java.lang.String.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitApprovalUseUserIdReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[3] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("getProcessIdByBulkMisId");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "miskey"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "MisKey"), hanwha.neo.branch.ss.approval.vo.MisKey[].class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentStatusOnly"));
        oper.setReturnClass(hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly[].class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getProcessIdByBulkMisIdReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[4] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("submitApproval");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "approvalDocument"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocument"), hanwha.neo.branch.ss.approval.vo.ApprovalDocument.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        oper.setReturnClass(java.lang.String.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitApprovalReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[5] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("getStatusByMisId");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "miskey"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "MisKey"), hanwha.neo.branch.ss.approval.vo.MisKey.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentStatus"));
        oper.setReturnClass(hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getStatusByMisIdReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[6] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("cancelApproval");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "cancelApprovalDocument"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "CancelApprovalDocument"), hanwha.neo.branch.ss.approval.vo.CancelApprovalDocument.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        oper.setReturnClass(java.lang.String.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "cancelApprovalReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[7] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("getOriginUserID");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "miskey"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "MisKey"), hanwha.neo.branch.ss.approval.vo.MisKey.class, false, false);
        oper.addParameter(param);
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "delegatedSignerInfo"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "DelegatedSignerInfo"), hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "DelegatedSignerInfo"));
        oper.setReturnClass(hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getOriginUserIDReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[8] = oper;

        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("getListByUserKey");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "approvalUserKey"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalUserKey"), hanwha.neo.branch.ss.approval.vo.ApprovalUserKey.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentList"));
        oper.setReturnClass(hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[].class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getListByUserKeyReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[9] = oper;

    }

    private static void _initOperationDesc2(){
        org.apache.axis.description.OperationDesc oper;
        org.apache.axis.description.ParameterDesc param;
        oper = new org.apache.axis.description.OperationDesc();
        oper.setName("submitTempApprovalUseUserId");
        param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "approvalDocument"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocument"), hanwha.neo.branch.ss.approval.vo.ApprovalDocument.class, false, false);
        oper.addParameter(param);
        oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        oper.setReturnClass(java.lang.String.class);
        oper.setReturnQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitTempApprovalUseUserIdReturn"));
        oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
        oper.setUse(org.apache.axis.constants.Use.LITERAL);
        oper.addFault(new org.apache.axis.description.FaultDesc(
                      new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "fault"),
                      "hanwha.neo.branch.ss.common.vo.WsException",
                      new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"), 
                      true
                     ));
        _operations[10] = oper;

    }

    public ApprovalServiceSoapBindingStub() throws org.apache.axis.AxisFault {
         this(null);
    }

    public ApprovalServiceSoapBindingStub(java.net.URL endpointURL, javax.xml.rpc.Service service) throws org.apache.axis.AxisFault {
         this(service);
         super.cachedEndpoint = endpointURL;
    }

    public ApprovalServiceSoapBindingStub(javax.xml.rpc.Service service) throws org.apache.axis.AxisFault {
        if (service == null) {
            super.service = new org.apache.axis.client.Service();
        } else {
            super.service = service;
        }
        ((org.apache.axis.client.Service)super.service).setTypeMappingVersion("1.2");
            java.lang.Class cls;
            javax.xml.namespace.QName qName;
            javax.xml.namespace.QName qName2;
            java.lang.Class beansf = org.apache.axis.encoding.ser.BeanSerializerFactory.class;
            java.lang.Class beandf = org.apache.axis.encoding.ser.BeanDeserializerFactory.class;
            java.lang.Class enumsf = org.apache.axis.encoding.ser.EnumSerializerFactory.class;
            java.lang.Class enumdf = org.apache.axis.encoding.ser.EnumDeserializerFactory.class;
            java.lang.Class arraysf = org.apache.axis.encoding.ser.ArraySerializerFactory.class;
            java.lang.Class arraydf = org.apache.axis.encoding.ser.ArrayDeserializerFactory.class;
            java.lang.Class simplesf = org.apache.axis.encoding.ser.SimpleSerializerFactory.class;
            java.lang.Class simpledf = org.apache.axis.encoding.ser.SimpleDeserializerFactory.class;
            java.lang.Class simplelistsf = org.apache.axis.encoding.ser.SimpleListSerializerFactory.class;
            java.lang.Class simplelistdf = org.apache.axis.encoding.ser.SimpleListDeserializerFactory.class;
            qName = new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "ArrayOf_tns1_ReceiverInfo");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.ReceiverInfo[].class;
            cachedSerClasses.add(cls);
            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ReceiverInfo");
            qName2 = new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "item");
            cachedSerFactories.add(new org.apache.axis.encoding.ser.ArraySerializerFactory(qName, qName2));
            cachedDeserFactories.add(new org.apache.axis.encoding.ser.ArrayDeserializerFactory());

            qName = new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "ArrayOf_tns1_SignerInfo");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.SignerInfo[].class;
            cachedSerClasses.add(cls);
            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "SignerInfo");
            qName2 = new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "item");
            cachedSerFactories.add(new org.apache.axis.encoding.ser.ArraySerializerFactory(qName, qName2));
            cachedDeserFactories.add(new org.apache.axis.encoding.ser.ArrayDeserializerFactory());

            qName = new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "ArrayOf_tns1_WsApAttachFile");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.WsApAttachFile[].class;
            cachedSerClasses.add(cls);
            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "WsApAttachFile");
            qName2 = new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "item");
            cachedSerFactories.add(new org.apache.axis.encoding.ser.ArraySerializerFactory(qName, qName2));
            cachedDeserFactories.add(new org.apache.axis.encoding.ser.ArrayDeserializerFactory());

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocument");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.ApprovalDocument.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentList");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentStatus");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentStatusOnly");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalUserKey");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.ApprovalUserKey.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "CancelApprovalDocument");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.CancelApprovalDocument.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "DelegatedSignerInfo");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "MisKey");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.MisKey.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ReceiverInfo");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.ReceiverInfo.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "SignerInfo");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.SignerInfo.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

            qName = new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "WsApAttachFile");
            cachedSerQNames.add(qName);
            cls = hanwha.neo.branch.ss.approval.vo.WsApAttachFile.class;
            cachedSerClasses.add(cls);
            cachedSerFactories.add(beansf);
            cachedDeserFactories.add(beandf);

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
            // All the type mapping information is registered
            // when the first call is made.
            // The type mapping information is actually registered in
            // the TypeMappingRegistry of the service, which
            // is the reason why registration is only needed for the first call.
            synchronized (this) {
                if (firstCall()) {
                    // must set encoding style before registering serializers
                    _call.setEncodingStyle(null);
                    for (int i = 0; i < cachedSerFactories.size(); ++i) {
                        java.lang.Class cls = (java.lang.Class) cachedSerClasses.get(i);
                        javax.xml.namespace.QName qName =
                                (javax.xml.namespace.QName) cachedSerQNames.get(i);
                        java.lang.Object x = cachedSerFactories.get(i);
                        if (x instanceof Class) {
                            java.lang.Class sf = (java.lang.Class)
                                 cachedSerFactories.get(i);
                            java.lang.Class df = (java.lang.Class)
                                 cachedDeserFactories.get(i);
                            _call.registerTypeMapping(cls, qName, sf, df, false);
                        }
                        else if (x instanceof javax.xml.rpc.encoding.SerializerFactory) {
                            org.apache.axis.encoding.SerializerFactory sf = (org.apache.axis.encoding.SerializerFactory)
                                 cachedSerFactories.get(i);
                            org.apache.axis.encoding.DeserializerFactory df = (org.apache.axis.encoding.DeserializerFactory)
                                 cachedDeserFactories.get(i);
                            _call.registerTypeMapping(cls, qName, sf, df, false);
                        }
                    }
                }
            }
            return _call;
        }
        catch (java.lang.Throwable _t) {
            throw new org.apache.axis.AxisFault("Failure trying to get the Call object", _t);
        }
    }

    public java.lang.String submitTempApproval(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[0]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitTempApproval"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {approvalDocument});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
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

    public hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo getOriginUserIDUseUserId(hanwha.neo.branch.ss.approval.vo.MisKey miskey, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo delegatedSignerInfo) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[1]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getOriginUserIDUseUserId"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {miskey, delegatedSignerInfo});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
            extractAttachments(_call);
            try {
                return (hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo) _resp;
            } catch (java.lang.Exception _exception) {
                return (hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo) org.apache.axis.utils.JavaUtils.convert(_resp, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo.class);
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

    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[] getListByUserKeyUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalUserKey approvalUserKey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[2]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getListByUserKeyUseUserId"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {approvalUserKey});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
            extractAttachments(_call);
            try {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[]) _resp;
            } catch (java.lang.Exception _exception) {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[]) org.apache.axis.utils.JavaUtils.convert(_resp, hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[].class);
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

    public java.lang.String submitApprovalUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[3]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitApprovalUseUserId"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {approvalDocument});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
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

    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly[] getProcessIdByBulkMisId(hanwha.neo.branch.ss.approval.vo.MisKey[] miskey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[4]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getProcessIdByBulkMisId"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {miskey});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
            extractAttachments(_call);
            try {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly[]) _resp;
            } catch (java.lang.Exception _exception) {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly[]) org.apache.axis.utils.JavaUtils.convert(_resp, hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly[].class);
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

    public java.lang.String submitApproval(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[5]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitApproval"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {approvalDocument});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
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

    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus getStatusByMisId(hanwha.neo.branch.ss.approval.vo.MisKey miskey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[6]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getStatusByMisId"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {miskey});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
            extractAttachments(_call);
            try {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus) _resp;
            } catch (java.lang.Exception _exception) {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus) org.apache.axis.utils.JavaUtils.convert(_resp, hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus.class);
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

    public java.lang.String cancelApproval(hanwha.neo.branch.ss.approval.vo.CancelApprovalDocument cancelApprovalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[7]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "cancelApproval"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {cancelApprovalDocument});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
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

    public hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo getOriginUserID(hanwha.neo.branch.ss.approval.vo.MisKey miskey, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo delegatedSignerInfo) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[8]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getOriginUserID"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {miskey, delegatedSignerInfo});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
            extractAttachments(_call);
            try {
                return (hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo) _resp;
            } catch (java.lang.Exception _exception) {
                return (hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo) org.apache.axis.utils.JavaUtils.convert(_resp, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo.class);
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

    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[] getListByUserKey(hanwha.neo.branch.ss.approval.vo.ApprovalUserKey approvalUserKey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[9]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "getListByUserKey"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {approvalUserKey});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
            extractAttachments(_call);
            try {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[]) _resp;
            } catch (java.lang.Exception _exception) {
                return (hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[]) org.apache.axis.utils.JavaUtils.convert(_resp, hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[].class);
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

    public java.lang.String submitTempApprovalUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (super.cachedEndpoint == null) {
            throw new org.apache.axis.NoEndPointException();
        }
        org.apache.axis.client.Call _call = createCall();
        _call.setOperation(_operations[10]);
        _call.setUseSOAPAction(true);
        _call.setSOAPActionURI("");
        _call.setEncodingStyle(null);
        _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
        _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
        _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
        _call.setOperationName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "submitTempApprovalUseUserId"));

        setRequestHeaders(_call);
        setAttachments(_call);
 try {        java.lang.Object _resp = _call.invoke(new java.lang.Object[] {approvalDocument});

        if (_resp instanceof java.rmi.RemoteException) {
            throw (java.rmi.RemoteException)_resp;
        }
        else {
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
