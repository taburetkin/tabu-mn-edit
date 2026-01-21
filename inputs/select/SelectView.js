import { View, CollectionView, Collection } from '../../vendors.js';
import { CategoriesView, SELECT_CATEGORY_ID_ALL, SELECT_CATEGORY_ID_SELECTED } from './categories.js';
import { SearchView } from './search.js';
import { SubmitView } from './submit.js';

const SelectItemLabelView = View.extend({
	baseClassName: 'select-item-label',
	tagName: 'span',
	template: '<span><%= label %></span>'
});

const SelectItemView = View.extend({
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

const JustSelectView = CollectionView.extend({
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


export const SelectView = View.extend({
	baseClassName: 'select-control',
	mergeOptionsKeys: ['multiple', 'nullable', 'nullableValue'],
	initialize() {
		this.on('all', e => console.log(`-[${e}]-`, this.cid));
	},
	childView: View,
	children() {
		const cats = this.getCategoriesView();
		const srch = this.getSearchView();
		const sel = this.getSelectView();
		const btns = this.getSubmitButtons();
		const views = [cats, srch, sel, btns];
		console.log('select children', views)
		return views;
	},
	childViewTriggers: {
		'user:input':'user:input',
		'submit':'submit',
		'category':'category',
		'search':'search'
	},
	getCategoriesView() {
		if (this.getOption('noCategories', true)) { return; }
		return { 
			class: CategoriesView,
			multiple: this.multiple,
			nullable: this.nullable,
			setAsParentProperty: 'categoriesView',
		};
	},
	getSearchView() {
		if (this.getOption('noSearch', true)) { return; }
		
		return { 
			class: SearchView,
			setAsParentProperty: 'selectView',
		};
	},
	getSelectView() {
		const collection = buildEnumCollection({
			enumName: 'someName',
			value: ['one','three'],
			multiple: this.multiple,
			nullable: this.nullable,
		});
		let nullableValue = !this.nullable ? this.nullableValue : null;
		const transformOutValue = models => {
			let v = models.map(m => m.id);
			if (!this.multiple) {
				v = v[0] || nullableValue
			} else {
				v = v.join(', ') || nullableValue
			}
			return v;
		}
		return { 
			class: JustSelectView, collection, multiple: this.multiple, nullable: this.nullable, transformOutValue,
			setAsParentProperty: 'selectView',
		};
	},
	getSubmitButtons() {
		if (this.getOption('noSubmit', true)) {
			return;
		}
		return { 
			class: SubmitView,
			noReset: this.getOption('noReset', true),
			noCancel: this.getOption('noCancel', true),
			setAsParentProperty: 'submitView',
		};
	},

});

const someEnum = {
	none: 'Значение не указано',
	one: 'Odin',
	two: 'Dwa',
	three: 'Tri',
	four: 'Chetiri',
	five: 'Pyat',
	six: 'Shest',
	seven: 'Sem',
	eight: 'Vosem',
	nine: 'Devyat',
	ten: 'Desyat',
	one2: 'Odin-2',
	two2: 'Dwa-2',
	three2: 'Tri-2',
	four2: 'Chetiri-2',
	five2: 'Pyat-2',
	six2: 'Shest-2',
	seven2: 'Sem-2',
	eight2: 'Vosem-2',
	nine2: 'Devyat-2',
	ten2: 'Desyat-2'	
}

const defaultEnumValues = {
	none: 1,
	undefined: 1,
	notdefined: 1
}

function buildEnumCollection(options = {}) {
	let { enumName, multiple, nullable, value } = options;
	console.log('value?', value)
	if (typeof value === 'string') {
		value = multiple ? value.split(/\s*,\s*/) : [value]
	}
	else if (!Array.isArray(value)) {
		value = [];
	}

	const enumObj = someEnum;
	const models = Object.keys(enumObj).map(id => ({ id, label: someEnum[id] })).filter(m => {
		if (m.id in defaultEnumValues) {
			if (nullable || multiple) {
				return false;
			}
		}
		return true;
	});
	const col = new Collection();
	col.add(models);
	const selected = value.map(id => col.get(id)).filter(m => !!m);
	col.initialSelected = selected;
	console.log('col', col)
	return col;
}

function anyProperty(obj, text) {
	var pat = new RegExp(text, 'im');
	if (obj == null) return false;
	for(let key in obj) {
		let value = obj[key];
		if (value == null) continue;
		value = value.toString();
		if (pat.test(value)) {
			console.log('tested', value, pat)
			return true;
		}
	}
	return false;
}