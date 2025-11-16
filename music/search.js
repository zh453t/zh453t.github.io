'use strict';

const links = {
	qobuz: 'https://pan.baidu.com/s/1KZKdzanzOuOucnm0JeIhog?pwd=qbdl',
	am: 'https://pan.baidu.com/s/1SYyQkwJYxKiXokgGY7GHdQ?pwd=amdl',
	qbtmp: 'https://pan.baidu.com/s/1rNcrBE3NYoray8Q4X41fdw?pwd=temp',
	amtmp: 'https://pan.baidu.com/s/1HMoCc-hd1S1lIVgRSfIpKA?pwd=amd3',
};

// 搜索结果数量限制
const MAX_RESULTS = 50;

const searchBox = document.querySelector('.search-box');
const resultsEl = document.querySelector('.results');

searchBox.disabled = true;
searchBox.placeholder = '正在加载数据...';

/**
 * 从URL异步加载JSON数据
 * @param {string} url - 数据源URL
 * @returns {Promise<Array>} 解析后的数据数组
 */
const loadData = async (url) => {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`加载失败: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error(`数据加载错误 (${url}):`, error);
		return [];
	}
};

/** @type {Object<string, Array>} 存储所有平台专辑数据 */
let data;

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
	const rawData = {
		qobuz: await loadData('./qobuz/data.json'),
		qbtmp: await loadData('./qobuz/temp.json'),
		am: await loadData('./am/data.json'),
		amtmp: await loadData('./am/temp.json'),
	};

	data = {
		qobuz: processAlbums(rawData.qobuz, 'qobuz'),
		qbtmp: processAlbums(rawData.qbtmp, 'qobuz-temp'),
		am: processAlbums(rawData.am, 'am'),
		amtmp: processAlbums(rawData.amtmp, 'am-temp'),
	};

	searchBox.disabled = false;
	searchBox.placeholder = '搜索艺人、专辑、曲目...';
	searchBox.focus();
};

/**
 * 规范化搜索查询，替换特殊字符
 * @param {string} query - 原始搜索词
 * @returns {string} 规范化后的搜索词
 */
const normalizeQuery = (query) => query.replace(/['/:]/g, '_');

/**
 * 在所有数据中搜索匹配的专辑
 * @param {string} query - 搜索关键词
 * @returns {Array} 匹配的专辑数组
 */
const search = (query) => {
	const term = query.trim().toLowerCase();
	if (!term || !data) return [];

	const normalized = normalizeQuery(term);
	let resultCount = 0;
	const results = [];

	// 遍历所有数据源，直到达到最大结果数量
	for (const albums of Object.values(data)) {
		if (resultCount >= MAX_RESULTS) break;

		for (const album of albums) {
			if (resultCount >= MAX_RESULTS) break;

			const artistMatch = album.artist.toLowerCase().includes(normalized);
			const albumMatch = album.album.toLowerCase().includes(normalized);
			const trackMatch = album.tracks.some((track) => track.title.toLowerCase().includes(normalized));

			if (artistMatch || albumMatch || trackMatch) {
				results.push(album);
				resultCount++;
			}
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
 * 高亮显示搜索结果中的匹配文本
 * @param {Object} album - 专辑数据对象
 * @param {string} query - 搜索查询词
 * @returns {string} 包含高亮标记的HTML字符串
 */
const highlight = (album, query) => {
	const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
	const normQuery = query.toLowerCase();

	const artist = album.artist.replace(regex, '<span class="highlight">$1</span>');
	const albumName = album.album.replace(regex, '<span class="highlight">$1</span>');

	const tracks = album.tracks
		.filter((track) => track.title.toLowerCase().includes(normQuery))
		.map(
			(track) => `
			<li class="track-match-item">
				${track.number}. ${track.title.replace(regex, '<span class="highlight">$1</span>')}
			</li>`
		)
		.join('');

	const tracksHTML = tracks ? `<ul class="track-match-list">${tracks}</ul>` : '';

	return `
		<div class="result-content">
			<div class="artist">${artist}</div>
			<div class="album">${albumName}</div>
			<div class="meta">
				<span class="year">${album.year}</span>
				<span class="codec">${album.codec}</span>
			</div>
			${tracksHTML}
		</div>
	`;
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
			el.href = links[album.source];

			el.innerHTML = `
				${highlight(album, query)}
				<div class="source" data-source="${album.source}">
					${album.source.toUpperCase()}
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
