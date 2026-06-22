/**
 * ApprovalDocumentStatus.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.vo;

public class ApprovalDocumentStatus  implements java.io.Serializable {
    private hanwha.neo.branch.ss.approval.vo.WsApAttachFile[] attachfiles;

    private java.lang.String bodyContent;

    private java.lang.String childIncYn;

    private java.lang.String deptOpenYn;

    private java.lang.String documentLevelCode;

    private java.lang.String initDeptOpenYn;

    private java.lang.String misDocId;

    private java.lang.String preservationTermCode;

    private hanwha.neo.branch.ss.approval.vo.ReceiverInfo[] receiverInfos;

    private hanwha.neo.branch.ss.approval.vo.SignerInfo[] signerInfos;

    private int status;

    private java.lang.String stdDate;

    private java.lang.String systemId;

    private java.lang.String title;

    private java.lang.String wfData;

    private java.lang.String wfDataType;

    public ApprovalDocumentStatus() {
    }

    public ApprovalDocumentStatus(
           hanwha.neo.branch.ss.approval.vo.WsApAttachFile[] attachfiles,
           java.lang.String bodyContent,
           java.lang.String childIncYn,
           java.lang.String deptOpenYn,
           java.lang.String documentLevelCode,
           java.lang.String initDeptOpenYn,
           java.lang.String misDocId,
           java.lang.String preservationTermCode,
           hanwha.neo.branch.ss.approval.vo.ReceiverInfo[] receiverInfos,
           hanwha.neo.branch.ss.approval.vo.SignerInfo[] signerInfos,
           int status,
           java.lang.String stdDate,
           java.lang.String systemId,
           java.lang.String title,
           java.lang.String wfData,
           java.lang.String wfDataType) {
           this.attachfiles = attachfiles;
           this.bodyContent = bodyContent;
           this.childIncYn = childIncYn;
           this.deptOpenYn = deptOpenYn;
           this.documentLevelCode = documentLevelCode;
           this.initDeptOpenYn = initDeptOpenYn;
           this.misDocId = misDocId;
           this.preservationTermCode = preservationTermCode;
           this.receiverInfos = receiverInfos;
           this.signerInfos = signerInfos;
           this.status = status;
           this.stdDate = stdDate;
           this.systemId = systemId;
           this.title = title;
           this.wfData = wfData;
           this.wfDataType = wfDataType;
    }


    /**
     * Gets the attachfiles value for this ApprovalDocumentStatus.
     * 
     * @return attachfiles
     */
    public hanwha.neo.branch.ss.approval.vo.WsApAttachFile[] getAttachfiles() {
        return attachfiles;
    }


    /**
     * Sets the attachfiles value for this ApprovalDocumentStatus.
     * 
     * @param attachfiles
     */
    public void setAttachfiles(hanwha.neo.branch.ss.approval.vo.WsApAttachFile[] attachfiles) {
        this.attachfiles = attachfiles;
    }


    /**
     * Gets the bodyContent value for this ApprovalDocumentStatus.
     * 
     * @return bodyContent
     */
    public java.lang.String getBodyContent() {
        return bodyContent;
    }


    /**
     * Sets the bodyContent value for this ApprovalDocumentStatus.
     * 
     * @param bodyContent
     */
    public void setBodyContent(java.lang.String bodyContent) {
        this.bodyContent = bodyContent;
    }


    /**
     * Gets the childIncYn value for this ApprovalDocumentStatus.
     * 
     * @return childIncYn
     */
    public java.lang.String getChildIncYn() {
        return childIncYn;
    }


    /**
     * Sets the childIncYn value for this ApprovalDocumentStatus.
     * 
     * @param childIncYn
     */
    public void setChildIncYn(java.lang.String childIncYn) {
        this.childIncYn = childIncYn;
    }


    /**
     * Gets the deptOpenYn value for this ApprovalDocumentStatus.
     * 
     * @return deptOpenYn
     */
    public java.lang.String getDeptOpenYn() {
        return deptOpenYn;
    }


    /**
     * Sets the deptOpenYn value for this ApprovalDocumentStatus.
     * 
     * @param deptOpenYn
     */
    public void setDeptOpenYn(java.lang.String deptOpenYn) {
        this.deptOpenYn = deptOpenYn;
    }


    /**
     * Gets the documentLevelCode value for this ApprovalDocumentStatus.
     * 
     * @return documentLevelCode
     */
    public java.lang.String getDocumentLevelCode() {
        return documentLevelCode;
    }


    /**
     * Sets the documentLevelCode value for this ApprovalDocumentStatus.
     * 
     * @param documentLevelCode
     */
    public void setDocumentLevelCode(java.lang.String documentLevelCode) {
        this.documentLevelCode = documentLevelCode;
    }


    /**
     * Gets the initDeptOpenYn value for this ApprovalDocumentStatus.
     * 
     * @return initDeptOpenYn
     */
    public java.lang.String getInitDeptOpenYn() {
        return initDeptOpenYn;
    }


    /**
     * Sets the initDeptOpenYn value for this ApprovalDocumentStatus.
     * 
     * @param initDeptOpenYn
     */
    public void setInitDeptOpenYn(java.lang.String initDeptOpenYn) {
        this.initDeptOpenYn = initDeptOpenYn;
    }


    /**
     * Gets the misDocId value for this ApprovalDocumentStatus.
     * 
     * @return misDocId
     */
    public java.lang.String getMisDocId() {
        return misDocId;
    }


    /**
     * Sets the misDocId value for this ApprovalDocumentStatus.
     * 
     * @param misDocId
     */
    public void setMisDocId(java.lang.String misDocId) {
        this.misDocId = misDocId;
    }


    /**
     * Gets the preservationTermCode value for this ApprovalDocumentStatus.
     * 
     * @return preservationTermCode
     */
    public java.lang.String getPreservationTermCode() {
        return preservationTermCode;
    }


    /**
     * Sets the preservationTermCode value for this ApprovalDocumentStatus.
     * 
     * @param preservationTermCode
     */
    public void setPreservationTermCode(java.lang.String preservationTermCode) {
        this.preservationTermCode = preservationTermCode;
    }


    /**
     * Gets the receiverInfos value for this ApprovalDocumentStatus.
     * 
     * @return receiverInfos
     */
    public hanwha.neo.branch.ss.approval.vo.ReceiverInfo[] getReceiverInfos() {
        return receiverInfos;
    }


    /**
     * Sets the receiverInfos value for this ApprovalDocumentStatus.
     * 
     * @param receiverInfos
     */
    public void setReceiverInfos(hanwha.neo.branch.ss.approval.vo.ReceiverInfo[] receiverInfos) {
        this.receiverInfos = receiverInfos;
    }


    /**
     * Gets the signerInfos value for this ApprovalDocumentStatus.
     * 
     * @return signerInfos
     */
    public hanwha.neo.branch.ss.approval.vo.SignerInfo[] getSignerInfos() {
        return signerInfos;
    }


    /**
     * Sets the signerInfos value for this ApprovalDocumentStatus.
     * 
     * @param signerInfos
     */
    public void setSignerInfos(hanwha.neo.branch.ss.approval.vo.SignerInfo[] signerInfos) {
        this.signerInfos = signerInfos;
    }


    /**
     * Gets the status value for this ApprovalDocumentStatus.
     * 
     * @return status
     */
    public int getStatus() {
        return status;
    }


    /**
     * Sets the status value for this ApprovalDocumentStatus.
     * 
     * @param status
     */
    public void setStatus(int status) {
        this.status = status;
    }


    /**
     * Gets the stdDate value for this ApprovalDocumentStatus.
     * 
     * @return stdDate
     */
    public java.lang.String getStdDate() {
        return stdDate;
    }


    /**
     * Sets the stdDate value for this ApprovalDocumentStatus.
     * 
     * @param stdDate
     */
    public void setStdDate(java.lang.String stdDate) {
        this.stdDate = stdDate;
    }


    /**
     * Gets the systemId value for this ApprovalDocumentStatus.
     * 
     * @return systemId
     */
    public java.lang.String getSystemId() {
        return systemId;
    }


    /**
     * Sets the systemId value for this ApprovalDocumentStatus.
     * 
     * @param systemId
     */
    public void setSystemId(java.lang.String systemId) {
        this.systemId = systemId;
    }


    /**
     * Gets the title value for this ApprovalDocumentStatus.
     * 
     * @return title
     */
    public java.lang.String getTitle() {
        return title;
    }


    /**
     * Sets the title value for this ApprovalDocumentStatus.
     * 
     * @param title
     */
    public void setTitle(java.lang.String title) {
        this.title = title;
    }


    /**
     * Gets the wfData value for this ApprovalDocumentStatus.
     * 
     * @return wfData
     */
    public java.lang.String getWfData() {
        return wfData;
    }


    /**
     * Sets the wfData value for this ApprovalDocumentStatus.
     * 
     * @param wfData
     */
    public void setWfData(java.lang.String wfData) {
        this.wfData = wfData;
    }


    /**
     * Gets the wfDataType value for this ApprovalDocumentStatus.
     * 
     * @return wfDataType
     */
    public java.lang.String getWfDataType() {
        return wfDataType;
    }


    /**
     * Sets the wfDataType value for this ApprovalDocumentStatus.
     * 
     * @param wfDataType
     */
    public void setWfDataType(java.lang.String wfDataType) {
        this.wfDataType = wfDataType;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof ApprovalDocumentStatus)) return false;
        ApprovalDocumentStatus other = (ApprovalDocumentStatus) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.attachfiles==null && other.getAttachfiles()==null) || 
             (this.attachfiles!=null &&
              java.util.Arrays.equals(this.attachfiles, other.getAttachfiles()))) &&
            ((this.bodyContent==null && other.getBodyContent()==null) || 
             (this.bodyContent!=null &&
              this.bodyContent.equals(other.getBodyContent()))) &&
            ((this.childIncYn==null && other.getChildIncYn()==null) || 
             (this.childIncYn!=null &&
              this.childIncYn.equals(other.getChildIncYn()))) &&
            ((this.deptOpenYn==null && other.getDeptOpenYn()==null) || 
             (this.deptOpenYn!=null &&
              this.deptOpenYn.equals(other.getDeptOpenYn()))) &&
            ((this.documentLevelCode==null && other.getDocumentLevelCode()==null) || 
             (this.documentLevelCode!=null &&
              this.documentLevelCode.equals(other.getDocumentLevelCode()))) &&
            ((this.initDeptOpenYn==null && other.getInitDeptOpenYn()==null) || 
             (this.initDeptOpenYn!=null &&
              this.initDeptOpenYn.equals(other.getInitDeptOpenYn()))) &&
            ((this.misDocId==null && other.getMisDocId()==null) || 
             (this.misDocId!=null &&
              this.misDocId.equals(other.getMisDocId()))) &&
            ((this.preservationTermCode==null && other.getPreservationTermCode()==null) || 
             (this.preservationTermCode!=null &&
              this.preservationTermCode.equals(other.getPreservationTermCode()))) &&
            ((this.receiverInfos==null && other.getReceiverInfos()==null) || 
             (this.receiverInfos!=null &&
              java.util.Arrays.equals(this.receiverInfos, other.getReceiverInfos()))) &&
            ((this.signerInfos==null && other.getSignerInfos()==null) || 
             (this.signerInfos!=null &&
              java.util.Arrays.equals(this.signerInfos, other.getSignerInfos()))) &&
            this.status == other.getStatus() &&
            ((this.stdDate==null && other.getStdDate()==null) || 
             (this.stdDate!=null &&
              this.stdDate.equals(other.getStdDate()))) &&
            ((this.systemId==null && other.getSystemId()==null) || 
             (this.systemId!=null &&
              this.systemId.equals(other.getSystemId()))) &&
            ((this.title==null && other.getTitle()==null) || 
             (this.title!=null &&
              this.title.equals(other.getTitle()))) &&
            ((this.wfData==null && other.getWfData()==null) || 
             (this.wfData!=null &&
              this.wfData.equals(other.getWfData()))) &&
            ((this.wfDataType==null && other.getWfDataType()==null) || 
             (this.wfDataType!=null &&
              this.wfDataType.equals(other.getWfDataType())));
        __equalsCalc = null;
        return _equals;
    }

    private boolean __hashCodeCalc = false;
    public synchronized int hashCode() {
        if (__hashCodeCalc) {
            return 0;
        }
        __hashCodeCalc = true;
        int _hashCode = 1;
        if (getAttachfiles() != null) {
            for (int i=0;
                 i<java.lang.reflect.Array.getLength(getAttachfiles());
                 i++) {
                java.lang.Object obj = java.lang.reflect.Array.get(getAttachfiles(), i);
                if (obj != null &&
                    !obj.getClass().isArray()) {
                    _hashCode += obj.hashCode();
                }
            }
        }
        if (getBodyContent() != null) {
            _hashCode += getBodyContent().hashCode();
        }
        if (getChildIncYn() != null) {
            _hashCode += getChildIncYn().hashCode();
        }
        if (getDeptOpenYn() != null) {
            _hashCode += getDeptOpenYn().hashCode();
        }
        if (getDocumentLevelCode() != null) {
            _hashCode += getDocumentLevelCode().hashCode();
        }
        if (getInitDeptOpenYn() != null) {
            _hashCode += getInitDeptOpenYn().hashCode();
        }
        if (getMisDocId() != null) {
            _hashCode += getMisDocId().hashCode();
        }
        if (getPreservationTermCode() != null) {
            _hashCode += getPreservationTermCode().hashCode();
        }
        if (getReceiverInfos() != null) {
            for (int i=0;
                 i<java.lang.reflect.Array.getLength(getReceiverInfos());
                 i++) {
                java.lang.Object obj = java.lang.reflect.Array.get(getReceiverInfos(), i);
                if (obj != null &&
                    !obj.getClass().isArray()) {
                    _hashCode += obj.hashCode();
                }
            }
        }
        if (getSignerInfos() != null) {
            for (int i=0;
                 i<java.lang.reflect.Array.getLength(getSignerInfos());
                 i++) {
                java.lang.Object obj = java.lang.reflect.Array.get(getSignerInfos(), i);
                if (obj != null &&
                    !obj.getClass().isArray()) {
                    _hashCode += obj.hashCode();
                }
            }
        }
        _hashCode += getStatus();
        if (getStdDate() != null) {
            _hashCode += getStdDate().hashCode();
        }
        if (getSystemId() != null) {
            _hashCode += getSystemId().hashCode();
        }
        if (getTitle() != null) {
            _hashCode += getTitle().hashCode();
        }
        if (getWfData() != null) {
            _hashCode += getWfData().hashCode();
        }
        if (getWfDataType() != null) {
            _hashCode += getWfDataType().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(ApprovalDocumentStatus.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentStatus"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("attachfiles");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "attachfiles"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "WsApAttachFile"));
        elemField.setNillable(true);
        elemField.setItemQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "item"));
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("bodyContent");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "bodyContent"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("childIncYn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "childIncYn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("deptOpenYn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "deptOpenYn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("documentLevelCode");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "documentLevelCode"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("initDeptOpenYn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "initDeptOpenYn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("misDocId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "misDocId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("preservationTermCode");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "preservationTermCode"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("receiverInfos");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "receiverInfos"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ReceiverInfo"));
        elemField.setNillable(true);
        elemField.setItemQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "item"));
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("signerInfos");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "signerInfos"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "SignerInfo"));
        elemField.setNillable(true);
        elemField.setItemQName(new javax.xml.namespace.QName("http://axisws.approval.ss.branch.neo.hanwha", "item"));
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("status");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "status"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("stdDate");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "stdDate"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("systemId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "systemId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("title");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "title"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("wfData");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "wfData"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("wfDataType");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "wfDataType"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
    }

    /**
     * Return type metadata object
     */
    public static org.apache.axis.description.TypeDesc getTypeDesc() {
        return typeDesc;
    }

    /**
     * Get Custom Serializer
     */
    public static org.apache.axis.encoding.Serializer getSerializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanSerializer(
            _javaType, _xmlType, typeDesc);
    }

    /**
     * Get Custom Deserializer
     */
    public static org.apache.axis.encoding.Deserializer getDeserializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanDeserializer(
            _javaType, _xmlType, typeDesc);
    }

}
