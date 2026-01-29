package com.zhulin.service;

import com.zhulin.model.Learning;
import com.zhulin.repository.LearningRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing Learning entities.
 * Handles business logic for Learning operations including transaction management.
 */
@Service
@Transactional
public class LearningService {
    private static final Logger logger = LoggerFactory.getLogger(LearningService.class);
    private final LearningRepository learningRepository;

    public LearningService(LearningRepository learningRepository) {
        this.learningRepository = learningRepository;
    }

    /**
     * Retrieve all learnings from the database.
     *
     * @return List of all learnings
     */
    public List<Learning> findAll() {
        logger.debug("Fetching all learnings from repository");
        return learningRepository.findAll();
    }

    /**
     * Find a learning by its ID.
     *
     * @param id The ID of the learning
     * @return Optional containing the learning if found
     */
    public Optional<Learning> findById(String id) {
        logger.debug("Fetching learning by id: {}", id);
        return learningRepository.findById(id);
    }

    /**
     * Save a learning entity.
     *
     * @param learning The learning to save
     * @return The saved learning
     */
    public Learning save(Learning learning) {
        logger.debug("Saving learning: {}", learning.getTitle());
        Learning saved = learningRepository.save(learning);
        logger.info("Learning saved successfully with id: {}", saved.getId());
        return saved;
    }

    /**
     * Delete a learning by its ID.
     *
     * @param id The ID of the learning to delete
     */
    public void deleteById(String id) {
        logger.debug("Deleting learning with id: {}", id);
        learningRepository.deleteById(id);
        logger.info("Learning deleted successfully with id: {}", id);
    }
}
