package com.zhulin.controller;

import com.zhulin.model.BambooField;
import com.zhulin.service.BambooFieldService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing BambooField entities.
 * Provides REST endpoints for CRUD operations and ordering of BambooFields.
 */
@RestController
@RequestMapping("/api/fields")
@CrossOrigin(origins = "*")
public class BambooFieldController {
    private static final Logger logger = LoggerFactory.getLogger(BambooFieldController.class);
    private final BambooFieldService bambooFieldService;

    public BambooFieldController(BambooFieldService bambooFieldService) {
        this.bambooFieldService = bambooFieldService;
    }

    /**
     * Retrieve all bamboo fields.
     *
     * @return List of all bamboo fields
     */
    @GetMapping
    public List<BambooField> getAllFields() {
        logger.info("Request to get all bamboo fields");
        return bambooFieldService.findAll();
    }

    /**
     * Retrieve a bamboo field by its ID.
     *
     * @param id The ID of the bamboo field
     * @return ResponseEntity containing the field if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<BambooField> getFieldById(@PathVariable String id) {
        logger.info("Request to get bamboo field by id: {}", id);
        return bambooFieldService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new bamboo field.
     *
     * @param bambooField The bamboo field to create
     * @return The created bamboo field
     */
    @PostMapping
    public BambooField createField(@Valid @RequestBody BambooField bambooField) {
        logger.info("Request to create new bamboo field: {}", bambooField.getName());
        return bambooFieldService.save(bambooField);
    }

    /**
     * Update an existing bamboo field.
     *
     * @param id          The ID of the field to update
     * @param bambooField The updated field object
     * @return ResponseEntity containing the updated field, or error status
     */
    @PutMapping("/{id}")
    public ResponseEntity<BambooField> updateField(@PathVariable String id, @Valid @RequestBody BambooField bambooField) {
        logger.info("Request to update bamboo field with id: {}", id);
        if (!bambooFieldService.findById(id).isPresent()) {
            logger.warn("Bamboo field with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }
        bambooField.setId(id);
        BambooField saved = bambooFieldService.save(bambooField);
        return saved != null ? ResponseEntity.ok(saved) : ResponseEntity.badRequest().build();
    }

    /**
     * Update the order of bamboo fields.
     *
     * @param fields List of bamboo fields in the desired order
     * @return ResponseEntity with 200 OK
     */
    @PutMapping("/order")
    public ResponseEntity<Void> updateFieldsOrder(@RequestBody List<BambooField> fields) {
        logger.info("Request to update order for {} bamboo fields", fields.size());
        bambooFieldService.updateFieldsOrder(fields);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete a bamboo field by its ID.
     *
     * @param id The ID of the field to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteField(@PathVariable String id) {
        logger.info("Request to delete bamboo field with id: {}", id);
        if (!bambooFieldService.findById(id).isPresent()) {
            logger.warn("Bamboo field with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        bambooFieldService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
