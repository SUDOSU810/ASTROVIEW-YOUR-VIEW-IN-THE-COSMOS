import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { SatelliteInfo, SatelliteType } from '../services/satelliteApi'
import { getSatelliteColor } from '../services/satelliteApi'
import './SatelliteGlobe.css'

interface Props {
  satellites: SatelliteInfo[]
  loading: boolean
  error: string | null
  selectedSatellite: SatelliteInfo | null
  onSelectSatellite: (sat: SatelliteInfo | null) => void
}

// ── Constants ──
const EARTH_RADIUS = 5
const SCALE_FACTOR = EARTH_RADIUS / 6371 // km to scene units
const TRAIL_LENGTH = 180

// Create a canvas texture from the 🛰️ emoji
function createEmojiTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.font = `${size * 0.75}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🛰️', size / 2, size / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Convert lat/lng/alt to 3D position
function latLngToVector3(
  lat: number,
  lng: number,
  alt: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const r = EARTH_RADIUS + alt * SCALE_FACTOR
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

export default function SatelliteGlobe({
  satellites,
  loading,
  error,
  selectedSatellite,
  onSelectSatellite,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const earthRef = useRef<THREE.Mesh | null>(null)
  const satSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map())
  const trailsRef = useRef<Map<string, THREE.Line>>(new Map())
  const trailPointsRef = useRef<Map<string, THREE.Vector3[]>>(new Map())
  const frameRef = useRef<number>(0)
  const raycasterRef = useRef(new THREE.Raycaster())
  const emojiTextureRef = useRef<THREE.Texture | null>(null)
  const mouseRef = useRef(new THREE.Vector2())
  const [hovered, setHovered] = useState<string | null>(null)

  // ── Create Scene ──
  const initScene = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 3, 14)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 7
    controls.maxDistance = 30
    controls.enablePan = false
    controls.rotateSpeed = 0.5
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3
    controlsRef.current = controls

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0)
    sunLight.position.set(10, 5, 10)
    scene.add(sunLight)

    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.4)
    rimLight.position.set(-5, 3, -5)
    scene.add(rimLight)

    // ── Earth ──
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64)

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader()
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x2233aa,
      emissive: 0x112244,
      emissiveIntensity: 0.15,
      shininess: 25,
    })

    textureLoader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
      (texture) => {
        earthMat.map = texture
        earthMat.color.set(0xffffff)
        earthMat.emissive.set(0x000000)
        earthMat.needsUpdate = true
      },
      undefined,
      () => {
        // Fallback: try alternative texture source
        textureLoader.load(
          'https://unpkg.com/three-globe@2.31.1/example/img/earth-day.jpg',
          (texture) => {
            earthMat.map = texture
            earthMat.color.set(0xffffff)
            earthMat.emissive.set(0x000000)
            earthMat.needsUpdate = true
          }
        )
      }
    )

    const earth = new THREE.Mesh(earthGeo, earthMat)
    scene.add(earth)
    earthRef.current = earth

    // ── Atmosphere Glow ──
    const atmosphereGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 64, 64)
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    })
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat)
    atmosphere.scale.set(1.2, 1.2, 1.2)
    scene.add(atmosphere)

    // ── Stars ──
    const starCount = 2000
    const starGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      const r = 80 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = r * Math.cos(phi)

      const brightness = 0.5 + Math.random() * 0.5
      starColors[i * 3] = brightness
      starColors[i * 3 + 1] = brightness
      starColors[i * 3 + 2] = brightness + Math.random() * 0.2
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })
    scene.add(new THREE.Points(starGeo, starMat))

    // ── Animation Loop ──
    function animate() {
      frameRef.current = requestAnimationFrame(animate)

      // Slow Earth rotation
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.0005
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // ── Resize Handler ──
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Mouse Handlers ──
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      // Check hover
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const satSprites = Array.from(satSpritesRef.current.values())
      const intersects = raycasterRef.current.intersectObjects(satSprites)

      if (intersects.length > 0) {
        const sprite = intersects[0].object as THREE.Sprite
        const satId = sprite.userData.noradId
        setHovered(satId)
        container.style.cursor = 'pointer'
      } else {
        setHovered(null)
        container.style.cursor = 'grab'
      }
    }

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )

      raycasterRef.current.setFromCamera(mouse, camera)
      const satSprites = Array.from(satSpritesRef.current.values())
      const intersects = raycasterRef.current.intersectObjects(satSprites)

      if (intersects.length > 0) {
        const sprite = intersects[0].object as THREE.Sprite
        const satData = sprite.userData as SatelliteInfo
        onSelectSatellite(satData)
      } else {
        onSelectSatellite(null)
      }
    }

    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('resize', onResize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('click', onClick)
      cancelAnimationFrame(frameRef.current)
      renderer.dispose()
      controls.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [onSelectSatellite])

  // ── Initialize Scene ──
  useEffect(() => {
    const cleanup = initScene()
    return cleanup
  }, [initScene])

  // ── Update Satellite Positions ──
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || satellites.length === 0) return

    satellites.forEach((sat) => {
      const pos = latLngToVector3(sat.lat, sat.lng, sat.altitude)

      // ── Satellite Emoji Sprite ──
      let sprite = satSpritesRef.current.get(sat.noradId)

      if (!sprite) {
        // Create emoji texture once and reuse
        if (!emojiTextureRef.current) {
          emojiTextureRef.current = createEmojiTexture()
        }

        const spriteMat = new THREE.SpriteMaterial({
          map: emojiTextureRef.current,
          transparent: true,
          depthWrite: false,
        })
        sprite = new THREE.Sprite(spriteMat)
        sprite.scale.set(0.35, 0.35, 1)
        sprite.userData = sat

        scene.add(sprite)
        satSpritesRef.current.set(sat.noradId, sprite)
      }

      sprite.position.copy(pos)
      sprite.userData = sat

      // Scale up if hovered or selected
      const isHovered = hovered === sat.noradId
      const isSelected = selectedSatellite?.noradId === sat.noradId
      const baseScale = 0.35
      const targetScale = isHovered || isSelected ? baseScale * 2.5 : baseScale
      const current = sprite.scale.x
      const lerped = THREE.MathUtils.lerp(current, targetScale, 0.15)
      sprite.scale.set(lerped, lerped, 1)

      // ── Orbital Trail ──
      let points = trailPointsRef.current.get(sat.noradId) || []
      points.push(pos.clone())
      if (points.length > TRAIL_LENGTH) {
        points = points.slice(-TRAIL_LENGTH)
      }
      trailPointsRef.current.set(sat.noradId, points)

      // Update or create trail line
      if (points.length >= 2) {
        let trail = trailsRef.current.get(sat.noradId)

        if (trail) {
          scene.remove(trail)
          trail.geometry.dispose()
          ;(trail.material as THREE.Material).dispose()
        }

        const color = getSatelliteColor(sat.type)
        const trailGeo = new THREE.BufferGeometry().setFromPoints(points)

        // Create fading opacity along the trail
        const alphas = new Float32Array(points.length)
        for (let i = 0; i < points.length; i++) {
          alphas[i] = (i / points.length) * 1.0
        }
        trailGeo.setAttribute(
          'alpha',
          new THREE.BufferAttribute(alphas, 1)
        )

        const trailMat = new THREE.ShaderMaterial({
          vertexShader: `
            attribute float alpha;
            varying float vAlpha;
            void main() {
              vAlpha = alpha;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            void main() {
              gl_FragColor = vec4(uColor, vAlpha);
            }
          `,
          uniforms: {
            uColor: { value: new THREE.Color(color) },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })

        trail = new THREE.Line(trailGeo, trailMat)
        scene.add(trail)
        trailsRef.current.set(sat.noradId, trail)
      }
    })
  }, [satellites, hovered, selectedSatellite])

  // ── Satellite type legend ──
  const categories: { type: SatelliteType; label: string }[] = [
    { type: 'space-station', label: 'Space Station' },
    { type: 'scientific', label: 'Scientific' },
    { type: 'communication', label: 'Communication' },
    { type: 'navigation', label: 'Navigation' },
    { type: 'weather', label: 'Weather' },
    { type: 'earth-observation', label: 'Earth Obs.' },
  ]

  return (
    <div className="satellite-globe-container">
      {loading && (
        <div className="globe-loading">
          <div className="globe-loading-spinner" />
          <span>Loading satellite data from CelesTrak...</span>
        </div>
      )}

      {error && !loading && (
        <div className="globe-data-not-found">
          <div className="globe-not-found-icon">🛰️</div>
          <h4>Satellite Data Not Found</h4>
          <p>Unable to fetch satellite tracking data at this time. The globe is still interactive — try refreshing the page.</p>
        </div>
      )}

      <div ref={containerRef} className="globe-canvas" />

      {/* Legend */}
      <div className="globe-legend">
        {categories.map((c) => (
          <div key={c.type} className="globe-legend-item">
            <span
              className="globe-legend-dot"
              style={{ background: getSatelliteColor(c.type) }}
            />
            <span>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Satellite count */}
      <div className="globe-sat-count">
        🛰️ {satellites.length} satellites tracked
      </div>

      {/* Info Panel */}
      {selectedSatellite && (
        <div className="globe-info-panel">
          <button
            className="globe-info-close"
            onClick={() => onSelectSatellite(null)}
          >
            ✕
          </button>
          <div className="globe-info-header">
            <span
              className="globe-info-dot"
              style={{
                background: getSatelliteColor(selectedSatellite.type),
              }}
            />
            <h4>{selectedSatellite.name}</h4>
          </div>
          <div className="globe-info-type">
            {selectedSatellite.type.replace('-', ' ').toUpperCase()}
          </div>
          <div className="globe-info-rows">
            <div className="globe-info-row">
              <span>NORAD ID</span>
              <strong>{selectedSatellite.noradId}</strong>
            </div>
            <div className="globe-info-row">
              <span>Altitude</span>
              <strong>{selectedSatellite.altitude.toFixed(1)} km</strong>
            </div>
            <div className="globe-info-row">
              <span>Speed</span>
              <strong>{selectedSatellite.speed.toFixed(2)} km/s</strong>
            </div>
            <div className="globe-info-row">
              <span>Latitude</span>
              <strong>{selectedSatellite.lat.toFixed(4)}°</strong>
            </div>
            <div className="globe-info-row">
              <span>Longitude</span>
              <strong>{selectedSatellite.lng.toFixed(4)}°</strong>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="globe-instructions">
        🖱️ Drag to rotate · Scroll to zoom · Click satellite for details
      </div>
    </div>
  )
}
