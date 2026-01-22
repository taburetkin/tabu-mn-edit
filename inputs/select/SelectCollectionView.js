import { View, CollectionView, Collection } from '../../vendors.js';
import { CategoriesView, SELECT_CATEGORY_ID_ALL, SELECT_CATEGORY_ID_SELECTED } from './categories.js';
import { SearchView } from './search.js';
import { SelectItemView } from './SelectItemView.js';
import { SubmitView } from './submit.js';


export const SelectCollectionView = CollectionView.extend({
	mergeOptionsKeys:['multiple', 'nullable', 'transformOutValue'],
	initialize() {
		this.selected = new Set();
		if (this.collection.initialSelected?.length) {
			this.once('render', () => {
				this.collection.initialSelected.forEach(model => this._select(model));
			})
		}
		this.listenTo(this.parentView, {
			'submit': this._onSubmit,
			'category': this._onCategory,
			'search': this._onSearch
		});
		let category = this.parentView.categoriesView?.getActive();
		if (category) {
			this._onCategory(category, true);
		}
	},
	_textFilter(view) {
		if (!this.searchText) { return true; }
		return anyProperty(view.model.attributes, this.searchText);
	},
	_onSearch(value, noSort) {
		if (value == null) { return; }
		value = value.toString();
		this.searchText = value;
		if (value === '') {
			this.textFilterView = null;
		} else {
			this.textFilterView = this._textFilter;
		}
		if (!noSort) {
			this.sort();
		}		
		console.log('search', arguments);
	},
	_onCategory(category, noSort) {
		if (category.id === SELECT_CATEGORY_ID_ALL) {
			this.categoryFilterView = null;
		}
		else if (category.id === SELECT_CATEGORY_ID_SELECTED) {
			this.categoryFilterView = v => v.isSelected();
		} else {
			const filter = category.get('filter');
			this.categoryFilterView = filter;
		}
		if (!noSort) {
			this.sort();
		}
	},
	_onSubmit(type, event) {
		if (type === 'ok') {
			return this.triggerChange(true);
		}
		else if (type === 'cancel') {
			return this.parentView.trigger('user:input:cancel');
		}
		else if (type === 'reset') {
			return this._clear();
		}
	},
	_isSelected(model) {
		return this.selected.has(model);
	},
	_select(model) {
		this.selected.add(model)
		model.trigger('selected', model, true);
	},
	_unselect(model) {
		this.selected.delete(model);
		model.trigger('selected', model, false);
	},
	baseClassName: [
		'select-items',
		v => v.multiple ? 'multiple' : 'single'
	],
	childView: SelectItemView,
	childViewOptions() {
		const parent = this;
		return {
			isSelected: function() {
				return parent._isSelected(this.model);
			}
		}
	},
	childViewEvents: {
		click(view, event) {
			const shiftKey = event.shiftKey;
			this.processClick(view, shiftKey);
		}
	},
	processClick(view, isRange) {
		if (!this.prevClick || !isRange || !this.multiple) {
			this.processSingleClick(view);
		} else {
			this.processRangeClick(view);
		}
		this.triggerChange();
	},
	processSingleClick(view) {
		const index = this._getViewIndex(view);
		const click = {
			view,
			index
		}
		this.prevClick = click;
		//console.log('#1', { m: this.multiple, n: this.nullable })

		if (this.multiple) {
			this._toggleOne(view.model);
			return;
		}

		const alreadySelected = this._isSelected(view.model);

		//removing all selected
		const selected = [...this.selected];
		//const first = selected[0];
		selected.forEach(model => {
			if (model == view.model) {
				if (this.nullable) {
					this._toggleOne(model);
				}
			} else {
				this._toggleOne(model)
			}
		});
		if (!alreadySelected) {
			this._toggleOne(view.model);
		}

	},
	processRangeClick(view) {
		let start = this.prevClick.index;
		delete this.prevClick;
		let stop = this._getViewIndex(view);

		if (start === stop) {
			this._toggleOne(view.model);
			return;
		}

		let dif = start < stop ? 1 : -1;
		
		for(let i = start + dif; i != stop + dif; i += dif) {
			const view = this._getViewByIndex(i);
			if (view) { this._toggleOne(view.model); }
		}
	},
	_getViewByIndex(index) {
		const views = this._getImmediateChildren();
		return views[index];
	},
	_getViewIndex(view) {
		const views = this._getImmediateChildren();
		return views.indexOf(view);
	},
	_clear() {
		const vals = [...this.selected];
		vals.forEach(v => this._unselect(v));
		this.triggerChange(true);
	},
	_toggleOne(model) {
		if (this._isSelected(model)) {
			this._unselect(model);
		} else {
			this._select(model);
		}
	},
	triggerChange(done) {
		let v = [...this.selected];
		if (this.transformOutValue) {
			v = this.transformOutValue(v);
		}
		this.trigger('user:input', v, !!done || !this.multiple);
	},
	viewFilter(view, index) {
		if (this.categoryFilterView && !this.categoryFilterView(view, index)) { return false; }
		if (this.textFilterView && !this.textFilterView(view, index)) { return false; }
		//console.log('*+*');
		return true;
	}
});
