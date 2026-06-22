/**
 * DelegatedSignerInfo.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.vo;

public class DelegatedSignerInfo  implements java.io.Serializable {
    private java.lang.String delegatedUserId;

    private java.lang.String delegatedUserKey;

    private int sequence;

    private java.lang.String userId;

    private java.lang.String userKey;

    public DelegatedSignerInfo() {
    }

    public DelegatedSignerInfo(
           java.lang.String delegatedUserId,
           java.lang.String delegatedUserKey,
           int sequence,
           java.lang.String userId,
           java.lang.String userKey) {
           this.delegatedUserId = delegatedUserId;
           this.delegatedUserKey = delegatedUserKey;
           this.sequence = sequence;
           this.userId = userId;
           this.userKey = userKey;
    }


    /**
     * Gets the delegatedUserId value for this DelegatedSignerInfo.
     * 
     * @return delegatedUserId
     */
    public java.lang.String getDelegatedUserId() {
        return delegatedUserId;
    }


    /**
     * Sets the delegatedUserId value for this DelegatedSignerInfo.
     * 
     * @param delegatedUserId
     */
    public void setDelegatedUserId(java.lang.String delegatedUserId) {
        this.delegatedUserId = delegatedUserId;
    }


    /**
     * Gets the delegatedUserKey value for this DelegatedSignerInfo.
     * 
     * @return delegatedUserKey
     */
    public java.lang.String getDelegatedUserKey() {
        return delegatedUserKey;
    }


    /**
     * Sets the delegatedUserKey value for this DelegatedSignerInfo.
     * 
     * @param delegatedUserKey
     */
    public void setDelegatedUserKey(java.lang.String delegatedUserKey) {
        this.delegatedUserKey = delegatedUserKey;
    }


    /**
     * Gets the sequence value for this DelegatedSignerInfo.
     * 
     * @return sequence
     */
    public int getSequence() {
        return sequence;
    }


    /**
     * Sets the sequence value for this DelegatedSignerInfo.
     * 
     * @param sequence
     */
    public void setSequence(int sequence) {
        this.sequence = sequence;
    }


    /**
     * Gets the userId value for this DelegatedSignerInfo.
     * 
     * @return userId
     */
    public java.lang.String getUserId() {
        return userId;
    }


    /**
     * Sets the userId value for this DelegatedSignerInfo.
     * 
     * @param userId
     */
    public void setUserId(java.lang.String userId) {
        this.userId = userId;
    }


    /**
     * Gets the userKey value for this DelegatedSignerInfo.
     * 
     * @return userKey
     */
    public java.lang.String getUserKey() {
        return userKey;
    }


    /**
     * Sets the userKey value for this DelegatedSignerInfo.
     * 
     * @param userKey
     */
    public void setUserKey(java.lang.String userKey) {
        this.userKey = userKey;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof DelegatedSignerInfo)) return false;
        DelegatedSignerInfo other = (DelegatedSignerInfo) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.delegatedUserId==null && other.getDelegatedUserId()==null) || 
             (this.delegatedUserId!=null &&
              this.delegatedUserId.equals(other.getDelegatedUserId()))) &&
            ((this.delegatedUserKey==null && other.getDelegatedUserKey()==null) || 
             (this.delegatedUserKey!=null &&
              this.delegatedUserKey.equals(other.getDelegatedUserKey()))) &&
            this.sequence == other.getSequence() &&
            ((this.userId==null && other.getUserId()==null) || 
             (this.userId!=null &&
              this.userId.equals(other.getUserId()))) &&
            ((this.userKey==null && other.getUserKey()==null) || 
             (this.userKey!=null &&
              this.userKey.equals(other.getUserKey())));
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
        if (getDelegatedUserId() != null) {
            _hashCode += getDelegatedUserId().hashCode();
        }
        if (getDelegatedUserKey() != null) {
            _hashCode += getDelegatedUserKey().hashCode();
        }
        _hashCode += getSequence();
        if (getUserId() != null) {
            _hashCode += getUserId().hashCode();
        }
        if (getUserKey() != null) {
            _hashCode += getUserKey().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(DelegatedSignerInfo.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "DelegatedSignerInfo"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("delegatedUserId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "delegatedUserId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("delegatedUserKey");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "delegatedUserKey"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("sequence");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "sequence"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
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
