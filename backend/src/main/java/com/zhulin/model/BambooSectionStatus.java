package com.zhulin.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum BambooSectionStatus {
    PENDING("pending"),
    IN_PROGRESS("in-progress"),
    COMPLETED("completed");

    private final String value;

    BambooSectionStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
    
    @Override
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static BambooSectionStatus fromValue(String text) {
        for (BambooSectionStatus b : BambooSectionStatus.values()) {
            if (String.valueOf(b.value).equalsIgnoreCase(text)) {
                return b;
            }
        }
        return null;
    }
}
