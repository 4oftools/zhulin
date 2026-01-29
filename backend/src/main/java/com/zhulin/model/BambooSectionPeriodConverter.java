package com.zhulin.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class BambooSectionPeriodConverter implements AttributeConverter<BambooSectionPeriod, String> {

    private final static ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(BambooSectionPeriod attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting BambooSectionPeriod to JSON", e);
        }
    }

    @Override
    public BambooSectionPeriod convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, BambooSectionPeriod.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting JSON to BambooSectionPeriod", e);
        }
    }
}
