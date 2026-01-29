package com.zhulin.repository;

import com.zhulin.model.Bamboo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BambooRepository extends JpaRepository<Bamboo, String> {
}
