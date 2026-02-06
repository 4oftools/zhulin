package com.zhulin.repository;

import com.zhulin.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, String> {
    List<Sprint> findAllByOrderByStartTimeDesc();
}
 