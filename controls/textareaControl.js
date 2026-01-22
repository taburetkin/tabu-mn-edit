import { RawTextareaView } from "../inputs/index.js";

function textareaControl(options) {
	const { value } = options;
	return {
		class: RawTextareaView,
		value
	}
}

textareaControl.subtypes = {
	textarea:1,
	bigtext:1,
}

export default textareaControl;