package com.zhulin.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Bamboo extends BaseEntity {
    @NotNull
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @Column(length = 1000)
    private String description;
    
    private Boolean completed = false;
    private LocalDateTime completedAt;
    
    private Boolean archived = false;
    private LocalDateTime archivedAt;

    @Column(name = "field_id")
    private String fieldId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", insertable = false, updatable = false)
    @JsonIgnore
    private BambooField field;

    private String goalId; // Link to a goal
    
    private Boolean inActivityList = false;

    @OneToMany(mappedBy = "bamboo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BambooSection> tasks = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Boolean getArchived() {
        return archived;
    }

    public void setArchived(Boolean archived) {
        this.archived = archived;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public String getFieldId() {
        return fieldId;
    }

    public void setFieldId(String fieldId) {
        this.fieldId = fieldId;
    }

    public BambooField getField() {
        return field;
    }

    public void setField(BambooField field) {
        this.field = field;
    }

    public String getGoalId() {
        return goalId;
    }

    public void setGoalId(String goalId) {
        this.goalId = goalId;
    }

    public Boolean getInActivityList() {
        return inActivityList;
    }

    public void setInActivityList(Boolean inActivityList) {
        this.inActivityList = inActivityList;
    }

    public List<BambooSection> getTasks() {
        return tasks;
    }

    public void setTasks(List<BambooSection> tasks) {
        this.tasks = tasks;
    }
}
