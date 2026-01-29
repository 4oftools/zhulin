package com.zhulin.controller;

import com.zhulin.model.Bamboo;
import com.zhulin.service.BambooService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing Bamboo entities.
 * Provides REST endpoints for CRUD operations on Bamboos.
 */
@RestController
@RequestMapping("/api/bamboos")
@CrossOrigin(origins = "*")
public class BambooController {
    private static final Logger logger = LoggerFactory.getLogger(BambooController.class);
    private final BambooService bambooService;

    public BambooController(BambooService bambooService) {
        this.bambooService = bambooService;
    }

    /**
     * Retrieve all bamboos.
     *
     * @return List of all bamboos
     */
    @GetMapping
    public List<Bamboo> getAllBamboos() {
        logger.info("Request to get all bamboos");
        return bambooService.findAll();
    }

    /**
     * Retrieve a bamboo by its ID.
     *
     * @param id The ID of the bamboo
     * @return ResponseEntity containing the bamboo if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Bamboo> getBambooById(@PathVariable String id) {
        logger.info("Request to get bamboo by id: {}", id);
        return bambooService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new bamboo.
     *
     * @param bamboo The bamboo object to create
     * @return The created bamboo
     */
    @PostMapping
    public Bamboo createBamboo(@Valid @RequestBody Bamboo bamboo) {
        logger.info("Request to create new bamboo: {}", bamboo.getName());
        return bambooService.save(bamboo);
    }

    /**
     * Update an existing bamboo.
     *
     * @param id     The ID of the bamboo to update
     * @param bamboo The updated bamboo object
     * @return ResponseEntity containing the updated bamboo if found, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Bamboo> updateBamboo(@PathVariable String id, @Valid @RequestBody Bamboo bamboo) {
        logger.info("Request to update bamboo with id: {}", id);
        if (!bambooService.findById(id).isPresent()) {
            logger.warn("Bamboo with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }
        bamboo.setId(id);
        return ResponseEntity.ok(bambooService.save(bamboo));
    }

    /**
     * Delete a bamboo by its ID.
     *
     * @param id The ID of the bamboo to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBamboo(@PathVariable String id) {
        logger.info("Request to delete bamboo with id: {}", id);
        if (!bambooService.findById(id).isPresent()) {
            logger.warn("Bamboo with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        bambooService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
