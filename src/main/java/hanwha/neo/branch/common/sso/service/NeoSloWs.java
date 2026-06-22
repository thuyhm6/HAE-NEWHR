/**
 * NeoSloWs.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.common.sso.service;

public interface NeoSloWs extends java.rmi.Remote {
    public java.lang.String create(java.lang.String id, java.lang.String type, java.lang.String target) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public java.lang.String login(java.lang.String otaId, java.lang.String target) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
}
