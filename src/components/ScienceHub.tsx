import { useEffect, useRef, useState } from 'react'
import {
  Activity, ArrowRight, Atom, BatteryCharging, Bot, BrainCircuit, Check, ChevronRight,
  Dna, Flame, Lightbulb, Orbit, Play, Printer, Rocket, ShieldCheck, Sparkles, Timer,
  Trophy, Volume2, VolumeX, Wind, Wrench, X, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './ScienceHub.css'

type LabId = 'volcano' | 'electricity' | 'gravity' | 'rocket' | 'dna' | 'quiz' | 'achievements' | 'workshop'
type HubTab = 'lab' | 'learn' | 'challenge' | 'quiz'
type ModuleInfo = {
  id: LabId
  title: string
  label: string
  description: string
  badge: string
  icon: LucideIcon
  accent: string
}
type Progress = { xp: number; coins: number; completed: LabId[]; badges: string[] }
type Question = { prompt: string; answers: string[]; correct: number; explanation: string }
type Facts = { what: string; how: string; examples: string; fun: string; challenge: string }
type Settings = { pressure: number; gas: number; temperature: number; crater: string; eruption: string; voltage: number; gravity: number; mass: number; fuel: number; engine: number; boosters: number; fin: string }

const storageKey = 'ai-science-lab-progress-v1'
const modules: ModuleInfo[] = [
  { id: 'volcano', title: 'Volcano Lab', label: 'EARTH SCIENCE', description: 'Tune the magma chamber. Predict the eruption.', badge: 'Junior Volcanologist', icon: Flame, accent: 'lava' },
  { id: 'electricity', title: 'Electricity Lab', label: 'CIRCUITS + ENERGY', description: 'Build a circuit and bring your ideas to life.', badge: 'Circuit Builder', icon: BatteryCharging, accent: 'electric' },
  { id: 'gravity', title: 'Gravity Chamber', label: 'SPACE + MOTION', description: 'Make a world. See how gravity changes everything.', badge: 'Gravity Explorer', icon: Orbit, accent: 'gravity' },
  { id: 'rocket', title: 'Rocket Launch Bay', label: 'FLIGHT + ENGINEERING', description: 'Build a launch vehicle. Put a payload on a mission.', badge: 'Rocket Engineer', icon: Rocket, accent: 'rocket' },
  { id: 'dna', title: 'DNA Mixing Center', label: 'LIFE SCIENCE', description: 'Invent imaginary species and explore inherited traits.', badge: 'Genetics Genius', icon: Dna, accent: 'dna' },
  { id: 'quiz', title: 'Quiz Arena', label: 'SCIENCE SHOWDOWN', description: 'Pick a topic, choose a mode, and test your ideas.', badge: 'Science Strategist', icon: BrainCircuit, accent: 'quiz' },
  { id: 'achievements', title: 'Science Achievements', label: 'YOUR FIELD RECORD', description: 'See your discoveries, earned badges, and next goals.', badge: 'Lab Rookie', icon: Trophy, accent: 'achievements' },
  { id: 'workshop', title: 'Inventor Workshop', label: 'MAKE + TEST', description: 'Drag parts to a workbench and prototype a new machine.', badge: 'Inventor', icon: Wrench, accent: 'workshop' },
]

const facts: Record<LabId, Facts> = {
  volcano: { what: 'A volcano is an opening in Earth’s crust where molten rock, gas, and ash can escape.', how: 'Magma rises when it is less dense than nearby rock. Dissolved gases expand as pressure drops; if pressure builds faster than it escapes, an eruption can happen.', examples: 'Kīlauea often has fluid lava flows. Mount St. Helens is a steep stratovolcano. Iceland’s volcanoes sit near a spreading plate boundary.', fun: 'Rock called magma is underground. Once it reaches the surface, we call it lava.', challenge: 'Raise gas pressure while keeping the magma cooler. Compare the model’s gentle-flow and explosive modes.', },
  electricity: { what: 'A circuit is a complete path that lets electric charge move through components.', how: 'A battery provides voltage, which transfers energy to charges. Resistance limits current; Ohm’s law connects them: voltage = current × resistance.', examples: 'Flashlights use a simple series circuit. House wiring uses parallel branches so one light can turn off without stopping the others.', fun: 'A bulb needs a complete path from one battery terminal, through the bulb, and back to the other terminal.', challenge: 'Build a closed path with a battery, wires, a switch, and a bulb. Then add a second bulb and compare.', },
  gravity: { what: 'Gravity is an attraction between objects that have mass.', how: 'More mass means a stronger gravitational pull. Farther apart objects pull on each other less; on a planet, gravity gives falling objects downward acceleration.', examples: 'Earth holds the Moon in orbit. The Sun holds the planets in their paths. Astronauts in orbit still feel Earth’s gravity.', fun: 'Orbiting astronauts appear weightless because they and their spacecraft are continuously falling around Earth together.', challenge: 'Change your planet’s gravity, then predict whether the same jump or drop would take more or less time.', },
  rocket: { what: 'A rocket moves by pushing hot exhaust backward; the rocket is pushed forward in return.', how: 'The engine makes thrust. A rocket must overcome gravity and air drag; staging drops empty tanks so the remaining rocket can accelerate.', examples: 'Sounding rockets study the upper atmosphere. Launch vehicles carry satellites, probes, and crew spacecraft.', fun: 'A rocket can work in space because it carries both fuel and the oxygen source needed to burn it.', challenge: 'Deliver a satellite by balancing engine power and boosters against fuel use and air drag.', },
  dna: { what: 'DNA is a molecule in cells that stores inherited instructions for building and running an organism.', how: 'Genes are sections of DNA. Many traits are influenced by several genes and the environment; a single dominant/recessive model is useful for some simple traits, not all traits.', examples: 'DNA is found in almost all living cells. Scientists compare DNA to study relatedness and inherited variation.', fun: 'If the DNA from one human cell were stretched out, it would be about two metres long.', challenge: 'Mix fictional creature traits, then identify which traits came from each imaginary parent.', },
  quiz: { what: 'A science quiz is a chance to use evidence and explain your thinking, not just recall a fact.', how: 'Read carefully, compare each choice with what you know, and use feedback to improve your next idea.', examples: 'Scientists ask each other questions at conferences, in labs, and while reviewing evidence.', fun: 'Changing your mind when new evidence arrives is a strength in science.', challenge: 'Answer three questions from different science fields and collect a point for each correct explanation.', },
  achievements: { what: 'Achievements are a record of the science you have explored and the skills you have practised.', how: 'Complete a simulation, explain a result, or finish a challenge to unlock a badge and add experience points.', examples: 'Scientists keep lab notebooks to track questions, methods, observations, and conclusions.', fun: 'An experiment that does not work as expected can still teach you something important.', challenge: 'Complete any lab, then return here to see your field record update.', },
  workshop: { what: 'Engineering is a process of designing, testing, and improving a solution to a problem.', how: 'Set a goal, choose parts, build a prototype, test it, then use what happened to improve the next version.', examples: 'Engineers use prototypes to test bridges, medical devices, robots, and spacecraft.', fun: 'The first version of a design is rarely the last. Iteration is part of the work.', challenge: 'Add at least three different parts to the workbench and give your invention a mission.', },
}

const questionBank: Record<LabId, Question[]> = {
  volcano: [
    { prompt: 'What do we call molten rock while it is still underground?', answers: ['Lava', 'Magma', 'Ash'], correct: 1, explanation: 'Magma is underground molten rock. At the surface it is called lava.' },
    { prompt: 'What can make an explosive eruption more likely?', answers: ['Trapped gas building pressure', 'A very wide beach', 'The Moon getting brighter'], correct: 0, explanation: 'Gas can become trapped in viscous magma and build pressure.' },
    { prompt: 'Where do many volcanoes form?', answers: ['Only in deserts', 'Near moving tectonic plate boundaries', 'At the center of every continent'], correct: 1, explanation: 'Many volcanoes form where tectonic plates meet, though some form over hotspots.' },
  ],
  electricity: [
    { prompt: 'What must a simple circuit have for current to keep flowing?', answers: ['A complete path', 'A wooden gap', 'Only one wire end'], correct: 0, explanation: 'A complete conducting loop lets charge move through the circuit.' },
    { prompt: 'What does voltage describe in a circuit?', answers: ['Energy transferred per unit of charge', 'The color of a wire', 'How heavy a battery is'], correct: 0, explanation: 'Voltage is the difference in electric potential energy per unit charge.' },
    { prompt: 'What does a resistor do?', answers: ['Limits current', 'Makes charge disappear', 'Creates new electrons'], correct: 0, explanation: 'Resistance makes it harder for current to flow.' },
  ],
  gravity: [
    { prompt: 'If a planet has more mass, what happens to its gravity nearby?', answers: ['It usually gets stronger', 'It always vanishes', 'It changes into light'], correct: 0, explanation: 'Greater mass creates a stronger gravitational attraction at the same distance.' },
    { prompt: 'Why does the Moon stay near Earth?', answers: ['Earth’s gravity bends its path', 'There is no gravity in space', 'The Moon is tied to Earth'], correct: 0, explanation: 'The Moon moves forward while Earth’s gravity continually bends its path.' },
    { prompt: 'Do astronauts in orbit experience Earth’s gravity?', answers: ['Yes', 'No, never', 'Only at night'], correct: 0, explanation: 'Earth’s gravity is still strong in orbit; astronauts and their spacecraft are falling together.' },
  ],
  rocket: [
    { prompt: 'What pushes a rocket forward?', answers: ['Exhaust pushed backward', 'Air pulling from above', 'The shape of its paint'], correct: 0, explanation: 'A rocket pushes exhaust backward, and the exhaust pushes the rocket forward.' },
    { prompt: 'Why do rockets drop empty stages?', answers: ['To reduce mass', 'To make more air', 'To turn off gravity'], correct: 0, explanation: 'Discarding empty tanks reduces mass, so the remaining rocket can accelerate more easily.' },
    { prompt: 'What is drag?', answers: ['A force from moving through air', 'The rocket’s fuel tank', 'The force that creates orbit'], correct: 0, explanation: 'Drag is resistance from a fluid such as air moving around an object.' },
  ],
  dna: [
    { prompt: 'What does DNA do?', answers: ['Stores inherited biological instructions', 'Powers every cell like a battery', 'Makes all traits identical'], correct: 0, explanation: 'DNA stores information used by cells. It does not determine every trait by itself.' },
    { prompt: 'What is a gene?', answers: ['A section of DNA', 'A whole cell', 'A kind of fossil'], correct: 0, explanation: 'A gene is a stretch of DNA that contributes to a biological product or trait.' },
    { prompt: 'Are all traits controlled by just one gene?', answers: ['No, many involve several genes and environment', 'Yes, every trait has one gene', 'Only plant traits do'], correct: 0, explanation: 'Many traits are complex and are influenced by multiple genes and the environment.' },
  ],
  quiz: [
    { prompt: 'Which is a good next step when evidence disagrees with your prediction?', answers: ['Change the evidence', 'Revise your explanation', 'Stop asking questions'], correct: 1, explanation: 'Science explanations change when stronger evidence gives us a better account.' },
    { prompt: 'Which is a conductor?', answers: ['Copper wire', 'Rubber band', 'Dry wood'], correct: 0, explanation: 'Copper has mobile electrons that let electric charge flow easily.' },
    { prompt: 'Why do rockets need fins in the lower atmosphere?', answers: ['They help stabilize the rocket', 'They create fuel', 'They turn off drag'], correct: 0, explanation: 'Fins can help stabilize a rocket’s direction while it moves through air.' },
  ],
  achievements: [
    { prompt: 'What belongs in a useful lab record?', answers: ['Method and observations', 'Only a score', 'A guess with no test'], correct: 0, explanation: 'Methods and observations help you and others understand what happened.' },
    { prompt: 'What can a failed test teach you?', answers: ['How to improve the next design', 'Nothing at all', 'That science is over'], correct: 0, explanation: 'Unexpected results can help refine an idea or improve a design.' },
    { prompt: 'What is a model useful for?', answers: ['Exploring and explaining a system', 'Replacing all evidence', 'Proving every detail is exact'], correct: 0, explanation: 'Models help us explore systems, but every model has limits.' },
  ],
  workshop: [
    { prompt: 'What comes after testing a prototype?', answers: ['Use what you learned to improve it', 'Never change it', 'Hide the results'], correct: 0, explanation: 'Engineers use test results to improve a design through iteration.' },
    { prompt: 'Why define a design goal?', answers: ['So you can judge whether the design works', 'So every design looks the same', 'So it needs no testing'], correct: 0, explanation: 'A clear goal helps you compare the prototype with the problem it should solve.' },
    { prompt: 'What is a prototype?', answers: ['An early version built to test an idea', 'A finished planet', 'A kind of battery'], correct: 0, explanation: 'A prototype is an early build for trying out an idea.' },
  ],
}

const initialSettings: Settings = { pressure: 52, gas: 48, temperature: 72, crater: 'Broad', eruption: 'Gentle flow', voltage: 56, gravity: 62, mass: 50, fuel: 68, engine: 62, boosters: 1, fin: 'Delta' }
const circuitParts = ['Battery', 'Wire', 'Bulb', 'Motor', 'Fan', 'Switch', 'Resistor', 'LED']
const workshopParts = ['Solar sail', 'Sample pod', 'Gyroscope', 'Landing legs', 'Radiator', 'Sensor']
const guideAnswers = [
  { question: 'Why did the volcano erupt?', answer: 'As magma rises, pressure drops and trapped gases expand. If gas cannot escape fast enough, the pressure can help drive an eruption.' },
  { question: 'Why did the bulb not light?', answer: 'Check that the circuit forms a complete loop from one battery terminal, through the bulb, and back to the other terminal. Also check the switch.' },
  { question: 'Why did the rocket crash?', answer: 'The design may not have produced enough thrust to overcome gravity and drag, or it may have used too much fuel before reaching its goal.' },
  { question: 'What is DNA?', answer: 'DNA is a molecule in cells that stores inherited biological instructions. Genes are sections of DNA, and many traits depend on several genes and the environment.' },
]

function readProgress(): Progress {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Partial<Progress>
    return { xp: value.xp ?? 0, coins: value.coins ?? 0, completed: value.completed ?? [], badges: value.badges ?? [] }
  } catch {
    return { xp: 0, coins: 0, completed: [], badges: [] }
  }
}

function questionsFor(moduleId: LabId, category: string, mode: string): Question[] {
  const topic: LabId = moduleId === 'quiz'
    ? category === 'Volcanoes' ? 'volcano' : category === 'Electricity' ? 'electricity' : category === 'Gravity' ? 'gravity' : category === 'Rockets' ? 'rocket' : category === 'DNA' ? 'dna' : 'quiz'
    : moduleId
  const topicQuestions = questionBank[topic]
  return mode === 'Boss battle' ? [...topicQuestions, ...questionBank.quiz] : topicQuestions
}

function Slider({ label, value, onChange, min = 0, max = 100, suffix = '%' }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <label className="lab-slider">
      <span><span>{label}</span><b>{value}{suffix}</b></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export function ScienceHub() {
  const [progress, setProgress] = useState<Progress>(readProgress)
  const [selected, setSelected] = useState<ModuleInfo | null>(null)
  const [tab, setTab] = useState<HubTab>('lab')
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [erupting, setErupting] = useState(false)
  const [parts, setParts] = useState<string[]>([])
  const [switchOn, setSwitchOn] = useState(true)
  const [circuitMode, setCircuitMode] = useState('Series')
  const [dropped, setDropped] = useState(0)
  const [rocketPhase, setRocketPhase] = useState('idle')
  const [rocketWillOrbit, setRocketWillOrbit] = useState(false)
  const [rocketResult, setRocketResult] = useState('')
  const [creature, setCreature] = useState('')
  const [traits, setTraits] = useState({ eyes: 'Amber', wings: 'Glider wings', height: 'Tall', glow: 'Soft green' })
  const [blueprint, setBlueprint] = useState<string[]>([])
  const [draggedPart, setDraggedPart] = useState('')
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizChoice, setQuizChoice] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizTimeLeft, setQuizTimeLeft] = useState(45)
  const [survivalLives, setSurvivalLives] = useState(3)
  const [quizMode, setQuizMode] = useState('Solo challenge')
  const [quizCategory, setQuizCategory] = useState('Mixed science')
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideReply, setGuideReply] = useState('Pick a question and I’ll help you reason it through.')
  const [soundOn, setSoundOn] = useState(false)
  const [challengeGoal, setChallengeGoal] = useState(false)
  const moduleDialogRef = useRef<HTMLElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const volcanoTimeoutRef = useRef<number | null>(null)

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(progress)) }, [progress])

  useEffect(() => {
    if (!selected) {
      openerRef.current?.focus()
      openerRef.current = null
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    moduleDialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null)
        return
      }
      if (event.key !== 'Tab' || !moduleDialogRef.current) return
      const focusable = moduleDialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), select, input:not(:disabled)')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === moduleDialogRef.current)) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === moduleDialogRef.current)) {
        event.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selected])

  useEffect(() => {
    const nextPhase: Record<string, string> = { 'count-3': 'count-2', 'count-2': 'count-1', 'count-1': 'ignition', ignition: 'liftoff', liftoff: 'separation', separation: rocketWillOrbit ? 'orbit' : 'crash' }
    if (!(rocketPhase in nextPhase)) return
    const timeout = window.setTimeout(() => {
      const next = nextPhase[rocketPhase]
      setRocketPhase(next)
      if (next === 'orbit') {
        setRocketResult('Payload deployed. Your design reached its target orbit.')
        complete('rocket')
      }
      if (next === 'crash') setRocketResult('The vehicle could not reach orbit. Adjust the design and try again.')
    }, rocketPhase.startsWith('count') ? 650 : 850)
    return () => window.clearTimeout(timeout)
  }, [rocketPhase, rocketWillOrbit])

  useEffect(() => {
    if (!selected || selected.id !== 'quiz' || tab !== 'quiz' || !quizStarted || quizDone || quizMode !== 'Time attack') return
    const interval = window.setInterval(() => {
      setQuizTimeLeft((timeLeft) => {
        if (timeLeft <= 1) {
          setQuizDone(true)
          return 0
        }
        return timeLeft - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [selected, tab, quizStarted, quizDone, quizMode])

  useEffect(() => () => {
    if (volcanoTimeoutRef.current !== null) {
      window.clearTimeout(volcanoTimeoutRef.current)
    }
  }, [])

  function complete(id: LabId) {
    setProgress((current) => {
      if (current.completed.includes(id)) return current
      const badge = modules.find((item) => item.id === id)?.badge ?? 'Lab Rookie'
      return { xp: current.xp + 80, coins: current.coins + 25, completed: [...current.completed, id], badges: [...current.badges, badge] }
    })
  }

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function openModule(module: ModuleInfo, opener?: HTMLElement) {
    openerRef.current = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    setSelected(module)
    setTab(module.id === 'quiz' ? 'quiz' : module.id === 'achievements' ? 'learn' : 'lab')
    setErupting(false)
    if (volcanoTimeoutRef.current !== null) {
      window.clearTimeout(volcanoTimeoutRef.current)
      volcanoTimeoutRef.current = null
    }
    setParts([])
    setBlueprint([])
    setCreature('')
    setRocketPhase('idle')
    setRocketResult('')
    setQuizIndex(0)
    setQuizChoice(null)
    setQuizScore(0)
    setQuizDone(false)
    setQuizStarted(module.id !== 'quiz')
    setQuizTimeLeft(45)
    setSurvivalLives(3)
    setCircuitMode('Series')
    setChallengeGoal(false)
  }

  function playTone(frequency = 520) {
    if (!soundOn || !window.AudioContext) return
    const context = new window.AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.09, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.24)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.24)
    oscillator.onended = () => { void context.close() }
  }

  function runQuizAnswer(choice: number) {
    if (!selected || quizChoice !== null) return
    const question = questionsFor(selected.id, quizCategory, quizMode)[quizIndex]
    setQuizChoice(choice)
    if (choice === question.correct) setQuizScore((score) => score + 1)
    else if (quizMode === 'Survival') {
      setSurvivalLives((lives) => {
        if (lives <= 1) window.setTimeout(() => setQuizDone(true), 900)
        return Math.max(0, lives - 1)
      })
    }
    playTone(choice === question.correct ? 720 : 220)
  }

  function nextQuizQuestion() {
    if (!selected) return
    const activeQuestions = questionsFor(selected.id, quizCategory, quizMode)
    const finalQuestion = quizIndex + 1 === activeQuestions.length
    if (!finalQuestion) {
      setQuizIndex((index) => index + 1)
      setQuizChoice(null)
      return
    }
    setQuizDone(true)
    if (quizScore >= 2) complete(selected.id)
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    window.speechSynthesis.speak(utterance)
  }

  const selectedFacts = selected ? facts[selected.id] : facts.quiz
  const questions = selected ? questionsFor(selected.id, quizCategory, quizMode) : questionBank.quiz
  const currentQuestion = questions[quizIndex]
  const hasBattery = parts.includes('Battery')
  const hasWire = parts.includes('Wire')
  const hasBulb = parts.includes('Bulb') || parts.includes('LED')
  const hasResistor = parts.includes('Resistor')
  const hasSwitch = parts.includes('Switch')
  const shortCircuit = hasBattery && hasWire && !hasBulb && !hasResistor
  const circuitReady = hasBattery && hasWire && hasBulb && (!hasSwitch || switchOn)

  function addPart(part: string, target: 'circuit' | 'blueprint') {
    if (target === 'circuit') setParts((current) => {
      const maximum = part === 'Bulb' || part === 'LED' ? 2 : part === 'Wire' ? 3 : 1
      return current.filter((item) => item === part).length >= maximum ? current : [...current, part]
    })
    else setBlueprint((current) => current.includes(part) ? current : [...current, part])
    setDraggedPart('')
  }

  function launchRocket() {
    const score = settings.engine + settings.fuel * 0.45 + settings.boosters * 12 - (settings.boosters > 2 ? 15 : 0)
    setRocketWillOrbit(score >= 103 && (!challengeGoal || settings.fuel <= 70))
    setRocketResult('')
    setRocketPhase('count-3')
    playTone(170)
  }

  function triggerVolcanoEruption() {
    if (erupting) return

    const eruptionScore = settings.pressure * 1.1 + settings.gas * 1.25 + settings.temperature * 0.35 + (settings.crater === 'Caldera' ? 18 : settings.crater === 'Broad' ? 8 : 0)
    const modeDuration = settings.eruption === 'Mega eruption' ? 5200 : settings.eruption === 'Explosive eruption' ? 4200 : 3000

    setErupting(true)
    complete('volcano')
    playTone(eruptionScore > 200 ? 120 : settings.gas > 70 ? 150 : 260)

    if (volcanoTimeoutRef.current !== null) {
      window.clearTimeout(volcanoTimeoutRef.current)
    }

    volcanoTimeoutRef.current = window.setTimeout(() => {
      setErupting(false)
      volcanoTimeoutRef.current = null
    }, modeDuration)
  }

  function renderLab() {
    if (!selected) return null
    if (selected.id === 'volcano') {
      const eruptionLevel = settings.gas > 72 ? 'eruption-mega' : settings.gas > 48 ? 'eruption-explosive' : 'eruption-gentle'
      return <>
        <div className={`volcano-world ${erupting ? 'is-erupting' : ''} ${eruptionLevel}`} aria-label="Interactive volcano cross-section simulation">
          <div className="world-sky"><span className="ash ash-one" /><span className="ash ash-two" /><span className="ash ash-three" /><span className="smoke-cloud smoke-one" /><span className="smoke-cloud smoke-two" /></div>
          <div className="island-base"><div className="volcano-cone"><span className="lava-river river-one" /><span className="lava-river river-two" /><span className="crater-lava" /><span className="volcano-vent" /></div><span className="island-water" /><span className="magma-core" /></div>
          <div className="scene-caption"><b>{erupting ? settings.eruption.toUpperCase() : 'TECTONIC FIELD / 03'}</b><span>{erupting ? 'MODEL RUNNING' : 'MAGMA CHAMBER READY'}</span></div>
        </div>
        <div className="lab-controls-grid">
          <Slider label="Lava pressure" value={settings.pressure} onChange={(value) => updateSetting('pressure', value)} />
          <Slider label="Gas build-up" value={settings.gas} onChange={(value) => updateSetting('gas', value)} />
          <Slider label="Magma temperature" value={settings.temperature} onChange={(value) => updateSetting('temperature', value)} />
          <label className="lab-select"><span>Crater size</span><select value={settings.crater} onChange={(event) => updateSetting('crater', event.target.value)}><option>Narrow</option><option>Broad</option><option>Caldera</option></select></label>
        </div>
        <div className="mode-line"><span>ERUPTION MODE</span><div className="segmented-control">{['Gentle flow', 'Explosive eruption', 'Mega eruption'].map((mode) => <button key={mode} className={settings.eruption === mode ? 'selected' : ''} onClick={() => updateSetting('eruption', mode)}>{mode}</button>)}</div></div>
        <div className="lab-actions"><button className="lab-primary" onClick={triggerVolcanoEruption}><Play size={15} fill="currentColor" /> {erupting ? 'Eruption running' : 'Run eruption model'}</button><button className={`sound-toggle ${soundOn ? 'sound-active' : ''}`} onClick={() => setSoundOn((value) => !value)}>{soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />} Sound {soundOn ? 'on' : 'off'}</button></div>
        <p className="model-note"><ShieldCheck size={14} /> Simplified educational model. Real eruptions depend on many interacting conditions.</p>
      </>
    }
    if (selected.id === 'electricity') {
      return <>
          <div className={`circuit-board ${circuitReady ? 'circuit-powered' : ''} ${shortCircuit ? 'circuit-warning' : ''}`} style={{ '--bulb-brightness': circuitReady ? `${0.3 + settings.voltage / 75}` : '0.3' } as React.CSSProperties} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (draggedPart) addPart(draggedPart, 'circuit') }}>
          <div className="circuit-rail"><span className="terminal terminal-positive">+</span><span className="terminal terminal-negative">−</span><span className="circuit-wire wire-top" /><span className="circuit-wire wire-bottom" /><span className="circuit-wire wire-left" /><span className="circuit-wire wire-right" />
            {parts.map((part, index) => <span key={`${part}-${index}`} className={`circuit-component component-${part.toLowerCase()}`} style={{ '--part-index': index, '--load-offset': `${(index - (parts.length - 1) / 2) * 32}px` } as React.CSSProperties}>{part === 'Battery' ? <BatteryCharging size={22} /> : part === 'Bulb' || part === 'LED' ? <Lightbulb size={22} /> : part === 'Motor' || part === 'Fan' ? <Wind size={22} /> : part === 'Switch' ? <Zap size={20} /> : <Activity size={20} />}{part === 'Switch' && <button className={`switch-toggle ${switchOn ? 'switch-on' : ''}`} onClick={(event) => { event.stopPropagation(); setSwitchOn((value) => !value) }} aria-label="Toggle circuit switch">{switchOn ? 'ON' : 'OFF'}</button>}</span>)}
          </div>
          <span className="board-message">{shortCircuit ? 'SHORT-CIRCUIT RISK · ADD A LOAD OR RESISTOR' : circuitReady ? `${circuitMode.toUpperCase()} CIRCUIT CLOSED · CURRENT FLOWS` : 'DROP COMPONENTS HERE OR PICK FROM THE TRAY'}</span>
          {circuitReady && <span className="bulb-glow" />}
        </div>
        <div className="component-tray"><span className="tray-label">PARTS TRAY <small>DRAG OR TAP TO ADD</small></span><div>{circuitParts.map((part) => <button key={part} draggable onDragStart={() => setDraggedPart(part)} onClick={() => addPart(part, 'circuit')} className={parts.includes(part) ? 'part-used' : ''}>{part === 'Battery' ? <BatteryCharging size={16} /> : part === 'Bulb' || part === 'LED' ? <Lightbulb size={16} /> : part === 'Fan' || part === 'Motor' ? <Wind size={16} /> : <Zap size={15} />}{part}</button>)}</div></div>
        <div className="lab-actions"><button className="lab-primary" onClick={() => { if (circuitReady) complete('electricity'); playTone(circuitReady ? 620 : 180) }}><Zap size={15} /> Test circuit</button><button className="sound-toggle" onClick={() => { setParts([]); setSwitchOn(true) }}><X size={15} /> Clear board</button></div>
        <p className="model-note"><ShieldCheck size={14} /> A real circuit needs a complete path. Avoid connecting a battery directly across itself.</p>
      </>
    }
    if (selected.id === 'gravity') {
      return <>
        <div className="gravity-world" key={dropped}>
          <div className="gravity-star"><span /></div><div className="gravity-orbit orbit-inner" /><div className="gravity-orbit orbit-outer" />
          <div className="gravity-planet" style={{ '--planet-size': `${50 + settings.mass * 0.55}px` } as React.CSSProperties}><span /></div>
          <span className={`gravity-object ${dropped ? 'object-dropped' : ''}`}><Atom size={17} /></span>
          <div className="scene-caption"><b>PLANET GRAVITY / {settings.gravity}%</b><span>OBJECT MASS / {settings.mass}%</span></div>
        </div>
        <div className="lab-controls-grid"><Slider label="Battery voltage" value={settings.voltage} onChange={(value) => updateSetting('voltage', value)} /><label className="lab-select"><span>Wiring mode</span><select value={circuitMode} onChange={(event) => setCircuitMode(event.target.value)}><option>Series</option><option>Parallel</option></select></label></div>
        <div className="lab-controls-grid"><Slider label="Planet gravity" value={settings.gravity} onChange={(value) => updateSetting('gravity', value)} /><Slider label="Object mass" value={settings.mass} onChange={(value) => updateSetting('mass', value)} /></div>
        <p className="gravity-readout"><Orbit size={15} /> At this setting, the model’s surface pull is {Math.round(settings.gravity * 0.16)} m/s². Earth is about 9.8 m/s².</p>
        <div className="lab-actions"><button className="lab-primary" onClick={() => { setDropped((value) => value + 1); complete('gravity'); playTone(330) }}><Play size={15} fill="currentColor" /> Drop an object</button><button className="sound-toggle" onClick={() => updateSetting('gravity', 62)}>Reset to Earth</button></div>
        <p className="model-note"><ShieldCheck size={14} /> Gravity depends on mass and distance. This simple model changes the planet’s surface pull.</p>
      </>
    }
    if (selected.id === 'rocket') {
      const launched = !['idle', 'orbit', 'crash'].includes(rocketPhase)
      return <>
        <div className={`rocket-hangar rocket-${rocketPhase}`}>
          <div className="hangar-grid" /><span className="launch-light light-a" /><span className="launch-light light-b" />
          <div className="rocket-model"><span className="rocket-nose" /><span className="rocket-body"><i /><i /><i /></span><span className="rocket-engine" /><span className="rocket-fin fin-left" /><span className="rocket-fin fin-right" /><span className="rocket-flame" /></div>
          <div className="rocket-smoke smoke-left" /><div className="rocket-smoke smoke-right" />
          <div className="launch-countdown">{rocketPhase === 'idle' ? 'PAD / READY' : rocketPhase === 'orbit' ? 'ORBIT ACHIEVED' : rocketPhase === 'crash' ? 'MISSION ENDED' : rocketPhase.startsWith('count') ? rocketPhase.slice(-1) : rocketPhase.toUpperCase()}</div>
          <div className="scene-caption"><b>LAUNCH PAD / 07</b><span>{rocketResult || 'PAYLOAD / SATELLITE'}</span></div>
        </div>
        <div className="lab-controls-grid"><Slider label="Fuel tank" value={settings.fuel} onChange={(value) => updateSetting('fuel', value)} /><Slider label="Engine power" value={settings.engine} onChange={(value) => updateSetting('engine', value)} /><label className="lab-select"><span>Boosters</span><select value={settings.boosters} onChange={(event) => updateSetting('boosters', Number(event.target.value))}><option value={0}>None</option><option value={1}>1 booster</option><option value={2}>2 boosters</option><option value={3}>3 boosters</option></select></label><label className="lab-select"><span>Fin shape</span><select value={settings.fin} onChange={(event) => updateSetting('fin', event.target.value)}><option>Delta</option><option>Swept</option><option>Stubby</option></select></label></div>
        <div className="lab-actions"><button className="lab-primary" disabled={launched} onClick={launchRocket}><Rocket size={16} /> {launched ? 'Mission in progress' : 'Begin countdown'}</button><span className={`mission-result ${rocketPhase === 'orbit' ? 'mission-success' : ''}`}>{rocketResult}</span></div>
        <p className="model-note"><ShieldCheck size={14} /> This launch model is simplified. Real missions require careful engineering and testing.</p>
      </>
    }
    if (selected.id === 'dna') {
      const traitOptions: Record<keyof typeof traits, string[]> = { eyes: ['Amber', 'Blue', 'Violet', 'Silver'], wings: ['Glider wings', 'Feathered wings', 'No wings'], height: ['Tiny', 'Tall', 'Towering'], glow: ['Soft green', 'Blue', 'No glow'] }
      return <>
        <div className="dna-studio"><div className="dna-helix" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><i /><i /><i /><i /></div><div className={`creature-card ${creature ? 'creature-created' : ''}`}><span className="creature-orbit" /><span className="creature-eyes">◉　◉</span><span className="creature-wings">{traits.wings === 'No wings' ? '◇' : '⌁　⌁'}</span><b>{creature || 'TRAIT STUDIO'}</b><small>{creature ? `${traits.eyes} eyes · ${traits.height} · ${traits.glow} glow` : 'MIX IMAGINARY TRAITS'}</small></div></div>
        <div className="trait-controls">{(Object.keys(traits) as (keyof typeof traits)[]).map((trait) => <label className="lab-select" key={trait}><span>{trait === 'glow' ? 'Glow ability' : trait === 'eyes' ? 'Eye colour' : trait}</span><select value={traits[trait]} onChange={(event) => setTraits((current) => ({ ...current, [trait]: event.target.value }))}>{traitOptions[trait].map((option) => <option key={option}>{option}</option>)}</select></label>)}</div>
        <div className="lab-actions"><button className="lab-primary" onClick={() => { setCreature(`${traits.eyes} ${traits.wings === 'No wings' ? 'wanderer' : 'glider'}`); complete('dna'); playTone(560) }}><Sparkles size={15} /> Generate imaginary species</button></div>
        <p className="model-note"><ShieldCheck size={14} /> This is a fantasy trait mixer, not a genetics predictor. Real traits are often complex and shaped by many factors.</p>
      </>
    }
    if (selected.id === 'quiz') {
      return <>
        <div className="quiz-arena-banner"><div><span>YOUR FIELD SCORE</span><b>{progress.xp} XP</b></div><div><span>MODE</span><b>{quizMode.toUpperCase()}</b></div><Sparkles size={24} /></div>
        <span className="tray-label">CHOOSE YOUR CATEGORY</span><div className="quiz-categories">{['Volcanoes', 'Electricity', 'Gravity', 'Rockets', 'DNA', 'Mixed science'].map((category) => <button className={quizCategory === category ? 'selected' : ''} key={category} onClick={() => { setQuizCategory(category); setQuizIndex(0); setQuizChoice(null); setQuizDone(false) }}>{category}</button>)}</div>
        <span className="tray-label mode-label">PICK A MODE</span><div className="quiz-modes">{['Solo challenge', 'Time attack', 'Survival', 'Boss battle'].map((mode) => <button className={quizMode === mode ? 'selected' : ''} key={mode} onClick={() => setQuizMode(mode)}>{mode}</button>)}</div>
        <button className="lab-primary quiz-start" onClick={() => { setTab('quiz'); setQuizIndex(0); setQuizChoice(null); setQuizScore(0); setQuizDone(false); setQuizStarted(true); setQuizTimeLeft(45); setSurvivalLives(3) }}><Play size={15} fill="currentColor" /> Start {quizCategory} quiz</button>
                      {tab === 'quiz' && (selected.id === 'quiz' && !quizStarted ? <div className="quiz-info-start">{renderLab()}</div> : quizDone ? <div className="quiz-finish"><Trophy size={37} /><span>ROUND COMPLETE</span><h3>{quizScore} / {questions.length} correct</h3><p>{quizScore >= 2 ? 'Strong scientific thinking. Your field record has been updated.' : 'Good questions take practice. Read the explanations and give it another go.'}</p><button className="lab-primary" onClick={() => { setQuizIndex(0); setQuizChoice(null); setQuizScore(0); setQuizDone(false); setQuizStarted(true); setQuizTimeLeft(45); setSurvivalLives(3) }}>Play another round<ArrowRight size={15} /></button></div> : <div className="quiz-question-view"><div className="quiz-question-top"><span>QUESTION 0{quizIndex + 1}</span><span>{quizCategory.toUpperCase()} · {quizMode.toUpperCase()}{quizMode === 'Time attack' ? ` · ${quizTimeLeft} SEC` : quizMode === 'Survival' ? ` · ${survivalLives} LIVES` : ''}</span></div><div className="quiz-progress-track"><i style={{ width: `${(quizIndex / questions.length) * 100}%` }} /></div><h3>{currentQuestion.prompt}</h3><div className="quiz-answer-list">{currentQuestion.answers.map((answer, answerIndex) => <button key={answer} disabled={quizChoice !== null} className={`${quizChoice === answerIndex ? 'answer-picked' : ''} ${quizChoice !== null && answerIndex === currentQuestion.correct ? 'answer-correct' : ''}`} onClick={() => runQuizAnswer(answerIndex)}><b>{String.fromCharCode(65 + answerIndex)}</b>{answer}{quizChoice === answerIndex && <Check size={16} />}</button>)}</div>{quizChoice !== null && <div className="quiz-explanation"><Check size={15} />{currentQuestion.explanation}</div>}{quizChoice !== null && <button className="lab-primary quiz-next" onClick={nextQuizQuestion}>{quizIndex + 1 === questions.length ? 'See my result' : 'Next question'}<ArrowRight size={15} /></button>}</div>)}
        <p className="model-note"><ShieldCheck size={14} /> No timer unless you choose Time attack. Good questions matter more than speed.</p>
      </>
    }
    if (selected.id === 'achievements') {
      return <>
        <div className="achievement-summary"><div><span>EXPERIENCE</span><b>{progress.xp} <small>XP</small></b></div><div><span>FIELD TOKENS</span><b>{progress.coins} <small>COINS</small></b></div><div><span>LABS EXPLORED</span><b>{progress.completed.length}<small> / 5</small></b></div></div>
        <div className="achievement-grid">{modules.slice(0, 5).map((module) => { const Icon = module.icon; const unlocked = progress.badges.includes(module.badge); return <div className={`achievement-badge ${unlocked ? 'badge-unlocked' : ''}`} key={module.id}><span><Icon size={20} /></span><b>{module.badge}</b><small>{unlocked ? 'UNLOCKED' : 'LOCKED · TRY THE LAB'}</small></div> })}</div>
        <div className="achievement-bottom"><p>{progress.completed.length ? 'Every experiment adds a new page to your field record.' : 'Your field record starts with your first experiment.'}</p><button className="sound-toggle" onClick={() => window.print()}><Printer size={15} /> Print certificate</button></div>
      </>
    }
    return <>
      <div className="workshop-stage" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (draggedPart) addPart(draggedPart, 'blueprint') }}>
        <div className="blueprint-grid" />
        <div className="blueprint-orbit" /><div className="blueprint-core"><Rocket size={31} /></div>
        {blueprint.map((part, index) => <span className={`blueprint-part blueprint-part-${index % 4}`} key={part}>{part}</span>)}
        <span className="workshop-label">PROTOTYPE BAY / DROP PARTS TO BUILD</span>
      </div>
      <div className="component-tray"><span className="tray-label">DESIGN PARTS <small>DRAG OR TAP TO ADD</small></span><div>{workshopParts.map((part) => <button key={part} draggable onDragStart={() => setDraggedPart(part)} onClick={() => addPart(part, 'blueprint')} className={blueprint.includes(part) ? 'part-used' : ''}><Wrench size={15} />{part}</button>)}</div></div>
      <label className="lab-select inventor-goal"><span>Mission objective</span><select><option>Map an icy moon</option><option>Deliver a satellite</option><option>Study a distant planet</option></select></label>
      <div className="lab-actions"><button className="lab-primary" disabled={blueprint.length < 3} onClick={() => { complete('workshop'); playTone(660) }}><Check size={15} /> Test prototype {blueprint.length < 3 ? `(${blueprint.length}/3 parts)` : ''}</button><button className="sound-toggle" onClick={() => setBlueprint([])}><X size={15} /> Start over</button></div>
    </>
  }

  return (
    <>
      <section className="science-dashboard" id="modules" aria-labelledby="modules-heading">
        <div className="dashboard-heading"><div><div className="section-kicker"><span>03</span> YOUR SCIENCE STATION</div><h2 id="modules-heading">Choose a lab. <span>Make a discovery.</span></h2><p>Build, test, tweak, and learn. Every result is a new question.</p></div><div className="dashboard-progress"><span className="progress-number">{progress.xp.toString().padStart(3, '0')}</span><span>FIELD XP</span><div><i style={{ width: `${Math.min(progress.xp % 400 / 4, 100)}%` }} /></div><small>{progress.completed.length} LABS EXPLORED</small></div></div>
        <div className="module-grid">
          {modules.map((module, moduleIndex) => {
            const Icon = module.icon
            const done = progress.completed.includes(module.id)
            return <button className={`module-card module-${module.accent} ${done ? 'module-complete' : ''}`} key={module.id} onClick={() => openModule(module)}>
              <span className="module-card-top"><span className="module-index">LAB / 0{moduleIndex + 1}</span><span className="module-open"><ArrowRight size={15} /></span></span>
              <span className="module-art"><span className="module-art-orbit" /><span className="module-art-core"><Icon size={24} strokeWidth={1.6} /></span><span className="module-art-line" /></span>
              <span className="module-card-copy"><span className="module-label">{module.label}</span><b>{module.title}</b><small>{module.description}</small></span>
              <span className="module-card-bottom"><span>{done ? <><Check size={12} /> FIELD LOGGED</> : <><Sparkles size={12} /> OPEN LAB</>}</span><span>{done ? module.badge : 'EXPLORE'} <ChevronRight size={13} /></span></span>
            </button>
          })}
        </div>
        <div className="daily-mission"><span className="daily-mark"><Zap size={18} /></span><div><span>DAILY SCIENCE CHALLENGE / 01</span><b>Build a rocket that reaches orbit using low fuel.</b></div><button onClick={() => openModule(modules[3])}>Take the challenge<ArrowRight size={15} /></button></div>
      </section>

      <div className="orbit-assistant">
        {guideOpen && <div className="assistant-popover"><div className="assistant-heading"><span className="assistant-bot"><Bot size={19} /></span><span><b>ORBIT</b><small>YOUR SCIENCE SIDEKICK</small></span><button onClick={() => setGuideOpen(false)} aria-label="Close Orbit"><X size={16} /></button></div><p>{guideReply}</p><div className="assistant-prompts">{guideAnswers.map((item) => <button key={item.question} onClick={() => { setGuideReply(item.answer); speak(item.answer) }}>{item.question}<ChevronRight size={13} /></button>)}</div><button className="assistant-voice" onClick={() => speak(guideReply)}><Volume2 size={14} /> Read this answer aloud</button><small className="assistant-note">Orbit uses prepared science explanations in this demo.</small></div>}
        <button className={`assistant-launch ${guideOpen ? 'assistant-open' : ''}`} onClick={() => setGuideOpen((value) => !value)} aria-label={guideOpen ? 'Close Orbit assistant' : 'Ask Orbit, the science assistant'}><Bot size={21} /><span>{guideOpen ? 'Close Orbit' : 'Ask Orbit'}</span><i /></button>
      </div>

      {selected && (
        <div className="module-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <section className={`module-dialog module-dialog-${selected.accent}`} role="dialog" aria-modal="true" aria-labelledby="module-title" tabIndex={-1} ref={moduleDialogRef}>
            <div className="module-dialog-header"><div className="module-dialog-icon"><selected.icon size={20} /></div><div><span>{selected.label} / SIMULATION BAY</span><h2 id="module-title">{selected.title}</h2></div><button className="module-close" onClick={() => setSelected(null)} aria-label="Close lab"><X size={18} /></button></div>
            <nav className="module-tabs" aria-label={`${selected.title} views`}>
              {(['lab', 'learn', 'challenge', 'quiz'] as HubTab[]).map((hubTab) => <button className={tab === hubTab ? 'active' : ''} key={hubTab} onClick={() => setTab(hubTab)}>{hubTab === 'lab' ? 'LAB' : hubTab === 'learn' ? 'LEARN' : hubTab === 'challenge' ? 'CHALLENGE' : 'QUIZ'}{hubTab === 'lab' && selected.id !== 'achievements' ? <span className="tab-live" /> : null}</button>)}
            </nav>
            <div className="module-dialog-body">
              {tab === 'lab' && renderLab()}
              {tab === 'learn' && <div className="learn-view"><div className="learn-lead"><span>FIELD GUIDE / {selected.label}</span><p>{selectedFacts.what}</p></div><div className="lesson-grid"><article><span>01 / HOW IT WORKS</span><p>{selectedFacts.how}</p></article><article><span>02 / REAL WORLD</span><p>{selectedFacts.examples}</p></article><article><span>03 / DID YOU KNOW?</span><p>{selectedFacts.fun}</p></article><article><span>04 / TRY THIS</span><p>{selectedFacts.challenge}</p></article></div><div className="science-note"><ShieldCheck size={15} /> Models simplify real systems. Compare predictions with evidence, not just a score.</div></div>}
              {tab === 'challenge' && <div className="challenge-view"><div className="challenge-head"><span>MISSION BRIEF / 01</span><span><Timer size={13} /> NO TIMER</span></div><h3>{selectedFacts.challenge}</h3><p>Make a prediction before you run the model. Change one thing at a time and look for evidence.</p>{selected.id === 'rocket' && <div className="challenge-rule"><Rocket size={19} /><span>Design goal <b>Reach orbit while using less than 70% fuel</b></span></div>}{selected.id === 'volcano' && <div className="challenge-rule"><Flame size={19} /><span>Design goal <b>Compare pressure in two eruption modes</b></span></div>}<button className="lab-primary" onClick={() => { setTab('lab'); if (selected.id === 'rocket') { updateSetting('fuel', 42); updateSetting('engine', 78) } }}>{selected.id === 'rocket' || selected.id === 'volcano' ? 'Set up the experiment' : 'Open the lab controls'}<ArrowRight size={15} /></button><button className="challenge-complete" onClick={() => complete(selected.id)}><Check size={14} /> Mark this challenge explored</button></div>}
              {tab === 'quiz' && (selected.id === 'quiz' && !quizDone && quizIndex === 0 && quizChoice === null ? <div className="quiz-info-start">{renderLab()}<button className="tab-quiz-link" onClick={() => { setQuizMode('Solo challenge'); setTab('quiz'); setQuizIndex(0); setQuizChoice(null); setQuizDone(false) }}>Jump into a mixed science round<ArrowRight size={15} /></button></div> : quizDone ? <div className="quiz-finish"><Trophy size={37} /><span>ROUND COMPLETE</span><h3>{quizScore} / {questions.length} correct</h3><p>{quizScore >= 2 ? 'Strong scientific thinking. Your field record has been updated.' : 'Good questions take practice. Read the explanations and give it another go.'}</p><button className="lab-primary" onClick={() => { setQuizIndex(0); setQuizChoice(null); setQuizScore(0); setQuizDone(false) }}>Play another round<ArrowRight size={15} /></button></div> : <div className="quiz-question-view"><div className="quiz-question-top"><span>QUESTION 0{quizIndex + 1}</span><span>{quizCategory.toUpperCase()} · {quizMode.toUpperCase()}</span></div><div className="quiz-progress-track"><i style={{ width: `${(quizIndex / questions.length) * 100}%` }} /></div><h3>{currentQuestion.prompt}</h3><div className="quiz-answer-list">{currentQuestion.answers.map((answer, answerIndex) => <button key={answer} disabled={quizChoice !== null} className={`${quizChoice === answerIndex ? 'answer-picked' : ''} ${quizChoice !== null && answerIndex === currentQuestion.correct ? 'answer-correct' : ''}`} onClick={() => runQuizAnswer(answerIndex)}><b>{String.fromCharCode(65 + answerIndex)}</b>{answer}{quizChoice === answerIndex && <Check size={16} />}</button>)}</div>{quizChoice !== null && <div className="quiz-explanation"><Check size={15} />{currentQuestion.explanation}</div>}{quizChoice !== null && <button className="lab-primary quiz-next" onClick={nextQuizQuestion}>{quizIndex + 1 === questions.length ? 'See my result' : 'Next question'}<ArrowRight size={15} /></button>}</div>)}
            </div>
            <footer className="module-dialog-footer"><span><ShieldCheck size={13} /> SAFE SIMULATION · PROGRESS SAVES ON THIS DEVICE</span><span>{progress.xp} XP <i /> {progress.badges.length} BADGES</span></footer>
          </section>
        </div>
      )}
    </>
  )
}