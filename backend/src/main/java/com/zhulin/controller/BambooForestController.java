package com.zhulin.controller;

import com.zhulin.model.BambooForest;
import com.zhulin.service.BambooForestService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing BambooForest entities.
 * Provides REST endpoints for CRUD operations on BambooForests.
 */
@RestController
@RequestMapping("/api/forests")
@CrossOrigin(origins = "*")
public class BambooForestController {
    private static final Logger logger = LoggerFactory.getLogger(BambooForestController.class);
    private final BambooForestService bambooForestService;

    public BambooForestController(BambooForestService bambooForestService) {
        this.bambooForestService = bambooForestService;
    }

    /**
     * Retrieve all bamboo forests.
     *
     * @return List of all bamboo forests
     */
    @GetMapping
    public List<BambooForest> getAllForests() {
        logger.info("Request to get all bamboo forests");
        return bambooForestService.findAll();
    }

    /**
     * Retrieve a bamboo forest by its ID.
     *
     * @param id The ID of the bamboo forest
     * @return ResponseEntity containing the forest if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<BambooForest> getForestById(@PathVariable String id) {
        logger.info("Request to get bamboo forest by id: {}", id);
        return bambooForestService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new bamboo forest.
     *
     * @param bambooForest The bamboo forest to create
     * @return The created bamboo forest
     */
    @PostMapping
    public BambooForest createForest(@Valid @RequestBody BambooForest bambooForest) {
        logger.info("Request to create new bamboo forest: {}", bambooForest.getName());
        return bambooForestService.save(bambooForest);
    }

    /**
     * Update an existing bamboo forest.
     *
     * @param id           The ID of the forest to update
     * @param bambooForest The updated forest object
     * @return ResponseEntity containing the updated forest if found, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<BambooForest> updateForest(@PathVariable String id, @Valid @RequestBody BambooForest bambooForest) {
        logger.info("Request to update bamboo forest with id: {}", id);
        if (!bambooForestService.findById(id).isPresent()) {
            logger.warn("Bamboo forest with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }
        bambooForest.setId(id);
        return ResponseEntity.ok(bambooForestService.save(bambooForest));
    }

    /**
     * Delete a bamboo forest by its ID.
     *
     * @param id The ID of the forest to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForest(@PathVariable String id) {
        logger.info("Request to delete bamboo forest with id: {}", id);
        if (!bambooForestService.findById(id).isPresent()) {
            logger.warn("Bamboo forest with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        bambooForestService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
