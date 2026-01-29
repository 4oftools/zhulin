package com.zhulin.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
public class KeyOutput extends BaseEntity {
    @NotNull
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    private Boolean completed = false;
    private LocalDateTime completedAt;

    @Column(name = "forest_id")
    private String forestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forest_id", insertable = false, updatable = false)
    @JsonIgnore
    private BambooForest forest;

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

    public String getForestId() {
        return forestId;
    }

    public void setForestId(String forestId) {
        this.forestId = forestId;
    }

    public BambooForest getForest() {
        return forest;
    }

    public void setForest(BambooForest forest) {
        this.forest = forest;
    }
}
