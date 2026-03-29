package com.zhulin.service;

import com.zhulin.model.Bamboo;
import com.zhulin.repository.BambooRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.zhulin.model.BambooSection;

/**
 * Service class for managing Bamboo entities.
 * Handles business logic for Bamboo operations including transaction management.
 */
@Service
@Transactional
public class BambooService {
    private static final Logger logger = LoggerFactory.getLogger(BambooService.class);
    private final BambooRepository bambooRepository;

    public BambooService(BambooRepository bambooRepository) {
        this.bambooRepository = bambooRepository;
    }

    /**
     * Retrieve all bamboos from the database.
     * Initializes associated tasks and their tags.
     *
     * @return List of all bamboos
     */
    public List<Bamboo> findAll() {
        logger.debug("Fetching all bamboos from repository");
        List<Bamboo> bamboos = bambooRepository.findAll();
        bamboos.forEach(this::initializeBamboo);
        return bamboos;
    }

    /**
     * Find a bamboo by its ID.
     * Initializes associated tasks and their tags if found.
     *
     * @param id The ID of the bamboo
     * @return Optional containing the bamboo if found
     */
    public Optional<Bamboo> findById(String id) {
        logger.debug("Fetching bamboo by id: {}", id);
        Optional<Bamboo> bamboo = bambooRepository.findById(id);
        bamboo.ifPresent(this::initializeBamboo);
        return bamboo;
    }

    /**
     * Save a bamboo entity.
     * Generates IDs for bamboo and tasks if they are new.
     * Handles updating existing bamboo and synchronizing its sections (create/update/delete).
     *
     * @param bamboo The bamboo to save
     * @return The saved bamboo
     */
    public Bamboo save(Bamboo bamboo) {
        logger.debug("Saving bamboo: {}", bamboo.getName());

        // 1. Check if it's an update for an existing bamboo
        if (bamboo.getId() != null) {
            Optional<Bamboo> existingOpt = bambooRepository.findById(bamboo.getId());
            if (existingOpt.isPresent()) {
                Bamboo existing = existingOpt.get();
                logger.debug("Updating existing bamboo: {}", existing.getId());
                
                // Update scalar fields
                boolean wasCompleted = Boolean.TRUE.equals(existing.getCompleted());
                boolean wasArchived = Boolean.TRUE.equals(existing.getArchived());
                existing.setName(bamboo.getName());
                existing.setStartDate(bamboo.getStartDate());
                existing.setEndDate(bamboo.getEndDate());
                existing.setDescription(bamboo.getDescription());
                existing.setCompleted(bamboo.getCompleted());
                if (Boolean.TRUE.equals(bamboo.getCompleted()) && !wasCompleted) {
                    existing.setCompletedAt(LocalDateTime.now());
                } else if (!Boolean.TRUE.equals(bamboo.getCompleted())) {
                    existing.setCompletedAt(null);
                }
                existing.setArchived(bamboo.getArchived());
                if (Boolean.TRUE.equals(bamboo.getArchived()) && !wasArchived) {
                    existing.setArchivedAt(LocalDateTime.now());
                } else if (!Boolean.TRUE.equals(bamboo.getArchived())) {
                    existing.setArchivedAt(null);
                }
                existing.setFieldId(bamboo.getFieldId());
                existing.setGoalId(bamboo.getGoalId());
                existing.setInActivityList(bamboo.getInActivityList());

                // Update sections (tasks)
                updateSections(existing, bamboo.getTasks());

                Bamboo saved = bambooRepository.save(existing);
                initializeBamboo(saved);
                logger.info("Bamboo updated successfully with id: {}", saved.getId());
                return saved;
            }
        }

        // 2. It's a create (or ID not found, treat as new)
        if (bamboo.getId() == null || bamboo.getId().isEmpty()) {
            bamboo.setId(UUID.randomUUID().toString());
            logger.debug("Generated new ID for bamboo: {}", bamboo.getId());
        }
        
        if (bamboo.getTasks() != null) {
            bamboo.getTasks().forEach(task -> {
                task.setBambooId(bamboo.getId());
                if (task.getId() == null || task.getId().isEmpty()) {
                    task.setId(UUID.randomUUID().toString());
                    logger.debug("Generated new ID for task: {}", task.getId());
                }
                applyNewSectionCompletedAt(task);
            });
        }
        if (Boolean.TRUE.equals(bamboo.getCompleted())) {
            bamboo.setCompletedAt(LocalDateTime.now());
        } else {
            bamboo.setCompletedAt(null);
        }
        if (Boolean.TRUE.equals(bamboo.getArchived())) {
            bamboo.setArchivedAt(LocalDateTime.now());
        } else {
            bamboo.setArchivedAt(null);
        }

        Bamboo saved = bambooRepository.save(bamboo);
        initializeBamboo(saved);
        logger.info("Bamboo saved successfully with id: {}", saved.getId());
        return saved;
    }

    /**
     * Synchronize sections: update existing, create new, remove missing.
     */
    private void updateSections(Bamboo existingBamboo, List<BambooSection> newSections) {
        if (newSections == null) {
            existingBamboo.getTasks().clear();
            return;
        }

        // Map existing sections by ID
        Map<String, BambooSection> existingMap = existingBamboo.getTasks().stream()
                .collect(Collectors.toMap(BambooSection::getId, Function.identity()));
        
        List<BambooSection> updatedList = new ArrayList<>();
        
        for (BambooSection newSection : newSections) {
            if (newSection.getId() != null && existingMap.containsKey(newSection.getId())) {
                // Update existing
                BambooSection existingSection = existingMap.get(newSection.getId());
                updateSectionFields(existingSection, newSection);
                updatedList.add(existingSection);
            } else {
                // Create new
                if (newSection.getId() == null || newSection.getId().isEmpty()) {
                    newSection.setId(UUID.randomUUID().toString());
                }
                newSection.setBambooId(existingBamboo.getId());
                applyNewSectionCompletedAt(newSection);
                updatedList.add(newSection);
            }
        }
        
        // Replace the list content to trigger orphanRemoval for missing items
        existingBamboo.getTasks().clear();
        existingBamboo.getTasks().addAll(updatedList);
    }

    private void updateSectionFields(BambooSection existing, BambooSection newer) {
        existing.setName(newer.getName());
        existing.setDescription(newer.getDescription());
        existing.setType(newer.getType());
        existing.setStatus(newer.getStatus());
        existing.setPriority(newer.getPriority());
        existing.setEstimatedDuration(newer.getEstimatedDuration());
        existing.setActualDuration(newer.getActualDuration());
        existing.setTags(newer.getTags());
        boolean wasCompleted = Boolean.TRUE.equals(existing.getCompleted());
        existing.setCompleted(newer.getCompleted());
        boolean nowCompleted = Boolean.TRUE.equals(existing.getCompleted());
        if (nowCompleted && !wasCompleted) {
            existing.setCompletedAt(LocalDateTime.now());
        } else if (!nowCompleted) {
            existing.setCompletedAt(null);
        }
        existing.setDueDate(newer.getDueDate());
        existing.setPeriod(newer.getPeriod());
        existing.setGoalId(newer.getGoalId());
    }

    /**
     * Delete a bamboo by its ID.
     *
     * @param id The ID of the bamboo to delete
     */
    public void deleteById(String id) {
        logger.debug("Deleting bamboo with id: {}", id);
        bambooRepository.deleteById(id);
        logger.info("Bamboo deleted successfully with id: {}", id);
    }

    /**
     * Initialize lazy-loaded collections for a bamboo.
     *
     * @param bamboo The bamboo to initialize
     */
    private void initializeBamboo(Bamboo bamboo) {
        Hibernate.initialize(bamboo.getTasks());
        bamboo.getTasks().forEach(task -> Hibernate.initialize(task.getTags()));
    }

    private void applyNewSectionCompletedAt(BambooSection section) {
        if (Boolean.TRUE.equals(section.getCompleted())) {
            section.setCompletedAt(LocalDateTime.now());
        } else {
            section.setCompletedAt(null);
        }
    }
}
