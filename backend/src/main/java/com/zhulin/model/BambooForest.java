package com.zhulin.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class BambooForest extends BaseEntity {
    @NotNull
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @Column(length = 1000)
    private String description;
    
    private Boolean enabled = true;
    private Boolean archived = false;
    private LocalDateTime archivedAt;

    @OneToMany(mappedBy = "forest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<BambooField> bambooFields = new ArrayList<>();

    @OneToMany(mappedBy = "forest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Goal> goals = new ArrayList<>();

    @OneToMany(mappedBy = "forest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KeyOutput> keyOutputs = new ArrayList<>();

    @OneToMany(mappedBy = "forest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Learning> learnings = new ArrayList<>();

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

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
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

    public List<BambooField> getBambooFields() {
        return bambooFields;
    }

    public void setBambooFields(List<BambooField> bambooFields) {
        this.bambooFields = bambooFields;
    }

    public List<Goal> getGoals() {
        return goals;
    }

    public void setGoals(List<Goal> goals) {
        this.goals = goals;
    }

    public List<KeyOutput> getKeyOutputs() {
        return keyOutputs;
    }

    public void setKeyOutputs(List<KeyOutput> keyOutputs) {
        this.keyOutputs = keyOutputs;
    }

    public List<Learning> getLearnings() {
        return learnings;
    }

    public void setLearnings(List<Learning> learnings) {
        this.learnings = learnings;
    }
}
