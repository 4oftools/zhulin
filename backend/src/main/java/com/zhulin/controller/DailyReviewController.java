package com.zhulin.controller;

import com.zhulin.model.DailyReview;
import com.zhulin.service.DailyReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class DailyReviewController {

    @Autowired
    private DailyReviewService dailyReviewService;

    @GetMapping
    public List<DailyReview> getAllReviews() {
        return dailyReviewService.getAllReviews();
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<DailyReview> getReviewByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return dailyReviewService.getReviewByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DailyReview saveReview(@RequestBody DailyReview review) {
        return dailyReviewService.saveReview(review);
    }
}
