'use strict';

/**
 * @category Constants
 * @description 存储跳转链接的对象。
 */
const link = {
	qobuz: 'link1',
	am: 'link2'
};

/**
 * @category DOM Elements
 * @type {HTMLInputElement}
 */
const searchBox = document.querySelector('.search-box');

/**
 * @category DOM Elements
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
		// 假设您的新数据文件路径依然是 './qobuz/data.json'
		qobuz: await loadData('./qobuz/data.json'),
	};

	// 为每个专辑对象添加 'source' 属性以便在渲染时复用
	sources = {
		qobuz: Object.freeze(
			rawData.qobuz.map((album) => ({
				...album,
				source: 'qobuz', // 添加 'source' 属性
			}))
		),
		am: Object.freeze(
			rawData.qobuz.map((album) => ({
				...album,
				source: 'am',
			}))
		),
	};

	// 启用搜索框
	searchBox.disabled = false;
	searchBox.placeholder = '搜索艺人、专辑、曲目...'; // 更新提示
	searchBox.focus();
};

/**
 * @category Functions
 * @function normalizeSearchQuery
 * @description 将搜索查询中的特殊字符替换为下划线以匹配数据格式。
 * @param {string} query - 原始搜索查询。
 * @returns {string} 规范化后的搜索查询。
 */
const normalizeSearchQuery = (query) => {
	return query.replace(/['/:]/g, '_');
};

/**
 * @category Functions
 * @function search
 * @description 根据查询字符串在所有数据源中搜索匹配的条目。
 * @param {string} query - 搜索查询字符串。
 * @returns {Array<object>} 匹配的搜索结果（专辑对象）数组。
 */
const search = (query) => {
	const normalized = query.trim().toLowerCase();
	if (!normalized || !sources) return [];

	// 创建规范化版本，将特殊字符替换为下划线
	const normalizedForMatching = normalizeSearchQuery(normalized);

	return Object.values(sources).flatMap((platformData) =>
		platformData.filter((item) => {
			// 匹配艺人（使用规范化查询）
			const artistMatch = item.artist.toLowerCase().includes(normalizedForMatching);
			// 匹配专辑（使用规范化查询）
			const albumMatch = item.album.toLowerCase().includes(normalizedForMatching);

			// 匹配曲目（使用规范化查询）
			const trackMatch = item.tracks.some((track) => 
				track.title.toLowerCase().includes(normalizedForMatching)
			);

			return artistMatch || albumMatch || trackMatch;
		})
	);
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
   * @description 根据查询高亮显示搜索结果（艺人、专辑和匹配的曲目）。
   * @param {object} item - 搜索结果对象 (专辑对象)。
   * @param {string} query - 用于高亮的搜索查询字符串。
   * @returns {string} 包含高亮标记的 HTML 字符串。
   */
  const highlight = (item, query) => {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const normalizedQuery = query.toLowerCase();

    // 高亮艺人和专辑
    const highlightArtist = item.artist.replace(regex, '<span class="highlight">$1</span>');
    const highlightAlbum = item.album.replace(regex, '<span class="highlight">$1</span>');

    // 【优化】查找并高亮匹配的曲目，生成 <li> 列表项
    const matchingTrackItems = item.tracks
      .filter(track => track.title.toLowerCase().includes(normalizedQuery))
      .map(track => 
        // 使用 <li> 标签，语义更清晰
        `<li class="track-match-item">
           ${track.number}. ${track.title.replace(regex, '<span class="highlight">$1</span>')}
         </li>`
      )
      .join(''); // 将所有 <li> 拼接在一起

    // 【优化】如果存在匹配的曲目，则将它们包裹在一个 <ul> 容器中
    const matchingTracksHTML = matchingTrackItems ? 
      `<ul class="track-match-list">${matchingTrackItems}</ul>` : 
      '';

    // 构建内容
    let content = `
        <div class="artist">${highlightArtist}</div>
        <div class="album">${highlightAlbum}</div>
        <div class="meta">
            <span class="year">${item.year}</span>
            <span class="codec">${item.codec}</span>
        </div>
        ${matchingTracksHTML} 
    `;

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
			// 【优化】使用 <a> 标签，语义化、可访问性、UX 均更佳
			const element = document.createElement('a');
			element.className = 'result-item';
			
			// 根据 result.source 动态设置 href
			// result.source 可能是 'qobuz' 或 'am'
			element.href = link[result.source]; 

			// 渲染内容
			element.innerHTML = `
          ${highlight(result, query)}
          <div class="source" data-source="${result.source}">
              ${result.source.toUpperCase()}
          </div>
        `;

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
 */
(async () => {
	await initializeData(); // 加载数据
	searchBox.addEventListener('input', handleSearch); // 绑定事件
})();