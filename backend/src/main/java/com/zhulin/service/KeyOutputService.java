package com.zhulin.service;

import com.zhulin.model.KeyOutput;
import com.zhulin.repository.KeyOutputRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing KeyOutput entities.
 * Handles business logic for KeyOutput operations including transaction management.
 */
@Service
@Transactional
public class KeyOutputService {
    private static final Logger logger = LoggerFactory.getLogger(KeyOutputService.class);
    private final KeyOutputRepository keyOutputRepository;

    public KeyOutputService(KeyOutputRepository keyOutputRepository) {
        this.keyOutputRepository = keyOutputRepository;
    }

    /**
     * Retrieve all key outputs from the database.
     *
     * @return List of all key outputs
     */
    public List<KeyOutput> findAll() {
        logger.debug("Fetching all key outputs from repository");
        return keyOutputRepository.findAll();
    }

    /**
     * Find a key output by its ID.
     *
     * @param id The ID of the key output
     * @return Optional containing the key output if found
     */
    public Optional<KeyOutput> findById(String id) {
        logger.debug("Fetching key output by id: {}", id);
        return keyOutputRepository.findById(id);
    }

    /**
     * Save a key output entity.
     *
     * @param keyOutput The key output to save
     * @return The saved key output
     */
    public KeyOutput save(KeyOutput keyOutput) {
        logger.debug("Saving key output: {}", keyOutput.getName());
        KeyOutput saved = keyOutputRepository.save(keyOutput);
        logger.info("Key output saved successfully with id: {}", saved.getId());
        return saved;
    }

    /**
     * Delete a key output by its ID.
     *
     * @param id The ID of the key output to delete
     */
    public void deleteById(String id) {
        logger.debug("Deleting key output with id: {}", id);
        keyOutputRepository.deleteById(id);
        logger.info("Key output deleted successfully with id: {}", id);
    }
}
