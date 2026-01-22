import enumControl from "./enumControl";
import inputControl from "./inputControl";
import textareaControl from "./textareaControl";

export function get(options = {}) {

	const { 
		value, 
		valueType, valueSubType, 
		multiple, nullable, nullableValue 
	} = options;

	if (valueType === 'enum') {
		return enumControl(options);
	}

	if (valueSubType in textareaControl.subtypes) {
		return textareaControl(options);
	}

	return inputControl(options);

}