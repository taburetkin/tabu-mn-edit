import { View, CollectionView } from '../../vendors.js';

export const SELECT_CATEGORY_ID_ALL = Symbol('all');
export const SELECT_CATEGORY_ID_SELECTED = Symbol('selected');

const CategoryView = View.extend({
	template: '<span><%= name %></span>',
	baseClassName: [
		'select-category-trigger',
		v => v.activeClassName()
	],
	modelEvents: {
		'change:active'() {
			this.updateClassName();
		}
	},
	events: {
		click(event) {
			if (this.activeClassName()) { return; }
			this.trigger('select', this.model);
		}
	},
	activeClassName() {
		return this.model.get('active') ? 'active' : ''
	}
});

const allModell = {
	id: SELECT_CATEGORY_ID_ALL,
	name: 'все'
}
const selectedModel = {
	id: SELECT_CATEGORY_ID_SELECTED,
	name: 'выбранное'
}

export const CategoriesView = CollectionView.extend({
	childView: CategoryView,
	baseClassName: 'select-categories',
	initialize() {
		const models = this.getModels();
		this.initializeCollection(models);
		this.initializeActive();
	},
	initializeActive() {
		let active = this.collection.active || this.collection.findWhere({ active: true }) || this.collection.get(SELECT_CATEGORY_ID_ALL);
		if (active) {
			this.once('render', () => this._select(active));
		}
	},
	getModels() {
		const models = [
			{ 
				name: 'активные',
				active: true, 
				filter: (v,i) => {
					//console.log('+-', i, )
					return i % 2;
				} 
			}

		]
		let addSelectionModels = true;
		if (addSelectionModels) {
			models.unshift(allModell);
			models.push(selectedModel);
		}
		return models;
	},
	childViewEvents: {
		select: '_select'
	},
	_select(model) {
		if (this.collection.active === model) { return; }
		if (this.collection.active) {
			this.collection.active.set({ active: false });				
		}
		this.collection.active = model;
		if (model) {
			model.set({ active: true });
			this.trigger('category', model);
		}
	},
	getActive() {
		return this.collection.active;
	}
});
