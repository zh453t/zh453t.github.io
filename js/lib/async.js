'use strict';
const btn = document.querySelector('.btn-country')
const countriesContainer = document.querySelector('.countries')
const p = console.info
// Promisifying  setTimeout
const wait = seconds => new Promise((resolve, reject) => {
	setTimeout(resolve, seconds * 1000)
	// 因为 setTimeout 不会失败，所以 reject 没用
})

const render = {
	error(message) {
		countriesContainer.insertAdjacentText('beforeend', message)
	},
	popup(errorText) {
		const popup = document.querySelector('.popup')
		document.querySelector('#closePopup').addEventListener('click', () => {
			popup.close()
		})
		const errorTextElement = document.querySelector('#errorText')

		errorTextElement.textContent = errorText
		popup.show()
	},

	country(data, className = '') {
		const html = `<article class="country ${className}">
	<img class="country__img" src="${data.flags.svg}" alt="${data.flags.alt}" />
	<div class="country__data">
		<h3 class="country__name">${data.name.common}</h3>
		<h4 class="country__region">${data.region}</h4>
		<p class="country__row"><span>👫</span>${data.population}</p>
		<p class="country__row"><span>🗣️</span>${[...Object.values(data.languages)].toString().replace(',', ', ')}</p>
		<p class="country__row"><span>💰</span>${[...Object.keys(data.currencies)]}</p>
	</div>
</article>`
		document.querySelector('.countries').style.opacity = 1
		document.querySelector('.countries').insertAdjacentHTML('beforeend', html)
	}
}

const timeout = (s) => {
	return new Promise((_, reject) => {
		setTimeout(function () {
			reject(new Error('Request took too long!'))
		}, s * 1000)
	})
}

const countryApp = {
	parseResponse: response => {
		if (response.ok === false) throw new Error(`Country not found ${response.status}`)
		return response.json()
	},
	// old school
	render,

	// .then()
	get: {
		country(country, code = false) {
			return fetch(code ? `https://restcountries.com/v3.1/alpha/${country}` : `https://restcountries.com/v3.1/name/${country}`)
				.then(countryApp.parseResponse)
				.then((data) => {
					render.country(data[0])
					const neighbour = data[0].borders?.[0]
					if (!neighbour) throw new Error('No neighbour found!')

					return fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`)
				})
				.then(countryApp.parseResponse)
				.then(data => render.country(data[0], 'neighbour'))
				.catch(err => {
					// 排错的，任何一个 Promise 出现问题都会在这报错
					// fetch 只在连接不上的时候报错

					render.countryError(`Something went wrong 🤨: ${err.message}`)
					// 如果在服务器端 404

				})
		},

		countryAndNeighbours(country) {
			countryApp.get.country(country).finally(() => {
				// 总是被调用，在 Promise 或 fulfilled 或 Rejected 之后
				countriesContainer.style.opacity = 1
			})
			/* traditional AJAX Call
			request.addEventListener('load', function () {
				const [data] = JSON.parse(this.response)
				console.log(data)
		
				render.country(data)
		
				const neighbour = data.borders[0]
				if (!neighbour) return
				const request = new XMLHttpRequest()
		
				// AJAX Call2
				request.open('GET', `https://restcountries.com/v3.1/alpha/${neighbour}`)
				request.send()
				request.addEventListener('load', function () {
					const [data] = JSON.parse(this.response)
					console.log(data)
		
					render.country(data, 'neighbour')
				})
		
			})*/
		},


	},

	get3Countries: async function (c1, c2, c3) {
		try {
			const request3 = await Promise.race([
				fetch(`https://restcountries.com/v3.1/name/${c1}`),
				fetch(`https://restcountries.com/v3.1/name/${c2}`),
				fetch(`https://restcountries.com/v3.1/name/${c3}`),
			])
			const data3 = request3.map(async function (request) {
				return await request.json()
			})
			console.log(data3)
		} catch (err) {
			console.error(err)
		}
	},

	run() {
		p('countryApp opened')
		btn.addEventListener('click', function () {
			countryApp.get.countryAndNeighbours('Australia')
		})
	}
	// getCountryAndNeighbours('North Korea')
}

const whereAmIApp = {

	getPosition() {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject)
		})
	},
	whereAmI() {
		whereAmIApp.getPosition().then(pos => {
			console.log(pos.coords)
			const { latitude: lat, longitude: lng } = pos.coords
			console.log(`${lat.toFixed(5)},${lng.toFixed(5)}`)
			return fetch(`https://restapi.amap.com/v3/geocode/regeo?key=c0273f22ea894b73bfd6db31f066f2f7&location=${lng.toFixed(5)},${lat.toFixed(5)}&`)
		})
			// #2 reverse geocoding
			.then(response => {
				// if NETWORK ERROR
				if (response.ok === false) {
					const error = new Error(`Network Error: ${response.status}`)
					render.error(error.message)
					throw error
				}
				return response.json()
			}).then(data => {
				console.log(data)
				const { formatted_address: address, addressComponent } = data.regeocode
				const { country } = addressComponent
				console.log(`你在${address}`);
				getCountry(country)
			}).catch(err => {
				return render.error(err.message)
			})
	},

	whereAmI__ASYNC: async function () {
		try {
			const position = await whereAmIApp.getPosition()
			const { latitude: lat, longitude: lng } = position.coords
			const res1 = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=c0273f22ea894b73bfd6db31f066f2f7&location=${lng.toFixed(5)},${lat.toFixed(5)}&`)
			const regeoData = await res1.json()
			const { formatted_address: address, addressComponent } = regeoData.regeocode
			let { country } = addressComponent
			if (country === '中国') country = 'China'
			console.log(`你在${address}`);

			// async function 会在后台执行，所以下面的console.log会首先执行
			const res2 = await fetch(`https://restcountries.com/v3.1/name/${country}`)
			// await 时， async function(){里的代码会等待那个 Promise ，直到它兑现了才会执行下一行代码}
			// 当 await fetch(`https://restcountries.com/v3.1/name/${country}`) 兑现了， 
			// await fetch(`https://restcountries.com/v3.1/name/${country}`) 是  这个 promise 的 resolvedValue
			console.log(res2)
			const data = await res2.json()
			render.country(data[0])
		} catch (err) {
			console.error(`${err}💥`)

			// Reject promise returned from async function
			// throw err
		}
	},

	run() {
		// this.getPosition().then(position => log(position))
		this.whereAmI__ASYNC()
		// this.get3Countries('China' ,'Vietnam', 'Japan')
	}
}

const task2 = {
	promiseTest() {
		log('Test start')
		setTimeout(() => {
			log('0 sec timer')
		}, 0);
		Promise.resolve('Resolved Promise 1').then(result => log(result))
		Promise.resolve('Resolved Promise 2').then(result => {
			for (let i = 0; i < 1000000000; i++) { }
			log(result)
		})
		log('test end')
	},

	buyLottery() {
		const lotteryPromise = new Promise(function (resolve, reject) {
			if (Math.random() >= 0.5) resolve('You Win!')
			else reject(new Error('You Lose!'))
		})
		lotteryPromise.then(res => log(res)).catch(err => console.error(err))
	},

	test() {

	}
}

const task3 = () => {
	// imagetesk
	const createImage = (imgPath = '') => {
		return new Promise((resolve, reject) => {
			const image = document.createElement('img')
			image.src = imgPath
			console.log('Image added: ', image)

			image.addEventListener('error', () => reject(new Error('Image not found')))
			image.addEventListener('load', () => {
				document.querySelector('.images').append(image)
				resolve(image)
			})
		})
	}
	const wait = (sec, img) => {
		return new Promise(resolve => {
			setTimeout(() => resolve(img), sec * 1000)
		})
	}
	createImage('https://raw.githubusercontent.com/jonasschmedtmann/complete-javascript-course/master/16-Asynchronous/starter/img/img-2.jpg').then(image => {
		return wait(2, image)
	})
		.then(image => {
			console.log('Wait1:', image)
			// image.style.display = 'none'
			return createImage('https://raw.githubusercontent.com/jonasschmedtmann/complete-javascript-course/master/16-Asynchronous/starter/img/img-1.jpg')
		})
		.then(image => {
			console.log('Wait2:', image)
			return wait(2, image)
		})
		.then(image => {
			console.log('Image Hid:', image)
			image.style.opacity = 0
		})

		.catch(console.error)
}

const task3_new = () => {
	const createImage = (imgPath) => {
		return new Promise((resolve, reject) => {
			const image = document.createElement('img')
			image.src = imgPath
			console.log('Image added: ', image)

			image.addEventListener('error', () => reject(new Error('Image not found')))
			image.addEventListener('load', () => {
				document.querySelector('.images').append(image)

				resolve(image)
			})
		})
	}
	const wait = (sec, img) => {
		return new Promise(resolve => {
			setTimeout(() => {
				img.style.display = 'none'
				resolve(img)
			}, sec * 1000)

		})
	}
	const loadNPause = async function () {
		try {
			const image1 = await createImage('https://raw.githubusercontent.com/jonasschmedtmann/complete-javascript-course/master/16-Asynchronous/starter/img/img-1.jpg')
			await wait(2, image1)
			await createImage('https://raw.githubusercontent.com/jonasschmedtmann/complete-javascript-course/master/16-Asynchronous/starter/img/img-2.jpg')

		} catch (err) { console.error(err) }
	}
	// loadNPause()

	const loadAll = async (imgArr) => {
		try {
			const promiseArr = imgArr.map(async img => await createImage(img))
			console.log(promiseArr)
			const imgsEl = await Promise.allSettled(promiseArr)
			console.log(imgsEl)

			imgsEl.forEach(img => img.value.classList.add('parallel'))
		} catch (err) { console.error(err) }
	}
	loadAll([
		'https://raw.githubusercontent.com/jonasschmedtmann/complete-javascript-course/master/16-Asynchronous/starter/img/img-1.jpg',
		'https://raw.githubusercontent.com/jonasschmedtmann/complete-javascript-course/master/16-Asynchronous/starter/img/img-2.jpg',
		'https://raw.githubusercontent.com/jonasschmedtmann/complete-javascript-course/master/16-Asynchronous/starter/img/img-3.jpg'
	])
}
task3_new()



const promiseTest1 = () => {
	Promise.any([
		Promise.resolve('success'),
		Promise.reject('fuck you'),
		Promise.resolve('success')
	]).then(res => console.log(res))
		.catch(console.error)
}