ALTER TABLE ORG_RESUME_INFO ADD CHANGE_DATE_D DATE;
UPDATE ORG_RESUME_INFO SET CHANGE_DATE = '';
UPDATE ORG_RESUME_INFO SET CHANGE_DATE_D = TO_DATE(CHANGE_DATE, 'DD/MM/YYYY');
ALTER TABLE ORG_RESUME_INFO DROP COLUMN CHANGE_DATE_D;

# Thay đổi trong PKG_RESUME_PROCESS.
V_LIMIT_DATE VARCHAR2(20); đổi thành V_LIMIT_DATE DATE;
SELECT NVL(MAX(ORG.CHANGE_DATE), '1949.01.01') đổi thành SELECT NVL(MAX(ORG.CHANGE_DATE), TO_DATE('1949.01.01','YYYY.MM.DD'))
AND (DATE_LEFT IS NULL OR TO_CHAR(DATE_LEFT, 'YYYY.MM.DD') > V_LIMIT_DATE); đổi thành AND (DATE_LEFT IS NULL OR DATE_LEFT > V_LIMIT_DATE);

# menu
org0301 đổi thành /org/orgManage/viewOrgBusiness
org0302 đổi thành /org/orgManage/viewOrgCostCenter

ess0000	\assets\images\icon\ess.png
ar0000	\assets\images\icon\attendance.png
hr0000	\assets\images\icon\hr.png
org0000	\assets\images\icon\org.png
pa0000	\assets\images\icon\payroll.png
edu0000	\assets\images\icon\training.png
evs0000	\assets\images\icon\evs.png
rpt0000	\assets\images\icon\report.png
sy0000	\assets\images\icon\system.png

/sys/rightsManagement/viewRolesGroup?SYS_TYPE=0 đổi thành /sys/syRole/viewRolesGroup?SYS_TYPE=0
/sys/rightsManagement/viewSyRolesGroupList?SYS_TYPE=0 đổi thành /sys/syRole/viewSyRolesGroupList?SYS_TYPE=0
/sys/rightsManagement/viewLoginUser đổi thành /sys/syRole/viewLoginUser

/ess/infoApplyLeave/viewCheckAttencetanceExForBatchList đổi thành /ess/infoApplyAttendance/viewCheckAttencetanceExForBatchList

bảng ESS_OT_APPLY_TB_EXCEL_TEMP đổi UPLOAD_DATE thành date

