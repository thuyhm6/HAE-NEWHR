/**
 * ApprovalUserKey.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.vo;

public class ApprovalUserKey  implements java.io.Serializable {
    private java.lang.String systemId;

    private java.lang.String userId;

    private java.lang.String userKey;

    private java.lang.String wlType;

    public ApprovalUserKey() {
    }

    public ApprovalUserKey(
           java.lang.String systemId,
           java.lang.String userId,
           java.lang.String userKey,
           java.lang.String wlType) {
           this.systemId = systemId;
           this.userId = userId;
           this.userKey = userKey;
           this.wlType = wlType;
    }


    /**
     * Gets the systemId value for this ApprovalUserKey.
     * 
     * @return systemId
     */
    public java.lang.String getSystemId() {
        return systemId;
    }


    /**
     * Sets the systemId value for this ApprovalUserKey.
     * 
     * @param systemId
     */
    public void setSystemId(java.lang.String systemId) {
        this.systemId = systemId;
    }


    /**
     * Gets the userId value for this ApprovalUserKey.
     * 
     * @return userId
     */
    public java.lang.String getUserId() {
        return userId;
    }


    /**
     * Sets the userId value for this ApprovalUserKey.
     * 
     * @param userId
     */
    public void setUserId(java.lang.String userId) {
        this.userId = userId;
    }


    /**
     * Gets the userKey value for this ApprovalUserKey.
     * 
     * @return userKey
     */
    public java.lang.String getUserKey() {
        return userKey;
    }


    /**
     * Sets the userKey value for this ApprovalUserKey.
     * 
     * @param userKey
     */
    public void setUserKey(java.lang.String userKey) {
        this.userKey = userKey;
    }


    /**
     * Gets the wlType value for this ApprovalUserKey.
     * 
     * @return wlType
     */
    public java.lang.String getWlType() {
        return wlType;
    }


    /**
     * Sets the wlType value for this ApprovalUserKey.
     * 
     * @param wlType
     */
    public void setWlType(java.lang.String wlType) {
        this.wlType = wlType;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof ApprovalUserKey)) return false;
        ApprovalUserKey other = (ApprovalUserKey) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.systemId==null && other.getSystemId()==null) || 
             (this.systemId!=null &&
              this.systemId.equals(other.getSystemId()))) &&
            ((this.userId==null && other.getUserId()==null) || 
             (this.userId!=null &&
              this.userId.equals(other.getUserId()))) &&
            ((this.userKey==null && other.getUserKey()==null) || 
             (this.userKey!=null &&
              this.userKey.equals(other.getUserKey()))) &&
            ((this.wlType==null && other.getWlType()==null) || 
             (this.wlType!=null &&
              this.wlType.equals(other.getWlType())));
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
        if (getSystemId() != null) {
            _hashCode += getSystemId().hashCode();
        }
        if (getUserId() != null) {
            _hashCode += getUserId().hashCode();
        }
        if (getUserKey() != null) {
            _hashCode += getUserKey().hashCode();
        }
        if (getWlType() != null) {
            _hashCode += getWlType().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(ApprovalUserKey.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "ApprovalUserKey"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("systemId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "systemId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("userId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "userId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("userKey");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "userKey"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("wlType");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "wlType"));
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
