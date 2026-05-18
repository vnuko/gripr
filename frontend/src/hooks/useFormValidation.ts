import { useState, useCallback, useMemo } from "react";
import type {
  RiderInput,
  TerrainInput,
  BikeType,
  RidingStyle,
  SkillLevel,
  WeatherCondition,
} from "../types/rider-input.js";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

const VALIDATION_RULES = {
  riderWeight: {
    min: 40,
    max: 150,
    required: true,
    message: "Rider weight must be between 40 and 150 kg",
  },
  tireFront: {
    min: 1.5,
    max: 3.0,
    required: false,
    validateWhenEmpty: false,
    message: "Front tire width must be between 1.5 and 3.0 inches",
  },
  tireRear: {
    min: 1.5,
    max: 3.0,
    required: false,
    validateWhenEmpty: false,
    message: "Rear tire width must be between 1.5 and 3.0 inches",
  },
  bikeType: {
    required: true,
    validValues: ["trail", "enduro", "xc", "downhill", "gravel"] as BikeType[],
    message: "Please select a bike type",
  },
  ridingStyle: {
    required: true,
    validValues: ["conservative", "moderate", "aggressive"] as RidingStyle[],
    message: "Please select a riding style",
  },
  skillLevel: {
    required: true,
    validValues: [
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ] as SkillLevel[],
    message: "Please select a skill level",
  },
  wheelSize: {
    required: true,
    message: "Please select a wheel size",
  },
  weather: {
    required: true,
    validValues: ["dry", "damp", "wet"] as WeatherCondition[],
    message: "Please select weather conditions",
  },
};

export function useFormValidation(
  initialValues: Partial<RiderInput & TerrainInput> = {},
) {
  const [values, setValues] =
    useState<Partial<RiderInput & TerrainInput>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (
      field: keyof (RiderInput & TerrainInput),
      value: unknown,
    ): string | null => {
      const rules = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];

      if (!rules) return null;

      if (
        rules.required &&
        (value === undefined || value === "" || value === null)
      ) {
        return rules.message;
      }

      if (
        "min" in rules &&
        "max" in rules &&
        rules.min !== undefined &&
        rules.max !== undefined
      ) {
        if (value === undefined || value === "" || value === null) {
          return null;
        }
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < rules.min || numValue > rules.max) {
          return rules.message;
        }
      }

      if ("validValues" in rules && rules.validValues && value) {
        if (!rules.validValues.includes(value as never)) {
          return rules.message;
        }
      }

      return null;
    },
    [],
  );

  const setValue = useCallback(
    (
      field: keyof (RiderInput & TerrainInput),
      value: string | number | boolean | string[] | undefined,
    ) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      const error = validateField(field, value);
      setErrors((prev) => {
        if (error) {
          return { ...prev, [field]: error };
        }
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    [validateField],
  );

  const validateAll = useCallback((): ValidationResult => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const field of Object.keys(VALIDATION_RULES) as (keyof (RiderInput &
      TerrainInput))[]) {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [values, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const isComplete = useMemo(() => {
    const requiredFields: (keyof (RiderInput & TerrainInput))[] = [
      "riderWeight",
      "bikeType",
      "tubeless",
      "ridingStyle",
      "skillLevel",
      "wheelSize",
      "selectedTerrains",
      "weather",
      "temperature",
    ];
    return requiredFields.every((field) => values[field] !== undefined);
  }, [values]);

  return {
    values,
    errors,
    setValue,
    validateAll,
    clearErrors,
    reset,
    isComplete,
    hasErrors: Object.keys(errors).length > 0,
  };
}
