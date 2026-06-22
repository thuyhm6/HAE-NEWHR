/**
 * WsMailInfo.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.mail.service;

public class WsMailInfo  implements java.io.Serializable {
    private int attachCount;

    private boolean htmlContent;

    private boolean important;

    private boolean mhtContent;

    private java.lang.String senderEmail;

    private java.lang.String subject;

    public WsMailInfo() {
    }

    public WsMailInfo(
           int attachCount,
           boolean htmlContent,
           boolean important,
           boolean mhtContent,
           java.lang.String senderEmail,
           java.lang.String subject) {
           this.attachCount = attachCount;
           this.htmlContent = htmlContent;
           this.important = important;
           this.mhtContent = mhtContent;
           this.senderEmail = senderEmail;
           this.subject = subject;
    }


    /**
     * Gets the attachCount value for this WsMailInfo.
     * 
     * @return attachCount
     */
    public int getAttachCount() {
        return attachCount;
    }


    /**
     * Sets the attachCount value for this WsMailInfo.
     * 
     * @param attachCount
     */
    public void setAttachCount(int attachCount) {
        this.attachCount = attachCount;
    }


    /**
     * Gets the htmlContent value for this WsMailInfo.
     * 
     * @return htmlContent
     */
    public boolean isHtmlContent() {
        return htmlContent;
    }


    /**
     * Sets the htmlContent value for this WsMailInfo.
     * 
     * @param htmlContent
     */
    public void setHtmlContent(boolean htmlContent) {
        this.htmlContent = htmlContent;
    }


    /**
     * Gets the important value for this WsMailInfo.
     * 
     * @return important
     */
    public boolean isImportant() {
        return important;
    }


    /**
     * Sets the important value for this WsMailInfo.
     * 
     * @param important
     */
    public void setImportant(boolean important) {
        this.important = important;
    }


    /**
     * Gets the mhtContent value for this WsMailInfo.
     * 
     * @return mhtContent
     */
    public boolean isMhtContent() {
        return mhtContent;
    }


    /**
     * Sets the mhtContent value for this WsMailInfo.
     * 
     * @param mhtContent
     */
    public void setMhtContent(boolean mhtContent) {
        this.mhtContent = mhtContent;
    }


    /**
     * Gets the senderEmail value for this WsMailInfo.
     * 
     * @return senderEmail
     */
    public java.lang.String getSenderEmail() {
        return senderEmail;
    }


    /**
     * Sets the senderEmail value for this WsMailInfo.
     * 
     * @param senderEmail
     */
    public void setSenderEmail(java.lang.String senderEmail) {
        this.senderEmail = senderEmail;
    }


    /**
     * Gets the subject value for this WsMailInfo.
     * 
     * @return subject
     */
    public java.lang.String getSubject() {
        return subject;
    }


    /**
     * Sets the subject value for this WsMailInfo.
     * 
     * @param subject
     */
    public void setSubject(java.lang.String subject) {
        this.subject = subject;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof WsMailInfo)) return false;
        WsMailInfo other = (WsMailInfo) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            this.attachCount == other.getAttachCount() &&
            this.htmlContent == other.isHtmlContent() &&
            this.important == other.isImportant() &&
            this.mhtContent == other.isMhtContent() &&
            ((this.senderEmail==null && other.getSenderEmail()==null) || 
             (this.senderEmail!=null &&
              this.senderEmail.equals(other.getSenderEmail()))) &&
            ((this.subject==null && other.getSubject()==null) || 
             (this.subject!=null &&
              this.subject.equals(other.getSubject())));
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
        _hashCode += getAttachCount();
        _hashCode += (isHtmlContent() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        _hashCode += (isImportant() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        _hashCode += (isMhtContent() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        if (getSenderEmail() != null) {
            _hashCode += getSenderEmail().hashCode();
        }
        if (getSubject() != null) {
            _hashCode += getSubject().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(WsMailInfo.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "WsMailInfo"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("attachCount");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "attachCount"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("htmlContent");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "htmlContent"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("important");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "important"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("mhtContent");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "mhtContent"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("senderEmail");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "senderEmail"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("subject");
        elemField.setXmlName(new javax.xml.namespace.QName("http://service.mail.ss.branch.neo.hanwha", "subject"));
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
