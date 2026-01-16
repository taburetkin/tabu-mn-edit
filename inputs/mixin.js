import { attrsToHtmlAttrs } from "./utils.js";
import { invokeValue } from '../vendors.js';
export const commonInputMixin = {
	_initializeInput(keys, value) {
		this._tagAttributes = this._getTagAttributes(keys);
		this.value = this.initialValue = invokeValue(value, this, this);
		this.on('user:input', function(value){ console.log(value, false) })
		this.on('user:input:done', function(value){ console.log(value, true) })
	},
	commonTemplateContext() {
		let htmlAttrs = attrsToHtmlAttrs(this._tagAttributes);
		if (htmlAttrs) {
			htmlAttrs = ' ' + htmlAttrs;
		}
		return { htmlAttrs };
	},
	_getTagAttributes(keys) {
		const options = this.getOptions(keys, true);
		const attrs = Object.assign(options, this.getOption('inputAttributes', true));
		return attrs;
	},
	_handleInput() {
		let value = this._extractValue();
		this.trigger('user:input', value);
	},
	_handleInputDone(event, isTextarea) {
		if ((event.key === 'Enter' || event.keyCode === 13) && (event.ctrlKey === isTextarea || !isTextarea)) {
			event.preventDefault();
			let value = this._extractValue();
			this.trigger('user:input:done', value);
		}
	}
}