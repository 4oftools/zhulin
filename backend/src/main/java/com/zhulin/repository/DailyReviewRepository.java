package com.zhulin.repository;

import com.zhulin.model.DailyReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyReviewRepository extends JpaRepository<DailyReview, String> {
    Optional<DailyReview> findByDate(LocalDate date);
}
