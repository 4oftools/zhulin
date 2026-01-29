package com.zhulin.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SprintStatus {
    RUNNING("running"),
    COMPLETED("completed"),
    PAUSED("paused"),
    INTERRUPTED("interrupted");

    private final String value;

    SprintStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static SprintStatus fromValue(String text) {
        for (SprintStatus b : SprintStatus.values()) {
            if (String.valueOf(b.value).equalsIgnoreCase(text)) {
                return b;
            }
        }
        return null;
    }
}
