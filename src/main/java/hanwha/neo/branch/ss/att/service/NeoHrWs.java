package hanwha.neo.branch.ss.att.service;

public interface NeoHrWs extends java.rmi.Remote {
    public java.lang.String syncHrOffData(hanwha.neo.branch.ss.att.vo.SyncHrOffDataRequest request)
            throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException;
}
