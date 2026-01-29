package com.zhulin.controller;

import com.zhulin.model.KeyOutput;
import com.zhulin.service.KeyOutputService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing KeyOutput entities.
 * Provides REST endpoints for CRUD operations on KeyOutputs.
 */
@RestController
@RequestMapping("/api/key-outputs")
@CrossOrigin(origins = "*")
public class KeyOutputController {
    private static final Logger logger = LoggerFactory.getLogger(KeyOutputController.class);
    private final KeyOutputService keyOutputService;

    public KeyOutputController(KeyOutputService keyOutputService) {
        this.keyOutputService = keyOutputService;
    }

    /**
     * Retrieve all key outputs.
     *
     * @return List of all key outputs
     */
    @GetMapping
    public List<KeyOutput> getAllKeyOutputs() {
        logger.info("Request to get all key outputs");
        return keyOutputService.findAll();
    }

    /**
     * Retrieve a key output by its ID.
     *
     * @param id The ID of the key output
     * @return ResponseEntity containing the key output if found, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<KeyOutput> getKeyOutputById(@PathVariable String id) {
        logger.info("Request to get key output by id: {}", id);
        return keyOutputService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new key output.
     *
     * @param keyOutput The key output to create
     * @return The created key output
     */
    @PostMapping
    public KeyOutput createKeyOutput(@Valid @RequestBody KeyOutput keyOutput) {
        logger.info("Request to create new key output: {}", keyOutput.getName());
        return keyOutputService.save(keyOutput);
    }

    /**
     * Update an existing key output.
     *
     * @param id        The ID of the key output to update
     * @param keyOutput The updated key output object
     * @return ResponseEntity containing the updated key output if found, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<KeyOutput> updateKeyOutput(@PathVariable String id, @Valid @RequestBody KeyOutput keyOutput) {
        logger.info("Request to update key output with id: {}", id);
        if (!keyOutputService.findById(id).isPresent()) {
            logger.warn("Key output with id {} not found for update", id);
            return ResponseEntity.notFound().build();
        }
        keyOutput.setId(id);
        return ResponseEntity.ok(keyOutputService.save(keyOutput));
    }

    /**
     * Delete a key output by its ID.
     *
     * @param id The ID of the key output to delete
     * @return ResponseEntity with 200 OK if deleted, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKeyOutput(@PathVariable String id) {
        logger.info("Request to delete key output with id: {}", id);
        if (!keyOutputService.findById(id).isPresent()) {
            logger.warn("Key output with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        keyOutputService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
