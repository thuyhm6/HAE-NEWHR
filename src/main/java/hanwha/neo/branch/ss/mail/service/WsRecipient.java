/**
 * WsRecipient.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.mail.service;

public class WsRecipient  implements java.io.Serializable {
    private boolean dept;

    private java.lang.String recvEmail;

    private java.lang.String recvType;

    private int seqID;

    public WsRecipient() {
    }

    public WsRecipient(
           boolean dept,
           java.lang.String recvEmail,
           java.lang.String recvType,
           int seqID) {
           this.dept = dept;
           this.recvEmail = recvEmail;
           this.recvType = recvType;
           this.seqID = seqID;
    }


    /**
     * Gets the dept value for this WsRecipient.
     * 
     * @return dept
     */
    public boolean isDept() {
        return dept;
    }


    /**
     * Sets the dept value for this WsRecipient.
     * 
     * @param dept
     */
    public void setDept(boolean dept) {
        this.dept = dept;
    }


    /**
     * Gets the recvEmail value for this WsRecipient.
     * 
     * @return recvEmail
     */
    public java.lang.String getRecvEmail() {
        return recvEmail;
    }


    /**
     * Sets the recvEmail value for this WsRecipient.
     * 
     * @param recvEmail
     */
    public void setRecvEmail(java.lang.String recvEmail) {
        this.recvEmail = recvEmail;
    }


    /**
     * Gets the recvType value for this WsRecipient.
     * 
     * @return recvType
     */
    public java.lang.String getRecvType() {
        return recvType;
    }


    /**
     * Sets the recvType value for this WsRecipient.
     * 
     * @param recvType
     */
    public void setRecvType(java.lang.String recvType) {
        this.recvType = recvType;
    }


    /**
     * Gets the seqID value for this WsRecipient.
     * 
     * @return seqID
     */
    public int getSeqID() {
        return seqID;
    }


    /**
     * Sets the seqID value for this WsRecipient.
     * 
     * @param seqID
     */
    public void setSeqID(int seqID) {
        this.seqID = seqID;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof WsRecipient)) return false;
        WsRecipient other = (WsRecipient) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            this.dept == other.isDept() &&
            ((this.recvEmail==null && other.getRecvEmail()==null) || 
             (this.recvEmail!=null &&
              this.recvEmail.equals(other.getRecvEmail()))) &&
            ((this.recvType==null && other.getRecvType()==null) || 
             (this.recvType!=null &&
              this.recvType.equals(other.getRecvType()))) &&
            this.seqID == other.getSeqID();
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
        _hashCode += (isDept() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        if (getRecvEmail() != null) {
            _hashCode += getRecvEmail().hashCode();
        }
        if (getRecvType() != null) {
            _hashCode += getRecvType().hashCode();
        }
        _hashCode += getSeqID();
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(WsRecipient.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "WsRecipient"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("dept");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "dept"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("recvEmail");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "recvEmail"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("recvType");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "recvType"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("seqID");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "seqID"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
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
