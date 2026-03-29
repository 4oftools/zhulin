package com.zhulin.service;

import com.zhulin.model.BambooSection;
import com.zhulin.repository.BambooSectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for managing BambooSection entities.
 */
@Service
@Transactional
public class BambooSectionService {
    private static final Logger logger = LoggerFactory.getLogger(BambooSectionService.class);
    private final BambooSectionRepository bambooSectionRepository;

    public BambooSectionService(BambooSectionRepository bambooSectionRepository) {
        this.bambooSectionRepository = bambooSectionRepository;
    }

    public List<BambooSection> findAll() {
        logger.debug("Fetching all bamboo sections from repository");
        return bambooSectionRepository.findAll();
    }

    public Optional<BambooSection> findById(String id) {
        logger.debug("Fetching bamboo section by id: {}", id);
        return bambooSectionRepository.findById(id);
    }

    /**
     * 新建或更新：completedAt 仅由服务端在「未完成→完成 / 完成→未完成」时维护。
     */
    public BambooSection save(BambooSection incoming) {
        if (incoming.getId() != null && bambooSectionRepository.existsById(incoming.getId())) {
            return mergeUpdate(incoming.getId(), incoming);
        }
        if (incoming.getId() == null || incoming.getId().isEmpty()) {
            incoming.setId(UUID.randomUUID().toString());
        }
        applyCompletedAtForNew(incoming);
        BambooSection saved = bambooSectionRepository.save(incoming);
        logger.info("Bamboo section saved successfully with id: {}", saved.getId());
        return saved;
    }

    private BambooSection mergeUpdate(String id, BambooSection incoming) {
        return bambooSectionRepository.findById(id).map(existing -> {
            existing.setName(incoming.getName());
            existing.setDescription(incoming.getDescription());
            existing.setType(incoming.getType());
            existing.setStatus(incoming.getStatus());
            existing.setPriority(incoming.getPriority());
            existing.setEstimatedDuration(incoming.getEstimatedDuration());
            existing.setActualDuration(incoming.getActualDuration());
            existing.setTags(incoming.getTags());
            boolean was = Boolean.TRUE.equals(existing.getCompleted());
            existing.setCompleted(incoming.getCompleted());
            boolean now = Boolean.TRUE.equals(existing.getCompleted());
            if (now && !was) {
                existing.setCompletedAt(LocalDateTime.now());
            } else if (!now) {
                existing.setCompletedAt(null);
            }
            existing.setDueDate(incoming.getDueDate());
            existing.setPeriod(incoming.getPeriod());
            existing.setGoalId(incoming.getGoalId());
            existing.setBambooId(incoming.getBambooId());
            existing.setInTodoList(incoming.getInTodoList());
            BambooSection saved = bambooSectionRepository.save(existing);
            logger.info("Bamboo section updated successfully with id: {}", saved.getId());
            return saved;
        }).orElseThrow(() -> new IllegalArgumentException("Bamboo section not found: " + id));
    }

    private void applyCompletedAtForNew(BambooSection s) {
        if (Boolean.TRUE.equals(s.getCompleted())) {
            s.setCompletedAt(LocalDateTime.now());
        } else {
            s.setCompletedAt(null);
        }
    }

    public void deleteById(String id) {
        logger.debug("Deleting bamboo section with id: {}", id);
        bambooSectionRepository.deleteById(id);
        logger.info("Bamboo section deleted successfully with id: {}", id);
    }
}
