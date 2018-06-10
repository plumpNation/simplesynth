let context = new AudioContext()

context.sampleRate = 22050

const oscillator = context.createOscillator()

const pressedKeys = []

oscillator.frequency = 0

function start () {
  window.onmidi = onmidi

  document.getElementById('waveshape')
    .addEventListener('change', function () {
      oscillator.waveShape = Number(this.value)
    }, true)

  context = new AudioContext()

  context.sampleRate = 22050

  // new AudioDevice(samplerate, 2, processAudio)
}

function processAudio (buffer) {
  const l = buffer.length

  for (let i = 0; i < l; i++) {
    // Advance the oscillator angle, add some flavor with Math.random noise.
    oscillator.generate((Math.random() * 2 - 1) * 0.3)

    // Set the sample for both channels to oscillator's output, and multiply
    // that with 0.2 to lower the volume to a less irritating/distorted level.
    buffer[i] = buffer[++i] = oscillator.getMix() * 0.2
  }
}

function onmidi (e) {
  // 0x9, KEYDOWN // 0x8, KEYUP
  if ([9, 8].indexOf(e.status) < 0) {
    // We don't understand anything else here, so we'll just leave.
    return
  }

  if (e.status === 9) {
    // Add the newest key to be first in the array.
    pressedKeys.unshift(e.data1)

  // 0x8, KEYUP
  } else if (e.status === 8) {
    for (let i = 0; i < pressedKeys.length; i++) {
      if (pressedKeys[i] === e.data1) {
        // remove keys that are no longer pressed
        pressedKeys.splice(i--, 1)
      }
    }
  }

  // If there are any pressed keys.
  if (pressedKeys.length) {
    // Set the oscillator frequency to match the last key pressed
    oscillator.frequency = 440 * Math.pow(1.059, pressedKeys[0] - 69)
  } else {
    oscillator.frequency = 0
  }
}

window.addEventListener('load', start, true)
