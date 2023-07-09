'use strict'
/*1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)

*/

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

// 1
dogs.forEach(dog => {
  dog.recommendedFood = dog.weight ** 0.75 * 28 // g
  // console.log(dog.recommendedFood)
})

// 2
const checkEating = (dogObject) => {
  const outputDog = { owners: dogObject.owners }
  if (dogObject.curFood > dogObject.recommendedFood * 1.1) {
    // console.log(`${dogObject.owners}'s dog is eating too much`)
    outputDog.eating = 'much'
  } else if (dogObject.curFood < dogObject.recommendedFood * 0.9) {
    // console.log(`${dogObject.owners}'s dog is eating too little`)
    outputDog.eating = 'little'
  } else {
    // console.log(`${dogObject.owners}'s dog is ok`)
    outputDog.eating = 'ok'
  }
  return outputDog
  // Object { owners: (2) […], eating: "much" || 'little' || 'ok' }
  // eating: "much"
  // owners: Array [ "Sarah", "John" ]
}

const findDogsByOwner = (owner) => {
  const dogOwners = dogs.map(dog => dog.owners)
  const theDog = dogs.at(dogOwners.findIndex(own => own.includes(owner))) // the Dog object
  return checkEating(theDog)
}

findDogsByOwner('Sarah')

// 3
// const ownersEatTooMuch = dogs.reduce((prevDog, curDog) => {
//   let prevDogTemp = prevDog

//   if (checkEating(curDog).eating == 'much') {
//     prevDogTemp.push(curDog.owners)
//   }
//   return prevDogTemp
// }, [])
// filterfilter
const ownersEatTooMuch = dogs.filter(dog => checkEating(dog).eating === 'much').map(dog => dog.owners)
// const ownersEatTooLittle = dogs.reduce((prevDog, curDog) => {
//   let prevDogTemp = prevDog

//   if (checkEating(curDog).eating == 'little') {
//     prevDogTemp.push(curDog.owners)
//   }
//   return prevDogTemp
// }, [])

const ownersEatTooLittle = dogs.filter(dog => checkEating(dog).eating === 'little').map(dog => dog.owners)

// 4
console.log(`${ownersEatTooMuch.flat().slice(0, -1).join(', ')} and ${ownersEatTooMuch.flat().slice(-1)}'s dogs eat too much!`)
console.log(`${ownersEatTooLittle.flat().slice(0, -1).join(', ')}, and ${ownersEatTooLittle.flat().slice(-1)}'s dogs eat too little!`)

// 5
console.log(dogs.map(dog => dog.curFood).some((dog, dogIndex) => dog == dogs[dogIndex].recommendedFood))

/*6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
array.find == 'ok'

7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)*/

// 6
console.log(dogs.some(dogObj => checkEating(dogObj).eating == 'ok'))

// 7
const dogsEatingOkay = dogs.filter(dogObj => checkEating(dogObj).eating == 'ok')

// 8
const dogSorted = dogs.toSorted((a, b) => a.recommendedFood - b.recommendedFood)
// dogs.forEach(dog => checkEating(dog).eating == 'ok')