package com.zhulin.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
public class Sprint extends BaseEntity {
    private String taskId;
    
    private String taskName;
    
    @NotNull
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private Long duration; // in seconds
    
    @NotNull
    @Enumerated(EnumType.STRING)
    private SprintStatus status;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    private SprintType type;

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public SprintStatus getStatus() {
        return status;
    }

    public void setStatus(SprintStatus status) {
        this.status = status;
    }

    public SprintType getType() {
        return type;
    }

    public void setType(SprintType type) {
        this.type = type;
    }
}
