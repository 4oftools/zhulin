package com.zhulin.controller;

import com.zhulin.model.Goal;
import com.zhulin.service.GoalService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing Goal entities.
 * Provides REST endpoints for CRUD operations on Goals.
 */
@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {
    private static final Logger logger = LoggerFactory.getLogger(GoalController.class);
    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    /**
     * Retrieve all goals.
     *
     * @return List of all goals
     */
    @GetMapping
    public List<Goal> getAllGoals() {
        logger.info("Request to get all goals");
        return goalService.findAll();
    }

    /**
     * Retrieve a goal by its ID.
     *
     * @param id The ID of the goal
     * @return ResponseEntity containing the goal if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable String id) {
        logger.info("Request to get goal by id: {}", id);
        return goalService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new goal.
     *
     * @param goal The goal to create
     * @return The created goal
     */
    @PostMapping
    public Goal createGoal(@Valid @RequestBody Goal goal) {
        logger.info("Request to create new goal: {}", goal.getName());
        return goalService.save(goal);
    }

    /**
     * Update an existing goal.
     *
     * @param id   The ID of the goal to update
     * @param goal The updated goal object
     * @return ResponseEntity containing the updated goal if found, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable String id, @Valid @RequestBody Goal goal) {
        logger.info("Request to update goal with id: {}", id);
        if (!goalService.findById(id).isPresent()) {
            logger.warn("Goal with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }
        goal.setId(id);
        return ResponseEntity.ok(goalService.save(goal));
    }

    /**
     * Delete a goal by its ID.
     *
     * @param id The ID of the goal to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable String id) {
        logger.info("Request to delete goal with id: {}", id);
        if (!goalService.findById(id).isPresent()) {
            logger.warn("Goal with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        goalService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
