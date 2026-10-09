'use strict';

const links = {
	qobuz: 'https://pan.baidu.com/s/1KZKdzanzOuOucnm0JeIhog?pwd=qbdl',
	// Apple Music：am-sorted 下的条目
	am: 'https://pan.baidu.com/s/1SYyQkwJYxKiXokgGY7GHdQ?pwd=amdl',
	qbtmp: 'https://pan.baidu.com/s/1rNcrBE3NYoray8Q4X41fdw?pwd=temp',
	// Apple Music：am-dlt 下的条目
	amtmp: 'https://pan.baidu.com/s/1HMoCc-hd1S1lIVgRSfIpKA?pwd=amd3',
};

// 搜索结果数量限制
const MAX_RESULTS = 50;

const searchBox = document.querySelector('.search-box');
const resultsEl = document.querySelector('.results');

searchBox.disabled = true;
searchBox.placeholder = '正在加载数据...';

/**
 * 解析 JSONC 文本（先去除注释与尾随逗号，再交给 JSON.parse）
 * @param {string} text - JSONC 文本
 * @returns {any} 解析后的数据
 */
const parseJSONC = (text) => {
	let out = '';
	let inString = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		const next = text[i + 1];

		if (inString) {
			out += char;
			if (char === '\\') {
				// 转义字符：原样保留下一个字符
				out += next ?? '';
				i++;
			} else if (char === '"') {
				inString = false;
			}
			continue;
		}

		if (char === '"') {
			inString = true;
			out += char;
			continue;
		}

		// 行注释
		if (char === '/' && next === '/') {
			while (i < text.length && text[i] !== '\n') i++;
			out += '\n';
			continue;
		}

		// 块注释
		if (char === '/' && next === '*') {
			i += 2;
			while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
			i++;
			continue;
		}

		out += char;
	}

	// 移除尾随逗号
	return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
};

/**
 * 从URL异步加载数据（支持 JSON 与 JSONC）
 * @param {string} url - 数据源URL
 * @param {{ jsonc?: boolean }} [options] - 加载选项
 * @returns {Promise<Array>} 解析后的数据数组
 */
const loadData = async (url, { jsonc = false } = {}) => {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`加载失败: ${response.status}`);
		const text = await response.text();
		const parsed = jsonc ? parseJSONC(text) : JSON.parse(text);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.error(`数据加载错误 (${url}):`, error);
		return [];
	}
};

/** @type {Object<string, Array>} 存储所有平台专辑数据 */
let data;

/** 数据源定义：key 为来源标识，url 为数据文件 */
const SOURCES = {
	qobuz: { url: './qobuz/data.json' },
	qbtmp: { url: './qobuz/temp.json' },
	am: { url: './am/data.jsonc', jsonc: true },
};

/**
 * 为专辑数据添加来源标记
 * @param {Array} albums - 原始专辑数据
 * @param {string} source - 数据来源标识
 * @returns {Array} 处理后的专辑数据
 */
const processAlbums = (albums, source) => Object.freeze(albums.map((album) => ({ ...album, source })));

/**
 * 初始化应用数据
 * @returns {Promise<void>}
 */
const init = async () => {
	const loaded = await Promise.all(
		Object.entries(SOURCES).map(async ([source, { url, jsonc }]) => [
			source,
			processAlbums(await loadData(url, { jsonc }), source),
		])
	);

	data = Object.fromEntries(loaded);

	searchBox.disabled = false;
	searchBox.placeholder = '搜索艺人、专辑...';
	searchBox.focus();
};

/**
 * 规范化搜索查询，替换特殊字符
 * @param {string} query - 原始搜索词
 * @returns {string} 规范化后的搜索词
 */
const normalizeQuery = (query) => query.replace(/['/:]/g, '_');

/**
 * 判断专辑是否符合关键词（比對艺人、专辑、别名/原名，以及曲目标题（若有））
 * @param {Object} album - 专辑数据对象
 * @param {string} normalized - 规范化后的关键词（小写）
 * @returns {boolean} 是否匹配
 */
const matches = (album, normalized) =>
	[album.artist, album.album, album.original_artist].some(
		(field) => typeof field === 'string' && field.toLowerCase().includes(normalized)
	) ||
	(Array.isArray(album.tracks) &&
		album.tracks.some((track) => typeof track?.title === 'string' && track.title.toLowerCase().includes(normalized)));

/**
 * 在所有数据中搜索匹配的专辑
 * @param {string} query - 搜索关键词
 * @returns {Array} 匹配的专辑数组
 */
const search = (query) => {
	const term = query.trim().toLowerCase();
	if (!term || !data) return [];

	const normalized = normalizeQuery(term);
	const results = [];

	// 遍历所有数据源，直到达到最大结果数量
	for (const albums of Object.values(data)) {
		for (const album of albums) {
			if (results.length >= MAX_RESULTS) return results;
			if (matches(album, normalized)) results.push(album);
		}
	}

	return results;
};

/**
 * 转义正则表达式特殊字符
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 建立高亮用正则（同时匹配原始关键词与规范化后的关键词）
 * @param {string} query - 搜索查询词
 * @returns {RegExp} 高亮用正则
 */
const buildHighlightRegex = (query) => {
	const variants = [...new Set([query, normalizeQuery(query)])].filter(Boolean);
	return new RegExp(`(${variants.map(escapeRegex).join('|')})`, 'gi');
};

/**
 * 生成结果卡片的附加信息（路径 / 年份 / 格式）
 * @param {Object} album - 专辑数据对象
 * @returns {string} 信息区HTML
 */
const buildMeta = (album) => {
	const items = [];

	if (album.location) items.push(`<span class="location">${album.location}</span>`);
	if (album.year) items.push(`<span class="year">${album.year}</span>`);
	if (album.codec) items.push(`<span class="codec">${album.codec}</span>`);

	return items.length ? `<div class="meta">${items.join('')}</div>` : '';
};

/**
 * 高亮显示搜索结果中的匹配文本
 * @param {Object} album - 专辑数据对象
 * @param {string} query - 搜索查询词
 * @returns {string} 包含高亮标记的HTML字符串
 */
const highlight = (album, query) => {
	const regex = buildHighlightRegex(query);
	const mark = (text) => (typeof text === 'string' ? text.replace(regex, '<span class="highlight">$1</span>') : '');

	// 别名（原名）仅少数条目存在
	const alias = album.original_artist ? `<div class="alias">原名：${mark(album.original_artist)}</div>` : '';

	// Qobuz 等含曲目数据的数据源：列出符合关键词的曲目（Apple Music 无此字段）
	const normalized = normalizeQuery(query.trim().toLowerCase());
	const tracks = Array.isArray(album.tracks)
		? album.tracks
				.filter((track) => typeof track?.title === 'string' && track.title.toLowerCase().includes(normalized))
				.map(
					(track) => `
				<li class="track-match-item">
					${track.number}. ${mark(track.title)}
				</li>`
				)
				.join('')
		: '';

	const tracksHTML = tracks ? `<ul class="track-match-list">${tracks}</ul>` : '';

	return `
		<div class="result-content">
			<div class="artist">${mark(album.artist)}</div>
			${alias}
			<div class="album">${mark(album.album)}</div>
			${buildMeta(album)}
			${tracksHTML}
		</div>
	`;
};

/**
 * 依数据来源与存放路径计算跳转链接
 * @param {Object} album - 专辑数据对象
 * @returns {string} 跳转链接
 */
const getLink = (album) => {
	if (album.source === 'am') {
		// location 在 am-dlt 下的条目指向「近期」链接，在 am-sorted 下的条目指向「历史文件」链接
		return typeof album.location === 'string' && album.location.startsWith('am-dlt') ? links.amtmp : links.am;
	}
	return links[album.source];
};

/** 来源标识对应的显示名称 */
const SOURCE_LABELS = {
	qobuz: 'QOBUZ',
	qbtmp: 'QOBUZ-TEMP',
	am: 'AM',
};

/** 来源标识对应的样式分组 */
const SOURCE_GROUPS = {
	qobuz: 'qobuz',
	qbtmp: 'qobuz',
	am: 'am',
};

/**
 * 将搜索结果渲染到页面
 * @param {Array} results - 搜索结果数组
 * @param {string} query - 搜索查询词
 */
const render = (results, query) => {
	resultsEl.replaceChildren(
		...results.map((album) => {
			const el = document.createElement('a');
			el.className = 'result-item';
			el.href = getLink(album);

			el.innerHTML = `
				${highlight(album, query)}
				<div class="source" data-source="${SOURCE_GROUPS[album.source] ?? album.source}">
					${SOURCE_LABELS[album.source] ?? album.source.toUpperCase()}
				</div>
			`;

			return el;
		})
	);
	// 显示结果数量信息
	if (results.length === MAX_RESULTS) {
		const infoEl = document.createElement('div');
		infoEl.className = 'result-info';
		infoEl.textContent = `显示前 ${MAX_RESULTS} 个结果，请使用更具体的关键词获取更多结果`;
		resultsEl.appendChild(infoEl);
	}
};

/**
 * 创建防抖函数，延迟执行目标函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
const debounce = (fn, delay = 100) => {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
};

/**
 * 处理搜索输入事件
 * @param {Event} event - 输入事件对象
 */
const handleSearch = debounce((event) => {
	const query = event.target.value.trim();
	const results = search(query);
	render(results, query);
});

// 初始化应用
(async () => {
	await init();
	searchBox.addEventListener('input', handleSearch);
})();
