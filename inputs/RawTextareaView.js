import { View } from '../vendors.js';
import { commonInputMixin } from './mixin.js';
import { commonAttributeKeys } from './utils.js';


const keys = Object.assign({
}, commonAttributeKeys);


export const RawTextareaView = View.extend({
	...commonInputMixin,
	baseClassName: 'raw-textarea-view',
	template: '<textarea<%= htmlAttrs %>><%= value %></textarea>',
	initialize() {
		const value = this.getOption('value', true);
		this._initializeInput(keys, value);
	},
	templateContext() {
		const ctx = this.commonTemplateContext();
		ctx.value = this.value;
		return ctx;
	},
	_extractValue() {
		return this.ui.input.val();
	},
	ui: {
		input: 'textarea'
	},
	events: {
		'input textarea'() {
			this._handleInput.apply(this, arguments);
		},
		'keydown textarea'(e) {
			if (e.keyCode === 9 || e.key === 'Tab') {
				e.preventDefault();
				const ta = e.target;
				const start = ta.selectionStart;
				const end = ta.selectionEnd;
				const currentValue = ta.value;
				ta.value = currentValue.substring(0, start) + 
								'\t' + 
								currentValue.substring(end);
				ta.selectionStart = ta.selectionEnd = start + 1;
			}
			const isTextarea = true;
			this._handleInputDone(e, isTextarea);
		},

	}	

});