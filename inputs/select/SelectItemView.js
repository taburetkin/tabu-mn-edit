import { View, CollectionView, Collection } from '../../vendors.js';
import { CategoriesView, SELECT_CATEGORY_ID_ALL, SELECT_CATEGORY_ID_SELECTED } from './categories.js';
import { SearchView } from './search.js';
import { SubmitView } from './submit.js';

const SelectItemLabelView = View.extend({
	baseClassName: 'select-item-label',
	tagName: 'span',
	template: '<span><%= label %></span>'
});

export const SelectItemView = View.extend({
	mergeOptionsKeys: ['isSelected'],
	modelEvents: {
		'selected':'updateClassName'
	},
	baseClassName: [
		'select-item',
		v => v.selectedClassName() 
	],
	selectedClassName() {
		return this.isSelected() ? 'selected' : ''
	},
	template: '<span class="select-item-icon"><span></span></span>',
	passDownModel: true,
	children() {
		const views = [SelectItemLabelView]
		return views;
	},
	triggers: {
		click: 'click'
	}
});
