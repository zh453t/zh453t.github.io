/**
 * Created by 愚人码头 .
 * author: 愚人码头
 * Date: 11-5-19
 * Time: 上午10:24
 * Modified: 23-8-24
 */

const config = {
	// 是否为utf-16
	hexIn: false,
	hexOut: false,
};

const helpers = {
	utf16to8(str) {
		let out, i, length, c;
		let charCode;
		out = config.hexIn ? [] : '';
		length = str.length;
		for (i = 0; i < length; i++) {
			c = config.hexIn ? str[i] : str.charCodeAt(i);
			if (c >= 0x0001 && c <= 0x007f) {
				config.hexIn ? out.push(str[i]) : (out += str.charAt(i));
			} else if (c > 0x07ff) {
				charCode = 0xe0 | ((c >> 12) & 0x0f);
				config.hexIn ? out.push(charCode) : (out += String.fromCharCode(charCode));
				charCode = 0x80 | ((c >> 6) & 0x3f);
				config.hexIn ? out.push(charCode) : (out += String.fromCharCode(charCode));
				charCode = 0x80 | ((c >> 0) & 0x3f);
				config.hexIn ? out.push(charCode) : (out += String.fromCharCode(charCode));
			} else {
				charCode = 0xc0 | ((c >> 6) & 0x1f);
				config.hexIn ? out.push(charCode) : (out += String.fromCharCode(charCode));
				charCode = 0x80 | ((c >> 0) & 0x3f);
				config.hexIn ? out.push(charCode) : (out += String.fromCharCode(charCode));
			}
		}
		return out;
	},
	utf8to16(str) {
		let out, i, length, c;
		let char2, char3;
		let charCode;

		out = config.hexOut ? [] : '';
		length = str.length;
		i = 0;
		while (i < length) {
			c = config.hexOut ? str[i++] : str.charCodeAt(i++);
			switch (c >> 4) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					// 0xxxxxxx
					config.hexOut ? out.push(str[i - 1]) : (out += str.charAt(i - 1));
					break;
				case 12:
				case 13:
					// 110x xxxx   10xx xxxx
					char2 = config.hexOut ? str[i++] : str.charCodeAt(i++);
					charCode = ((c & 0x1f) << 6) | (char2 & 0x3f);
					config.hexOut ? out.push(charCode) : (out += String.fromCharCode(charCode));
					break;
				case 14:
					// 1110 xxxx  10xx xxxx  10xx xxxx
					char2 = config.hexOut ? str[i++] : str.charCodeAt(i++);
					char3 = config.hexOut ? str[i++] : str.charCodeAt(i++);
					charCode = ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0);
					config.hexOut ? out.push(charCode) : (out += String.fromCharCode(charCode));
					break;
			}
		}

		return out;
	},
	CharToHex(str) {
		let out, i, length, c, h;
		out = '';
		length = str.length;
		i = 0;
		while (i < length) {
			c = str.charCodeAt(i++);
			h = c.toString(16);
			if (h.length < 2) h = '0' + h;

			out += '\\x' + h + ' ';
			if (i > 0 && i % 8 == 0) out += '\r\n';
		}

		return out;
	},
};
/**
 * 编码 base64
 * @param {string} src utf-8 string
 * @returns {string} base64 text
 */
const base64Encode = function (src) {
	const core = function (str) {
		const base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		let c1, c2, c3;

		let length = str.length;
		let i = 0;
		let output = '';
		while (i < length) {
			c1 = (config.hexIn ? str[i++] : str.charCodeAt(i++)) & 0xff;
			if (i == length) {
				output += base64EncodeChars.charAt(c1 >> 2);
				output += base64EncodeChars.charAt((c1 & 0x3) << 4);
				output += '==';
				break;
			}
			c2 = config.hexIn ? str[i++] : str.charCodeAt(i++);
			if (i == length) {
				output += base64EncodeChars.charAt(c1 >> 2);
				output += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
				output += base64EncodeChars.charAt((c2 & 0xf) << 2);
				output += '=';
				break;
			}
			c3 = config.hexIn ? str[i++] : str.charCodeAt(i++);
			output += base64EncodeChars.charAt(c1 >> 2);
			output += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
			output += base64EncodeChars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
			output += base64EncodeChars.charAt(c3 & 0x3f);
		}
		return output;
	};
	return core(config.hexIn ? src : helpers.utf16to8(src));
};
/**
 * decodes base64 text
 * @param {string} src base64 text
 * @returns {string} utf-8 string
 * @author:  愚人码头
 */
const base64Decode = function (src, { hexOut }) {
	const core = function (str) {
		const base64DecodeChars = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1];

		let c1, c2, c3, c4;
		let i, length, out;
		let charCode;

		length = str.length;
		i = 0;
		out = config.hexOut ? [] : '';
		while (i < length) {
			/* c1 */
			do {
				c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < length && c1 == -1);
			if (c1 == -1) break;

			/* c2 */
			do {
				c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
			} while (i < length && c2 == -1);
			if (c2 == -1) break;

			charCode = (c1 << 2) | ((c2 & 0x30) >> 4);
			config.hexOut ? out.push(charCode) : (out += String.fromCharCode(charCode));

			/* c3 */
			do {
				c3 = str.charCodeAt(i++) & 0xff;
				if (c3 == 61) return out;
				c3 = base64DecodeChars[c3];
			} while (i < length && c3 == -1);
			if (c3 == -1) break;
			charCode = ((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2);
			config.hexOut ? out.push(charCode) : (out += String.fromCharCode(charCode));

			/* c4 */
			do {
				c4 = str.charCodeAt(i++) & 0xff;
				if (c4 == 61) return out;
				c4 = base64DecodeChars[c4];
			} while (i < length && c4 == -1);
			if (c4 == -1) break;
			charCode = ((c3 & 0x03) << 6) | c4;
			config.hexOut ? out.push(charCode) : (out += String.fromCharCode(charCode));
		}
		return out;
	};
	let result = core(src);
	if (hexOut) result = helpers.utf8to16(result);
	return result;
};

export { base64Encode, base64Decode, config };
