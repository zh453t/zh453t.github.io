'strict mode'
const budget = [
	{ value: 250, description: 'Sold old TV 📺', user: 'jonas' },
	{ value: -45, description: 'Groceries 🥑', user: 'jonas' },
	{ value: 3500, description: 'Monthly salary 👩‍💻', user: 'jonas' },
	{ value: 300, description: 'Freelancing 👩‍💻', user: 'jonas' },
	{ value: -1100, description: 'New iPhone 📱', user: 'jonas' },
	{ value: -20, description: 'Candy 🍭', user: 'matilda' },
	{ value: -125, description: 'Toys 🚂', user: 'matilda' },
	{ value: -1800, description: 'New Laptop 💻', user: 'jonas' },
];


const spendingLimits = Object.freeze({
	jonas: 1500,
	matilda: 100,
})
spendingLimits.jay = 200

const getLimit = (limit, user) => limit?.[user] ?? 0

// Pure function
const addExpense = function (state, value, description, user = 'jonas') {
	const cleanUser = user.toLowerCase();
	// console.log(cleanUser)
	return (value <= getLimit(spendingLimits, cleanUser)) ? [...state, { value: -value, description, user }] : state
	// budget.push({ value: -value, description, user });
	// 试图改变函数之外的变量
};

const newBudget1 = addExpense(budget, 100, 'Pizza 🍕');

const newBudget2 = addExpense(newBudget1, 10, 'Going to movies 🍿', 'Matilda');
// const newBudget3 = addExpense(newBudget2, spendingLimits, 200, 'Stuff', 'Jay');
console.dir('NEW', newBudget2)

const checkExpenses = (state, limits) => state.map(entry => entry.value < -getLimit(limits, entry.user) ? { ...entry, flag: 'limit' } : entry)

const finalBudget = checkExpenses(budget, spendingLimits);

const logBigExpenses = function (state, bigLimit) {
	const bigExpenses = state.filter(entry =>  entry.value <= -bigLimit)
	return bigExpenses.reduce((prev, currentEntry) => `${prev}${currentEntry.description.slice(-2)} / `, '').slice(0, -2)
	// for (const entry of budget) {
	// 	output += entry.value <= -bigLlimit ? `${entry.description.slice(-2)} / `:''
	// }
	// output = output.slice(0, -2); // Remove last '/ '
	// console.log(output);
};
const expensesBiggerThan111 = logBigExpenses(budget, 111)
console.log(expensesBiggerThan111)