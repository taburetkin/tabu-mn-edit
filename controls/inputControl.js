import { RawInputView } from "../inputs/index.js";

export default function inputControl(options) {
	const { value } = options;
	return { 
		class: RawInputView,
		value
	}
}