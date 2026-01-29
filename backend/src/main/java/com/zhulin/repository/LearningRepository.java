package com.zhulin.repository;

import com.zhulin.model.Learning;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningRepository extends JpaRepository<Learning, String> {
}
