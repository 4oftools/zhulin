package com.zhulin.controller;

import com.zhulin.model.Learning;
import com.zhulin.service.LearningService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing Learning entities.
 * Provides REST endpoints for CRUD operations on Learnings.
 */
@RestController
@RequestMapping("/api/learnings")
@CrossOrigin(origins = "*")
public class LearningController {
    private static final Logger logger = LoggerFactory.getLogger(LearningController.class);
    private final LearningService learningService;

    public LearningController(LearningService learningService) {
        this.learningService = learningService;
    }

    /**
     * Retrieve all learnings.
     *
     * @return List of all learnings
     */
    @GetMapping
    public List<Learning> getAllLearnings() {
        logger.info("Request to get all learnings");
        return learningService.findAll();
    }

    /**
     * Retrieve a learning by its ID.
     *
     * @param id The ID of the learning
     * @return ResponseEntity containing the learning if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Learning> getLearningById(@PathVariable String id) {
        logger.info("Request to get learning by id: {}", id);
        return learningService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new learning.
     *
     * @param learning The learning to create
     * @return The created learning
     */
    @PostMapping
    public Learning createLearning(@Valid @RequestBody Learning learning) {
        logger.info("Request to create new learning: {}", learning.getTitle());
        return learningService.save(learning);
    }

    /**
     * Update an existing learning.
     *
     * @param id       The ID of the learning to update
     * @param learning The updated learning object
     * @return ResponseEntity containing the updated learning if found, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Learning> updateLearning(@PathVariable String id, @Valid @RequestBody Learning learning) {
        logger.info("Request to update learning with id: {}", id);
        if (!learningService.findById(id).isPresent()) {
            logger.warn("Learning with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }
        learning.setId(id);
        return ResponseEntity.ok(learningService.save(learning));
    }

    /**
     * Delete a learning by its ID.
     *
     * @param id The ID of the learning to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearning(@PathVariable String id) {
        logger.info("Request to delete learning with id: {}", id);
        if (!learningService.findById(id).isPresent()) {
            logger.warn("Learning with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        learningService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
