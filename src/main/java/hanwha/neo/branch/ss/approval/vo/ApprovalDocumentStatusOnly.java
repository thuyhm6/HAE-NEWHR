/**
 * ApprovalDocumentStatusOnly.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.vo;

public class ApprovalDocumentStatusOnly  implements java.io.Serializable {
    private java.lang.String instanceId;

    private java.lang.String misDocId;

    private java.lang.String revision;

    private int status;

    private java.lang.String systemId;

    public ApprovalDocumentStatusOnly() {
    }

    public ApprovalDocumentStatusOnly(
           java.lang.String instanceId,
           java.lang.String misDocId,
           java.lang.String revision,
           int status,
           java.lang.String systemId) {
           this.instanceId = instanceId;
           this.misDocId = misDocId;
           this.revision = revision;
           this.status = status;
           this.systemId = systemId;
    }


    /**
     * Gets the instanceId value for this ApprovalDocumentStatusOnly.
     * 
     * @return instanceId
     */
    public java.lang.String getInstanceId() {
        return instanceId;
    }


    /**
     * Sets the instanceId value for this ApprovalDocumentStatusOnly.
     * 
     * @param instanceId
     */
    public void setInstanceId(java.lang.String instanceId) {
        this.instanceId = instanceId;
    }


    /**
     * Gets the misDocId value for this ApprovalDocumentStatusOnly.
     * 
     * @return misDocId
     */
    public java.lang.String getMisDocId() {
        return misDocId;
    }


    /**
     * Sets the misDocId value for this ApprovalDocumentStatusOnly.
     * 
     * @param misDocId
     */
    public void setMisDocId(java.lang.String misDocId) {
        this.misDocId = misDocId;
    }


    /**
     * Gets the revision value for this ApprovalDocumentStatusOnly.
     * 
     * @return revision
     */
    public java.lang.String getRevision() {
        return revision;
    }


    /**
     * Sets the revision value for this ApprovalDocumentStatusOnly.
     * 
     * @param revision
     */
    public void setRevision(java.lang.String revision) {
        this.revision = revision;
    }


    /**
     * Gets the status value for this ApprovalDocumentStatusOnly.
     * 
     * @return status
     */
    public int getStatus() {
        return status;
    }


    /**
     * Sets the status value for this ApprovalDocumentStatusOnly.
     * 
     * @param status
     */
    public void setStatus(int status) {
        this.status = status;
    }


    /**
     * Gets the systemId value for this ApprovalDocumentStatusOnly.
     * 
     * @return systemId
     */
    public java.lang.String getSystemId() {
        return systemId;
    }


    /**
     * Sets the systemId value for this ApprovalDocumentStatusOnly.
     * 
     * @param systemId
     */
    public void setSystemId(java.lang.String systemId) {
        this.systemId = systemId;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof ApprovalDocumentStatusOnly)) return false;
        ApprovalDocumentStatusOnly other = (ApprovalDocumentStatusOnly) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.instanceId==null && other.getInstanceId()==null) || 
             (this.instanceId!=null &&
              this.instanceId.equals(other.getInstanceId()))) &&
            ((this.misDocId==null && other.getMisDocId()==null) || 
             (this.misDocId!=null &&
              this.misDocId.equals(other.getMisDocId()))) &&
            ((this.revision==null && other.getRevision()==null) || 
             (this.revision!=null &&
              this.revision.equals(other.getRevision()))) &&
            this.status == other.getStatus() &&
            ((this.systemId==null && other.getSystemId()==null) || 
             (this.systemId!=null &&
              this.systemId.equals(other.getSystemId())));
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
        if (getInstanceId() != null) {
            _hashCode += getInstanceId().hashCode();
        }
        if (getMisDocId() != null) {
            _hashCode += getMisDocId().hashCode();
        }
        if (getRevision() != null) {
            _hashCode += getRevision().hashCode();
        }
        _hashCode += getStatus();
        if (getSystemId() != null) {
            _hashCode += getSystemId().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(ApprovalDocumentStatusOnly.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalDocumentStatusOnly"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("instanceId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "instanceId"));
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
        elemField.setFieldName("revision");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "revision"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("status");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "status"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("systemId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "systemId"));
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
