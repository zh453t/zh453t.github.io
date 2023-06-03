const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const restaurant = {
  name: 'Classico Italiano',
  location: ',,, Firenze, Italy',
  categories: ['Italian', 'Pizzeria', 'Vegetarian', 'Organic'],

  starterMenu: [
    'Focaccia',
    'Bruschetta',
    'Garlic Bread',
    'Caprese Salad',
  ],
  mainMenu: ['Pizza', 'Pasta', 'Risotto'],

  // 函数表达式
  order(starterIndex, mainIndex) {
    return [this.starterMenu[starterIndex], this.mainMenu[mainIndex]]
  },

  openingHrs: {
    'thu': {
      open: 12,
      close: 22
    },
    'fri': {
      open: 11,
      close: 23
    },
    'sat': {
      open: 0,
      close: 24
    }
  }
}