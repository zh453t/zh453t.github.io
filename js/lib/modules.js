'use strict'
window.log = console.log
// import cloneDeep from '../node_modules/lodash-es/cloneDeep.js'
import cloneDeep from 'lodash-es'
const state = {
	cart: [
		{product: 'bread', quantity: 5},
		{product: 'pizza', quantity: 5}
	],
	user: {loggedIn: true}
}

const stateClone = cloneDeep(state)

state.user.loggedIn = false
console.log(stateClone)

const getLastPost = async function () {
	const res = await fetch('https://jsonplaceholder.typicode.com/posts')
	const data = await res.json()
	return {title: data.at(-1).title, test: data.at(-1).body}
}

// if(module.hot) module.hot.accept()

// import 'core-js/stable'

// Polyfilling async funtions
import 'regenerator-runtime/runtime'