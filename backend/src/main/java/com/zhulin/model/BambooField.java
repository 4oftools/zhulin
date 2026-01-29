package com.zhulin.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class BambooField extends BaseEntity {
    @NotNull
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @Column(length = 1000)
    private String description;
    
    private Boolean archived = false;
    private LocalDateTime archivedAt;

    @Column(name = "forest_id")
    private String forestId;

    private Integer sortOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forest_id", insertable = false, updatable = false)
    @JsonIgnore
    private BambooForest forest;

    @OneToMany(mappedBy = "field", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bamboo> bamboos = new ArrayList<>();

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

    public String getForestId() {
        return forestId;
    }

    public void setForestId(String forestId) {
        this.forestId = forestId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public BambooForest getForest() {
        return forest;
    }

    public void setForest(BambooForest forest) {
        this.forest = forest;
    }

    public List<Bamboo> getBamboos() {
        return bamboos;
    }

    public void setBamboos(List<Bamboo> bamboos) {
        this.bamboos = bamboos;
    }
}
