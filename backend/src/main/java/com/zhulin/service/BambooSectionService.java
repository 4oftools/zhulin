package com.zhulin.service;

import com.zhulin.model.BambooSection;
import com.zhulin.repository.BambooSectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing BambooSection entities.
 * Handles business logic for BambooSection (Task) operations including transaction management.
 */
@Service
@Transactional
public class BambooSectionService {
    private static final Logger logger = LoggerFactory.getLogger(BambooSectionService.class);
    private final BambooSectionRepository bambooSectionRepository;

    public BambooSectionService(BambooSectionRepository bambooSectionRepository) {
        this.bambooSectionRepository = bambooSectionRepository;
    }

    /**
     * Retrieve all bamboo sections from the database.
     *
     * @return List of all bamboo sections
     */
    public List<BambooSection> findAll() {
        logger.debug("Fetching all bamboo sections from repository");
        return bambooSectionRepository.findAll();
    }

    /**
     * Find a bamboo section by its ID.
     *
     * @param id The ID of the bamboo section
     * @return Optional containing the section if found
     */
    public Optional<BambooSection> findById(String id) {
        logger.debug("Fetching bamboo section by id: {}", id);
        return bambooSectionRepository.findById(id);
    }

    /**
     * Save a bamboo section entity.
     *
     * @param bambooSection The bamboo section to save
     * @return The saved bamboo section
     */
    public BambooSection save(BambooSection bambooSection) {
        logger.debug("Saving bamboo section: {}", bambooSection.getName());
        BambooSection saved = bambooSectionRepository.save(bambooSection);
        logger.info("Bamboo section saved successfully with id: {}", saved.getId());
        return saved;
    }

    /**
     * Delete a bamboo section by its ID.
     *
     * @param id The ID of the section to delete
     */
    public void deleteById(String id) {
        logger.debug("Deleting bamboo section with id: {}", id);
        bambooSectionRepository.deleteById(id);
        logger.info("Bamboo section deleted successfully with id: {}", id);
    }
}
