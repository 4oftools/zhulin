package com.zhulin.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SprintType {
    SPRINT("sprint"),
    REST("rest"),
    BREAK("break");

    private final String value;

    SprintType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static SprintType fromValue(String text) {
        for (SprintType b : SprintType.values()) {
            if (String.valueOf(b.value).equalsIgnoreCase(text)) {
                return b;
            }
        }
        return null;
    }
}
