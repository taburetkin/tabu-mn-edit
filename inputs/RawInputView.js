import { View } from '../vendors.js';
import { commonInputMixin } from './mixin.js';
import { attrsToHtmlAttrs, commonAttributeKeys } from './utils.js';

const keys = Object.assign({
	inputType: 'type', 
	value: 1
}, commonAttributeKeys);

export const RawInputView = View.extend({
	...commonInputMixin,
	baseClassName: 'raw-input-view',
	template: '<input<%= htmlAttrs %>>',
	initialize() {
		this._initializeInput(keys, () => this._tagAttributes.value);
	},
	templateContext() {
		return this.commonTemplateContext();
	},
	_extractValue() {
		return this.ui.input.val();
	},	
	ui: {
		input: 'input'
	},
	events: {
		'input input'() {
			this._handleInput.apply(this, arguments);
		},
		'keydown input'(e) {
			const isTextarea = false;
			this._handleInputDone(e, isTextarea);
		},		
	}
});