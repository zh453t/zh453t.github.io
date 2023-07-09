'use strict'
/*
Primitives == 原始 数据类型
Iterator == 迭代器
*/
const airline = 'TAP Air Portugal'
const plane = 'A320'

const checkMiddleSeat = (seat) => {
  const seatID = seat.slice(-1)
  if (seatID == 'B' || 'E') console.log('You got the middle seat😂')
  else console.log('You got lucky😃')
}
checkMiddleSeat('21B')