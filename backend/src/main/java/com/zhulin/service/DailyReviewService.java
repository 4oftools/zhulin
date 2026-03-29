package com.zhulin.service;

import com.zhulin.model.DailyReview;
import com.zhulin.repository.DailyReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DailyReviewService {

    @Autowired
    private DailyReviewRepository dailyReviewRepository;

    public List<DailyReview> getAllReviews() {
        return dailyReviewRepository.findAll();
    }

    public Optional<DailyReview> getReviewByDate(LocalDate date) {
        return dailyReviewRepository.findByDate(date);
    }

    public DailyReview saveReview(DailyReview review) {
        Optional<DailyReview> existing = dailyReviewRepository.findByDate(review.getDate());
        if (existing.isPresent()) {
            DailyReview toUpdate = existing.get();
            toUpdate.setScore(review.getScore());
            toUpdate.setGoodThings(review.getGoodThings());
            toUpdate.setBadThings(review.getBadThings());
            return dailyReviewRepository.save(toUpdate);
        }
        return dailyReviewRepository.save(review);
    }
}
