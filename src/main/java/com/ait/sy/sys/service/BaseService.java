package com.ait.sy.sys.service;

import com.ait.exception.BusinessException;
import com.ait.exception.TechnicalException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

/**
 * BaseService - Base service class với common functionality
 */
public abstract class BaseService<T, ID> {

    protected final Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * Find entity by ID
     */
    public abstract Optional<T> findById(ID id);

    /**
     * Find all entities
     */
    public abstract List<T> findAll();

    /**
     * Save entity
     */
    public abstract T save(T entity) throws BusinessException, TechnicalException;

    /**
     * Update entity
     */
    public abstract T update(T entity) throws BusinessException, TechnicalException;

    /**
     * Delete entity by ID
     */
    public abstract void deleteById(ID id) throws BusinessException, TechnicalException;

    /**
     * Check if entity exists
     */
    public abstract boolean existsById(ID id);

    /**
     * Validate entity before save
     */
    protected abstract void validateForSave(T entity) throws BusinessException;

    /**
     * Validate entity before update
     */
    protected abstract void validateForUpdate(T entity) throws BusinessException;

    /**
     * Validate entity before delete
     */
    protected abstract void validateForDelete(ID id) throws BusinessException;

    /**
     * Log operation
     */
    protected void logOperation(String operation, Object... params) {
        logger.debug("Performing {} operation with params: {}", operation, params);
    }

    /**
     * Log error
     */
    protected void logError(String operation, Exception e) {
        logger.error("Error during {} operation", operation, e);
    }

    /**
     * Handle business exception
     */
    protected void handleBusinessException(String operation, Exception e) throws BusinessException {
        logError(operation, e);
        if (e instanceof BusinessException) {
            throw (BusinessException) e;
        }
        throw BusinessException.invalidInput(operation, "Loi he thong khi xu ly du lieu.");
    }

    /**
     * Handle technical exception
     */
    protected void handleTechnicalException(String operation, Exception e) throws TechnicalException {
        logError(operation, e);
        if (e instanceof TechnicalException) {
            throw (TechnicalException) e;
        }
        throw TechnicalException.databaseQueryError(operation, e);
    }
}
