const onmidievent = (e) => {
  if (parent && parent.onmidi) {
    parent.onmidi(e)
  }
}

(function (window) {
  const isKeyFlat = [false, true, false, true, false, false, true, false, true, false, true, false]
  const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  const keys = []

  let keymap = [
    [90, 48], // C1
    [83, 49],
    [88, 50],
    [68, 51],
    [67, 52],
    [86, 53],
    [71, 54],
    [66, 55],
    [72, 56],
    [78, 57],
    [74, 58],
    [77, 59],
    [81, 60], // C2
    [50, 61],
    [87, 62],
    [51, 63],
    [69, 64],
    [82, 65],
    [53, 66],
    [84, 67],
    [54, 68],
    [89, 69],
    [55, 70],
    [85, 71],
    [73, 72], // C3
    [57, 73],
    [79, 74],
    [48, 75],
    [80, 76]
  ]

  let mouseDown = false
  let mkey = -1
  let pressedKeys = []
  let channel = 1
  let velocity = 127
  let pitchBendAmount = 8192

  remap()

  MidiEvent.name = 'MidiEvent'

  document.addEventListener('DOMContentLoaded', init)

  function init () {
    createKeyboard()
    doBindings()

    document.removeEventListener('DOMContentLoaded', init)
  }

  function remap () {
    const newMap = {}

    for (let i = 0; i < keymap.length; i++) {
      newMap[keymap[i][0]] = keymap[i][1]
    }

    keymap = newMap
  }

  function pitchBend (am) {
    if (!am) {
      pitchBendAmount = 8192
    } else {
      pitchBendAmount += am
    }

    if (pitchBendAmount > 16383) {
      pitchBendAmount = 16383
    }

    if (pitchBendAmount < 0) {
      pitchBendAmount = 0
    }

    const firstByte = Math.floor(pitchBendAmount / 128)
    const secondByte = pitchBendAmount - firstByte * 128

    onmidievent(new MidiEvent(channel, 14, firstByte, secondByte))
  }

  function release (num) {
    const index = pressedKeys.indexOf(num)
    const keyAlreadyReleased = pressedKeys.indexOf(num) < 0

    if (num < 0 || keyAlreadyReleased) {
      return
    }

    pressedKeys.splice(index, 1)

    keys[num].classList.remove('pressed')

    onmidievent(new MidiEvent(channel, 8, num, 0))
  }

  function press (num) {
    const keyAlreadyPressed = pressedKeys.indexOf(num) > -1

    if (num < 0 || keyAlreadyPressed) {
      return
    }

    pressedKeys.push(num)

    keys[num].classList.add('pressed')

    onmidievent(new MidiEvent(channel, 9, num, velocity))
  }

  function mouseKeyPress (num) {
    release(mkey)

    mkey = num

    press(num)
  }

  function keyboardParamDown (num) {
    if (num === 40) {
      pitchBend(-200)
    } else if (num === 38) {
      pitchBend(200)
    } else {
      return false
    }

    return true
  }

  function keyboardParamUp (num) {
    if (num === 40 || num === 38) {
      pitchBend()
    } else {
      return false
    }

    return true
  }

  function keyboardPress (num, oct) {
    if (keymap[num]) {
      press(keymap[num] + oct * 12)

      return true
    }
  }

  function keyboardRelease (num, oct) {
    if (keymap[num]) {
      release(keymap[num] + oct * 12)

      return true
    }
  }

  function MidiEvent (channel, status, data1, data2) {
    this.channel = channel
    this.status = status
    this.data1 = data1
    this.data2 = data2
  }

  function createKey (index) {
    const key = document.createElement('div')

    key.className = 'key ' + (isKeyFlat[index % 12] ? 'black' : 'white')
    key.title = keyNames[index % 12] + ' ' + Math.floor(index / 12)
    key.id = 'key_' + index

    // naughty side effect
    keys.push(key)

    return key
  }

  function createKeys (i) {
    // make a keyboard with 128 keys
    return [...Array(128).keys()].map(createKey)
  }

  function createKeyContainer () {
    const container = document.createElement('div')

    container.id = 'keycontainer'
    container.style.left = '-560px'

    return container
  }

  function createKeyboard () {
    const keyContainer = createKeyContainer()
    const UIKeys = createKeys()

    document.body.appendChild(keyContainer)

    UIKeys.forEach(UIKey => {
      keyContainer.appendChild(UIKey)
    })
  }

  function doBindings () {
    function keyDown (e) {
      keyboardPress(e.which, e.shiftKey * 1 - e.ctrlKey * 1 + e.altKey * 1) ||
        keyboardParamDown(e.which)
    }

    function keyUp (e) {
      keyboardRelease(e.which, e.shiftKey * 1 - e.ctrlKey * 1 + e.altKey * 1) ||
        keyboardParamUp(e.which)
    }

    const keyboard = document.getElementById('keycontainer')

    keyboard.addEventListener('mousedown', e => {
      const key = e.target

      if (!key.classList.contains('key')) {
        return
      }

      // If we don't do this, we'll drag the key element.
      e.preventDefault()

      mouseKeyPress(keys.indexOf(e.target))
    })

    keyboard.addEventListener('mousemove', e => {
      if (mouseDown) {
        mouseKeyPress(keys.indexOf(e.target))
      }
    })

    keyboard.addEventListener('mouseout', e => {
      mouseKeyPress(-1)
    })

    document.addEventListener('mouseup', e => {
      mouseKeyPress(-1)
      mouseDown = false
    })

    document.addEventListener('mousedown', e => {
      mouseDown = true
    })

    document.addEventListener('keydown', keyDown)
    document.addEventListener('keyup', keyUp)
    document.addEventListener('mousescroll', e => {
      const left = Math.max(
        Math.min(parseFloat(keyboard.style.left) + e.delta * 50, 0),
        window.innerWidth - 3075
      )

      keyboard.style.left = left + 'px'
    })

    if (parent) {
      window.parent.addEventListener('keydown', keyDown)
      window.parent.addEventListener('keyup', keyUp)
    }
  }
}(window))
