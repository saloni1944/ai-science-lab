import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type ElectronOrbit = {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  radiusX: number
  radiusY: number
  speed: number
  phase: number
}

export function AtomScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = mountRef.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      host.dataset.webgl = 'unavailable'
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 60)
    camera.position.set(0, 0, 8.8)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x8feeff, 1.7))
    const cyanLight = new THREE.PointLight(0x28dfff, 36, 15)
    cyanLight.position.set(2.5, 2.2, 3.4)
    scene.add(cyanLight)
    const warmLight = new THREE.PointLight(0xff6b59, 15, 9)
    warmLight.position.set(-2.4, -1.5, 2)
    scene.add(warmLight)

    const atom = new THREE.Group()
    atom.position.set(0.84, 0.03, 0)
    scene.add(atom)
    const nucleus = new THREE.Group()
    atom.add(nucleus)
    const protonMaterial = new THREE.MeshStandardMaterial({ color: 0xff856e, emissive: 0xa92e2b, emissiveIntensity: 0.58, roughness: 0.28, metalness: 0.13 })
    const neutronMaterial = new THREE.MeshStandardMaterial({ color: 0x70d7df, emissive: 0x126c82, emissiveIntensity: 0.38, roughness: 0.3, metalness: 0.18 })
    const corePositions: [number, number, number][] = [
      [0, 0, 0], [0.28, 0.12, 0.06], [-0.23, 0.18, 0.05], [0.12, -0.27, 0.1],
      [-0.2, -0.21, -0.11], [0.08, 0.06, -0.27], [0.31, -0.1, -0.12], [-0.06, 0.3, -0.14], [-0.32, 0.01, 0.16],
    ]
    corePositions.forEach((position, index) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(index === 0 ? 0.31 : 0.23, 28, 28), index % 2 === 0 ? protonMaterial : neutronMaterial)
      mesh.position.set(...position)
      nucleus.add(mesh)
    })

    const orbitDefinitions = [
      { radiusX: 2.45, radiusY: 1.13, rotation: [0.64, 0.05, -0.12], speed: 0.68, phase: 0.4 },
      { radiusX: 2.55, radiusY: 1.18, rotation: [-0.82, 0.32, 0.65], speed: -0.49, phase: 2.1 },
      { radiusX: 2.3, radiusY: 1.24, rotation: [0.17, 1.02, 1.14], speed: 0.57, phase: 4.35 },
    ] as const
    const electronMaterial = new THREE.MeshStandardMaterial({ color: 0xc9ffff, emissive: 0x0adfff, emissiveIntensity: 4.2, roughness: 0.14, metalness: 0.05 })
    const electrons: ElectronOrbit[] = orbitDefinitions.map((definition) => {
      const plane = new THREE.Group()
      plane.rotation.set(definition.rotation[0], definition.rotation[1], definition.rotation[2])
      atom.add(plane)
      const ellipse = new THREE.EllipseCurve(0, 0, definition.radiusX, definition.radiusY, 0, Math.PI * 2, false, 0)
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ellipse.getPoints(180).map((point) => new THREE.Vector3(point.x, point.y, 0))),
        new THREE.LineBasicMaterial({ color: 0x38dff3, transparent: true, opacity: 0.42 }),
      )
      plane.add(orbitLine)
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 20), electronMaterial)
      plane.add(electron)
      return { mesh: electron, radiusX: definition.radiusX, radiusY: definition.radiusY, speed: definition.speed, phase: definition.phase }
    })

    const particleCount = 420
    const particlePositions = new Float32Array(particleCount * 3)
    for (let index = 0; index < particleCount; index += 1) {
      const angle = index * 2.39996
      const radius = 3.5 + ((index * 17) % 95) / 10
      particlePositions[index * 3] = Math.cos(angle) * radius
      particlePositions[index * 3 + 1] = Math.sin(angle) * radius * 0.58
      particlePositions[index * 3 + 2] = -2.4 + ((index * 29) % 62) / 10
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x72eaff, size: 0.022, transparent: true, opacity: 0.57, sizeAttenuation: true })))

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, y: 0 }
    const startTime = performance.now()
    let frameId = 0
    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.position.x = width < 680 ? 0.18 : 0
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const onPointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    }
    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      const time = (performance.now() - startTime) / 1000
      if (!reducedMotion) {
        atom.rotation.y = time * 0.11 + pointer.x * 0.08
        atom.rotation.x = Math.sin(time * 0.17) * 0.045 + pointer.y * 0.035
        nucleus.rotation.y = time * 0.08
        electrons.forEach(({ mesh, radiusX, radiusY, speed, phase }) => {
          const angle = time * speed + phase
          mesh.position.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0)
        })
      } else {
        electrons.forEach(({ mesh, radiusX, radiusY, phase }) => mesh.position.set(Math.cos(phase) * radiusX, Math.sin(phase) * radiusY, 0))
      }
      renderer.render(scene, camera)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    host.addEventListener('pointermove', onPointerMove, { passive: true })
    frameId = window.requestAnimationFrame(animate)
    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="atom-scene" ref={mountRef} aria-hidden="true"><div className="atom-fallback"><span className="fallback-orbit fallback-orbit-one" /><span className="fallback-orbit fallback-orbit-two" /><span className="fallback-core" /></div></div>
}