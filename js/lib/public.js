'use strict'
document.querySelectorAll('samp').forEach(samp =>  {
  samp.onclick = () => samp.style.display = 'none'
})