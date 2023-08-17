'use strict'
const airline = 'TAP Air Portugal'
const plane = 'A320'

const createBooking = (flightNum, numPassengers, price) => {
  const bookingArr = []
  numPassengers = numPassengers || 1
  const booking = {
    flightNum,
    numPassengers,
    price
  }
  console.log(booking)
}



const lufthansa = {
  airline: 'lufthansa',
  iataCode: 'LH',
  bookings: [],
  book(flightNum, name) {
    console.log(`${name} booked a seat on ${this.airline} flight ${this.iataCode}${flightNum}`)
    this.bookings.push({
      flight: `${this.iataCode}${flightNum}`,
      name
    })
  }
}

const eurowings = {
  name: 'eurowings',
  iataCode: 'EW',
  bookings: [],
}

  const book = lufthansa.book

// with event listeners

lufthansa.planes = 300
lufthansa.buyPlane = function () {
  console.log(this)
  this.planes++
  console.log(this.planes)
}


const checkMiddleSeat = (seat) => {
  const seatID = seat.slice(-1)
  if (seatID == 'B' || 'E') console.log('You got the middle seat😂')
  else console.log('You got lucky😃')
}
checkMiddleSeat('21B')