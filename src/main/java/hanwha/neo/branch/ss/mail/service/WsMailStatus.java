/**
 * WsMailStatus.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.mail.service;

public class WsMailStatus  implements java.io.Serializable {
    private boolean delivery;

    private java.lang.String mailKey;

    public WsMailStatus() {
    }

    public WsMailStatus(
           boolean delivery,
           java.lang.String mailKey) {
           this.delivery = delivery;
           this.mailKey = mailKey;
    }


    /**
     * Gets the delivery value for this WsMailStatus.
     * 
     * @return delivery
     */
    public boolean isDelivery() {
        return delivery;
    }


    /**
     * Sets the delivery value for this WsMailStatus.
     * 
     * @param delivery
     */
    public void setDelivery(boolean delivery) {
        this.delivery = delivery;
    }


    /**
     * Gets the mailKey value for this WsMailStatus.
     * 
     * @return mailKey
     */
    public java.lang.String getMailKey() {
        return mailKey;
    }


    /**
     * Sets the mailKey value for this WsMailStatus.
     * 
     * @param mailKey
     */
    public void setMailKey(java.lang.String mailKey) {
        this.mailKey = mailKey;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof WsMailStatus)) return false;
        WsMailStatus other = (WsMailStatus) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            this.delivery == other.isDelivery() &&
            ((this.mailKey==null && other.getMailKey()==null) || 
             (this.mailKey!=null &&
              this.mailKey.equals(other.getMailKey())));
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
        _hashCode += (isDelivery() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        if (getMailKey() != null) {
            _hashCode += getMailKey().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(WsMailStatus.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "WsMailStatus"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("delivery");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "delivery"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("mailKey");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "mailKey"));
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
