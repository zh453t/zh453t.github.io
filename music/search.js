'use strict';

/**
 * @category Constants
 * @description 存储跳转链接的对象。
 */
const link = {
	qobuz: 'https://pan.baidu.com/s/1KZKdzanzOuOucnm0JeIhog?pwd=qbdl',
};

/**
 * @category DOM Elements
 * @description 搜索输入框元素。
 * @type {HTMLInputElement}
 */
const searchBox = document.querySelector('.search-box');

/**
 * @category DOM Elements
 * @description 搜索结果容器元素。
 * @type {HTMLOutputElement}
 */
const resultsContainer = document.querySelector('.results');

// 禁用搜索框直到数据加载完成
searchBox.disabled = true;
searchBox.placeholder = '正在加载数据...';

/**
 * @category Functions
 * @function loadData
 * @description 异步从指定 URL 加载 JSON 数据。
 * @param {string} url - 要获取的数据的 URL。
 * @returns {Promise<Array<any>>} 解析后的 JSON 数据数组，如果失败则为空数组。
 */
const loadData = async (url) => {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`加载失败: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error(`加载数据时出错 (${url}):`, error);
		return [];
	}
};

/**
 * @category State
 * @description 存储所有预处理和解析后的数据源。
 * @type {Object<string, Array<Object>>}
 */
let sources;

/**
 * @category Functions
 * @function initializeData
 * @description 异步加载、解析和预处理所有数据源，并在完成后启用搜索框。
 * @returns {Promise<void>}
 */
const initializeData = async () => {
	let rawData = {
		qobuz: await loadData('./qobuz/data.json'),
	};

	/**
	 * @category Internal Functions
	 * @function parseEntry
	 * @description 解析单个原始数据字符串（符合 "Artist - Album (year) [codec]" 或 "Artist" 格式）为结构化对象。
	 * @param {string} text - 原始数据字符串。
	 * @param {string} sourcePrefix - 数据源标识符 (例如 'qobuz')。
	 * @returns {object} 解析后的数据对象。
	 */
	const parseEntry = (text, sourcePrefix) => {
		// 判断是否为 "Artist Name - Album Title (year) [codec]" 格式
		const match = text.match(/(.*?) - (.*?) \((\d+)\) \[(.*?)\]/);
		if (match) {
			return {
				raw: text,
				artist: match[1],
				album: match[2],
				year: match[3],
				codec: match[4],
				normalized: text.toLowerCase(),
				source: `${sourcePrefix}`,
			};
		} else {
			// 如果不是，则认为是纯 artist 格式
			return {
				raw: text,
				artist: text,
				album: '', // 专辑名为空
				year: '', // 年份为空
				codec: '', // 编码格式为空
				normalized: text.toLowerCase(),
				source: `${sourcePrefix}`,
			};
		}
	};

	// 预处理数据
	sources = {
		qobuz: Object.freeze(rawData.qobuz.flat().map((t) => parseEntry(t, 'qobuz'))),
	};

	// 启用搜索框
	searchBox.disabled = false;
	searchBox.placeholder = '输入搜索内容... (支持艺人、专辑名搜索)';
	searchBox.focus();
};

/**
 * @category Functions
 * @function search
 * @description 根据查询字符串在所有数据源中搜索匹配的条目（匹配艺人或专辑名）。
 * @param {string} query - 搜索查询字符串。
 * @returns {Array<object>} 匹配的搜索结果数组。
 */
const search = (query) => {
	const normalized = query.trim().toLowerCase();
	if (!normalized || !sources) return [];

	return Object.values(sources).flatMap((platform) => Object.values(platform).filter((item) => item.artist.toLowerCase().includes(normalized) || item.album.toLowerCase().includes(normalized)));
};

/**
 * @category Functions
 * @function escapeRegExp
 * @description 转义字符串中的正则表达式特殊字符。
 * @param {string} string - 需要转义的字符串。
 * @returns {string} 转义后的字符串。
 */
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @category Functions
 * @function highlight
 * @description 根据查询字符串高亮显示搜索结果项（艺人名和专辑名），并生成 HTML 字符串。
 * @param {object} item - 搜索结果对象 (来自 parseEntry)。
 * @param {string} query - 用于高亮的搜索查询字符串。
 * @returns {string} 包含高亮标记的 HTML 字符串。
 */
const highlight = (item, query) => {
	const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi'); // 使用 escapeRegExp 转义 query

	// 高亮 artist 和 album
	const highlightArtist = item.artist.replace(regex, '<span class="highlight">$1</span>');
	const highlightAlbum = item.album.replace(regex, '<span class="highlight">$1</span>');

	// 动态渲染内容
	let content = '';
	if (item.album) {
		// 如果有专辑信息，显示完整格式
		content = `
          <div class="artist">${highlightArtist}</div>
          <div class="album"><strong>${highlightAlbum}</strong></div>
          <div class="meta">
              <span class="year">${item.year}</span>
              <span class="codec">${item.codec}</span>
          </div>
        `;
	} else {
		// 如果没有专辑信息，只显示 artist
		content = `
          <div class="artist">${highlightArtist}</div>
        `;
	}

	return `
        <div class="result-content">
            ${content}
        </div>
      `;
};

/**
 * @category Functions
 * @function renderResults
 * @description 将搜索结果渲染到 DOM 中（结果容器）。
 * @param {Array<object>} results - 搜索结果数组。
 * @param {string} query - 原始搜索查询字符串 (用于高亮)。
 * @returns {void}
 */
const renderResults = (results, query) => {
	resultsContainer.replaceChildren(
		...results.map((result) => {
			// 1. 直接创建 <a> 标签
			const element = document.createElement('a');

			// 2. 将 .result-item 的样式和角色赋给 <a>
			element.className = 'result-item';

			// 3. 设置链接地址
			element.href = link.qobuz;

			// 45. 渲染内容
			element.innerHTML = `
        ${highlight(result, query)}
        <div class="source" data-source="${result.source}">
            ${result.source.toUpperCase()}
        </div>
      `;

			// 6. 返回 <a> 元素
			return element;
		})
	);
};

/**
 * @category Functions
 * @function debounce
 * @description 创建一个防抖函数，延迟执行目标函数。
 * @param {Function} fn - 需要防抖的函数。
 * @param {number} [delay=100] - 延迟时间（毫秒）。
 * @returns {Function} 防抖后的函数。
 */
const debounce = (fn, delay = 100) => {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
};

/**
 * @category Event Handlers
 * @function handleSearch
 * @description 搜索框 input 事件的处理函数（经过防抖处理）。
 * @param {Event} event - input 事件对象。
 * @returns {void}
 */
const handleSearch = debounce((event) => {
	const query = event.target.value.trim();
	const results = search(query);
	renderResults(results, query);
});

/**
 * @category Initialization
 * @description 立即执行函数 (IIFE)，用于初始化应用。
 * 异步加载数据，然后将搜索事件监听器绑定到搜索框。
 */
(async () => {
	await initializeData(); // 加载数据
	searchBox.addEventListener('input', handleSearch); // 绑定事件
})();
