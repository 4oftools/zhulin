package com.zhulin.controller;

import com.zhulin.model.BambooSection;
import com.zhulin.service.BambooSectionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing BambooSection entities.
 * Provides REST endpoints for CRUD operations on BambooSections (Tasks).
 */
@RestController
@RequestMapping("/api/sections")
@CrossOrigin(origins = "*")
public class BambooSectionController {
    private static final Logger logger = LoggerFactory.getLogger(BambooSectionController.class);
    private final BambooSectionService bambooSectionService;

    public BambooSectionController(BambooSectionService bambooSectionService) {
        this.bambooSectionService = bambooSectionService;
    }

    /**
     * Retrieve all bamboo sections (tasks).
     *
     * @return List of all bamboo sections
     */
    @GetMapping
    public List<BambooSection> getAllSections() {
        logger.info("Request to get all bamboo sections");
        return bambooSectionService.findAll();
    }

    /**
     * Retrieve a bamboo section by its ID.
     *
     * @param id The ID of the bamboo section
     * @return ResponseEntity containing the section if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<BambooSection> getSectionById(@PathVariable String id) {
        logger.info("Request to get bamboo section by id: {}", id);
        return bambooSectionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new bamboo section.
     *
     * @param bambooSection The bamboo section to create
     * @return The created bamboo section
     */
    @PostMapping
    public BambooSection createSection(@Valid @RequestBody BambooSection bambooSection) {
        logger.info("Request to create new bamboo section: {}", bambooSection.getName());
        return bambooSectionService.save(bambooSection);
    }

    /**
     * Update an existing bamboo section.
     *
     * @param id            The ID of the section to update
     * @param bambooSection The updated section object
     * @return ResponseEntity containing the updated section if found, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<BambooSection> updateSection(@PathVariable String id, @Valid @RequestBody BambooSection bambooSection) {
        logger.info("Request to update bamboo section with id: {}", id);
        if (!bambooSectionService.findById(id).isPresent()) {
            logger.warn("Bamboo section with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }
        bambooSection.setId(id);
        return ResponseEntity.ok(bambooSectionService.save(bambooSection));
    }

    /**
     * Delete a bamboo section by its ID.
     *
     * @param id The ID of the section to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable String id) {
        logger.info("Request to delete bamboo section with id: {}", id);
        if (!bambooSectionService.findById(id).isPresent()) {
            logger.warn("Bamboo section with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        bambooSectionService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
