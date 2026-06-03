package com.ait.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ait.sy.sys.service.PerformanceMonitoringService;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

/**
 * LoggingAspect - AOP để tự động log tất cả method trong service layer
 */
@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

    @Autowired
    private PerformanceMonitoringService performanceMonitoringService;

    /**
     * Log tất cả method trong service layer (exclude PerformanceMonitoringService
     * to avoid recursion)
     */
    @Around("execution(* com.ait.service..*(..)) && !execution(* com.ait.service.PerformanceMonitoringService.*(..)) && !execution(* com.ait.service.LoggingService.*(..)) && !execution(* com.ait.service.MetricsService.*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        Object[] args = joinPoint.getArgs();

        // Xác định operation type dựa trên method name
        String operationType = getOperationType(methodName);
        String emoji = getOperationEmoji(operationType);

        // Log method entry
        logger.info("{} [{}] {}.{}() - Starting",
                emoji, operationType, className, methodName);

        // Log parameters (chỉ log non-sensitive data)
        if (args.length > 0) {
            String params = buildParameterString(args);
            if (!params.isEmpty()) {
                logger.debug("{} [{}] Parameters: {}", emoji, operationType, params);
            }
        }

        long startTime = System.currentTimeMillis();

        try {
            // Execute method
            Object result = joinPoint.proceed();

            long executionTime = System.currentTimeMillis() - startTime;
            String endTimeStr = LocalDateTime.now().format(TIME_FORMATTER);

            // Record performance metrics
            performanceMonitoringService.recordExecutionTime(className + "." + methodName, executionTime);

            // Log successful execution
            if (isVoidMethod(method)) {
                logger.info("✅ [{}] {}.{}() - Completed in {}ms ({})",
                        operationType, className, methodName, executionTime, endTimeStr);
            } else {
                String resultInfo = buildResultString(result);
                logger.info("✅ [{}] {}.{}() - Completed in {}ms ({}) -> {}",
                        operationType, className, methodName, executionTime, endTimeStr, resultInfo);
            }

            return result;

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            String endTimeStr = LocalDateTime.now().format(TIME_FORMATTER);

            // Log error
            logger.error("💥 [{}] {}.{}() - Failed in {}ms ({}) - Error: {}",
                    operationType, className, methodName, executionTime, endTimeStr, e.getClass().getSimpleName());

            // Log stack trace at debug level
            logger.debug("💥 [{}] Stack trace:", operationType, e);

            throw e;
        }
    }

    /**
     * Log tất cả method trong mapper layer (MyBatis)
     */
    // @Around("execution(* com.ait.mapper..*(..))") // Temporarily disabled to
    // avoid recursion
    public Object logMapperMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        Object[] args = joinPoint.getArgs();

        // Log mapper method call
        logger.debug("🗄️ [MAPPER] {}.{}() - Executing SQL", className, methodName);

        if (args.length > 0) {
            String params = buildParameterString(args);
            if (!params.isEmpty()) {
                logger.debug("🗄️ [MAPPER] Parameters: {}", params);
            }
        }

        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            // Record database query performance
            performanceMonitoringService.recordQueryTime(className + "." + methodName, executionTime);

            String resultInfo = buildResultString(result);
            logger.debug("✅ [MAPPER] {}.{}() - Completed in {}ms -> {}",
                    className, methodName, executionTime, resultInfo);

            return result;

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("💥 [MAPPER] {}.{}() - Failed in {}ms - Error: {}",
                    className, methodName, executionTime, e.getClass().getSimpleName());
            throw e;
        }
    }

    /**
     * Xác định loại operation dựa trên tên method
     */
    private String getOperationType(String methodName) {
        String lowerMethodName = methodName.toLowerCase();

        if (lowerMethodName.startsWith("create") || lowerMethodName.startsWith("insert") ||
                lowerMethodName.startsWith("add") || lowerMethodName.startsWith("save")) {
            return "CREATE";
        } else if (lowerMethodName.startsWith("update") || lowerMethodName.startsWith("modify") ||
                lowerMethodName.startsWith("edit") || lowerMethodName.startsWith("change")) {
            return "UPDATE";
        } else if (lowerMethodName.startsWith("delete") || lowerMethodName.startsWith("remove")) {
            return "DELETE";
        } else if (lowerMethodName.startsWith("find") || lowerMethodName.startsWith("get") ||
                lowerMethodName.startsWith("search") || lowerMethodName.startsWith("select") ||
                lowerMethodName.startsWith("list") || lowerMethodName.startsWith("count")) {
            return "READ";
        } else if (lowerMethodName.contains("auth") || lowerMethodName.contains("login") ||
                lowerMethodName.contains("logout")) {
            return "AUTH";
        } else {
            return "OPERATION";
        }
    }

    /**
     * Lấy emoji tương ứng với operation type
     */
    private String getOperationEmoji(String operationType) {
        switch (operationType) {
            case "CREATE":
                return "📝";
            case "UPDATE":
                return "✏️";
            case "DELETE":
                return "🗑️";
            case "READ":
                return "🔍";
            case "AUTH":
                return "🔐";
            default:
                return "⚙️";
        }
    }

    /**
     * Kiểm tra method có return void không
     */
    private boolean isVoidMethod(Method method) {
        return method.getReturnType() == void.class || method.getReturnType() == Void.class;
    }

    /**
     * Xây dựng string cho parameters
     */
    private String buildParameterString(Object[] args) {
        if (args == null || args.length == 0) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < args.length; i++) {
            if (i > 0)
                sb.append(", ");

            Object arg = args[i];
            if (arg == null) {
                sb.append("null");
            } else if (arg instanceof String) {
                // Mask sensitive data
                String str = (String) arg;
                if (str.toLowerCase().contains("password") || str.toLowerCase().contains("pwd")) {
                    sb.append("***");
                } else {
                    sb.append("\"").append(str).append("\"");
                }
            } else if (arg instanceof java.util.Collection) {
                sb.append("Collection[").append(((java.util.Collection<?>) arg).size()).append("]");
            } else if (arg.getClass().isArray()) {
                sb.append("Array[").append(Arrays.asList((Object[]) arg).size()).append("]");
            } else {
                sb.append(arg.toString());
            }
        }
        return sb.toString();
    }

    /**
     * Xây dựng string cho result
     */
    private String buildResultString(Object result) {
        if (result == null) {
            return "null";
        } else if (result instanceof java.util.Collection) {
            return "Collection[" + ((java.util.Collection<?>) result).size() + " items]";
        } else if (result.getClass().isArray()) {
            return "Array[" + Arrays.asList((Object[]) result).size() + " items]";
        } else if (result instanceof Boolean) {
            return result.toString();
        } else if (result instanceof Number) {
            return result.toString();
        } else {
            // Truncate long strings
            String resultStr = result.toString();
            if (resultStr.length() > 100) {
                return resultStr.substring(0, 100) + "...";
            }
            return resultStr;
        }
    }
}

