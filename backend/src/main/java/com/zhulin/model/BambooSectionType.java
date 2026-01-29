package com.zhulin.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum BambooSectionType {
    REGULAR("regular"),
    PERIODIC("periodic"),
    LABEL("label");

    private final String value;

    BambooSectionType(String value) {
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
    
    // Helper to map from string (case-insensitive)
    @JsonCreator
    public static BambooSectionType fromValue(String text) {
        for (BambooSectionType b : BambooSectionType.values()) {
            if (String.valueOf(b.value).equalsIgnoreCase(text)) {
                return b;
            }
        }
        return null;
    }
}
