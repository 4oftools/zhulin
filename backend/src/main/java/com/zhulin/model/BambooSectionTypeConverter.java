package com.zhulin.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BambooSectionTypeConverter implements AttributeConverter<BambooSectionType, String> {

    @Override
    public String convertToDatabaseColumn(BambooSectionType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public BambooSectionType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        for (BambooSectionType type : BambooSectionType.values()) {
            if (type.getValue().equals(dbData)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown BambooSectionType: " + dbData);
    }
}
