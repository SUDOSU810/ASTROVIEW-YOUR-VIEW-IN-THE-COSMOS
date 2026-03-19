import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import './SpaceExplorer.css'

interface ModelPreviewProps {
  modelPath: string
  onLoaded?: () => void
}

function ModelPreview({ modelPath, onLoaded }: ModelPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dir = new THREE.DirectionalLight(0xffffff, 1.2)
    dir.position.set(5, 10, 7)
    scene.add(dir)
    const rim = new THREE.DirectionalLight(0x9F7FFF, 0.5)
    rim.position.set(-5, 3, -5)
    scene.add(rim)

    // Loader
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)

    loader.load(modelPath, (gltf) => {
      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 5 / maxDim
      model.scale.setScalar(scale)
      model.position.sub(center.multiplyScalar(scale))

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.material && 'emissive' in mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xFF9FFC);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15
          }
        }
      })

      scene.add(model)
      onLoaded?.()

      // Animate
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate)
        model.rotation.y += 0.005
        renderer.render(scene, camera)
      }
      animate()
    })

    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameRef.current)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [modelPath, onLoaded])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default function SpaceExplorer() {
  const navigate = useNavigate()
  const [hubbleLoaded, setHubbleLoaded] = useState(false)
  const [rocketLoaded, setRocketLoaded] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('explorer-active')
    return () => document.documentElement.classList.remove('explorer-active')
  }, [])

  return (
    <div className="space-explorer">
      <div className="space-explorer-header">
        <h1>3D Infographic</h1>
        <p>Choose a spacecraft to explore in stunning 3D detail</p>
      </div>

      <div className="space-explorer-cards">
        {/* Hubble Card */}
        <div className="explorer-card" onClick={() => navigate('/hubble-viewer')}>
          <div className="explorer-card-canvas">
            {!hubbleLoaded && <div className="explorer-card-loading" />}
            <ModelPreview
              modelPath="/models/hubble.glb"
              onLoaded={() => setHubbleLoaded(true)}
            />
          </div>
          <div className="explorer-card-info">
            <span className="explorer-card-tag">Satellite</span>
            <h2>Hubble Space Telescope</h2>
            <p>Explore every component of humanity's window to the universe in an interactive scroll experience.</p>
          </div>
          <div className="explorer-card-arrow">→</div>
        </div>

        {/* Saturn V Card */}
        <div className="explorer-card" onClick={() => navigate('/rocket-viewer')}>
          <div className="explorer-card-canvas">
            {!rocketLoaded && <div className="explorer-card-loading" />}
            <ModelPreview
              modelPath="/models/Saturn V.glb"
              onLoaded={() => setRocketLoaded(true)}
            />
          </div>
          <div className="explorer-card-info">
            <span className="explorer-card-tag">Rocket</span>
            <h2>Saturn V Rocket</h2>
            <p>Discover the engineering marvel that carried astronauts to the Moon, section by section.</p>
          </div>
          <div className="explorer-card-arrow">→</div>
        </div>
      </div>
    </div>
  )
}
