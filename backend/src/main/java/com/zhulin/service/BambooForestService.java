package com.zhulin.service;

import com.zhulin.model.BambooForest;
import com.zhulin.repository.BambooForestRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing BambooForest entities.
 */
@Service
@Transactional
public class BambooForestService {
    private static final Logger logger = LoggerFactory.getLogger(BambooForestService.class);
    private final BambooForestRepository bambooForestRepository;

    public BambooForestService(BambooForestRepository bambooForestRepository) {
        this.bambooForestRepository = bambooForestRepository;
    }

    public List<BambooForest> findAll() {
        logger.debug("Fetching all bamboo forests from repository");
        List<BambooForest> forests = bambooForestRepository.findAll();
        forests.forEach(this::initializeForest);
        return forests;
    }

    public Optional<BambooForest> findById(String id) {
        logger.debug("Fetching bamboo forest by id: {}", id);
        Optional<BambooForest> forest = bambooForestRepository.findById(id);
        forest.ifPresent(this::initializeForest);
        return forest;
    }

    /**
     * archivedAt 由服务端在归档状态变化时写入。
     */
    public BambooForest save(BambooForest incoming) {
        logger.debug("Saving bamboo forest: {}", incoming.getName());
        if (incoming.getId() != null && bambooForestRepository.existsById(incoming.getId())) {
            BambooForest existing = bambooForestRepository.findById(incoming.getId()).get();
            existing.setName(incoming.getName());
            existing.setStartDate(incoming.getStartDate());
            existing.setEndDate(incoming.getEndDate());
            existing.setDescription(incoming.getDescription());
            existing.setEnabled(incoming.getEnabled());
            boolean wasArch = Boolean.TRUE.equals(existing.getArchived());
            existing.setArchived(incoming.getArchived());
            boolean nowArch = Boolean.TRUE.equals(existing.getArchived());
            if (nowArch && !wasArch) {
                existing.setArchivedAt(LocalDateTime.now());
            } else if (!nowArch) {
                existing.setArchivedAt(null);
            }
            BambooForest saved = bambooForestRepository.save(existing);
            initializeForest(saved);
            logger.info("Bamboo forest updated successfully with id: {}", saved.getId());
            return saved;
        }
        if (Boolean.TRUE.equals(incoming.getArchived())) {
            incoming.setArchivedAt(LocalDateTime.now());
        } else {
            incoming.setArchivedAt(null);
        }
        BambooForest saved = bambooForestRepository.save(incoming);
        initializeForest(saved);
        logger.info("Bamboo forest saved successfully with id: {}", saved.getId());
        return saved;
    }

    public void deleteById(String id) {
        logger.debug("Deleting bamboo forest with id: {}", id);
        bambooForestRepository.deleteById(id);
        logger.info("Bamboo forest deleted successfully with id: {}", id);
    }

    private void initializeForest(BambooForest forest) {
        Hibernate.initialize(forest.getBambooFields());
        forest.getBambooFields().forEach(field -> {
            Hibernate.initialize(field.getBamboos());
            field.getBamboos().forEach(bamboo -> {
                Hibernate.initialize(bamboo.getTasks());
                bamboo.getTasks().forEach(task -> Hibernate.initialize(task.getTags()));
            });
        });
        Hibernate.initialize(forest.getGoals());
        Hibernate.initialize(forest.getKeyOutputs());
        Hibernate.initialize(forest.getLearnings());
        forest.getLearnings().forEach(l -> Hibernate.initialize(l.getTags()));
    }
}
