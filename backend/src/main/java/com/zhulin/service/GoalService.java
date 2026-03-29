package com.zhulin.service;

import com.zhulin.model.Goal;
import com.zhulin.repository.GoalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing Goal entities.
 * Handles business logic for Goal operations including transaction management.
 */
@Service
@Transactional
public class GoalService {
    private static final Logger logger = LoggerFactory.getLogger(GoalService.class);
    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    /**
     * Retrieve all goals from the database.
     *
     * @return List of all goals
     */
    public List<Goal> findAll() {
        logger.debug("Fetching all goals from repository");
        return goalRepository.findAll();
    }

    /**
     * Find a goal by its ID.
     *
     * @param id The ID of the goal
     * @return Optional containing the goal if found
     */
    public Optional<Goal> findById(String id) {
        logger.debug("Fetching goal by id: {}", id);
        return goalRepository.findById(id);
    }

    /**
     * Save a goal entity.
     *
     * @param goal The goal to save
     * @return The saved goal
     */
    public Goal save(Goal incoming) {
        logger.debug("Saving goal: {}", incoming.getName());
        if (incoming.getId() != null && goalRepository.existsById(incoming.getId())) {
            Goal existing = goalRepository.findById(incoming.getId()).get();
            existing.setName(incoming.getName());
            existing.setDescription(incoming.getDescription());
            existing.setForestId(incoming.getForestId());
            boolean was = Boolean.TRUE.equals(existing.getCompleted());
            existing.setCompleted(incoming.getCompleted());
            boolean now = Boolean.TRUE.equals(existing.getCompleted());
            if (now && !was) {
                existing.setCompletedAt(LocalDateTime.now());
            } else if (!now) {
                existing.setCompletedAt(null);
            }
            Goal saved = goalRepository.save(existing);
            logger.info("Goal updated successfully with id: {}", saved.getId());
            return saved;
        }
        if (Boolean.TRUE.equals(incoming.getCompleted())) {
            incoming.setCompletedAt(LocalDateTime.now());
        } else {
            incoming.setCompletedAt(null);
        }
        Goal saved = goalRepository.save(incoming);
        logger.info("Goal saved successfully with id: {}", saved.getId());
        return saved;
    }

    /**
     * Delete a goal by its ID.
     *
     * @param id The ID of the goal to delete
     */
    public void deleteById(String id) {
        logger.debug("Deleting goal with id: {}", id);
        goalRepository.deleteById(id);
        logger.info("Goal deleted successfully with id: {}", id);
    }
}
