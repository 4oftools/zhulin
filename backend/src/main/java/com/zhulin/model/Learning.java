package com.zhulin.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Learning extends BaseEntity {
    @NotNull
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String category;
    
    @ElementCollection
    @CollectionTable(name = "learning_tags", joinColumns = @JoinColumn(name = "learning_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Column(name = "forest_id")
    private String forestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forest_id", insertable = false, updatable = false)
    @JsonIgnore
    private BambooForest forest;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
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
