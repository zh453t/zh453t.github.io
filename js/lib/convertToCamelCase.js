'use strict'
const convertToCamelCase = () => {
  let textOutputArr = []
  for (let text of document.querySelector('textarea').value.split('\n')) {
    text = text.toLowerCase().trim()
    let textArr = text.split('_')
    console.warn(textArr)
    textArr[1] = textArr[1].replace(textArr[1].slice(0,1), textArr[1].slice(0,1).toUpperCase())
    text = textArr.join('')
    console.log(text)
    textOutputArr.push(text)
  }
  console.log(textOutputArr.join('\n'))
  return textOutputArr.join('\n')

}
document.querySelector('button').addEventListener('click', convertToCamelCase)
// 🤨