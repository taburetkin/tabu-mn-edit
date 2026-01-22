export function attrsToHtmlAttrs(obj) {
	if (obj == null || typeof obj !== 'object') { return ''; }

	const arr = [];

	for(let key in obj) {
		let value = obj[key];
		if (value == null) {
			continue;
		}
		value = htmlEncodeAttr(value);
		arr.push(key + '="' + value + '"');
	}
	const htmlString = arr.join(' ');
	return htmlString;
}


function htmlEncodeAttr(str) {
		if (str == null) return '';
    if (typeof str !== 'string') {
        str = str.toString();
    }
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str; // Браузер автоматически кодирует <, >, &
    
    // innerHTML не кодирует кавычки, поэтому мы докодируем их вручную для безопасности в атрибутах
    return tempDiv.innerHTML
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;'); // Апостроф для строгой безопасности
}


export function handleInputDone(view, event) {

}

export function isAnyInputFocused() {
  const activeElement = document.activeElement;

  // Check if the active element is an input, textarea, or select element
  if (activeElement) {
    return activeElement.matches('input, textarea, select, button');
  }
  return false;
}


export const commonAttributeKeys = {
	inputName: 'name',
	inputPlaceholder: 'placeholder',
	inputTitle: 'title',
	inputClassName: 'class',
}