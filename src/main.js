import './style.css'

// Configuration
const config = {
  particleCount: 150, // More particles for lengthier feel
  particleColor: '#D4AF37',
  weddingDate: new Date('april 20, 2026 19:00:00').getTime(),
}

// State
let isCurtainOpen = false
let currentPage = 0
const totalPages = 5

// Elements
const curtain = document.getElementById('curtain')
const envelope = document.getElementById('envelope')
const vellum = document.getElementById('vellum')
const mainReveal = document.getElementById('main-reveal')
const tapText = document.getElementById('tap-text')
const audio = document.getElementById('mantra-audio')
const audioBtn = document.getElementById('audio-btn')
const audioIcon = document.getElementById('audio-icon')
const canvas = document.getElementById('particle-canvas')
const ctx = canvas.getContext('2d')
const rsvpForm = document.getElementById('rsvp-form')
const cursorDot = document.getElementById('cursor-dot')
const petalContainer = document.getElementById('petal-container')
const progressBar = document.getElementById('progress-bar')

// Sound FX
const bellSound = new Audio('public/assets/music.mp3') // Placeholder temple bell
bellSound.volume = 1.0

// Page Elements
const pages = document.querySelectorAll('.invitation-page')
const dots = document.querySelectorAll('.nav-dot')
const nextBtns = document.querySelectorAll('.next-page-btn')
const prevBtns = document.querySelectorAll('.prev-page-btn')

// Initialization
function init() {
  setupCanvas()
  animate()
  startCountdown()
  // setupScrollReveal() // Replaced by navigation logic
  initCursorTrail()
  initPetalSystem()
  initNavigation()

  // Start Sequence
  curtain.addEventListener('click', startRevealSequence)

  // Audio Toggle
  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio)
  }

  // RSVP Handler
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', handleRSVP)
  }
}

function initNavigation() {
  nextBtns.forEach(btn => {
    btn.onclick = () => {
      const next = parseInt(btn.getAttribute('data-next'))
      navigateToPage(next)
    }
  })

  prevBtns.forEach(btn => {
    btn.onclick = () => {
      const prev = parseInt(btn.getAttribute('data-prev'))
      navigateToPage(prev)
    }
  })

  dots.forEach(dot => {
    dot.onclick = () => {
      const target = parseInt(dot.getAttribute('data-page'))
      navigateToPage(target)
    }
  })
}

function playBell() {
  if (!isMuted && isCurtainOpen) {
    bellSound.currentTime = 0
    bellSound.play().catch(() => { })
  }
}

function navigateToPage(index) {
  if (index < 0 || index >= totalPages) return

  if (isCurtainOpen) playBell()

  // Update UI State
  pages.forEach((page, i) => {
    page.classList.toggle('active', i === index)
    // Reset scroll of page
    if (i === index) page.scrollTop = 0
  })

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index)
  })

  // Update Progress Ribbon
  if (progressBar) {
    const progress = (index / (totalPages - 1)) * 100
    progressBar.style.width = `${progress}%`
  }

  currentPage = index
}

function setupCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
}

// Countdown Logic
function startCountdown() {
  const timer = setInterval(() => {
    const now = new Date().getTime()
    const diff = config.weddingDate - now

    if (diff < 0) {
      clearInterval(timer)
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    document.getElementById('days').innerText = days.toString().padStart(2, '0')
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0')
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0')
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0')
  }, 1000)
}

// Scroll Reveal Logic
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el))
}

// RSVP WhatsApp Integration
function handleRSVP(e) {
  e.preventDefault()
  const name = e.target.querySelector('input[type="text"]').value
  const guests = e.target.querySelector('input[type="number"]').value
  const msg = e.target.querySelector('textarea').value

  const text = `*Wedding Blessing & RSVP*%0A%0AName: ${name}%0AGuests: ${guests}%0AMessage: ${msg}`
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

// Particle System
class Particle {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = Math.random() * 0.5 + 0.2
    this.size = Math.random() * 2 + 1
    this.alpha = Math.random() * 0.5 + 0.2
  }

  update() {
    // Reactive logic - Repel from mouse
    const dx = mouseX - this.x
    const dy = mouseY - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 150) {
      this.x -= dx * 0.02
      this.y -= dy * 0.02
    }

    this.y += this.vy
    this.alpha -= 0.0005

    if (this.y > canvas.height || this.alpha <= 0) {
      this.reset()
      this.y = -10
    }
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`
    ctx.fill()
    ctx.shadowBlur = 10
    ctx.shadowColor = '#D4AF37'
  }
}

const particles = Array.from({ length: config.particleCount }, () => new Particle())

// Audio Toggle
let isMuted = false
function toggleAudio() {
  isMuted = !isMuted
  if (audio) audio.muted = isMuted
  audioBtn.classList.toggle('muted', isMuted)
  audioIcon.innerText = isMuted ? '🔇' : '🔊'
}

// Custom Cursor Trail & 3D Tilt Logic
let mouseX = 0, mouseY = 0
function initCursorTrail() {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY

    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px'
      cursorDot.style.top = mouseY + 'px'
    }

    // 3D Tilt Logic
    apply3DTilt(e)

    // Create Trail Particle
    if (Math.random() > 0.7) {
      const trail = document.createElement('div')
      trail.className = 'trail-particle'
      trail.style.left = mouseX + 'px'
      trail.style.top = mouseY + 'px'
      document.body.appendChild(trail)

      setTimeout(() => {
        trail.style.opacity = '0.8'
        trail.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px) scale(0.5)`
      }, 0)

      setTimeout(() => trail.remove(), 1000)
    }
  })
}

function apply3DTilt(e) {
  const cards = document.querySelectorAll('.invitation-card, .frame-container')
  cards.forEach(card => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate rotation based on cursor position relative to center
    const rotateX = (centerY - y) / 20 // Reversed for natural tilt
    const rotateY = (x - centerX) / 20

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  })
}

// Falling Petals
function initPetalSystem() {
  setInterval(() => {
    if (!isCurtainOpen || !petalContainer) return
    const petal = document.createElement('div')
    const isJasmine = Math.random() > 0.7
    petal.className = `petal ${isJasmine ? 'jasmine' : ''}`

    const size = Math.random() * 15 + 10
    petal.style.width = size + 'px'
    petal.style.height = size + 'px'
    petal.style.left = Math.random() * 100 + 'vw'
    petal.style.animationDuration = (Math.random() * 5 + 5) + 's'

    petalContainer.appendChild(petal)
    setTimeout(() => petal.remove(), 10000)
  }, 300)
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles.forEach(p => {
    p.update()
    p.draw()
  })
  requestAnimationFrame(animate)
}

// Actions - Multi-Stage Reveal Sequence
function startRevealSequence() {
  if (isCurtainOpen) return
  isCurtainOpen = true

  // Step 1: Curtain Opens
  curtain.classList.add('open')
  if (tapText) tapText.style.display = 'none'
  if (audio) {
    audio.play().catch(e => console.log("Audio interaction needed", e))
  }

  // Step 2: Show & Open Envelope
  setTimeout(() => {
    envelope.classList.add('active')
    setTimeout(() => {
      envelope.classList.add('open')
    }, 1000)
  }, 2500)

  // Step 3: Show Vellum & Main Content
  setTimeout(() => {
    vellum.classList.add('active')
    mainReveal.classList.add('visible')

    // Step 4: Fade Vellum
    setTimeout(() => {
      vellum.classList.add('fade-out')
      revealSequence()

      // Cleanup
      setTimeout(() => {
        curtain.style.display = 'none'
        envelope.style.display = 'none'
        vellum.style.display = 'none'
      }, 3000)
    }, 2500)
  }, 6000)
}

function revealSequence() {
  const mantraLines = [
    document.getElementById('mantra-line-1'),
    document.getElementById('mantra-line-2'),
    document.getElementById('mantra-line-3')
  ]
  const sparklePen = document.getElementById('sparkle-pen')
  const container = document.getElementById('mantra-reveal-container')

  let currentLine = 0

  function revealNextLine() {
    if (currentLine >= mantraLines.length) {
      // All lines revealed
      sparklePen.classList.remove('active')
      container.classList.add('aura-active')

      // Reveal Sacred Symbols afterward (with safety)
      setTimeout(() => {
        const symbols = ['symbol-1', 'symbol-2', 'symbol-3']
        symbols.forEach((id, index) => {
          setTimeout(() => {
            const el = document.getElementById(id)
            if (el) el.classList.add('show')
          }, index * 800)
        })

        // Reveal Couple Names Trigger (with safety)
        setTimeout(() => {
          const coupleReveal = document.getElementById('couple')
          const namePath = document.getElementById('couple-name-path')
          if (coupleReveal) {
            coupleReveal.style.opacity = '1'
            coupleReveal.style.transition = 'opacity 2s ease'
          }
          if (namePath) namePath.classList.add('active')

          // SYNC: Ensure the multi-page system is initiated correctly
          if (typeof navigateToPage === 'function') {
            navigateToPage(0)
          }
        }, 3000)
      }, 1000)
      return
    }

    const line = mantraLines[currentLine]
    sparklePen.classList.add('active')
    line.classList.add('reveal')

    // Animate Sparkle Pen
    const lineRect = line.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    let start = null
    const duration = 2500 // Matching CSS transition

    function animateSparkle(timestamp) {
      if (!start) start = timestamp
      const progress = (timestamp - start) / duration

      if (progress < 1) {
        const x = progress * line.scrollWidth
        sparklePen.style.left = (line.offsetLeft + x - 10) + 'px'
        sparklePen.style.top = (line.offsetTop + 10) + 'px'
        requestAnimationFrame(animateSparkle)
      } else {
        currentLine++
        setTimeout(revealNextLine, 500)
      }
    }
    requestAnimationFrame(animateSparkle)
  }

  revealNextLine()
}

// Run
init()
