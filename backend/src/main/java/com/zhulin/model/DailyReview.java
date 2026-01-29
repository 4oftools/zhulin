package com.zhulin.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
public class DailyReview extends BaseEntity {
    @NotNull
    private LocalDate date;

    private Integer score;

    @Column(length = 2000)
    private String goodThings;

    @Column(length = 2000)
    private String badThings;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getGoodThings() {
        return goodThings;
    }

    public void setGoodThings(String goodThings) {
        this.goodThings = goodThings;
    }

    public String getBadThings() {
        return badThings;
    }

    public void setBadThings(String badThings) {
        this.badThings = badThings;
    }
}
