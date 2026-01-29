package com.zhulin.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class BambooSection extends BaseEntity {
    @NotNull
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @NotNull
    @Convert(converter = BambooSectionTypeConverter.class)
    private BambooSectionType type; // regular, periodic, label
    
    @NotNull
    @Convert(converter = BambooSectionStatusConverter.class)
    private BambooSectionStatus status; // pending, in-progress, completed
    
    private Integer priority;
    
    private Integer estimatedDuration;
    private Integer actualDuration;
    
    @ElementCollection
    @CollectionTable(name = "section_tags", joinColumns = @JoinColumn(name = "section_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    private Boolean completed = false;
    private LocalDateTime completedAt;
    private LocalDateTime dueDate;
    
    @Convert(converter = BambooSectionPeriodConverter.class)
    @Column(columnDefinition = "TEXT")
    private BambooSectionPeriod period;

    @Column(name = "bamboo_id")
    private String bambooId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bamboo_id", insertable = false, updatable = false)
    @JsonIgnore
    private Bamboo bamboo;

    private String goalId;

    private Boolean inTodoList = false;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BambooSectionType getType() {
        return type;
    }

    public void setType(BambooSectionType type) {
        this.type = type;
    }

    public BambooSectionStatus getStatus() {
        return status;
    }

    public void setStatus(BambooSectionStatus status) {
        this.status = status;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(Integer estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public Boolean getInTodoList() {
        return inTodoList;
    }

    public void setInTodoList(Boolean inTodoList) {
        this.inTodoList = inTodoList;
    }

    public Integer getActualDuration() {
        return actualDuration;
    }

    public void setActualDuration(Integer actualDuration) {
        this.actualDuration = actualDuration;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
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

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public BambooSectionPeriod getPeriod() {
        return period;
    }

    public void setPeriod(BambooSectionPeriod period) {
        this.period = period;
    }

    public String getBambooId() {
        return bambooId;
    }

    public void setBambooId(String bambooId) {
        this.bambooId = bambooId;
    }

    public Bamboo getBamboo() {
        return bamboo;
    }

    public void setBamboo(Bamboo bamboo) {
        this.bamboo = bamboo;
    }

    public String getGoalId() {
        return goalId;
    }

    public void setGoalId(String goalId) {
        this.goalId = goalId;
    }
}
