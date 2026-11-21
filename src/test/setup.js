import '@testing-library/jest-dom'

const canvasContext = {
  clearRect: () => {},
  save: () => {},
  translate: () => {},
  rotate: () => {},
  beginPath: () => {},
  arc: () => {},
  fill: () => {},
  fillRect: () => {},
  restore: () => {},
}

if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => canvasContext,
  })
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: () => 1,
  })

  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: () => {},
  })
}
