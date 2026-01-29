package com.zhulin.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BambooSectionStatusConverter implements AttributeConverter<BambooSectionStatus, String> {

    @Override
    public String convertToDatabaseColumn(BambooSectionStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public BambooSectionStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        for (BambooSectionStatus status : BambooSectionStatus.values()) {
            if (status.getValue().equals(dbData)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown BambooSectionStatus: " + dbData);
    }
}
