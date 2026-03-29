package com.zhulin.service;

import com.zhulin.model.Sprint;
import com.zhulin.model.SprintStatus;
import com.zhulin.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    public List<Sprint> findAll() {
        return sprintRepository.findAllByOrderByStartTimeDesc();
    }

    public Optional<Sprint> findById(String id) {
        return sprintRepository.findById(id);
    }

    /**
     * 新建：开始时间一律为服务端当前时间；结束时间由后续状态变更写入。
     * 更新：合并业务字段；首次进入已完成/已中断时写入服务端结束时间。
     */
    public Sprint save(Sprint sprint) {
        if (sprint.getId() != null && !sprint.getId().isEmpty()
                && sprintRepository.existsById(sprint.getId())) {
            return updateSprint(sprint.getId(), sprint);
        }
        return createSprint(sprint);
    }

    public Sprint createSprint(Sprint input) {
        Sprint s = new Sprint();
        if (input.getId() != null && !input.getId().isEmpty()) {
            s.setId(input.getId());
        }
        s.setTaskId(input.getTaskId());
        s.setTaskName(input.getTaskName() != null ? input.getTaskName() : "");
        s.setDuration(input.getDuration() != null ? input.getDuration() : 0L);
        s.setStatus(input.getStatus());
        s.setType(input.getType());
        s.setStartTime(LocalDateTime.now());
        s.setEndTime(null);
        return sprintRepository.save(s);
    }

    public Sprint updateSprint(String id, Sprint incoming) {
        return sprintRepository.findById(id).map(existing -> {
            SprintStatus oldSt = existing.getStatus();
            SprintStatus newSt = incoming.getStatus();
            existing.setTaskId(incoming.getTaskId());
            existing.setTaskName(incoming.getTaskName() != null ? incoming.getTaskName() : existing.getTaskName());
            if (incoming.getDuration() != null) {
                existing.setDuration(incoming.getDuration());
            }
            if (newSt != null) {
                existing.setStatus(newSt);
            }
            if (incoming.getType() != null) {
                existing.setType(incoming.getType());
            }
            boolean nowEnded = newSt == SprintStatus.COMPLETED || newSt == SprintStatus.INTERRUPTED;
            boolean wasEnded = oldSt == SprintStatus.COMPLETED || oldSt == SprintStatus.INTERRUPTED;
            if (nowEnded && !wasEnded) {
                existing.setEndTime(LocalDateTime.now());
            }
            return sprintRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + id));
    }

    public void deleteById(String id) {
        sprintRepository.deleteById(id);
    }
}
