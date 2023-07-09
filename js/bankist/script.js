'use strict'
// Data
const account1 = {
	owner: 'Jonas Schmedtmann',
	movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
	interestRate: 1.2, // %
	pin: 1111,

	movementsDates: [
		'2019-11-18T21:31:17.178Z',
		'2019-12-23T07:42:02.383Z',
		'2020-01-28T09:15:04.904Z',
		'2020-04-01T10:17:24.185Z',
		'2020-05-08T14:11:59.604Z',
		'2020-05-27T17:01:17.194Z',
		'2020-07-11T23:36:17.929Z',
		'2020-07-12T10:51:36.790Z',
	],
	currency: 'EUR',
	locale: 'pt-PT', // de-DE
};

const account2 = {
	owner: 'Jessica Davis',
	movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
	interestRate: 1.5,
	pin: 2222,

	movementsDates: [
		'2019-11-01T13:15:33.035Z',
		'2019-11-30T09:48:16.867Z',
		'2019-12-25T06:04:23.907Z',
		'2020-01-25T14:18:46.235Z',
		'2020-02-05T16:33:06.386Z',
		'2020-04-10T14:43:26.374Z',
		'2020-06-25T18:49:59.371Z',
		'2020-07-26T12:01:20.894Z',
	],
	currency: 'USD',
	locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// script

const currencies = new Map([
	['USD', 'United States dollar'],
	['EUR', 'Euro'],
	['GBP', 'Pound sterling'],
]);

// const movements = [200, 450, -400, 3000, -65, -130, 70, 1300];


const formatDate = (date) => date.toString().padStart(2,'0')
const calcDaysPassed = (date1, date2) => {
	const msPassed = +date2 - +date1
	const daysPassed = msPassed / 1000 /60/60/24
	return daysPassed
}

// dom: movements container
const displayMovements = (account, sort = false) => {
	containerMovements.innerHTML = ''

	const movs = sort ? account.movements.toSorted((a, b) => a - b) : account.movements
	movs.forEach((movement, index) => {
		const type = movement > 0 ? 'deposit' : 'withdrawal'
		// console.log(movement)
		const date = new Date(account.movementsDates[index])
		const daysPassed = Math.round(calcDaysPassed(new Date(), date))
		console.log(daysPassed)
		const htmlTemplate = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
      <div class="movements__date">${formatDate(date.getDate())}/${formatDate(date.getMonth() + 1)}/${formatDate(date.getFullYear())}, ${formatDate(date.getHours())}:${formatDate(date.getMinutes())}</div>
      <div class="movements__value">${movement.toFixed(2)}€</div>
    </div>`
		containerMovements.insertAdjacentHTML('afterbegin', htmlTemplate)

	})
}
// const user = 'Steven Thomas Williams'
// const createUsernames =

const displayBalance = function (account) {
	const balance = account.movements.reduce((acc, cur) => acc + cur)
	labelBalance.textContent = `${balance}€`
	account.balance = balance
}

// displayBalance(account1.movements)

const displaySummary = function (account) {
	const incomes = account.movements.filter(m => m > 0).reduce((acc, cur) => acc + cur)
	labelSumIn.textContent = `${incomes.toFixed(2)}€`

	const out = account.movements.filter(m => m < 0).reduce((acc, cur) => acc + cur)
	labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`

	let interest = account.movements.filter(m => m > 0)
		.map(a => a * account.interestRate / 100)
		.filter(m => m >= 1)
		.reduce((acc, cur) => acc + cur)
	labelSumInterest.textContent = `${interest}€`
}

const createUsername = function (accounts) {
	accounts.forEach(account => {
		account.username = account.owner.toLowerCase().split(' ').map((word => word[0])).join('')
	})
}

createUsername(accounts)
// displaySummary(account1.movements)

const cleanValue = (element) => {
	element.value = ''
}


const updateUI = () => {
	// Display movements
	displayMovements(currentAccount)

	// Display balance
	displayBalance(currentAccount)

	// Display Summary
	displaySummary(currentAccount)
}

// LOGIN
let currentAccount


// FAKE ALWAYS LOGIN
currentAccount = account1
updateUI()
containerApp.style.opacity = '1'

btnLogin.addEventListener('click', (event) => {
	// 阻止表单enter提交     
	event.preventDefault()


	console.log('LOGIN')
	currentAccount = accounts.find(account => account.username === inputLoginUsername.value)

	// check currentAccount:
	if (currentAccount === undefined) console.error('Invalid Username. Please Try Again')
	else if (inputLoginPin.value == currentAccount?.pin) {
		// account valid:
		// Update UI
		containerApp.style.opacity = '1'

		updateUI()
		// Clear input fields
		inputLoginUsername.value = inputLoginPin.value = ''
		inputLoginPin.blur()

	} else console.error('WRONG PASSWORD. Please try again.')
}
)



// Transfer Money:
btnTransfer.addEventListener('click', (e) => {
	e.preventDefault()
	const transfer = {
		amount: Number(inputTransferAmount.value),
		recieverAccount: accounts.find(acc => acc.username == inputTransferTo.value),
		date: new Date()
	}
	if (transfer.amount <= currentAccount.balance && transfer.amount > 0) {
		currentAccount.movements.push(-transfer.amount)
		currentAccount.movementsDates.push(transfer.date.toISOString())
		transfer.recieverAccount.movements.push(transfer.amount)
		transfer.recieverAccount.movementsDates.push(transfer.date.toISOString())
		console.info('NEW TRANSFER:', transfer)
		updateUI()
	} else console.error()
	inputTransferAmount.value = inputTransferTo.value = ''
	inputTransferTo.blur()
})


// Loan
btnLoan.addEventListener('click', (e) => {
	e.preventDefault()

	const loan = {
		amount: Number(inputLoanAmount.value),
		date: new Date()
	}
	if (loan.amount > 0 && currentAccount.movements.some(mov => loan.amount * 0.1 <= mov)) {
		// add movement
		currentAccount.movements.push(loan.amount)
		currentAccount.movementsDates.push(loan.date.toISOString())
		console.info('NEW LOAN:', loan)
		updateUI()
	} else { console.error('Amount Invalid.') }
	cleanValue(inputLoanAmount)
})

// Close Account:
btnClose.addEventListener('click', (e) => {
	e.preventDefault()
	console.log(currentAccount)

	if (inputCloseUsername.value == currentAccount.username && inputClosePin.value == currentAccount.pin) {
		console.warn('Delete')
		accounts.splice(accounts.findIndex(acc => acc == currentAccount), 1)
		containerApp.style.opacity = 0
	}
	cleanValue(inputClosePin)
	cleanValue(inputCloseUsername)
})


// movements.sort((a, b) => {
// 	return b - a
// })
// console.log(movements)

// sort
let sorted = false
btnSort.addEventListener('click', (e) => {
	sorted = !sorted
	e.preventDefault()
	displayMovements(currentAccount, sorted)
})


// document.querySelector('.logo').addEventListener('click', function () {
// 	const movementsUI = Array.from(document.querySelectorAll('.movements__value'))
// 	// document.querySelectorAll('.movements__value') 返回一个NodeList, 类似于Array
// 	// 当然也可以用[...document.querySelectorAll('.movements__value')]来创建数组
// 	console.log(movementsUI)

// })

// let bankDepositSum = accounts.flatMap(acc => acc.movements)
// 	.reduce((sum, cur) => sum + cur)
// // 用 map 构建相同长度的数组

// // const numDeposits1000 = accounts.flatMap(acc => acc.movements).filter(mov => mov > 1000).length
// const numDeposits1000 = accounts.flatMap(acc => acc.movements)
// 	// .reduce((count,cur) => cur >= 1000 ? count++ : count, 0)
// 	.reduce((count, cur) => cur >= 1000 ? count + 1 : count, 0)
// // console.log(numDeposits1000)

// ++
// let a = 10
// console.log(a++) // 10
// console.log(a) // 11
// // a此时已经自增，但
// console.log(++a) //12


// reduce + object
const sums = accounts.flatMap(acc => acc.movements).reduce((sums, cur) => {
	// cur > 0 ? sums.deposits += cur : sums.withdrawals += cur
	sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur
	return sums
}, { deposits: 0, withdrawals: 0 })

// console.log(account1.movementsDates[0])

// Date
const now = new Date()
document.querySelector('.date').textContent = `${formatDate(now.getDate())}/${formatDate(now.getMonth() + 1)}/${formatDate(now.getFullYear())}, ${formatDate(now.getHours())}:${formatDate(now.getMinutes())}`