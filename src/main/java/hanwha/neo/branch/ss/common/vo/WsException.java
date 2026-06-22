/**
 * WsException.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.common.vo;

public class WsException  extends org.apache.axis.AxisFault  implements java.io.Serializable {
    private java.lang.String exceptionActor;

    private java.lang.String exceptionCode;

    private java.lang.String exceptionMessage;

    public WsException() {
    }

    public WsException(
           java.lang.String exceptionActor,
           java.lang.String exceptionCode,
           java.lang.String exceptionMessage) {
        this.exceptionActor = exceptionActor;
        this.exceptionCode = exceptionCode;
        this.exceptionMessage = exceptionMessage;
    }


    /**
     * Gets the exceptionActor value for this WsException.
     * 
     * @return exceptionActor
     */
    public java.lang.String getExceptionActor() {
        return exceptionActor;
    }


    /**
     * Sets the exceptionActor value for this WsException.
     * 
     * @param exceptionActor
     */
    public void setExceptionActor(java.lang.String exceptionActor) {
        this.exceptionActor = exceptionActor;
    }


    /**
     * Gets the exceptionCode value for this WsException.
     * 
     * @return exceptionCode
     */
    public java.lang.String getExceptionCode() {
        return exceptionCode;
    }


    /**
     * Sets the exceptionCode value for this WsException.
     * 
     * @param exceptionCode
     */
    public void setExceptionCode(java.lang.String exceptionCode) {
        this.exceptionCode = exceptionCode;
    }


    /**
     * Gets the exceptionMessage value for this WsException.
     * 
     * @return exceptionMessage
     */
    public java.lang.String getExceptionMessage() {
        return exceptionMessage;
    }


    /**
     * Sets the exceptionMessage value for this WsException.
     * 
     * @param exceptionMessage
     */
    public void setExceptionMessage(java.lang.String exceptionMessage) {
        this.exceptionMessage = exceptionMessage;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof WsException)) return false;
        WsException other = (WsException) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.exceptionActor==null && other.getExceptionActor()==null) || 
             (this.exceptionActor!=null &&
              this.exceptionActor.equals(other.getExceptionActor()))) &&
            ((this.exceptionCode==null && other.getExceptionCode()==null) || 
             (this.exceptionCode!=null &&
              this.exceptionCode.equals(other.getExceptionCode()))) &&
            ((this.exceptionMessage==null && other.getExceptionMessage()==null) || 
             (this.exceptionMessage!=null &&
              this.exceptionMessage.equals(other.getExceptionMessage())));
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
        if (getExceptionActor() != null) {
            _hashCode += getExceptionActor().hashCode();
        }
        if (getExceptionCode() != null) {
            _hashCode += getExceptionCode().hashCode();
        }
        if (getExceptionMessage() != null) {
            _hashCode += getExceptionMessage().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(WsException.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsException"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("exceptionActor");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "exceptionActor"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("exceptionCode");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "exceptionCode"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("exceptionMessage");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "exceptionMessage"));
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


    /**
     * Writes the exception data to the faultDetails
     */
    public void writeDetails(javax.xml.namespace.QName qname, org.apache.axis.encoding.SerializationContext context) throws java.io.IOException {
        context.serialize(qname, null, this);
    }
}
