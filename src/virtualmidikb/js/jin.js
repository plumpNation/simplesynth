
function adapt (original, modifier) {
  if (modifier.constructor === String) {
    return original + Number(modifier.substr(1))
  }
  return modifier
}

function addClass (elem, cl) {
  let classes
  let n
  let hasClass
  let elems = (isArrayish(elem)) ? elem : [elem]

  for (let i = 0; i < elems.length; i++) {
    hasClass = false

    if (!elems[i].className.length) {
      classes = []
    } else {
      classes = elems[i].className.split(' ')
    }

    for (n = 0; n < classes.length; n++) {
      if (classes[n] === cl) {
        hasClass = true

        break
      }
    }

    if (!hasClass) {
      classes.push(cl)
    }
    elems[i].className = classes.join(' ')
  }
}

function addClasses (elem, cls) { // Requires addClass()
  let cl = cls

  if (cl.constructor === String) {
    cl = cl.split(' ')
  }

  for (let i = 0; i < cl.length; i++) {
    addClass(elem, cl[i])
  }
}

function addModule (name, func) {
  Jin[name] = fn[name] = func
  func.name = name
}

function appendChildren (parent) {
  if (isArrayish(arguments[1])) {
    for (let i = 0; i < arguments[1].length; i++) {
      parent.appendChild(arguments[1][i])
    }
  } else {
    for (let i = 1; i < arguments.length; i++) {
      parent.appendChild(arguments[i])
    }
  }
}

function bind (elem, type, func, pass) {
  if (isArrayish(elem)) {
    for (let i = 0; i < elem.length; i++) {
      bind(elem[i], type, func, pass)
    }

    return
  }

  elem = (elem === document && typeof elem['on' + type] === typeof Undefined)
    ? elem.documentElement
    : elem

  if (bind[type]) {
    return bind[type].bind(elem, type, func, pass)
  }

  const fnc = function (e) {
    if (!e) { // Fix some ie bugs...
      e = window.event
    }

    if (!e.stopPropagation) {
      e.stopPropagation = function () {
        this.cancelBubble = true
      }
    }

    e.data = pass

    func.call(elem, e)
  }

  elem.addEventListener(type, fnc, false)

  bind._binds.push({elem, type, func, fnc})
}

function byCl (cl, where) {
  if (!where) {
    where = document
  }

  return where.getElementsByClassName(cl)
}

function byId (id, where = document) {
  return where.getElementById(id)
}

function byTag (tag, where = document) {
  return where.getElementsByTagName(tag)
}

function CommandLine () {
  let path
  let getdata
  let iddata

  this.id = function (id) {
    reload()

    for (let i = 0, l = iddata.length; i < l; i++) {
      if (id === iddata[i].name) {
        return iddata[i].value
      }
    }

    return false
  }

  this.get = function (id) {
    reload()

    for (let i = 0, l = getdata.length; i < l; i++) {
      if (id === getdata[i].name) {
        return getdata[i].value
      }
    }

    return false
  }

  function reload () {
    if (path === location.href) {
      return
    }

    let pathsplit
    let getsplit
    let get
    let id
    let val
    let splitbreak

    path = location.href
    getdata = []
    iddata = []
    pathsplit = path.split('?')
    getsplit = pathsplit[pathsplit.length - 1].split('#')

    if (pathsplit.length > 1) {
      get = getsplit[0].split('&')

      for (let i = 0, l = get.length; i < l; i++) {
        splitbreak = get[i].split('=')
        val = (splitbreak.length === 1) ? true : splitbreak[1]
        getdata.push({name: splitbreak[0], value: val})
      }
    }

    if (getsplit.length > 1) {
      id = getsplit[1].split('&')

      for (let i = 0, l = id.length; i < l; i++) {
        splitbreak = id[i].split('=')
        val = (splitbreak.length === 1) ? true : splitbreak[1]
        iddata.push({name: splitbreak[0], value: val})
      }
    }
  }
}

function create (type, id) {
  if (!type) {
    type = 'div' // The probabilities are...
  }

  let elem = document.createElement(type)
  let prop

  if (id) {
    if (typeof id === 'object') {
      for (prop in id) {
        if (id !== 'css') { // This is just crazy, remove this if you're not just doing things to pass JSLint.
          elem.setAttribute(x, id[prop])
        }
      }

      if (id.css) {
        extend(elem.style, id.css)
      }
    } else {
      elem.id = id
    }
  }

  return elem
}

function css (elem, property, value) {
  let style = elem.style
  let prop

  if (typeof property === 'object') {
    for (prop in property) {
      if (prop[0] === '$') {
        experimentalCss(elem, prop.substr(1), property[prop])
      } else {
        style[prop] = property[prop]
      }
    }
  } else if (value === undefined) {
    return style[property]
  }

  if (property[0] === '$') {
    experimentalCss(elem, property.substr(1), value)
  } else {
    style[property] = value
  }
}

function DOMReady () {
  if (document.removeEventListener) {
    document.removeEventListener('DOMContentLoaded', DOMReady, false)
  } else if (document.detachEvent) {
    if (document.readyState !== 'complete') {
      return
    }
    document.detachEvent('onreadystatechange', DOMReady)
  }
  ready()
}

function extend (obj) {
  for (let i = 1; i < arguments.length; i++) {
    for (let n in arguments[i]) {
      obj[n] = arguments[i][n]
    }
  }

  return obj
}

function experimentalCss (elem, property, value) {
  let prefixes

  if (isArrayish(elem)) {
    for (let i = 0; i < elem.length; i++) {
      experimentalCss(elem[i], property, value)
    }
    return
  }

  prefixes = ['', '-webkit-', '-moz-', '-o-']

  if (!value) {
    while (prefixes.length && !value) {
      value = elem.style[prefixes.pop() + property]
    }

    return value
  } else {
    while (prefixes.length) {
      elem.style[prefixes.pop() + property] = value
    }
  }
}

function getElementsByClassName (elem, cl) {
  return elem.getElementsByClassName(cl)
}

function getElementsByTagName (elem, tg) {
  return elem.getElementsByTagName(tg)
}

function getOffset (elem, parent) { // Independent
  let top = 0
  let left = 0

  do {
    left += elem.offsetLeft || 0
    top += elem.offsetTop || 0
    elem = elem.offsetParent
  } while (elem && elem !== parent)

  return {left: left, top: top}
}

function getSize (elem) {
  return {width: elem.offsetWidth, height: elem.offsetHeight}
}

function getWindowSize (wnd) {
  if (!wnd) {
    wnd = window
  }

  if (window.document.documentElement) {
    return {
      width: wnd.document.documentElement.clientWidth,
      height: wnd.document.documentElement.clientHeight
    }
  }

  return {
    width: elem.document.body.clientWidth,
    height: elem.document.body.clientHeight
  }
}

function handleReady () { // jQuery-ish :)
  if (ready.bound) {
    return
  }

  ready.bound = true

  ready.f = []
  ready.p = []

  if (document.readyState === 'complete') {
    return setTimeout(ready, 1)
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', DOMReady, false)
    window.addEventListener('load', ready, false)
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', DOMReady, false)
    window.attachEvent('onload', ready)
  }
}

function hasClass (elem, cl) {
  const elems = (isArrayish(elem)) ? elem : [elem]

  for (let i = 0; i < elems.length; i++) {
    const classes = elems[i].className.split(' ')

    for (let n = 0; n < classes.length; n++) {
      if (classes[n] === cl) {
        return true
      }
    }
  }

  return false
}

function hasClasses (elem, cls) {
  let cl = cls

  if (cl.constructor === String) {
    cl = cl.split(' ')
  }

  for (let i = 0; i < cl.length; i++) {
    if (!hasClasses) {
      return false
    }
  }

  return true
}

function isArray (obj) { // Are there faster / more reliable methods out there?
  return !!(obj && obj.constructor === Array)
}

function isArrayish (obj) { // Same as isArray, but also accepts NodeList
  return !!(obj && (obj.constructor === Array || obj.constructor === NodeList || obj.constructor === layer))
}

function layer () {
  function Layer () {}

  function setAlign (elem, pos) {
    elem.style.zIndex = pos
  }

  const lr = []

  if (isArrayish(arguments[0])) {
    for (let i = 0; i < arguments[0].length; i++) {
      lr.push(arguments[0][i])
    }
  } else {
    for (let i = 0; i < arguments.length; i++) {
      lr.push(arguments[i])
    }
  }

  lr._concat = lr.concat

  extend(lr, {
    refresh: function () {
      for (let i = 0; i < this.length; i++) {
        setAlign(this[i], i)
      }
    },

    indexOf: function (elem) {
      for (let i = 0; i < this.length; i++) {
        if (this[i] === elem) {
          return i
        }
      }
      return -1
    },

    first: function () {
      return layer(this[0])
    },

    last: function () {
      return layer(this[this.length - 1])
    },

    item: function (i) {
      return layer(this[i])
    },

    move: function (elem, to) {
      if (to >= this.length - 1) {
        return this.toTop(elem)
      }
      if (to <= 0) {
        return this.toBottom(elem)
      }
      this.splice(this.indexOf(elem), 1)
      this.splice(to, 0, elem)
    },

    toBottom: function (elem) {
      this.splice(this.indexOf(elem), 1)
      this.unshift(elem)
    },

    toTop: function (elem) {
      this.splice(this.indexOf(elem), 1)
      this.push(elem)
    },

    remove: function (elem) {
      this.splice(this.indexOf(elem), 1)
    },

    alignByDistance: function (fromelem, lefttoright, reorder) {
      let point = this.indexOf(fromelem)
      let dist = Math.max(point, this.length - point - 1) + 1
      let maxDist = dist

      while (--dist) {
        if (lefttoright) {
          if (point - dist >= 0) {
            setAlign(this[point - dist], (maxDist - dist) * 2 - 1)
          }
          if (point - dist < this.length) {
            setAlign(this[point + dist], (maxDist - dist) * 2)
          }
        } else {
          if (point - dist < this.length) {
            setAlign(this[point + dist], (maxDist - dist) * 2 - 1)
          }
          if (point - dist >= 0) {
            setAlign(this[point - dist], (maxDist - dist) * 2)
          }
        }
      }

      setAlign(fromelem, maxDist * 2)
    },

    each: function (func) {
      for (let i = 0; i < this.length; i++) {
        func.call(this[i], i)
      }

      return this
    },

    undouble: function () {
      for (let i = 0; i < this.length; i++) {
        let d = this.indexOf(this[i])

        if (d !== i) {
          this.splice(i--, 1)
        }
      }

      return this
    },

    concat: function () {
      for (let a = 0; a < arguments.length; a++) {
        for (let b = 0; b < arguments[a].length; b++) {
          this.push(arguments[a][b])
        }
      }

      return this
    }
  }, layer.prototype)

  Layer.prototype = lr
  Layer.prototype.constructor = layer

  return new Layer()
}

function onReady (func, pd) {
  if (ready.triggered) {
    return func.call(document, {stopPropagation: function () {}, data: pd})
  }

  ready.f.push(func)
  ready.p.push(pd)
}

function ready () {
  if (ready.triggered) {
    return
  }

  ready.triggered = true

  let propagate = true

  const e = {
    stopPropagation: () => {
      propagate = false
    }
  }

  for (let i = 0; i < ready.f.length && propagate; i++) {
    e.data = ready.p[i]
    ready.f[i].call(document, e)
  }
}

function removeClass (elem, cl) {
  let classes
  let n
  let elems = (elem.length) ? elem : [elem]

  for (let i = 0; i < elems.length; i++) {
    if (!elems[i].className.length) {
      classes = []
    } else {
      classes = elems[i].className.split(' ')
    }

    for (n = 0; n < classes.length; n++) {
      if (classes[n] === cl) {
        classes.splice(n--, 1)
      }
    }

    elems[i].className = classes.join(' ')
  }
}

function removeClasses (elem, cls) { // Requires removeClasses()
  let cl = cls

  if (cl.constructor === String) {
    cl = cl.split(' ')
  }

  for (let i = 0; i < cl.length; i++) {
    removeClass(elem, cl[i])
  }
}

function toggleClass (elem, cls) { // Requires hasClass(), addClass() and removeClass()
  if (hasClass(elem, cls)) {
    removeClass(elem, cls)
  } else {
    addClass(elem, cls)
  }
}

function toggleClasses (elem, cls) { // Requires toggleClass and its dependencies
  let cl = cls

  if (cl.constructor === String) {
    cl = cl.split(' ')
  }

  for (let i = 0; i < cl.length; i++) {
    toggleClass(elem, cl[i])
  }
}

function trigger (elem, type) {
  let event
  let propagate = true

  if (isArrayish(elem)) {
    for (let i = 0; i < elem.length; i++) {
      trigger(elem[i], type)
    }

    return
  }

  if (bind[type]) {
    return bind[type].trigger(elem, type)
  }

  event = {
    preventDefault: function () { this.isDefaultPrevented = true },
    isDefaultPrevented: true,
    stopPropagation: function () { propagate = false }
  }

  for (let i = 0; i < bind._binds.length; i++) {
    if (bind._binds[i].elem === elem && bind._binds[i].type === type && propagate) {
      bind._binds[i].fnc.call(elem, event)
    }
  }

  if (elem['on' + type] && propagate) {
    elem['on' + type](event)
  }
}

function unbind (elem, type, func) {
  if (isArrayish(elem)) {
    for (let i = 0; i < elem.length; i++) {
      unbind(elem[i], type, func, undefined)
    }

    return
  }

  if (bind[type]) {
    return bind[type].unbind(elem, type, func)
  }

  for (let i = 0; i < bind._binds.length; i++) {
    if (bind._binds[i].elem === elem && bind._binds[i].type === type && bind._binds[i].func === func) {
      if (document.addEventListener) {
        elem.removeEventListener(type, bind._binds[i].fnc, false)
      } else {
        elem.detachEvent('on' + type, bind._binds[i].fnc)
      }
      bind._binds.splice(i--, 1)
    }
  }
}

function Jin (arg1, arg2) {
  return Jin.init(arg1, arg2)
}

const document = window.document
const settings = {}
const fn = {}

fn.settings = settings
fn.version = '0.2 Beta'
fn.fn = fn
window.Jin = Jin
bind._binds = []

addModule('adapt', adapt)
addModule('addClass', addClass)
addModule('addClasses', addClasses)
addModule('addModule', addModule)
addModule('appendChildren', appendChildren)
addModule('bind', bind)
addModule('create', create)
addModule('css', css)
addModule('byCl', byCl)
addModule('byId', byId)
addModule('byTag', byTag)
addModule('extend', extend)
addModule('experimentalCss', experimentalCss)
addModule('getElementsByTagName', getElementsByTagName)
addModule('getElementsByClassName', getElementsByClassName)
addModule('getOffset', getOffset)
addModule('getSize', getSize)
addModule('getWindowSize', getWindowSize)
addModule('hasClass', hasClass)
addModule('hasClasses', hasClasses)
addModule('isArray', isArray)
addModule('isArrayish', isArrayish)
addModule('layer', layer)
addModule('onReady', onReady)
addModule('removeClass', removeClass)
addModule('removeClasses', removeClasses)
addModule('toggleClass', toggleClass)
addModule('toggleClasses', toggleClasses)
addModule('trigger', trigger)
addModule('unbind', unbind)

addModule('init', function (arg1, arg2) {
  if (arg1.constructor === Function) {
    return onReady(arg1, arg2)
  }
  if (arg1.constructor === String && arg2.constructor === Function) {
    return addModule(arg1, arg2)
  }
  if (isArrayish(arg1)) {
    return layer(arg1)
  }
  if (arguments.length) {
    return layer.apply(this, arguments)
  }
  return Jin
})

fn.commandLine = new CommandLine()

bind.ready = {
  bind: function (elem, type, func, pass) {
    if (elem === document || elem === window) {
      return onReady(func, pass)
    }
  },

  unbind: function () {}, // Is this really necessary?

  trigger: function () {
    if (elem === document || elem === window) {
      return ready()
    }
  }
}

handleReady();

extend(Jin, fn)

layer.prototype.byClass = function (cl) {
  let lr = new layer()

  this.each(function () {
    if (hasClass(this, cl)) {
      lr.push(this)
    }
    lr.concat(getElementsByClassName(this, cl))
  })
  return lr
}

layer.prototype.byTag = function (tg) {
  let lr = new layer()

  this.each(function () {
    if (this.tagName === tg) {
      lr.push(this)
    }
    lr.concat(getElementsByTagName(this, tg))
  })
  return lr
}

layer.prototype.appendChildren = function () {
  for (let i = 0; i < arguments.length; i++) {
    appendChildren(this[0], arguments[i])
  }
  return this
}

layer.prototype.bind = function (a, b, c) {
  return this.each(function () {
    return bind(this, a, b, c)
  })
}

layer.prototype.css = function (a, b) {
  if (typeof a !== 'object' && !b) {
    return css(this[0], a)
  }
  return this.each(function () {
    return css(this, a, b)
  })
}

layer.prototype.unbind = function (a, b) {
  return this.each(function () {
    return unbind(this, a, b)
  })
}

layer.prototype.trigger = function (a) {
  return this.each(function () {
    return trigger(this, a)
  })
}

layer.prototype.experimentalCss = function (a, b) {
  return this.each(function () {
    return experimentalCss(this, a, b)
  })
}

layer.prototype.getOffset = function (i) {
  if (!i) {
    i = 0
  }
  return getOffset(this[i])
}

layer.prototype.getSize = function (i) {
  if (!i) {
    i = 0
  }
  return getSize(this[i])
}

layer.prototype.hasClass = function (a) {
  let b = false
  this.each(function () {
    if (hasClass(this, a)) {
      b = true
    }
  })
  return b
}

layer.prototype.hasClasses = function (a) {
  let b = false
  this.each(function () {
    if (hasClasses(this, a)) {
      b = true
    }
  })
  return b
}

layer.prototype.addClass = function (a) {
  return this.each(function () {
    return addClass(this, a)
  })
}

layer.prototype.addClasses = function (a) {
  return this.each(function () {
    return addClasses(this, a)
  })
}

layer.prototype.removeClass = function (a) {
  return this.each(function () {
    return removeClass(this, a)
  })
}

layer.prototype.removeClasses = function (a) {
  return this.each(function () {
    return removeClasses(this, a)
  })
}

layer.prototype.toggleClass = function (a) {
  return this.each(function () {
    return toggleClass(this, a)
  })
}

layer.prototype.toggleClasses = function (a) {
  return this.each(function () {
    return toggleClasses(this, a)
  })
}

layer.prototype.ready = function (a, b) { // For jQuery migrators
  return onReady(a, b)
}
