package com.zhulin.service;

import com.zhulin.model.BambooField;
import com.zhulin.repository.BambooFieldRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing BambooField entities.
 * Handles business logic for BambooField operations including transaction management and ordering.
 */
@Service
@Transactional
public class BambooFieldService {
    private static final Logger logger = LoggerFactory.getLogger(BambooFieldService.class);
    private final BambooFieldRepository bambooFieldRepository;

    public BambooFieldService(BambooFieldRepository bambooFieldRepository) {
        this.bambooFieldRepository = bambooFieldRepository;
    }

    /**
     * Retrieve all bamboo fields from the database.
     * Initializes associated bamboos, tasks, and tags.
     *
     * @return List of all bamboo fields
     */
    public List<BambooField> findAll() {
        logger.debug("Fetching all bamboo fields from repository");
        List<BambooField> fields = bambooFieldRepository.findAll();
        fields.forEach(this::initializeField);
        return fields;
    }

    /**
     * Find a bamboo field by its ID.
     * Initializes associated bamboos, tasks, and tags if found.
     *
     * @param id The ID of the bamboo field
     * @return Optional containing the field if found
     */
    public Optional<BambooField> findById(String id) {
        logger.debug("Fetching bamboo field by id: {}", id);
        Optional<BambooField> field = bambooFieldRepository.findById(id);
        field.ifPresent(this::initializeField);
        return field;
    }

    /**
     * Save a bamboo field entity.
     *
     * @param bambooField The bamboo field to save
     * @return The saved bamboo field
     */
    public BambooField save(BambooField bambooField) {
        logger.debug("Saving bamboo field: {}", bambooField.getName());
        BambooField saved = bambooFieldRepository.save(bambooField);
        logger.info("Bamboo field saved successfully with id: {}", saved.getId());
        return saved;
    }

    /**
     * Delete a bamboo field by its ID.
     *
     * @param id The ID of the field to delete
     */
    public void deleteById(String id) {
        logger.debug("Deleting bamboo field with id: {}", id);
        bambooFieldRepository.deleteById(id);
        logger.info("Bamboo field deleted successfully with id: {}", id);
    }

    /**
     * Update the order of bamboo fields.
     *
     * @param fields List of bamboo fields with updated order
     */
    public void updateFieldsOrder(List<BambooField> fields) {
        logger.debug("Updating order for {} fields", fields.size());
        for (int i = 0; i < fields.size(); i++) {
            BambooField fieldData = fields.get(i);
            Optional<BambooField> existing = bambooFieldRepository.findById(fieldData.getId());
            if (existing.isPresent()) {
                BambooField field = existing.get();
                field.setSortOrder(i);
                bambooFieldRepository.save(field);
            } else {
                logger.warn("Bamboo field with id {} not found during order update", fieldData.getId());
            }
        }
        logger.info("Bamboo fields order updated successfully");
    }

    /**
     * Initialize lazy-loaded collections for a bamboo field.
     *
     * @param field The bamboo field to initialize
     */
    private void initializeField(BambooField field) {
        Hibernate.initialize(field.getBamboos());
        field.getBamboos().forEach(bamboo -> {
            Hibernate.initialize(bamboo.getTasks());
            bamboo.getTasks().forEach(task -> Hibernate.initialize(task.getTags()));
        });
    }
}
