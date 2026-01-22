import { View, CollectionView, Collection } from '../../vendors.js';
import { CategoriesView, SELECT_CATEGORY_ID_ALL, SELECT_CATEGORY_ID_SELECTED } from './categories.js';
import { SearchView } from './search.js';
import { SelectCollectionView } from './SelectCollectionView.js';
import { SubmitView } from './submit.js';



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
			class: SelectCollectionView, collection, multiple: this.multiple, nullable: this.nullable, transformOutValue,
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