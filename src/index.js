(function () {
  const sampleRate = 22050

  let audioCtx
  let oscillator

  const pressedKeys = []

  window.addEventListener('DOMContentLoaded', onDOMContentLoaded, true)

  function onDOMContentLoaded () {
    window.onmidi = onmidi

    document.getElementById('waveshape')
      .addEventListener('change', (e) => {
        oscillator.type = e.target.value
      }, true)

    audioCtx = new AudioContext({
      sampleRate
    })

    // new AudioDevice(samplerate, 2, processAudio)

    oscillator = audioCtx.createOscillator()
    oscillator.frequency.setValueAtTime(0, audioCtx.currentTime)

    oscillator.connect(audioCtx.destination)
    oscillator.start()
  }

  // function processAudio (buffer) {
  //   const l = buffer.length

  //   for (let i = 0; i < l; i++) {
  //     // Advance the oscillator angle, add some flavor with Math.random noise.
  //     oscillator.generate((Math.random() * 2 - 1) * 0.3)

  //     // Set the sample for both channels to oscillator's output, and multiply
  //     // that with 0.2 to lower the volume to a less irritating/distorted level.
  //     buffer[i] = buffer[++i] = oscillator.getMix() * 0.2
  //   }
  // }

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
      oscillator.frequency.setValueAtTime(440 * Math.pow(1.059, pressedKeys[0] - 69), audioCtx.currentTime)
    } else {
      oscillator.frequency.setValueAtTime(0, audioCtx.currentTime)
    }
  }
}())
