import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './RocketViewer.css'

gsap.registerPlugin(ScrollTrigger)

// ─── Constants ──────────────────────────────────────────────────────────────
const MODEL_HEIGHT = 9
const ROCKET_X = 2.5

// ─── Sections ───────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    name: 'F-1 Engines & Base Structure', yMin: 0.00, yMax: 0.09,
    desc: 'Five Rocketdyne F-1 engines mounted in a cross pattern on the thrust structure. Together producing 7.5 million pounds of thrust.',
    tag: 'S-IC Propulsion', hasFlame: true,
    specs: { 'Thrust (total)': '33,000 kN', 'Engines': '5 × F-1', 'Fuel': 'RP-1 / LOX', 'Burn time': '150 sec' },
  },
  {
    name: 'S-IC First Stage Body', yMin: 0.09, yMax: 0.16,
    desc: "The lower body of the S-IC first stage housing the RP-1 kerosene fuel tank and structural rings.",
    tag: 'S-IC Structure', hasFlame: true,
    specs: { 'Stage height': '42 m', 'Diameter': '10.1 m', 'Dry mass': '131,000 kg', 'RP-1 mass': '648,000 kg' },
  },
  {
    name: 'S-IC LOX Tank & Intertank', yMin: 0.16, yMax: 0.26,
    desc: 'The liquid oxygen tank and intertank section. Holds 1.3 million liters of LOX at −183°C.',
    tag: 'S-IC Propellant', hasFlame: true,
    specs: { 'LOX volume': '1,311,000 L', 'LOX mass': '1,504,000 kg', 'Temperature': '−183°C', 'Pressurization': 'Helium' },
  },
  {
    name: 'S-II Second Stage', yMin: 0.26, yMax: 0.45,
    desc: 'The S-IC/S-II interstage adapter and second stage engine section. Five Rocketdyne J-2 engines burn liquid hydrogen and LOX.',
    tag: 'S-II Propulsion', hasFlame: true,
    specs: { 'J-2 thrust': '1,033 kN each', 'Burn time': '360 sec', 'Isp (vacuum)': '421 sec', 'Sep. altitude': '67 km' },
  },
  {
    name: 'S-IVB, IU & Spacecraft Adapter', yMin: 0.45, yMax: 0.80,
    desc: 'The S-IVB third stage (single restartable J-2 engine for TLI), the Instrument Unit, and the Spacecraft-LM Adapter panels.',
    tag: 'Third Stage & Avionics', hasFlame: true,
    specs: { 'TLI velocity': '10,800 m/s', 'IU computer': 'IBM LVDC', 'SLA panels': '4 segments', 'J-2 Isp': '421 sec' },
  },
  {
    name: 'Apollo Spacecraft & LES', yMin: 0.80, yMax: 1.01,
    desc: 'The complete Apollo spacecraft stack: Lunar Module, Service Module, Command Module, and the Launch Escape System tower.',
    tag: 'Crew & Payload', hasFlame: false,
    specs: { 'CM mass': '5,560 kg', 'LM mass': '15,200 kg', 'Crew': '3 astronauts', 'LES thrust': '667 kN' },
  },
]

interface SectionGroup {
  meshes: THREE.Mesh[]
  info: typeof SECTIONS[number]
  center: THREE.Vector3
}

export default function RocketViewer() {
  const navigate = useNavigate()
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const scrollSpacerRef = useRef<HTMLDivElement>(null)
  const [activeSectionIndex, setActiveSectionIndex] = useState(-1)
  const [scrollHintVisible, setScrollHintVisible] = useState(true)
  const sectionGroupsRef = useRef<SectionGroup[]>([])

  const handleBack = useCallback(() => navigate('/space-explorer'), [navigate])

  useEffect(() => {
    document.documentElement.classList.add('rocket-active')
    const container = canvasContainerRef.current
    if (!container) return

    // ═══ SCENE ═══
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050505)
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500)
    camera.position.set(0, 0, 18)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;z-index:1;pointer-events:none;'
    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomEffect = new BloomEffect({ intensity: 0.5, luminanceThreshold: 0.4, luminanceSmoothing: 0.7 })
    composer.addPass(new EffectPass(camera, bloomEffect))

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(8, 12, 10); key.castShadow = true; scene.add(key)
    const blue = new THREE.DirectionalLight(0x4488ff, 0.4)
    blue.position.set(-10, 5, -10); scene.add(blue)
    const warm = new THREE.DirectionalLight(0xff8844, 0.15)
    warm.position.set(0, -10, 5); scene.add(warm)

    // ═══ BACKGROUND ═══
    const bgScene = new THREE.Scene()
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`,
      fragmentShader: `
        uniform float iTime, uScroll; varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        void main(){
          vec2 uv=vUv; float depth=smoothstep(0.0,0.5,uScroll);
          float mg=mix(smoothstep(0.0,0.7,uv.y),1.0,depth);
          vec3 c=mix(vec3(0.03,0.06,0.12),vec3(0.02,0.02,0.025),mg);
          float sd=smoothstep(0.0,0.4,uScroll)*0.8+0.2;
          vec2 sg=floor(uv*220.0); float sv=hash(sg);
          if(sv>0.987){
            float b=smoothstep(0.8,0.0,length(uv-(sg+0.5)/220.0)*220.0);
            b*=0.5+0.5*sin(iTime*1.8+sv*40.0); c+=vec3(b*sd*mg*0.6);
          }
          c+=vec3(0.08,0.12,0.22)*(1.0-depth)*exp(-uv.y*4.0)*0.05;
          c*=clamp(1.0-dot((uv-0.5)*1.2,(uv-0.5)*1.2),0.35,1.0);
          gl_FragColor=vec4(c,1.0);
        }
      `,
      uniforms: { iTime: { value: 0 }, uScroll: { value: 0 } },
    })
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial))
    const px = Math.min(window.devicePixelRatio, 2)
    const bgRT = new THREE.WebGLRenderTarget(window.innerWidth * px, window.innerHeight * px)

    // ═══ FLAME ═══
    let flameMesh: THREE.Mesh | null = null
    function createFlame() {
      const mat = new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `
          uniform float iTime; varying vec2 vUv;
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
          float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
          void main(){
            vec2 uv=vUv; float h=uv.y; float cx=abs(uv.x-0.5)*2.0;
            float cone=h*(1.0-cx*cx*1.3);
            float n=fbm(vec2(uv.x*4.0,uv.y*6.0+iTime*5.0));
            float n2=fbm(vec2(uv.x*7.0+5.0,uv.y*9.0+iTime*7.0));
            float fire=cone*(0.5+0.5*n)*(0.6+0.4*n2); fire=smoothstep(0.05,0.7,fire);
            vec3 col=mix(vec3(1.0,0.2,0.0),vec3(1.0,0.7,0.15),fire);
            col=mix(col,vec3(1.0,1.0,0.85),smoothstep(0.6,1.0,fire)*h);
            float alpha=fire*smoothstep(0.0,0.1,h)*smoothstep(0.0,0.15,1.0-cx);
            gl_FragColor=vec4(col,alpha*0.9);
          }
        `,
        uniforms: { iTime: { value: 0 } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      })
      flameMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), mat)
      flameMesh.renderOrder = 100
      return flameMesh
    }

    // ═══ SMOKE ═══
    const MAX_SMOKE = 400
    const smokeData: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; maxLife: number; size: number }[] = []
    const smokePositions = new Float32Array(MAX_SMOKE * 3)
    const smokeSizes = new Float32Array(MAX_SMOKE)
    for (let i = 0; i < MAX_SMOKE; i++) { smokePositions[i * 3 + 1] = -500; smokeSizes[i] = 0 }
    const smokeGeo = new THREE.BufferGeometry()
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3))
    smokeGeo.setAttribute('aSize', new THREE.BufferAttribute(smokeSizes, 1))
    const smokeMat = new THREE.ShaderMaterial({
      vertexShader: `attribute float aSize; void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_PointSize=aSize*(120.0/-mv.z); gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `void main(){
        float d=length(gl_PointCoord-0.5)*2.0; float a=smoothstep(1.0,0.3,d)*0.4;
        if(a<0.01)discard; gl_FragColor=vec4(0.6,0.6,0.65,a);}`,
      transparent: true, blending: THREE.NormalBlending, depthWrite: false,
    })
    const smokePoints = new THREE.Points(smokeGeo, smokeMat)
    scene.add(smokePoints)

    function emitSmoke(pos: THREE.Vector3, count: number) {
      for (let j = 0; j < count; j++) {
        if (smokeData.length >= MAX_SMOKE) smokeData.shift()
        const angle = (j / count) * Math.PI * 2
        const speed = 1.0 + Math.sin(j * 1.3) * 0.5
        smokeData.push({
          x: pos.x + Math.cos(angle) * 0.3, y: pos.y, z: pos.z + Math.sin(angle) * 0.2,
          vx: Math.cos(angle) * speed * 0.4, vy: -speed * 0.3, vz: Math.sin(angle) * speed * 0.3,
          life: 1.5, maxLife: 1.5, size: 0.12,
        })
      }
    }

    function updateSmoke(dt: number) {
      for (let i = smokeData.length - 1; i >= 0; i--) {
        const s = smokeData[i]; s.life -= dt
        if (s.life <= 0) { smokeData.splice(i, 1); continue }
        s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt
        s.vx *= 0.97; s.vy *= 0.97; s.vz *= 0.97; s.size *= 1.003
      }
      for (let i = 0; i < MAX_SMOKE; i++) {
        if (i < smokeData.length) {
          smokePositions[i * 3] = smokeData[i].x; smokePositions[i * 3 + 1] = smokeData[i].y; smokePositions[i * 3 + 2] = smokeData[i].z
          smokeSizes[i] = smokeData[i].size * (smokeData[i].life / smokeData[i].maxLife)
        } else { smokePositions[i * 3 + 1] = -500; smokeSizes[i] = 0 }
      }
      smokeGeo.attributes.position.needsUpdate = true;
      (smokeGeo.attributes.aSize as THREE.BufferAttribute).needsUpdate = true
    }

    // ═══ LOAD MODEL ═══
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)

    let rocketModel: THREE.Object3D | null = null
    let rocketGroup: THREE.Group | null = null
    const allMeshes: THREE.Mesh[] = []
    const sectionGroups: SectionGroup[] = []
    let mouseX = 0, mouseY = 0, smoothMouseX = 0, smoothMouseY = 0

    loader.load('/models/Saturn V.glb', (gltf) => {
      rocketModel = gltf.scene
      rocketGroup = new THREE.Group()
      rocketGroup.add(rocketModel)
      scene.add(rocketGroup)

      // Normalize
      const box = new THREE.Box3().setFromObject(rocketModel)
      const size = box.getSize(new THREE.Vector3())
      const scale = MODEL_HEIGHT / Math.max(size.x, size.y, size.z)
      rocketModel.scale.setScalar(scale)
      const scaled = new THREE.Box3().setFromObject(rocketModel)
      rocketModel.position.sub(scaled.getCenter(new THREE.Vector3()))
      rocketModel.updateMatrixWorld(true)

      // Flame
      const rBox = new THREE.Box3().setFromObject(rocketModel)
      const flame = createFlame()
      flame.position.set(0, rBox.min.y - 0.5, 0)
      rocketModel.add(flame)

      // Collect meshes
      rocketModel.traverse(child => {
        if ((child as THREE.Mesh).isMesh && child !== flameMesh) {
          const mesh = child as THREE.Mesh
          if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
          mesh.material = (mesh.material as THREE.Material).clone()
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.transparent = true; mat.opacity = 1.0
          mat.emissive = new THREE.Color(0x000000); mat.emissiveIntensity = 0
          mesh.castShadow = true; mesh.receiveShadow = true
          mesh.userData.origPos = mesh.position.clone()
          mesh.userData.origRot = mesh.rotation.clone()
          allMeshes.push(mesh)
        }
      })

      // Compute normY
      const meshWorldYs = allMeshes.map(mesh => {
        const wc = new THREE.Vector3()
        mesh.geometry.boundingBox!.getCenter(wc)
        mesh.localToWorld(wc)
        return { mesh, y: wc.y }
      })
      const minY = Math.min(...meshWorldYs.map(m => m.y))
      const maxY = Math.max(...meshWorldYs.map(m => m.y))
      const rangeY = maxY - minY || 1
      const meshNormY = new Map<THREE.Mesh, number>()
      meshWorldYs.forEach(({ mesh, y }) => meshNormY.set(mesh, (y - minY) / rangeY))

      // Group meshes into sections
      SECTIONS.forEach(sec => {
        const meshes = allMeshes.filter(m => {
          const ny = meshNormY.get(m)!
          return ny >= sec.yMin && ny < sec.yMax
        })
        const gb = new THREE.Box3()
        meshes.forEach(m => gb.union(new THREE.Box3().setFromObject(m)))
        const center = meshes.length > 0
          ? gb.getCenter(new THREE.Vector3())
          : new THREE.Vector3(0, minY + (sec.yMin + sec.yMax) / 2 * rangeY, 0)
        sectionGroups.push({ meshes, info: sec, center })
      })
      sectionGroupsRef.current = sectionGroups

      // Move rocket
      rocketGroup.position.set(ROCKET_X, -14, 0)

      // ═══ BUILD TIMELINE ═══
      const total = sectionGroups.length
      const ENTRY_SCROLL = 2000
      const PER_SECTION = 1200
      const totalScroll = ENTRY_SCROLL + total * PER_SECTION

      if (scrollSpacerRef.current) {
        scrollSpacerRef.current.style.height = totalScroll + 'px'
      }

      const entryEnd = (ENTRY_SCROLL / totalScroll) * 100
      const sectionRange = 100 - entryEnd
      const perSec = sectionRange / total

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollSpacerRef.current,
          start: 'top top',
          end: `+=${totalScroll}`,
          scrub: 1.5,
          onUpdate: (self) => {
            bgMaterial.uniforms.uScroll.value = self.progress
            const pos = self.progress * 100
            if (pos < entryEnd) {
              setActiveSectionIndex(-1)
            } else {
              const idx = Math.min(Math.floor((pos - entryEnd) / perSec), total - 1)
              setActiveSectionIndex(idx)
            }
          },
        },
      })

      // Phase 1: Entry
      tl.to(rocketGroup.position, { y: 0, duration: entryEnd, ease: 'power3.out' }, 0)
      tl.to(camera.position, { y: 0, z: 16, duration: entryEnd, ease: 'power3.out' }, 0)
      tl.to({}, { duration: 4, onUpdate: () => setScrollHintVisible(false) }, entryEnd * 0.6)

      // Phase 2: Sections
      sectionGroups.forEach((section, i) => {
        const secStart = entryEnd + i * perSec
        const secMid = secStart + perSec * 0.5
        const secEnd = secStart + perSec
        const camY = section.center.y
        const zoomZ = 10

        tl.to(camera.position, { y: camY, z: zoomZ, duration: perSec * 0.4, ease: 'power2.inOut' }, secStart)

        section.meshes.forEach((mesh, j) => {
          const d = j * 0.008
          tl.to(mesh.position, { z: mesh.userData.origPos.z + 1.3, duration: perSec * 0.3, ease: 'power2.out' }, secStart + d)
          tl.to(mesh.material, { emissiveIntensity: 0.45, duration: perSec * 0.2 }, secStart + d)
          tl.to((mesh.material as THREE.MeshStandardMaterial).emissive, { r: 1.0, g: 0.624, b: 0.988, duration: perSec * 0.2 }, secStart + d)
          tl.to(mesh.position, { z: mesh.userData.origPos.z, duration: perSec * 0.3, ease: 'power2.in' }, secMid + d)
          tl.to(mesh.material, { emissiveIntensity: 0, duration: perSec * 0.2 }, secMid + d)
          tl.to((mesh.material as THREE.MeshStandardMaterial).emissive, { r: 0, g: 0, b: 0, duration: perSec * 0.2 }, secMid + d)
        })

        tl.to(camera.position, { z: 13, duration: perSec * 0.3, ease: 'power2.inOut' }, secMid)

        // Stage separation
        if (i < 6) {
          section.meshes.forEach((mesh, j) => {
            const d = j * 0.006
            tl.to(mesh.position, { y: mesh.userData.origPos.y - 5, duration: perSec * 0.3, ease: 'power2.in' }, secEnd - perSec * 0.08 + d)
            tl.to(mesh.rotation, { x: mesh.userData.origRot.x + 0.2, duration: perSec * 0.3, ease: 'power1.inOut' }, secEnd - perSec * 0.08 + d)
            tl.to(mesh.material, { opacity: 0, duration: perSec * 0.2, ease: 'power1.in' }, secEnd - perSec * 0.04 + d)
          })
          tl.add(() => {
            if (tl.scrollTrigger && tl.scrollTrigger.direction === 1) {
              const p = section.center.clone(); p.x += rocketGroup!.position.x
              emitSmoke(p, 45)
            }
          }, secEnd - perSec * 0.08)
        }

        // Dim others
        sectionGroups.forEach((other, oi) => {
          if (oi === i) return
          other.meshes.forEach(mesh => {
            const dist = Math.abs(oi - i)
            tl.to(mesh.material, { opacity: dist <= 1 ? 0.55 : 0.15, duration: perSec * 0.12 }, secStart)
          })
        })
      })

      // Anticlockwise rotation
      tl.to(rocketModel!.rotation, { y: -Math.PI * 0.5, duration: 100, ease: 'none' }, 0)
    })

    // ═══ ANIMATION LOOP ═══
    let lastTime = 0
    let animId = 0
    function animate(time = 0) {
      animId = requestAnimationFrame(animate)
      const dt = Math.min((time - lastTime) / 1000, 0.05) || 1 / 60
      lastTime = time

      // Background
      bgMaterial.uniforms.iTime.value += dt
      renderer.setRenderTarget(bgRT)
      renderer.render(bgScene, bgCamera)
      renderer.setRenderTarget(null)
      scene.background = bgRT.texture

      // Flame
      if (flameMesh?.visible && (flameMesh.material as THREE.ShaderMaterial).uniforms) {
        (flameMesh.material as THREE.ShaderMaterial).uniforms.iTime.value += dt
        flameMesh.lookAt(camera.position)
      }

      // Flame visibility is controlled by the GSAP timeline

      updateSmoke(dt)

      smoothMouseX += (mouseX - smoothMouseX) * 2.0 * dt
      smoothMouseY += (mouseY - smoothMouseY) * 2.0 * dt
      camera.position.x = ROCKET_X * 0.3 + smoothMouseX * 0.3
      if (rocketGroup) camera.lookAt(ROCKET_X, camera.position.y, 0)

      composer.render(dt)
    }
    animate()

    // Mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
      const npx = Math.min(window.devicePixelRatio, 2)
      bgRT.setSize(window.innerWidth * npx, window.innerHeight * npx)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      document.documentElement.classList.remove('rocket-active')
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
      ScrollTrigger.getAll().forEach(t => t.kill())
      renderer.dispose()
    }
  }, [])

  const total = SECTIONS.length

  return (
    <div className="rocket-viewer">
      <button className="rocket-back-btn" onClick={handleBack}>← Back</button>

      <div className="rocket-canvas-container" ref={canvasContainerRef} />
      <div className="rocket-scroll-spacer" ref={scrollSpacerRef} />

      {/* Detail panel */}
      <div className="rocket-detail-panel">
        {SECTIONS.map((sec, i) => (
          <div key={i} className={`rocket-detail-card ${activeSectionIndex === i ? 'active' : ''}`}>
            <div className="mesh-index">Section {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
            <h2>{sec.name}</h2>
            <p>{sec.desc}</p>
            <div className="spec-grid">
              {Object.entries(sec.specs).map(([k, v]) => (
                <div className="spec-item" key={k}>
                  <div className="spec-label">{k}</div>
                  <div className="spec-value">{v}</div>
                </div>
              ))}
            </div>
            <span className="card-tag">{sec.tag}</span>
          </div>
        ))}
      </div>

      {/* Progress track */}
      <div className="rocket-progress-track">
        {SECTIONS.map((_, i) => (
          <div
            key={i}
            className={`rocket-progress-pip ${activeSectionIndex === i ? 'active' : ''} ${activeSectionIndex > i ? 'passed' : ''}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="rocket-counter">
        <span>{activeSectionIndex >= 0 ? String(activeSectionIndex + 1).padStart(2, '0') : '—'}</span> / {String(total).padStart(2, '0')}
      </div>

      {/* Scroll hint */}
      {scrollHintVisible && (
        <div className="rocket-scroll-hint">↓ Scroll to Explore ↓</div>
      )}
    </div>
  )
}
