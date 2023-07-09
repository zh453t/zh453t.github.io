'use strict'
for (let samp of document.querySelectorAll('samp')) {
  samp.onclick = () => samp.setAttribute('hidden', true)
}