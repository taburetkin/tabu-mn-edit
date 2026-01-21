import { View } from '../../vendors.js';
import { RawInputView } from '../RawInputView.js';
export const SearchView = View.extend({
	children:[{ class: RawInputView }],
	childViewTriggers: {
		'user:input':'search'
	}
});