import { View } from '../../vendors.js';

const Btn = View.extend({
	tagName: 'button',
	template: '<span><span class="icon"></span><span class="button-text"><%= text %></span></span>',
	templateContext() {
		return {
			text: this.getText()
		}
	},
	getText() {
		return this.getOption('text', true)
	},
	events: {
		click(event) {
			this.trigger('submit', this.getOption('type', true), event);
		}
	}
});

const Ok = Btn.extend({
	type: 'ok',
	text:'Ok'
});

const Cancel = Btn.extend({
	type: 'cancel',
	text: 'Cancel'
});

const Reset = Btn.extend({
	type: 'reset',
	text: 'Reset'
});

export const SubmitView = View.extend({
	baseClassName: 'select-submit',
	children:[
		Ok,
		v => !v.getOption('noCancel', true) ? Cancel : undefined,
		v => !v.getOption('noReset', true) ? Reset : undefined
	],
	childViewTriggers: {
		submit:'submit'
	}
});