/**
 * ApprovalService.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.axisws;

public interface ApprovalService extends java.rmi.Remote {
    public java.lang.String submitTempApproval(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo getOriginUserIDUseUserId(hanwha.neo.branch.ss.approval.vo.MisKey miskey, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo delegatedSignerInfo) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[] getListByUserKeyUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalUserKey approvalUserKey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public java.lang.String submitApprovalUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly[] getProcessIdByBulkMisId(hanwha.neo.branch.ss.approval.vo.MisKey[] miskey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public java.lang.String submitApproval(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus getStatusByMisId(hanwha.neo.branch.ss.approval.vo.MisKey miskey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public java.lang.String cancelApproval(hanwha.neo.branch.ss.approval.vo.CancelApprovalDocument cancelApprovalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo getOriginUserID(hanwha.neo.branch.ss.approval.vo.MisKey miskey, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo delegatedSignerInfo) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[] getListByUserKey(hanwha.neo.branch.ss.approval.vo.ApprovalUserKey approvalUserKey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
    public java.lang.String submitTempApprovalUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
}
