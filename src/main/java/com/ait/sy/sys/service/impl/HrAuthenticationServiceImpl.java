package com.ait.sy.sys.service.impl;

import com.ait.hrm.empinfo.mapper.HrEmployeeMapper;
import com.ait.hrm.empinfo.mapper.HrPersonalInfoMapper;
import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.hrm.empinfo.model.HrPersonalInfo;
import com.ait.org.orgManage.mapper.HrDepartmentMapper;
import com.ait.org.orgManage.model.HrDepartment;
import com.ait.sy.syRole.mapper.SyUserMapper;
import com.ait.sy.syRole.model.SyUser;
import com.ait.sy.sys.service.HrAuthenticationService;
import com.ait.sy.sys.service.RateLimitingService;
import com.ait.util.CsrfUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HrAuthenticationServiceImpl implements HrAuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(HrAuthenticationServiceImpl.class);

    @Autowired
    private SyUserMapper syUserMapper;

    @Autowired
    private HrEmployeeMapper hrEmployeeMapper;

    @Autowired
    private HrDepartmentMapper hrDepartmentMapper;

    @Autowired
    private HrPersonalInfoMapper hrPersonalInfoMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RateLimitingService rateLimitingService;

    @Autowired
    private CsrfUtil csrfUtil;

    @Override
    public HrUserInfo authenticate(String username, String password) {
        return authenticate(username, password, null, null);
    }

    public HrUserInfo authenticate(String username, String password, HttpServletRequest request, HttpSession session) {
        try {
            String clientIp = getClientIpAddress(request);
            // Bỏ tính năng khóa tài khoản/IP khi đăng nhập sai nhiều lần
            // if (!rateLimitingService.isAllowed(clientIp, "login")) {
            //     logger.warn("Rate limit exceeded for IP={}", clientIp);
            //     throw new SecurityException("Qua nhieu lan dang nhap that bai. Vui long thu lai sau 15 phut.");
            // }

            if (username == null || username.trim().isEmpty()) {
                recordFailedLogin(clientIp, "login");
                throw new IllegalArgumentException("Ten dang nhap khong duoc de trong");
            }

            if (password == null || password.trim().isEmpty()) {
                recordFailedLogin(clientIp, "login");
                throw new IllegalArgumentException("Mat khau khong duoc de trong");
            }

            SyUser syUser = syUserMapper.findByUserName(username.trim());
            if (syUser == null) {
                recordFailedLogin(clientIp, "login");
                logger.warn("Login attempt with non-existent username={}", username);
                return null;
            }

            if (!syUser.isActive()) {
                recordFailedLogin(clientIp, "login");
                logger.warn("Login attempt with inactive user={}", username);
                return null;
            }

            // Kiểm tra mật khẩu: ưu tiên BCrypt, fallback sang plain text cho DB cũ
            boolean passwordMatches = syUser.matchesPassword(password, passwordEncoder);
            if (!passwordMatches) {
                // Fallback: so sánh plain text (đối với mật khẩu chưa mã hóa từ DB cũ)
                @SuppressWarnings("deprecation")
                boolean plainMatch = syUser.matchesPassword(password);
                if (!plainMatch) {
                    recordFailedLogin(clientIp, "login");
                    logger.warn("Invalid password for user={}", username);
                    return null;
                }
            }

            HrEmployee hrEmployee = hrEmployeeMapper.findByPersonId(syUser.getPersonId());
            if (hrEmployee == null) {
                recordFailedLogin(clientIp, "login");
                logger.warn("No employee found for user={}", username);
                return null;
            }

            if (!hrEmployee.isActive()) {
                recordFailedLogin(clientIp, "login");
                logger.warn("Inactive employee for user={}", username);
                return null;
            }

            HrPersonalInfo hrPersonalInfo = hrPersonalInfoMapper.findByPersonId(syUser.getPersonId());
            if (hrPersonalInfo == null) {
                recordFailedLogin(clientIp, "login");
                logger.warn("No personal info found for user={}", username);
                return null;
            }

            HrDepartment hrDepartment = hrDepartmentMapper.findByDeptNo(hrEmployee.getDeptNo());
            if (hrDepartment == null) {
                recordFailedLogin(clientIp, "login");
                logger.warn("No department found for user={}", username);
                return null;
            }

            if (!hrDepartment.isActive()) {
                recordFailedLogin(clientIp, "login");
                logger.warn("Inactive department for user={}", username);
                return null;
            }

            syUserMapper.updateLastLogin(syUser.getUserNo());

            if (session != null) {
                csrfUtil.saveCsrfToken(session);
                // Nếu mật khẩu chưa mã hóa → yêu cầu đổi mật khẩu bắt buộc
                if (!syUser.isPasswordEncrypted()) {
                    session.setAttribute("requirePasswordChange", true);
                    logger.info("Plain-text password detected for user={}, requirePasswordChange=true", username);
                }
            }

            rateLimitingService.resetRateLimit(clientIp, "login");
            logger.info("Successful login for user={} from IP={}", username, clientIp);

            return new HrUserInfo(syUser, hrEmployee, hrDepartment, hrPersonalInfo);
        } catch (SecurityException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Authentication flow failed for username={}", username, e);
            throw new RuntimeException("Loi he thong khi xac thuc dang nhap.", e);
        }
    }

    @Override
    public HrUserInfo findByUsername(String username) {
        try {
            SyUser syUser = syUserMapper.findByUserName(username);
            if (syUser == null) {
                return null;
            }

            HrEmployee hrEmployee = hrEmployeeMapper.findByPersonId(syUser.getPersonId());
            if (hrEmployee == null) {
                return null;
            }

            HrPersonalInfo hrPersonalInfo = hrPersonalInfoMapper.findByPersonId(syUser.getPersonId());
            if (hrPersonalInfo == null) {
                return null;
            }

            HrDepartment hrDepartment = hrDepartmentMapper.findByDeptNo(hrEmployee.getDeptNo());
            if (hrDepartment == null) {
                return null;
            }

            return new HrUserInfo(syUser, hrEmployee, hrDepartment, hrPersonalInfo);
        } catch (Exception e) {
            logger.error("Failed to find user info by username={}", username, e);
            throw new RuntimeException("Loi he thong khi lay thong tin user.", e);
        }
    }

    @Override
    public HrUserInfo findByPersonId(String personId) {
        try {
            SyUser syUser = syUserMapper.findByPersonId(personId);
            if (syUser == null) {
                return null;
            }

            HrEmployee hrEmployee = hrEmployeeMapper.findByPersonId(personId);
            if (hrEmployee == null) {
                return null;
            }

            HrPersonalInfo hrPersonalInfo = hrPersonalInfoMapper.findByPersonId(syUser.getPersonId());
            if (hrPersonalInfo == null) {
                return null;
            }

            HrDepartment hrDepartment = hrDepartmentMapper.findByDeptNo(hrEmployee.getDeptNo());
            if (hrDepartment == null) {
                return null;
            }

            return new HrUserInfo(syUser, hrEmployee, hrDepartment, hrPersonalInfo);
        } catch (Exception e) {
            logger.error("Failed to find user info by personId={}", personId, e);
            throw new RuntimeException("Loi he thong khi lay thong tin user theo personId.", e);
        }
    }

    @Override
    public boolean updateLastLogin(String userNo) {
        try {
            int result = syUserMapper.updateLastLogin(userNo);
            return result > 0;
        } catch (Exception e) {
            logger.error("Failed to update last login for userNo={}", userNo, e);
            throw new RuntimeException("Loi he thong khi cap nhat thoi gian dang nhap.", e);
        }
    }

    @Override
    public boolean existsByUsername(String username) {
        try {
            return syUserMapper.existsByUserName(username);
        } catch (Exception e) {
            logger.error("Failed to check username existence username={}", username, e);
            throw new RuntimeException("Loi he thong khi kiem tra username.", e);
        }
    }

    private void recordFailedLogin(String clientIp, String operation) {
        rateLimitingService.recordRequest(clientIp, operation);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        // Security-sensitive flow (rate limit): avoid trusting user-controlled forwarded headers.
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr == null || remoteAddr.isBlank()) ? "unknown" : remoteAddr;
    }

    public boolean validateCsrfToken(HttpServletRequest request) {
        return csrfUtil.validateCsrfToken(request);
    }

    public int getRemainingLoginAttempts(HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);
        return rateLimitingService.getRemainingAttempts(clientIp, "login");
    }

    public long getTimeUntilRateLimitReset(HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);
        return rateLimitingService.getTimeUntilReset(clientIp, "login");
    }
}
