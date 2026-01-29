package com.zhulin.service;

import com.zhulin.model.BambooForest;
import com.zhulin.repository.BambooForestRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing BambooForest entities.
 * Handles business logic for BambooForest operations including transaction management and lazy loading initialization.
 */
@Service
@Transactional
public class BambooForestService {
    private static final Logger logger = LoggerFactory.getLogger(BambooForestService.class);
    private final BambooForestRepository bambooForestRepository;

    public BambooForestService(BambooForestRepository bambooForestRepository) {
        this.bambooForestRepository = bambooForestRepository;
    }

    /**
     * Retrieve all bamboo forests from the database.
     * Initializes associated fields, bamboos, tasks, goals, key outputs, and learnings.
     *
     * @return List of all bamboo forests
     */
    public List<BambooForest> findAll() {
        logger.debug("Fetching all bamboo forests from repository");
        List<BambooForest> forests = bambooForestRepository.findAll();
        forests.forEach(this::initializeForest);
        return forests;
    }

    /**
     * Find a bamboo forest by its ID.
     * Initializes associated collections if found.
     *
     * @param id The ID of the bamboo forest
     * @return Optional containing the forest if found
     */
    public Optional<BambooForest> findById(String id) {
        logger.debug("Fetching bamboo forest by id: {}", id);
        Optional<BambooForest> forest = bambooForestRepository.findById(id);
        forest.ifPresent(this::initializeForest);
        return forest;
    }

    /**
     * Save a bamboo forest entity.
     *
     * @param bambooForest The bamboo forest to save
     * @return The saved bamboo forest
     */
    public BambooForest save(BambooForest bambooForest) {
        logger.debug("Saving bamboo forest: {}", bambooForest.getName());
        BambooForest saved = bambooForestRepository.save(bambooForest);
        logger.info("Bamboo forest saved successfully with id: {}", saved.getId());
        return saved;
    }

    /**
     * Delete a bamboo forest by its ID.
     *
     * @param id The ID of the forest to delete
     */
    public void deleteById(String id) {
        logger.debug("Deleting bamboo forest with id: {}", id);
        bambooForestRepository.deleteById(id);
        logger.info("Bamboo forest deleted successfully with id: {}", id);
    }

    /**
     * Initialize lazy-loaded collections for a bamboo forest.
     * This ensures all nested data is available for the frontend.
     *
     * @param forest The bamboo forest to initialize
     */
    private void initializeForest(BambooForest forest) {
        Hibernate.initialize(forest.getBambooFields());
        forest.getBambooFields().forEach(field -> {
            Hibernate.initialize(field.getBamboos());
            field.getBamboos().forEach(bamboo -> {
                Hibernate.initialize(bamboo.getTasks());
                bamboo.getTasks().forEach(task -> Hibernate.initialize(task.getTags()));
            });
        });
        Hibernate.initialize(forest.getGoals());
        Hibernate.initialize(forest.getKeyOutputs());
        Hibernate.initialize(forest.getLearnings());
    }
}
