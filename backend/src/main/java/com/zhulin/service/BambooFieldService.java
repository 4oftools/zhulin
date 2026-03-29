package com.zhulin.service;

import com.zhulin.model.BambooField;
import com.zhulin.repository.BambooFieldRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing BambooField entities.
 */
@Service
@Transactional
public class BambooFieldService {
    private static final Logger logger = LoggerFactory.getLogger(BambooFieldService.class);
    private final BambooFieldRepository bambooFieldRepository;

    public BambooFieldService(BambooFieldRepository bambooFieldRepository) {
        this.bambooFieldRepository = bambooFieldRepository;
    }

    public List<BambooField> findAll() {
        logger.debug("Fetching all bamboo fields from repository");
        List<BambooField> fields = bambooFieldRepository.findAll();
        fields.forEach(this::initializeField);
        return fields;
    }

    public Optional<BambooField> findById(String id) {
        logger.debug("Fetching bamboo field by id: {}", id);
        Optional<BambooField> field = bambooFieldRepository.findById(id);
        field.ifPresent(this::initializeField);
        return field;
    }

    /**
     * archivedAt 由服务端在归档状态变化时写入。
     */
    public BambooField save(BambooField incoming) {
        logger.debug("Saving bamboo field: {}", incoming.getName());
        if (incoming.getId() != null && bambooFieldRepository.existsById(incoming.getId())) {
            BambooField existing = bambooFieldRepository.findById(incoming.getId()).get();
            existing.setName(incoming.getName());
            existing.setStartDate(incoming.getStartDate());
            existing.setEndDate(incoming.getEndDate());
            existing.setDescription(incoming.getDescription());
            existing.setForestId(incoming.getForestId());
            existing.setSortOrder(incoming.getSortOrder());
            boolean wasArch = Boolean.TRUE.equals(existing.getArchived());
            existing.setArchived(incoming.getArchived());
            boolean nowArch = Boolean.TRUE.equals(existing.getArchived());
            if (nowArch && !wasArch) {
                existing.setArchivedAt(LocalDateTime.now());
            } else if (!nowArch) {
                existing.setArchivedAt(null);
            }
            BambooField saved = bambooFieldRepository.save(existing);
            initializeField(saved);
            logger.info("Bamboo field updated successfully with id: {}", saved.getId());
            return saved;
        }
        if (Boolean.TRUE.equals(incoming.getArchived())) {
            incoming.setArchivedAt(LocalDateTime.now());
        } else {
            incoming.setArchivedAt(null);
        }
        BambooField saved = bambooFieldRepository.save(incoming);
        initializeField(saved);
        logger.info("Bamboo field saved successfully with id: {}", saved.getId());
        return saved;
    }

    public void deleteById(String id) {
        logger.debug("Deleting bamboo field with id: {}", id);
        bambooFieldRepository.deleteById(id);
        logger.info("Bamboo field deleted successfully with id: {}", id);
    }

    public void updateFieldsOrder(List<BambooField> fields) {
        logger.debug("Updating order for {} fields", fields.size());
        for (int i = 0; i < fields.size(); i++) {
            BambooField fieldData = fields.get(i);
            Optional<BambooField> existing = bambooFieldRepository.findById(fieldData.getId());
            if (existing.isPresent()) {
                BambooField field = existing.get();
                field.setSortOrder(i);
                bambooFieldRepository.save(field);
            } else {
                logger.warn("Bamboo field with id {} not found during order update", fieldData.getId());
            }
        }
        logger.info("Bamboo fields order updated successfully");
    }

    private void initializeField(BambooField field) {
        Hibernate.initialize(field.getBamboos());
        field.getBamboos().forEach(bamboo -> {
            Hibernate.initialize(bamboo.getTasks());
            bamboo.getTasks().forEach(task -> Hibernate.initialize(task.getTags()));
        });
    }
}
