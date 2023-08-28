'use strict';
import * as base64us from './base64us.js';
const config = {
	encode: {
		useURI: true,
		useBinary: false,
		useBase64US: false,
	},
	decode: {
		useURI: true,
		useBinary: false,
		base64US: false,
		base64USHex: false,
	},
	// useURI will be changed automatically
};

const init = function () {
	const encodeForm = document.querySelector('.encode');
	encodeForm.reset();

	const decodeForm = document.querySelector('.decode');
	decodeForm.reset();

	const onchangeCallback = function () {
		const data = new FormData(this);
		let type = '';
		if (this === encodeForm) type = 'encode';
		if (this === decodeForm) type = 'decode';
		for (const key in config[type]) {
			config[type][key] = false;
			if (key === data.get(type)) config[type][key] = true;
		}

		// 例如
		// for (const key in config.encode) {
		// 	config.encode[key] = false;
		// 	if (key === data.get(type)) config.encode[key] = true;
		// }

		console.info(`${type} config changed:`, config[type]);
	};

	encodeForm.addEventListener('change', onchangeCallback);
	decodeForm.addEventListener('change', onchangeCallback);
};
init();

const binaryHelpers = {
	toBinary(string) {
		const codeUnits = new Uint16Array(string.length);
		for (let i = 0; i < codeUnits.length; i++) {
			codeUnits[i] = string.charCodeAt(i);
		}
		const charCodes = new Uint8Array(codeUnits.buffer);
		let result = '';
		for (let i = 0; i < charCodes.byteLength; i++) {
			result += String.fromCharCode(charCodes[i]);
		}
		return result;
	},
	fromBinary(binary) {
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		const charCodes = new Uint16Array(bytes.buffer);
		let result = '';
		for (let i = 0; i < charCodes.length; i++) {
			result += String.fromCharCode(charCodes[i]);
		}
		return result;
	},
};

class base64Tools {
	updateOutput(text) {
		this.output.textContent = text;
	}

	addHandlerClick(configObj) {
		if (configObj.encode && configObj.decode) return;

		const handler = () => {
			const input = this.input.value;
			if (!input) return;
			// console.log(this, 'encoding');
			let output;

			if (configObj.encode) output = this.encode(input);
			if (configObj.decode) output = this.decode(input);
			this.updateOutput(output);
		};
		this.btn.addEventListener('click', handler.bind(this));
		this.input.addEventListener('input', handler.bind(this));
	}

	findConfig(configObj) {
		// configObj 像实际中 config.encode 一样， 是没有嵌套的， value 全是布尔值的 object

		// 检测是否有两个 true
		// 算了，谁闲的跑控制台改config
		// if (
		// 	!Object.values(configObj).reduce((prev, curr) => {
		// 		if (curr && typeof prev === 'number') prev++;
		// 		if (prev === 2) return false; // 例如config.encode里有超过2个true时，函数会返回false, 触发保护语句 if(!false)
		// 		else return prev;
		// 	}, 0)
		// ) {
		// 	console.warn('config 不符合要求');
		// 	return;
		// }
		return Object.entries(configObj).find((entry) => entry[1])[0];
		// entry[0] 是 key, entry[1] 是 value
		// 找 true
	}
}
class Encode extends base64Tools {
	btn = document.querySelector('#enc--btn');
	input = document.querySelector('#enc--input');
	output = document.querySelector('#enc-out');
	constructor() {
		super();
		this.addHandlerClick({ encode: true });
	}

	encode(text) {
		const configText = this.findConfig(config.encode);

		// if (configText === 'useNothing') return btoa(text); *保留*
		if (configText === 'useURI') return btoa(encodeURIComponent(text));
		if (configText === 'useBinary') return btoa(binaryHelpers.toBinary(text));
		if (configText === 'useBase64US') return base64us.base64Encode(text);
	}
}
class Decode extends base64Tools {
	btn = document.querySelector('#dec--btn');
	input = document.querySelector('#dec--input');
	output = document.querySelector('#dec--output');

	constructor() {
		super();
		this.addHandlerClick({ decode: true });
	}

	/**
	 * core
	 * @param {string} base64Text
	 * @param {boolean} useURI
	 * @returns {string}
	 */
	decode(base64Text) {
		// read config
		const configText = this.findConfig(config.decode);

		if (configText === 'useBinary') return binaryHelpers.fromBinary(atob(base64Text));
		if (configText == 'useURI') return decodeURIComponent(atob(base64Text));
		if (configText == 'base64US') return base64us.base64Decode(base64Text, { hexOut: true });
		if (configText == 'base64USHex') return base64us.base64Decode(base64Text, { hexOut: false });
	}
}

const encode = new Encode();
const decode = new Decode();
// DO NOT MODIFY ENCODE & DECODE OBJECTS
