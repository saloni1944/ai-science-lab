import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, Atom, Bot, Check, ChevronRight, CircleHelp,
  Dna, FlaskConical, Gauge, Leaf, Orbit, Play, Sparkles, Timer, Waves, X, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AtomScene } from './components/AtomScene'
import { ScienceHub } from './components/ScienceHub'
import './App.css'
import './lab.css'

type Experiment = {
  title: string
  description: string
  subject: string
  time: string
  icon: 'orbit' | 'flask' | 'zap'
  art: string
}

type Topic = {
  title: string
  description: string
  icon: 'atom' | 'dna' | 'leaf'
  color: string
}

type Panel =
  | { kind: 'experiment'; experiment: Experiment }
  | { kind: 'topic'; topic: Topic }
  | { kind: 'challenge' }
  | { kind: 'quiz' }
  | null

const experiments: Experiment[] = [
  { title: 'Escape velocity', description: 'Can you launch a satellite without letting gravity pull it home?', subject: 'SPACE + MOTION', time: '6 MIN', icon: 'orbit', art: 'space' },
  { title: 'The color lab', description: 'Split light into a spectrum and mix a beam of your own.', subject: 'LIGHT + ENERGY', time: '4 MIN', icon: 'flask', art: 'spectrum' },
  { title: 'Charge runner', description: 'Build a path for electrons and watch a circuit come alive.', subject: 'ELECTRICITY', time: '8 MIN', icon: 'zap', art: 'circuit' },
]

const topics: Topic[] = [
  { title: 'Matter & motion', description: 'Tiny particles. Huge forces. A universe in motion.', icon: 'atom', color: 'cyan' },
  { title: 'Energy in action', description: 'Follow energy as it changes form, moves, and makes things happen.', icon: 'leaf', color: 'lime' },
  { title: 'Life, decoded', description: 'Explore the surprising systems that make living things work.', icon: 'dna', color: 'violet' },
]

const experimentIcons: Record<Experiment['icon'], LucideIcon> = { orbit: Orbit, flask: FlaskConical, zap: Zap }
const topicIcons: Record<Topic['icon'], LucideIcon> = { atom: Atom, dna: Dna, leaf: Leaf }
const challengeOptions = ['A sideways push keeps it moving', 'Gravity pulls it toward the star', 'There is no gravity in space']
const quizQuestions = [
  { question: 'What makes a planet keep moving around a star?', answers: ['Magnetism', 'Gravity and forward motion', 'The star pushes it'], correct: 1, fact: 'Gravity bends a planet’s forward path into an orbit.' },
  { question: 'What happens when white light passes through a prism?', answers: ['It becomes invisible', 'It splits into colors', 'It turns into heat'], correct: 1, fact: 'Different colors bend by different amounts, spreading into a spectrum.' },
]
const experimentModes = {
  orbit: { left: 'TOO SLOW', right: 'ESCAPE VELOCITY', control: 'LAUNCH ENERGY', readout: 'GRAVITY / ON' },
  flask: { left: 'RED', right: 'VIOLET', control: 'LIGHT FREQUENCY', readout: 'PRISM / READY' },
  zap: { left: 'LOW VOLTAGE', right: 'HIGH VOLTAGE', control: 'CIRCUIT VOLTAGE', readout: 'CIRCUIT / OPEN' },
} as const

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
}

function getSimulationFeedback(icon: Experiment['icon'], power: number, running: boolean) {
  if (!running) return { className: '', caption: 'ADJUST THE MODEL, THEN RUN IT' }
  if (icon === 'orbit') {
    if (power < 35) return { className: 'simulation-underpowered', caption: 'TOO SLOW · SATELLITE FALLS BACK' }
    if (power > 78) return { className: 'simulation-escape', caption: 'ESCAPE VELOCITY · LEAVING ORBIT' }
    return { className: 'simulation-orbiting', caption: 'STABLE ORBIT · GRAVITY BENDS ITS PATH' }
  }
  if (icon === 'flask') {
    if (power < 35) return { className: 'simulation-long-wave', caption: 'LONGER WAVELENGTH · RED LIGHT' }
    if (power > 72) return { className: 'simulation-short-wave', caption: 'SHORTER WAVELENGTH · VIOLET LIGHT' }
    return { className: 'simulation-spectrum', caption: 'WHITE LIGHT SPLIT INTO A SPECTRUM' }
  }
  if (power < 32) return { className: 'simulation-low-voltage', caption: 'LOW VOLTAGE · DIM CURRENT' }
  return { className: 'simulation-current', caption: 'CURRENT FLOWS · CIRCUIT COMPLETE' }
}

function App() {
  const [activePanel, setActivePanel] = useState<Panel>(null)
  const [guideHint, setGuideHint] = useState(false)
  const [challengeChoice, setChallengeChoice] = useState<number | null>(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizChoice, setQuizChoice] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [simulationPower, setSimulationPower] = useState(48)
  const [simulationRunning, setSimulationRunning] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!activePanel) {
      returnFocusRef.current?.focus()
      returnFocusRef.current = null
      return
    }
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePanel(null)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
        event.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activePanel])

  function showPanel(panel: NonNullable<Panel>) {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setActivePanel(panel)
  }

  function closePanel() {
    setActivePanel(null)
  }

  function openExperiment(experiment: Experiment) {
    setSimulationPower(48)
    setSimulationRunning(false)
    showPanel({ kind: 'experiment', experiment })
  }

  function openChallenge() {
    setChallengeChoice(null)
    showPanel({ kind: 'challenge' })
  }

  function openQuiz() {
    setQuizIndex(0)
    setQuizChoice(null)
    setQuizScore(0)
    setQuizComplete(false)
    showPanel({ kind: 'quiz' })
  }

  function answerQuiz(choice: number) {
    if (quizChoice !== null) return
    setQuizChoice(choice)
    if (choice === quizQuestions[quizIndex].correct) setQuizScore((score) => score + 1)
  }

  function continueQuiz() {
    if (quizIndex + 1 === quizQuestions.length) {
      setQuizComplete(true)
      return
    }
    setQuizIndex((index) => index + 1)
    setQuizChoice(null)
  }

  const quizQuestion = quizQuestions[quizIndex]
  const experimentMode = activePanel?.kind === 'experiment' ? experimentModes[activePanel.experiment.icon] : experimentModes.orbit
  const experimentFeedback = activePanel?.kind === 'experiment'
    ? getSimulationFeedback(activePanel.experiment.icon, simulationPower, simulationRunning)
    : { className: '', caption: '' }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="AI Science Lab home">
          <span className="brand-mark"><Atom size={20} strokeWidth={1.8} /></span>
          <span className="brand-name">AI SCIENCE <b>LAB</b></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#modules">Science dashboard</a><a href="#experiments">Experiments</a><a href="#topics">Explore topics</a>
        </nav>
        <div className="topbar-actions">
          <span className="online-indicator"><i /> LAB ONLINE</span>
          <button className="guide-nav-button" onClick={() => setGuideHint((value) => !value)}><Bot size={16} /><span>Meet Orbit</span></button>
        </div>
      </header>

      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-light hero-light-one" aria-hidden="true" />
          <div className="hero-light hero-light-two" aria-hidden="true" />
          <div className="circuit-trace trace-one" aria-hidden="true" />
          <div className="circuit-trace trace-two" aria-hidden="true" />
          <AtomScene />
          <div className="formula-tag formula-energy" aria-hidden="true"><span>ENERGY / 01</span><b>E = mc²</b></div>
          <div className="formula-tag formula-force" aria-hidden="true"><span>MOTION / 02</span><b>F = m × a</b></div>
          <div className="formula-tag formula-wave" aria-hidden="true"><span>LIGHT / 03</span><b>λ = c / f</b></div>
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-line" />WELCOME TO AI SCIENCE LAB</div>
            <h1 id="hero-title">Big questions.<br /><span>Brave experiments.</span></h1>
            <p className="hero-subtitle">Run experiments. Discover science.<br className="desktop-break" /> Become an inventor.</p>
            <div className="hero-buttons">
              <button className="button button-primary" onClick={() => scrollToSection('experiments')}><span>Start experiments</span><ArrowRight size={17} /></button>
              <button className="button button-secondary" onClick={() => scrollToSection('topics')}>Explore topics<ArrowDownRight size={16} /></button>
            </div>
            <div className="quick-launchers" aria-label="Quick activities">
              <button className="quick-launch" onClick={openChallenge}>
                <span className="quick-icon challenge-icon"><Zap size={17} /></span>
                <span className="quick-copy"><b>Daily challenge</b><small>One big question. 2 min.</small></span><ChevronRight size={16} className="quick-arrow" />
              </button>
              <button className="quick-launch" onClick={openQuiz}>
                <span className="quick-icon quiz-icon"><CircleHelp size={17} /></span>
                <span className="quick-copy"><b>Quiz arena</b><small>Test your science instincts.</small></span><ChevronRight size={16} className="quick-arrow" />
              </button>
            </div>
          </div>

          <div className="scene-readout" aria-hidden="true"><span className="readout-cross">+</span><span>ATOM / 004</span><i /><span>LIVE MODEL</span></div>
          <aside className="guide-card" aria-label="Orbit, your AI lab guide">
            <div className="guide-avatar"><Bot size={20} /><span /></div>
            <div className="guide-message">
              <div className="guide-name">ORBIT <span>YOUR LAB GUIDE</span></div>
              <p>{guideHint ? 'Try changing the launch speed. What do you think gravity will do?' : 'Hey, explorer. Ready to make a little science happen?'}</p>
              <button onClick={() => setGuideHint((value) => !value)}>{guideHint ? 'Got it' : 'Ask for a hint'} <ArrowRight size={13} /></button>
            </div>
            <span className="guide-signal" aria-hidden="true">●</span>
          </aside>
          <div className="hero-coordinate" aria-hidden="true">N 34° 03′ 08.9″ &nbsp; E 118° 14′ 37.8″</div>
        </section>

        <div className="telemetry-strip" aria-label="Lab status">
          <div><span className="telemetry-pip" /> SIMULATION MODE <b>SAFE</b></div>
          <div className="telemetry-center"><span>01</span> / 04 SYSTEMS ACTIVE</div>
          <div className="telemetry-right">CURIOSITY LEVEL <b>RISING <Sparkles size={13} /></b></div>
        </div>

        <ScienceHub />

        <section className="section experiments-section" id="experiments" aria-labelledby="experiments-title">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span>01</span> THE EXPERIMENT DECK</div>
              <h2 id="experiments-title">Pick your first mission<span>.</span></h2>
              <p>Real science. Zero risk. All the “what if?” you can handle.</p>
            </div>
            <div className="section-count"><span>03</span><small>MISSIONS<br />READY</small><ArrowDownRight size={16} /></div>
          </div>
          <div className="experiment-grid">
            {experiments.map((experiment, index) => {
              const Icon = experimentIcons[experiment.icon]
              return (
                <button className="experiment-card" key={experiment.title} onClick={() => openExperiment(experiment)}>
                  <span className={`experiment-art art-${experiment.art}`}>
                    <span className="art-index">SIM / 0{index + 1}</span><span className="art-orbit art-orbit-one" /><span className="art-orbit art-orbit-two" />
                    <span className="art-core"><Icon size={23} /></span><span className="art-status"><i /> READY</span>
                  </span>
                  <span className="experiment-info">
                    <span className="experiment-meta"><span>{experiment.subject}</span><span><Timer size={12} /> {experiment.time}</span></span>
                    <span className="experiment-title">{experiment.title}<ArrowRight size={16} /></span>
                    <span className="experiment-description">{experiment.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <div className="safety-note"><span className="safety-icon"><Check size={14} /></span> BUILT FOR SAFE DISCOVERY <span className="safety-divider" /> Every experiment runs in a simulation.</div>
        </section>

        <section className="section topics-section" id="topics" aria-labelledby="topics-title">
          <div className="topics-intro">
            <div className="section-kicker"><span>02</span> FOLLOW YOUR CURIOSITY</div>
            <h2 id="topics-title">A universe of<br />things to figure out<span>.</span></h2>
            <p>Choose a direction. There’s no wrong way to wonder.</p>
            <span className="topics-coordinate" aria-hidden="true">FIELD INDEX / 008.24</span>
          </div>
          <div className="topic-list">
            {topics.map((topic, index) => {
              const Icon = topicIcons[topic.icon]
              return (
                <button className={`topic-row topic-${topic.color}`} key={topic.title} onClick={() => showPanel({ kind: 'topic', topic })}>
                  <span className="topic-index">0{index + 1}</span><span className="topic-icon"><Icon size={20} strokeWidth={1.7} /></span>
                  <span className="topic-copy"><b>{topic.title}</b><small>{topic.description}</small></span><ArrowRight size={17} className="topic-arrow" />
                </button>
              )
            })}
          </div>
        </section>

        <section className="field-notes" id="field-notes" aria-label="Lab field note">
          <div className="field-note-mark"><Waves size={19} /></div>
          <div className="field-note-copy"><span>FIELD NOTE / 001</span><p>“The important thing is to never stop questioning.”</p></div>
          <span className="field-note-credit">A GOOD RULE FOR SCIENTISTS</span>
          <button className="field-note-action" onClick={() => scrollToSection('experiments')} aria-label="Return to experiments"><ArrowRight size={18} /></button>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home"><span className="brand-mark"><Atom size={17} /></span><span className="brand-name">AI SCIENCE <b>LAB</b></span></a>
        <span>MADE FOR CURIOUS MINDS <span className="footer-dot">●</span> AGES 12–14</span>
        <span className="footer-status"><i /> ALL SYSTEMS CURIOUS</span>
      </footer>

      {activePanel && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closePanel()}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" tabIndex={-1} ref={dialogRef}>
            <button className="modal-close" onClick={closePanel} aria-label="Close panel"><X size={18} /></button>
            {activePanel.kind === 'experiment' && (
              <>
                <div className="modal-kicker"><span className="telemetry-pip" /> SIMULATION / {activePanel.experiment.subject}</div>
                <h2 id="panel-title">{activePanel.experiment.title}<span>.</span></h2>
                <p className="modal-lede">{activePanel.experiment.description}</p>
                <div className={`simulation-window simulation-${activePanel.experiment.art} ${simulationRunning ? 'is-running' : ''} ${experimentFeedback.className}`}>
                  <div className="simulation-label"><span>LIVE MODEL</span><span>{experimentMode.readout}</span></div>
                  {activePanel.experiment.icon === 'orbit' && <div className="simulation-orbit"><span className="simulation-planet" /><span className="simulation-satellite"><span /></span></div>}
                  {activePanel.experiment.icon === 'flask' && <div className="spectrum-visual"><span className="spectrum-beam" style={{ width: `${38 + simulationPower * 0.52}px` }} /><span className="spectrum-prism" /><span className="spectrum-rays" style={{ filter: `hue-rotate(${(simulationPower - 50) * 1.5}deg)` }}><i /><i /><i /></span></div>}
                  {activePanel.experiment.icon === 'zap' && <div className="circuit-visual"><span className="circuit-track" /><i /><i /><i /><span className="circuit-current" /></div>}
                  <span className="simulation-caption" aria-live="polite">{experimentFeedback.caption}</span>
                </div>
                <label className="range-label" htmlFor="energy-range"><span>{experimentMode.control}</span><b>{simulationPower}%</b></label>
                <input id="energy-range" className="energy-range" type="range" min="10" max="100" value={simulationPower} onChange={(event) => setSimulationPower(Number(event.target.value))} />
                <div className="range-hints"><span>{experimentMode.left}</span><span>{experimentMode.right}</span></div>
                <button className="button button-primary modal-primary" onClick={() => setSimulationRunning((value) => !value)}>{simulationRunning ? 'Pause simulation' : 'Run simulation'}{simulationRunning ? <span className="pause-mark">Ⅱ</span> : <Play size={15} fill="currentColor" />}</button>
                <p className="modal-safety"><Check size={13} /> SAFE MODE · THIS IS A COMPUTER SIMULATION</p>
              </>
            )}
            {activePanel.kind === 'topic' && (
              <>
                <div className="modal-kicker"><span className="telemetry-pip" /> TOPIC FILE / {activePanel.topic.icon.toUpperCase()}</div>
                <h2 id="panel-title">{activePanel.topic.title}<span>.</span></h2>
                <p className="modal-lede">{activePanel.topic.description}</p>
                <div className="topic-detail-visual"><Atom size={48} strokeWidth={1.1} /><span>THREE CLUES. INFINITE QUESTIONS.</span></div>
                <div className="topic-detail-list"><span><b>01</b> Start with a question</span><span><b>02</b> Test an idea safely</span><span><b>03</b> See what the evidence says</span></div>
                <button className="button button-primary modal-primary" onClick={() => { closePanel(); scrollToSection('experiments') }}>Find an experiment<ArrowRight size={16} /></button>
              </>
            )}
            {activePanel.kind === 'challenge' && (
              <>
                <div className="modal-kicker"><Zap size={14} /> DAILY CHALLENGE / 02 MIN</div>
                <h2 id="panel-title">A satellite is in orbit.<br />What keeps it there<span>?</span></h2>
                <p className="modal-lede">Think it through, then lock in your answer.</p>
                <div className="answer-list">
                  {challengeOptions.map((option, index) => (
                    <button key={option} className={`answer-option ${challengeChoice === index ? 'is-selected' : ''} ${challengeChoice !== null && index === 1 ? 'is-correct' : ''}`} onClick={() => setChallengeChoice(index)}>
                      <span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{challengeChoice === index && <Check size={16} />}
                    </button>
                  ))}
                </div>
                {challengeChoice !== null && <p className={`answer-feedback ${challengeChoice === 1 ? 'feedback-correct' : ''}`} aria-live="polite">{challengeChoice === 1 ? 'That’s it! Gravity bends the satellite’s forward motion into an orbit.' : 'Good thinking. A sideways push starts the motion, but gravity keeps curving its path.'}</p>}
                <p className="modal-safety"><Sparkles size={13} /> CURIOSITY COUNTS MORE THAN POINTS</p>
              </>
            )}
            {activePanel.kind === 'quiz' && (
              <>
                <div className="modal-kicker"><CircleHelp size={14} /> QUIZ ARENA / ROUND 01</div>
                {quizComplete ? (
                  <>
                    <h2 id="panel-title">Nice thinking<span>.</span></h2>
                    <p className="modal-lede">You got {quizScore} of {quizQuestions.length} questions right. Every answer is a launchpad for the next question.</p>
                    <div className="quiz-result"><span>{String(quizScore).padStart(2, '0')}</span><small>OUT OF {quizQuestions.length}<br />CORRECT</small><Sparkles size={24} /></div>
                    <button className="button button-primary modal-primary" onClick={openQuiz}>Play again<ArrowRight size={16} /></button>
                  </>
                ) : (
                  <>
                    <div className="quiz-progress"><span>QUESTION 0{quizIndex + 1}</span><span>{quizIndex + 1} / {quizQuestions.length}</span></div>
                    <h2 id="panel-title">{quizQuestion.question}<span>?</span></h2>
                    <div className="answer-list quiz-answers">
                      {quizQuestion.answers.map((answer, index) => (
                        <button key={answer} className={`answer-option ${quizChoice === index ? 'is-selected' : ''} ${quizChoice !== null && index === quizQuestion.correct ? 'is-correct' : ''} ${quizChoice === index && index !== quizQuestion.correct ? 'is-wrong' : ''}`} onClick={() => answerQuiz(index)}>
                          <span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{answer}</span>{quizChoice === index && (index === quizQuestion.correct ? <Check size={16} /> : <X size={16} />)}
                        </button>
                      ))}
                    </div>
                    {quizChoice !== null && <p className="answer-feedback feedback-correct" aria-live="polite">{quizQuestion.fact}</p>}
                    {quizChoice !== null && <button className="button button-primary modal-primary" onClick={continueQuiz}>{quizIndex + 1 === quizQuestions.length ? 'See my result' : 'Next question'}<ArrowRight size={16} /></button>}
                  </>
                )}
                <p className="modal-safety"><Gauge size={13} /> NO TIMER. JUST GOOD QUESTIONS.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App