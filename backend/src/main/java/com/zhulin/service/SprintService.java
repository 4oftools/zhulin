package com.zhulin.service;

import com.zhulin.model.Sprint;
import com.zhulin.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Sprint save(Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    public void deleteById(String id) {
        sprintRepository.deleteById(id);
    }
}
