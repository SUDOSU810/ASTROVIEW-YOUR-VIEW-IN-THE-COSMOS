import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ChromaticAberrationEffect } from 'postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './HubbleViewer.css'

gsap.registerPlugin(ScrollTrigger)

// ─── Component info cards data ──────────────────────────────────────────────
const COMPONENT_CARDS = [
  { id: 'solar-panels', title: 'Solar Panels', desc: 'Two large solar arrays provide power to the telescope, generating over 2,800 watts of electricity.' },
  { id: 'core', title: 'Main Body', desc: 'The core structure houses the primary mirror and scientific instruments that capture deep space imagery.' },
  { id: 'antenna', title: 'Communication Antenna', desc: 'High-gain antenna system transmits data back to Earth at 1 megabit per second.' },
  { id: 'sensor', title: 'Sensor Modules', desc: 'Advanced sensors and guidance systems maintain precise positioning and orientation in orbit.' },
  { id: 'primary-mirror', title: 'Primary Mirror', desc: 'The heart of Hubble - a massive 2.4-meter concave mirror weighing 1,800 pounds that collects light from distant celestial objects.' },
  { id: 'secondary-mirror', title: 'Secondary Mirror', desc: 'A 12-inch convex mirror that reflects light from the primary mirror back through the aperture to the scientific instruments.' },
  { id: 'aperture-door', title: 'Aperture Door', desc: 'Protective cover that opens and closes to shield the delicate optical system when not in use.' },
  { id: 'fine-guidance', title: 'Fine Guidance Sensors', desc: 'Three precision sensors with mirrors, lenses, and servos that point the telescope with incredible accuracy for astrometry measurements.' },
  { id: 'wfc3', title: 'Wide Field Camera 3', desc: "Hubble's most advanced imaging camera, installed in 2009, capturing stunning images in ultraviolet, visible, and near-infrared light." },
  { id: 'acs', title: 'Advanced Camera for Surveys', desc: 'Wide-field imaging camera that surveys large areas of the sky, studying dark matter, galaxy evolution, and exoplanet atmospheres.' },
  { id: 'reaction-wheels', title: 'Reaction Wheels', desc: "Four spinning wheels in the Support Systems Module that control Hubble's orientation, allowing precise pointing without using fuel." },
  { id: 'gyroscopes', title: 'Gyroscopes', desc: "Six ultra-precise gyroscopes provide a stable frame of reference, measuring the telescope's rotation rate to maintain accurate pointing." },
  { id: 'complete', title: 'Complete Assembly', desc: "The Hubble Space Telescope - humanity's window to the universe, orbiting Earth since 1990, capturing breathtaking images of distant galaxies and nebulae." },
]

// ─── Grid scan shader ───────────────────────────────────────────────────────
const gridVert = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const gridFrag = `
precision highp float;
uniform vec3 iResolution; uniform float iTime;
uniform vec2 uSkew; uniform float uTilt; uniform float uYaw;
uniform float uLineThickness; uniform vec3 uLinesColor; uniform vec3 uScanColor;
uniform float uGridScale; uniform float uLineJitter; uniform float uScanOpacity;
uniform float uNoise; uniform float uScanGlow; uniform float uScanSoftness;
uniform float uPhaseTaper; uniform float uScanDuration; uniform float uScanDelay;
varying vec2 vUv;
float smoother01(float a,float b,float x){float t=clamp((x-a)/max(1e-5,(b-a)),0.0,1.0);return t*t*t*(t*(t*6.0-15.0)+10.0);}
void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 p=(2.0*fragCoord-iResolution.xy)/iResolution.y;vec3 ro=vec3(0.0);vec3 rd=normalize(vec3(p,2.0));
  float cR=cos(uTilt),sR=sin(uTilt);rd.xy=mat2(cR,-sR,sR,cR)*rd.xy;
  float cY=cos(uYaw),sY=sin(uYaw);rd.xz=mat2(cY,-sY,sY,cY)*rd.xz;
  vec2 skew=clamp(uSkew,vec2(-0.7),vec2(0.7));rd.xy+=skew*rd.z;
  vec3 color=vec3(0.0);float minT=1e20;float gridScale=max(1e-5,uGridScale);float fadeStrength=2.0;vec2 gridUV=vec2(0.0);float hitIsY=1.0;
  for(int i=0;i<4;i++){float isY=float(i<2);float pos=mix(-0.2,0.2,float(i))*isY+mix(-0.5,0.5,float(i-2))*(1.0-isY);
    float num=pos-(isY*ro.y+(1.0-isY)*ro.x);float den=isY*rd.y+(1.0-isY)*rd.x;float t=num/den;vec3 h=ro+rd*t;
    float depthBoost=smoothstep(0.0,3.0,h.z);h.xy+=skew*0.15*depthBoost;bool use=t>0.0&&t<minT;
    gridUV=use?mix(h.zy,h.xz,isY)/gridScale:gridUV;minT=use?t:minT;hitIsY=use?isY:hitIsY;}
  vec3 hit=ro+rd*minT;float dist=length(hit-ro);
  float jitterAmt=clamp(uLineJitter,0.0,1.0);
  if(jitterAmt>0.0){vec2 j=vec2(sin(gridUV.y*2.7+iTime*1.8),cos(gridUV.x*2.3-iTime*1.6))*(0.15*jitterAmt);gridUV+=j;}
  float fx=fract(gridUV.x);float fy=fract(gridUV.y);float ax=min(fx,1.0-fx);float ay=min(fy,1.0-fy);
  float wx=fwidth(gridUV.x);float wy=fwidth(gridUV.y);float halfPx=max(0.0,uLineThickness)*0.5;
  float tx=halfPx*wx;float ty=halfPx*wy;float aax=wx;float aay=wy;
  float lineX=1.0-smoothstep(tx,tx+aax,ax);float lineY=1.0-smoothstep(ty,ty+aay,ay);float primaryMask=max(lineX,lineY);
  vec2 gridUV2=(hitIsY>0.5?hit.xz:hit.zy)/gridScale;
  if(jitterAmt>0.0){vec2 j2=vec2(cos(gridUV2.y*2.1-iTime*1.4),sin(gridUV2.x*2.5+iTime*1.7))*(0.15*jitterAmt);gridUV2+=j2;}
  float fx2=fract(gridUV2.x);float fy2=fract(gridUV2.y);float ax2=min(fx2,1.0-fx2);float ay2=min(fy2,1.0-fy2);
  float wx2=fwidth(gridUV2.x);float wy2=fwidth(gridUV2.y);float tx2=halfPx*wx2;float ty2=halfPx*wy2;
  float lineX2=1.0-smoothstep(tx2,tx2+wx2,ax2);float lineY2=1.0-smoothstep(ty2,ty2+wy2,ay2);float altMask=max(lineX2,lineY2);
  float edgeDistX=min(abs(hit.x-(-0.5)),abs(hit.x-0.5));float edgeDistY=min(abs(hit.y-(-0.2)),abs(hit.y-0.2));
  float edgeDist=mix(edgeDistY,edgeDistX,hitIsY);float edgeGate=1.0-smoothstep(gridScale*0.5,gridScale*2.0,edgeDist);altMask*=edgeGate;
  float lineMask=max(primaryMask,altMask);float fade=exp(-dist*fadeStrength);
  float dur=max(0.05,uScanDuration);float del=max(0.0,uScanDelay);float scanZMax=2.0;
  float widthScale=max(0.1,uScanGlow);float sigma=max(0.001,0.18*widthScale*uScanSoftness);float sigmaA=sigma*2.0;
  float cycle=dur+del;float tCycle=mod(iTime,cycle);float scanPhase=clamp((tCycle-del)/dur,0.0,1.0);float phase=scanPhase;
  float t2=mod(max(0.0,iTime-del),2.0*dur);phase=(t2<dur)?(t2/dur):(1.0-(t2-dur)/dur);
  float scanZ=phase*scanZMax;float dz=abs(hit.z-scanZ);float lineBand=exp(-0.5*(dz*dz)/(sigma*sigma));
  float taper=clamp(uPhaseTaper,0.0,0.49);float headW=taper;float tailW=taper;
  float headFade=smoother01(0.0,headW,phase);float tailFade=1.0-smoother01(1.0-tailW,1.0,phase);float phaseWindow=headFade*tailFade;
  float combinedPulse=lineBand*phaseWindow*clamp(uScanOpacity,0.0,1.0);
  float auraBand=exp(-0.5*(dz*dz)/(sigmaA*sigmaA));float combinedAura=(auraBand*0.25)*phaseWindow*clamp(uScanOpacity,0.0,1.0);
  float lineVis=lineMask;vec3 gridCol=uLinesColor*lineVis*fade;vec3 scanCol=uScanColor*combinedPulse;vec3 scanAura=uScanColor*combinedAura;
  color=gridCol+scanCol+scanAura;
  float n=fract(sin(dot(gl_FragCoord.xy+vec2(iTime*123.4),vec2(12.9898,78.233)))*43758.5453123);
  color+=(n-0.5)*uNoise;color=clamp(color,0.0,1.0);
  float alpha=clamp(max(lineVis,combinedPulse),0.0,1.0);fragColor=vec4(color,alpha);
}
void main(){vec4 c;mainImage(c,vUv*iResolution.xy);gl_FragColor=c;}
`

function srgbColor(hex: string) {
  const c = new THREE.Color(hex)
  return c.convertSRGBToLinear()
}

// ─── Component identification ───────────────────────────────────────────────
interface ComponentGroups {
  solarPanels: THREE.Mesh[]; core: THREE.Mesh[]; antenna: THREE.Mesh[]; sensors: THREE.Mesh[]
  primaryMirror: THREE.Mesh[]; secondaryMirror: THREE.Mesh[]; apertureDoor: THREE.Mesh[]
  fineGuidance: THREE.Mesh[]; wfc3: THREE.Mesh[]; acs: THREE.Mesh[]
  reactionWheels: THREE.Mesh[]; gyroscopes: THREE.Mesh[]
}

function identifyComponents(model: THREE.Object3D): ComponentGroups {
  const allMeshes: THREE.Mesh[] = []
  model.traverse((node) => { if ((node as THREE.Mesh).isMesh) allMeshes.push(node as THREE.Mesh) })

  const groups: ComponentGroups = {
    solarPanels: [], core: [], antenna: [], sensors: [],
    primaryMirror: [], secondaryMirror: [], apertureDoor: [],
    fineGuidance: [], wfc3: [], acs: [], reactionWheels: [], gyroscopes: []
  }

  allMeshes.forEach((mesh, index) => {
    switch (index) {
      case 0: groups.core.push(mesh); groups.primaryMirror.push(mesh); groups.gyroscopes.push(mesh); break
      case 1: groups.sensors.push(mesh); groups.reactionWheels.push(mesh); groups.acs.push(mesh); break
      case 2: groups.antenna.push(mesh); groups.secondaryMirror.push(mesh); groups.fineGuidance.push(mesh); break
      case 3: groups.solarPanels.push(mesh); groups.apertureDoor.push(mesh); groups.wfc3.push(mesh); break
      case 4: groups.solarPanels.push(mesh); groups.sensors.push(mesh); groups.wfc3.push(mesh); break
      default: groups.sensors.push(mesh)
    }
  })
  return groups
}

function createWireframeOverlay(mesh: THREE.Mesh) {
  const geo = new THREE.WireframeGeometry(mesh.geometry)
  const mat = new THREE.LineBasicMaterial({ color: 0xFF9FFC, linewidth: 3, transparent: true, opacity: 1.0 })
  const wireframe = new THREE.LineSegments(geo, mat)
  wireframe.position.copy(mesh.position)
  wireframe.rotation.copy(mesh.rotation)
  wireframe.scale.copy(mesh.scale)
  wireframe.matrix.copy(mesh.matrix)
  wireframe.matrixWorld.copy(mesh.matrixWorld)
  return wireframe
}

function setComponentFocus(active: THREE.Mesh[] | null, all: ComponentGroups, scene: THREE.Scene) {
  scene.children.filter(c => c.userData.isWireframe).forEach(w => scene.remove(w))
  const allArrays = Object.values(all)
  allArrays.forEach((group) => {
    group.forEach((mesh: THREE.Mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      const isActive = active?.includes(mesh)
      if (isActive) {
        mat.emissive = new THREE.Color(0xFF9FFC)
        mat.emissiveIntensity = 2.5
        mat.opacity = 0.4
        const wf = createWireframeOverlay(mesh)
        wf.userData.isWireframe = true
        wf.userData.parentMesh = mesh
        scene.add(wf)
      } else {
        mat.emissive = new THREE.Color(0x000000)
        mat.emissiveIntensity = 0
        mat.opacity = 0.50
      }
      mat.transparent = true
      mat.needsUpdate = true
    })
  })
}

function getComponentCenter(meshes: THREE.Mesh[]) {
  if (!meshes.length) return new THREE.Vector3()
  const box = new THREE.Box3()
  meshes.forEach(m => box.union(new THREE.Box3().setFromObject(m)))
  return box.getCenter(new THREE.Vector3())
}

export default function HubbleViewer() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('hubble-active')
    const container = containerRef.current
    if (!container) return

    // ═══ THREE.JS SCENE ═══
    const scene = new THREE.Scene()
    scene.background = null
    scene.fog = new THREE.Fog(0x0a0a0f, 15, 50)
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000)
    camera.position.set(0, 0, 20)
    const cameraTarget = new THREE.Vector3(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0'
    renderer.domElement.style.left = '0'
    renderer.domElement.style.zIndex = '1'
    container.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
    dirLight.position.set(10, 15, 10)
    scene.add(dirLight)
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.8)
    rimLight.position.set(-10, 5, -10)
    scene.add(rimLight)
    const fillLight = new THREE.DirectionalLight(0xff8844, 0.3)
    fillLight.position.set(0, -10, 5)
    scene.add(fillLight)

    // ═══ GRID BACKGROUND ═══
    const gridRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    gridRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    gridRenderer.setSize(container.clientWidth, container.clientHeight)
    gridRenderer.outputColorSpace = THREE.SRGBColorSpace
    gridRenderer.toneMapping = THREE.NoToneMapping
    gridRenderer.autoClear = false
    gridRenderer.setClearColor(0x000000, 1)
    gridRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;'
    container.insertBefore(gridRenderer.domElement, container.firstChild)

    const gridUniforms = {
      iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, gridRenderer.getPixelRatio()) },
      iTime: { value: 0 }, uSkew: { value: new THREE.Vector2(0, 0) }, uTilt: { value: 0 }, uYaw: { value: 0 },
      uLineThickness: { value: 1 }, uLinesColor: { value: srgbColor('#392e4e') },
      uScanColor: { value: srgbColor('#FF9FFC') }, uGridScale: { value: 0.1 },
      uLineJitter: { value: 0.1 }, uScanOpacity: { value: 0.4 }, uNoise: { value: 0.01 },
      uScanGlow: { value: 0.5 }, uScanSoftness: { value: 2 }, uPhaseTaper: { value: 0.9 },
      uScanDuration: { value: 2.0 }, uScanDelay: { value: 2.0 }
    }

    const gridMaterial = new THREE.ShaderMaterial({
      uniforms: gridUniforms, vertexShader: gridVert, fragmentShader: gridFrag,
      transparent: true, depthWrite: false, depthTest: false
    })

    const gridScene = new THREE.Scene()
    const gridCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    gridScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), gridMaterial))

    const gridComposer = new EffectComposer(gridRenderer)
    gridComposer.addPass(new RenderPass(gridScene, gridCamera))
    const bloom = new BloomEffect({ intensity: 1.0, luminanceThreshold: 0, luminanceSmoothing: 0 })
    bloom.blendMode.opacity.value = 0.6
    const chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.002, 0.002),
      radialModulation: true, modulationOffset: 0.0
    })
    const effectPass = new EffectPass(gridCamera, bloom, chroma)
    effectPass.renderToScreen = true
    gridComposer.addPass(effectPass)

    // Mouse tracking for grid
    const gridLookTarget = { x: 0, y: 0 }
    const gridLookCurrent = { x: 0, y: 0 }
    const gridLookVel = { x: 0, y: 0 }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      gridLookTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      gridLookTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }
    const handleMouseLeave = () => { gridLookTarget.x = 0; gridLookTarget.y = 0 }
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    function smoothDamp(current: number, target: number, velocity: number, smoothTime: number, dt: number) {
      smoothTime = Math.max(0.0001, smoothTime)
      const omega = 2 / smoothTime, x = omega * dt
      const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
      let change = current - target
      const maxChange = Infinity * smoothTime
      change = Math.sign(change) * Math.min(Math.abs(change), maxChange)
      const newTarget = current - change
      const temp = (velocity + omega * change) * dt
      const newVel = (velocity - omega * temp) * exp
      let out = newTarget + (change + temp) * exp
      if ((target - current) * (out - target) > 0) { out = target; return { value: out, velocity: 0 } }
      return { value: out, velocity: newVel }
    }

    // ═══ LOAD MODEL ═══
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)

    let meshes: THREE.Mesh[] = []
    let modelCenter = new THREE.Vector3()
    let modelSize = 0
    let components: ComponentGroups | null = null
    let hubbleModel: THREE.Object3D | null = null
    let animId = 0

    loader.load('/models/hubble.glb', (gltf) => {
      const model = gltf.scene
      hubbleModel = model
      scene.add(model)

      const box = new THREE.Box3().setFromObject(model)
      modelCenter = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      modelSize = Math.max(size.x, size.y, size.z)
      const scale = 9 / modelSize
      model.scale.setScalar(scale)
      model.position.sub(modelCenter.multiplyScalar(scale))
      model.updateMatrixWorld(true)

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.userData.original = mesh.position.clone()
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.transparent = true; mat.opacity = 1.0; mat.depthWrite = true
          mat.emissive = new THREE.Color(0xFF9FFC); mat.emissiveIntensity = 0.6
          meshes.push(mesh)
        }
      })

      components = identifyComponents(model)

      // Calculate explosion vectors
      const explodeStrength = modelSize * 1.2
      meshes.forEach(mesh => {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
        const mc = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3())
        mc.applyMatrix4(mesh.matrixWorld)
        const ev = mc.clone().sub(new THREE.Vector3()).normalize()
        if (ev.length() === 0) ev.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
        mesh.userData.explosionVector = ev
        mesh.userData.originalPosition = mesh.position.clone()
      })

      // ═══ BUILD GSAP TIMELINE ═══
      const componentCenters = {
        solarPanels: getComponentCenter(components.solarPanels),
        core: getComponentCenter(components.core),
        antenna: getComponentCenter(components.antenna),
        sensors: getComponentCenter(components.sensors),
        primaryMirror: getComponentCenter(components.primaryMirror),
        secondaryMirror: getComponentCenter(components.secondaryMirror),
        apertureDoor: getComponentCenter(components.apertureDoor),
        fineGuidance: getComponentCenter(components.fineGuidance),
        wfc3: getComponentCenter(components.wfc3),
        acs: getComponentCenter(components.acs),
        reactionWheels: getComponentCenter(components.reactionWheels),
        gyroscopes: getComponentCenter(components.gyroscopes),
      }

      const scrollContainer = scrollContainerRef.current
      if (!scrollContainer) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: '+=2040',
          scrub: true,
          pin: container,
        }
      })

      tl.addLabel('intro', 0)
      tl.addLabel('solar-panels', 1)
      tl.addLabel('core', 2)
      tl.addLabel('antenna', 3)
      tl.addLabel('sensor', 4)
      tl.addLabel('primary-mirror', 5)
      tl.addLabel('secondary-mirror', 6)
      tl.addLabel('aperture-door', 7)
      tl.addLabel('fine-guidance', 8)
      tl.addLabel('wfc3', 9)
      tl.addLabel('acs', 10)
      tl.addLabel('reaction-wheels', 11)
      tl.addLabel('gyroscopes', 12)
      tl.addLabel('complete', 13)

      // 3D rotation
      tl.to(model.rotation, { y: Math.PI * 4, duration: 14, ease: 'none' }, 0)

      // Progressive explosion for each component
      const compKeys: (keyof ComponentGroups)[] = ['solarPanels', 'core', 'antenna', 'sensors', 'primaryMirror', 'secondaryMirror', 'apertureDoor', 'fineGuidance', 'wfc3', 'acs', 'reactionWheels', 'gyroscopes']
      const explodeFactors = [0.6, 0.4, 0.8, 1.0, 0.5, 0.6, 0.7, 0.9, 0.55, 0.65, 0.75, 0.45]
      const labels = ['solar-panels', 'core', 'antenna', 'sensor', 'primary-mirror', 'secondary-mirror', 'aperture-door', 'fine-guidance', 'wfc3', 'acs', 'reaction-wheels', 'gyroscopes']

      compKeys.forEach((key, i) => {
        components![key].forEach(mesh => {
          const dir = mesh.userData.explosionVector
          tl.to(mesh.position, {
            x: mesh.userData.original.x + dir.x * explodeStrength * explodeFactors[i],
            y: mesh.userData.original.y + dir.y * explodeStrength * explodeFactors[i],
            z: mesh.userData.original.z + dir.z * explodeStrength * explodeFactors[i],
            duration: 1, ease: 'power2.inOut'
          }, labels[i])
        })
      })

      // Reassembly
      meshes.forEach(mesh => {
        tl.to(mesh.position, {
          x: mesh.userData.original.x, y: mesh.userData.original.y, z: mesh.userData.original.z,
          duration: 1, ease: 'power2.inOut'
        }, 'complete')
      })

      // Camera movements
      const camMoves: { label: string; pos: [number, number, number]; target: THREE.Vector3 }[] = [
        { label: 'intro', pos: [0, 2, 25], target: new THREE.Vector3(0, 0, 0) },
        { label: 'solar-panels', pos: [componentCenters.solarPanels.x * 1.5, componentCenters.solarPanels.y + 1, componentCenters.solarPanels.z + 12], target: componentCenters.solarPanels },
        { label: 'core', pos: [componentCenters.core.x + 5, componentCenters.core.y + 4, componentCenters.core.z + 10], target: componentCenters.core },
        { label: 'antenna', pos: [componentCenters.antenna.x + 3, componentCenters.antenna.y - 6, componentCenters.antenna.z + 12], target: componentCenters.antenna },
        { label: 'sensor', pos: [componentCenters.sensors.x + 6, componentCenters.sensors.y + 3, componentCenters.sensors.z + 8], target: componentCenters.sensors },
        { label: 'primary-mirror', pos: [componentCenters.primaryMirror.x + 2, componentCenters.primaryMirror.y + 2, componentCenters.primaryMirror.z + 15], target: componentCenters.primaryMirror },
        { label: 'secondary-mirror', pos: [componentCenters.secondaryMirror.x + 3, componentCenters.secondaryMirror.y + 1, componentCenters.secondaryMirror.z + 10], target: componentCenters.secondaryMirror },
        { label: 'aperture-door', pos: [componentCenters.apertureDoor.x, componentCenters.apertureDoor.y + 3, componentCenters.apertureDoor.z + 18], target: componentCenters.apertureDoor },
        { label: 'fine-guidance', pos: [componentCenters.fineGuidance.x + 7, componentCenters.fineGuidance.y + 2, componentCenters.fineGuidance.z + 9], target: componentCenters.fineGuidance },
        { label: 'wfc3', pos: [componentCenters.wfc3.x + 4, componentCenters.wfc3.y + 3, componentCenters.wfc3.z + 11], target: componentCenters.wfc3 },
        { label: 'acs', pos: [componentCenters.acs.x + 5, componentCenters.acs.y + 4, componentCenters.acs.z + 10], target: componentCenters.acs },
        { label: 'reaction-wheels', pos: [componentCenters.reactionWheels.x + 6, componentCenters.reactionWheels.y + 1, componentCenters.reactionWheels.z + 12], target: componentCenters.reactionWheels },
        { label: 'gyroscopes', pos: [componentCenters.gyroscopes.x + 3, componentCenters.gyroscopes.y + 5, componentCenters.gyroscopes.z + 13], target: componentCenters.gyroscopes },
        { label: 'complete', pos: [0, 0, 20], target: new THREE.Vector3(0, 0, 0) },
      ]

      camMoves.forEach(({ label, pos, target }) => {
        tl.to(camera.position, { x: pos[0], y: pos[1], z: pos[2], duration: 1, ease: 'power2.inOut' }, label)
        tl.to(cameraTarget, { x: target.x, y: target.y, z: target.z, duration: 1, ease: 'power2.inOut' }, label)
      })

      // Visual focus system
      tl.add(() => setActiveCard(null), 'intro')
      const cardLabels = ['solar-panels', 'core', 'antenna', 'sensor', 'primary-mirror', 'secondary-mirror', 'aperture-door', 'fine-guidance', 'wfc3', 'acs', 'reaction-wheels', 'gyroscopes', 'complete']
      const compKeysForFocus: (keyof ComponentGroups | null)[] = [
        'solarPanels', 'core', 'antenna', 'sensors', 'primaryMirror', 'secondaryMirror',
        'apertureDoor', 'fineGuidance', 'wfc3', 'acs', 'reactionWheels', 'gyroscopes', null
      ]

      cardLabels.forEach((label, i) => {
        tl.add(() => {
          setActiveCard(label)
          if (compKeysForFocus[i] && components) {
            setComponentFocus(components[compKeysForFocus[i]!], components, scene)
          } else if (components) {
            // Complete: show all
            const all = Object.values(components).flat()
            all.forEach(mesh => {
              const mat = mesh.material as THREE.MeshStandardMaterial
              mat.opacity = 1.0; mat.emissive = new THREE.Color(0x000000); mat.emissiveIntensity = 0
            })
            scene.children.filter(c => c.userData.isWireframe).forEach(w => scene.remove(w))
          }
        }, label)
      })

      camera.far = Math.max(2000, explodeStrength * 4)
      camera.updateProjectionMatrix()
    })

    // ═══ ANIMATION LOOP ═══
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const dt = 1 / 60

      // Update grid
      const s = 0.55
      const skewScale = THREE.MathUtils.lerp(0.06, 0.2, s)
      const smoothTime = THREE.MathUtils.lerp(0.45, 0.12, s)
      const yBoost = THREE.MathUtils.lerp(1.2, 1.6, s)
      const xR = smoothDamp(gridLookCurrent.x, gridLookTarget.x, gridLookVel.x, smoothTime, dt)
      gridLookCurrent.x = xR.value; gridLookVel.x = xR.velocity
      const yR = smoothDamp(gridLookCurrent.y, gridLookTarget.y, gridLookVel.y, smoothTime, dt)
      gridLookCurrent.y = yR.value; gridLookVel.y = yR.velocity
      gridUniforms.uSkew.value.set(gridLookCurrent.x * skewScale, -gridLookCurrent.y * yBoost * skewScale)
      gridUniforms.iTime.value = performance.now() / 1000
      gridRenderer.clear(true, true, true)
      gridComposer.render(dt)

      // Update wireframes
      scene.children.forEach(child => {
        if (child.userData.isWireframe && child.userData.parentMesh) {
          child.position.copy(child.userData.parentMesh.position)
          child.rotation.copy(child.userData.parentMesh.rotation)
          child.scale.copy(child.userData.parentMesh.scale)
        }
      })

      camera.lookAt(cameraTarget)
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      gridRenderer.setSize(container.clientWidth, container.clientHeight)
      gridUniforms.iResolution.value.set(container.clientWidth, container.clientHeight, gridRenderer.getPixelRatio())
      gridComposer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      document.documentElement.classList.remove('hubble-active')
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animId)
      ScrollTrigger.getAll().forEach(t => t.kill())
      renderer.dispose()
      gridRenderer.dispose()
    }
  }, [])

  return (
    <div className="hubble-viewer" ref={scrollContainerRef}>
      <button className="hubble-back-btn" onClick={() => navigate('/space-explorer')}>
        ← Back
      </button>
      <div className="hubble-canvas-container" ref={containerRef} />
      <div className="hubble-scroll-spacer" />

      {/* Info Cards */}
      {COMPONENT_CARDS.map(card => (
        <div
          key={card.id}
          className={`hubble-component-card ${activeCard === card.id ? 'active' : ''}`}
        >
          <h2>{card.title}</h2>
          <p>{card.desc}</p>
        </div>
      ))}
    </div>
  )
}
