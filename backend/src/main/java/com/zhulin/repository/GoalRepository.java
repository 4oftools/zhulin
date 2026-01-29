package com.zhulin.repository;

import com.zhulin.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, String> {
}
