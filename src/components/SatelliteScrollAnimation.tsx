import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './SatelliteScrollAnimation.css'

gsap.registerPlugin(ScrollTrigger)

// ── Constants ──
const TRAIL_COUNT = 100
const LERP_SPEED = 0.08

// ═══════════════════════════════════════
// Liquid Metal Glass Shader
// Ported from MetallicPaint — procedural noise, chromatic aberration,
// multi-band metallic gradients, fresnel, liquid flow animation
// ═══════════════════════════════════════
function createLiquidMetalMaterial(
  tintHex: number = 0xaaccff,
  opacity: number = 1.0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vViewDir = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uTint;

      // ── Procedural noise (from MetallicPaint pW) ──
      vec3 hash3(vec3 p) {
        p = fract(p * vec3(0.1031, 0.1030, 0.0973));
        p += dot(p, p.yxz + 33.33);
        return fract((p.xxy + p.yxx) * p.zyx);
      }

      float noise3D(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f); // smoothstep
        float n = mix(
          mix(mix(dot(hash3(i), f),
                  dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), f.x),
              mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                  dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), f.x), f.y),
          mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                  dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), f.x),
              mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                  dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), f.x), f.y),
          f.z);
        return n * 0.5 + 0.5;
      }

      // ── Multi-band metallic gradient (from MetallicPaint mG) ──
      float metallicGrad(float t, float hi, float lo, float sharpness) {
        float r = lo;
        float sh = sharpness * 0.8;
        // Multiple edge bands for banded chrome look
        r = mix(r, hi, smoothstep(0.0, sh * 1.5, t));
        r = mix(r, lo, smoothstep(0.08 - sh, 0.08 + sh, t));
        r = mix(r, hi, smoothstep(0.13 - sh, 0.13 + sh, t));
        r = mix(r, lo, smoothstep(0.17 - sh, 0.17 + sh, t));
        r = mix(r, hi, smoothstep(0.22 - sh, 0.22 + sh, t));
        // Gradual falloff
        float gT = clamp((t - 0.22) / 0.78, 0.0, 1.0);
        r = mix(r, mix(hi, lo, smoothstep(0.0, 1.0, gT)),
                smoothstep(0.22 - sh * 0.5, 0.22 + sh * 0.5, t));
        return r;
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewDir);

        // ── Fresnel ──
        float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
        fresnel = pow(fresnel, 2.5);

        // ── Liquid flow pattern ──
        float time = uTime * 0.4;
        vec3 noiseCoord = vWorldPos * 3.5 + time * 0.3;
        float n1 = noise3D(noiseCoord);
        float n2 = noise3D(noiseCoord * 2.1 + vec3(17.0, 31.0, 7.0));
        float liquid = n1 * 0.6 + n2 * 0.4;
        // Apply liquid distortion
        liquid = liquid * 2.0 - 1.0;
        float liquidFlow = sin(liquid * 6.2831 + time) * 0.5 + 0.5;

        // ── Specular highlights (two light sources) ──
        vec3 light1 = normalize(vec3(5.0, 8.0, 6.0));
        vec3 light2 = normalize(vec3(-3.0, 4.0, -2.0));
        vec3 half1 = normalize(light1 + viewDir);
        vec3 half2 = normalize(light2 + viewDir);
        float spec1 = pow(max(dot(normal, half1), 0.0), 150.0) * 2.5;
        float spec2 = pow(max(dot(normal, half2), 0.0), 80.0) * 1.2;

        // ── Surface coordinate for metallic banding ──
        float surfaceAngle = dot(normal, light1) * 0.5 + 0.5;
        float metalInput = fract(surfaceAngle + liquidFlow * 0.3 + n1 * 0.2);

        // ── Multi-band metallic reflection ──
        float hiVal = 2.0; // brightness
        float loVal = 0.15;
        float sharpness = 0.04;

        // ── Chromatic aberration ──
        float chromaOffset = fresnel * 0.08;
        float rBand = metallicGrad(fract(metalInput + chromaOffset), hiVal, loVal, sharpness);
        float gBand = metallicGrad(metalInput, hiVal, loVal, sharpness);
        float bBand = metallicGrad(fract(metalInput - chromaOffset), hiVal, loVal, sharpness);

        vec3 metalColor = vec3(rBand, gBand, bBand);

        // ── Mix with tint ──
        vec3 tintNorm = uTint;
        metalColor = mix(metalColor, metalColor * tintNorm * 1.5, 0.3);

        // ── Add specular ──
        metalColor += vec3(1.0) * (spec1 + spec2);

        // ── Fresnel edge glow ──
        metalColor += uTint * fresnel * 0.4;

        // ── Refraction shimmer ──
        float refraction = sin(vWorldPos.x * 12.0 + time * 2.0) *
                          cos(vWorldPos.y * 10.0 - time * 1.3) * 0.04;
        metalColor += refraction;

        // ── Contrast ──
        metalColor = (metalColor - 0.5) * 1.4 + 0.5;
        metalColor = max(metalColor, vec3(0.0));

        // ── Alpha ──
        float alpha = uOpacity * 0.2;       // Base glass transparency
        alpha += fresnel * 0.6;              // Edges more opaque
        alpha += (spec1 + spec2) * 0.7;      // Specs fully visible
        alpha += metallicGrad(metalInput, 0.3, 0.0, sharpness); // Bands slightly opaque
        alpha = clamp(alpha, 0.0, 1.0);

        gl_FragColor = vec4(metalColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uTint: { value: new THREE.Color(tintHex) },
    },
  })
}

// ═══════════════════════════════════════
// Satellite Builder
// ═══════════════════════════════════════
function createSatellite(): { group: THREE.Group; materials: THREE.ShaderMaterial[] } {
  const group = new THREE.Group()
  const materials: THREE.ShaderMaterial[] = []

  const bodyMat = createLiquidMetalMaterial(0x88aaff, 1.0)
  materials.push(bodyMat)

  // Main body
  const bodyGeo = new THREE.BoxGeometry(0.7, 0.42, 0.42)
  group.add(new THREE.Mesh(bodyGeo, bodyMat))

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8)
  const armMat = createLiquidMetalMaterial(0x99bbff, 0.8)
  materials.push(armMat)
  const la = new THREE.Mesh(armGeo, armMat)
  la.rotation.z = Math.PI / 2; la.position.set(-0.52, 0, 0)
  group.add(la)
  const ra = new THREE.Mesh(armGeo, armMat)
  ra.rotation.z = Math.PI / 2; ra.position.set(0.52, 0, 0)
  group.add(ra)

  // Solar panels
  const panelGeo = new THREE.BoxGeometry(1.0, 0.03, 0.42)
  const panelMat = createLiquidMetalMaterial(0x6699ff, 0.9)
  materials.push(panelMat)
  const lp = new THREE.Mesh(panelGeo, panelMat)
  lp.position.set(-1.2, 0, 0)
  group.add(lp)
  const rp = new THREE.Mesh(panelGeo, panelMat)
  rp.position.set(1.2, 0, 0)
  group.add(rp)

  // Panel grid lines
  const lineMat = createLiquidMetalMaterial(0x4477cc, 0.5)
  materials.push(lineMat)
  for (let i = -2; i <= 2; i++) {
    const lg = new THREE.BoxGeometry(0.015, 0.04, 0.42)
    const ll = new THREE.Mesh(lg, lineMat)
    ll.position.set(-1.2 + i * 0.18, 0, 0)
    group.add(ll)
    const lr = new THREE.Mesh(lg, lineMat)
    lr.position.set(1.2 + i * 0.18, 0, 0)
    group.add(lr)
  }

  // Antenna dish
  const dishGeo = new THREE.ConeGeometry(0.13, 0.18, 16)
  const dishMat = createLiquidMetalMaterial(0xaaccff, 1.0)
  materials.push(dishMat)
  const dish = new THREE.Mesh(dishGeo, dishMat)
  dish.position.set(0, 0.38, 0)
  group.add(dish)

  // Antenna rod
  const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6)
  const rod = new THREE.Mesh(rodGeo, dishMat)
  rod.position.set(0, 0.55, 0)
  group.add(rod)

  // Tip glow
  const tipGeo = new THREE.SphereGeometry(0.04, 12, 12)
  const tipMat = createLiquidMetalMaterial(0xffffff, 1.5)
  materials.push(tipMat)
  const tip = new THREE.Mesh(tipGeo, tipMat)
  tip.position.set(0, 0.68, 0)
  tip.name = 'blink-led'
  group.add(tip)

  return { group, materials }
}

// ═══════════════════════════════════════
// ASCII Character Trail — WIDER spread
// ═══════════════════════════════════════
function createAsciiTrail(scene: THREE.Scene) {
  const charTextures: THREE.CanvasTexture[] = []
  const charset = '#@$%&MW*+=-~^:;,.'

  for (let c = 0; c < charset.length; c++) {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 32, 32)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(charset[c], 16, 17)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    charTextures.push(tex)
  }

  interface TrailChar {
    sprite: THREE.Sprite
    age: number
    maxAge: number
    velocity: THREE.Vector3
    active: boolean
  }

  const pool: TrailChar[] = []
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const texIdx = Math.floor(Math.random() * charTextures.length)
    const spriteMat = new THREE.SpriteMaterial({
      map: charTextures[texIdx],
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.scale.set(0.18, 0.18, 1)
    sprite.visible = false
    sprite.position.set(9999, 9999, 9999)
    scene.add(sprite)
    pool.push({ sprite, age: 0, maxAge: 2.5, velocity: new THREE.Vector3(), active: false })
  }

  let spawnIdx = 0

  function update(satPos: THREE.Vector3, active: boolean, delta: number) {
    if (active) {
      for (let s = 0; s < 3; s++) {
        const p = pool[spawnIdx % TRAIL_COUNT]
        p.active = true
        p.age = 0
        p.maxAge = 2.0 + Math.random() * 2.0 // Longer life = further drift
        p.velocity.set(
          (Math.random() - 0.5) * 1.2,  // 3x wider spread
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 0.5
        )
        p.sprite.position.set(
          satPos.x + (Math.random() - 0.5) * 0.4,  // Wider spawn area
          satPos.y + (Math.random() - 0.5) * 0.4,
          satPos.z + (Math.random() - 0.5) * 0.2
        )
        p.sprite.visible = true

        const texIdx = Math.floor(Math.random() * charTextures.length)
          ; (p.sprite.material as THREE.SpriteMaterial).map = charTextures[texIdx]

        const sz = 0.12 + Math.random() * 0.18
        p.sprite.scale.set(sz, sz, 1)

        spawnIdx++
      }
    }

    for (const p of pool) {
      if (!p.active) continue
      p.age += delta

      if (p.age >= p.maxAge) {
        p.active = false
        p.sprite.visible = false
        p.sprite.position.set(9999, 9999, 9999)
        continue
      }

      const life = p.age / p.maxAge
      const opacity = life < 0.08 ? life / 0.08 : 1.0 - Math.pow((life - 0.08) / 0.92, 0.6)
        ; (p.sprite.material as THREE.SpriteMaterial).opacity = opacity * 0.5

      p.sprite.position.x += p.velocity.x * delta
      p.sprite.position.y += p.velocity.y * delta
      p.sprite.position.z += p.velocity.z * delta

      p.velocity.multiplyScalar(0.992)
      p.sprite.position.y += delta * 0.04
    }
  }

  function dispose() {
    for (const p of pool) {
      ; (p.sprite.material as THREE.SpriteMaterial).dispose()
      scene.remove(p.sprite)
    }
    for (const tex of charTextures) tex.dispose()
  }

  return { update, dispose }
}

// ═══════════════════════════════════════
// DOM element center → Three.js world coordinate
// ═══════════════════════════════════════
function domToWorld(
  el: Element,
  camera: THREE.PerspectiveCamera
): { x: number; y: number } {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const ndcX = (cx / window.innerWidth) * 2 - 1
  const ndcY = -(cy / window.innerHeight) * 2 + 1
  const halfH = Math.tan((camera.fov / 2) * Math.PI / 180) * camera.position.z
  const halfW = halfH * camera.aspect
  return { x: ndcX * halfW, y: ndcY * halfH }
}

interface CardPos { x: number; y: number }

// ═══════════════════════════════════════
// Orbit Path — dual orbits → divider → bounce → swipe
// ═══════════════════════════════════════
function getTargetTransform(
  progress: number,
  time: number,
  dividerWorldX: number,
  bentoCards: CardPos[],
  teamCards: CardPos[]
): { pos: THREE.Vector3; rot: THREE.Euler; scale: number } {
  const ss = (t: number) => t * t * (3 - 2 * t)

  // Phase 1: Enter from upper right (0–6%)
  if (progress <= 0.06) {
    const t = ss(progress / 0.06)
    return {
      pos: new THREE.Vector3(lerp(7, 3.0, t), lerp(4, 1.5, t), lerp(-3, 0, t)),
      rot: new THREE.Euler((1 - t) * 0.4, time * 1.5 + (1 - t) * Math.PI, (1 - t) * 0.6),
      scale: t * 0.4,
    }
  }

  // Phase 2: Big orbit (6–20%)
  if (progress <= 0.20) {
    const t = (progress - 0.06) / 0.14
    const angle = t * Math.PI * 2
    return {
      pos: new THREE.Vector3(Math.cos(angle) * 3.5, Math.sin(angle) * 2.2, Math.sin(angle * 2) * 0.4),
      rot: new THREE.Euler(Math.sin(angle) * 0.12, angle + Math.PI * 0.5, Math.cos(angle) * 0.2),
      scale: lerp(0.4, 0.5, t),
    }
  }

  // Phase 3: Small orbit (20–34%)
  if (progress <= 0.34) {
    const t = (progress - 0.20) / 0.14
    const angle = t * Math.PI * 2
    return {
      pos: new THREE.Vector3(Math.cos(angle) * 1.8, Math.sin(angle) * 1.2, Math.sin(angle * 2) * 0.2),
      rot: new THREE.Euler(Math.sin(angle) * 0.08, angle + Math.PI * 0.5, Math.cos(angle) * 0.12),
      scale: lerp(0.5, 0.5, t),
    }
  }

  // Phase 4: Fly to divider center (34–48%)
  if (progress <= 0.48) {
    const t = ss((progress - 0.34) / 0.14)
    return {
      pos: new THREE.Vector3(lerp(1.8, dividerWorldX, t), lerp(0, 3.0, t), lerp(0.2, 0, t)),
      rot: new THREE.Euler(lerp(0.08, 0, t), lerp(Math.PI * 2.5, Math.PI * 0.5, t), lerp(0.12, 0, t)),
      scale: lerp(0.5, 0.35, t),
    }
  }

  // Phase 5: Scroll down through divider (48–82%)
  if (progress <= 0.82) {
    const t = (progress - 0.48) / 0.34
    const hover = Math.sin(time * 1.0) * 0.02
    return {
      pos: new THREE.Vector3(dividerWorldX, lerp(3.0, -3.0, t) + hover, 0),
      rot: new THREE.Euler(0.02, Math.PI * 0.5 + Math.sin(time * 0.6) * 0.06, 0),
      scale: 0.35,
    }
  }

  // Phase 6: Fly to Intelligence → bounce to Personalization → bounce to Visibility (82–86%)
  if (progress <= 0.86 && bentoCards.length >= 3) {
    const t = (progress - 0.82) / 0.04   // 0→1
    const cards = bentoCards.slice(0, 3)  // Intelligence, Personalization, Visibility

    // First part (0→0.3): fly from divider end to Intelligence card
    if (t <= 0.3) {
      const ft = ss(t / 0.3)
      return {
        pos: new THREE.Vector3(
          lerp(dividerWorldX, cards[0].x, ft),
          lerp(-3.0, cards[0].y, ft),
          lerp(0, 1.5, ft)
        ),
        rot: new THREE.Euler(
          lerp(0.02, 0, ft),
          lerp(Math.PI * 0.5, Math.PI, ft),
          lerp(0, -0.3, ft)
        ),
        scale: 0.35,
      }
    }

    // Second part (0.3→1.0): bounce card to card
    const bounceT = (t - 0.3) / 0.7
    const segFloat = bounceT * 2
    const segIndex = Math.min(Math.floor(segFloat), 1)
    const segT = segFloat - segIndex

    const curr = cards[segIndex]
    const next = cards[segIndex + 1]

    const eased = segT * segT * (3 - 2 * segT)
    const arcHeight = Math.sin(segT * Math.PI) * 2.0  // big bounce arc

    const x = curr.x + (next.x - curr.x) * eased
    const y = curr.y + arcHeight  // bounce UP from card level

    const hitPulse = Math.cos(segT * Math.PI) * 0.08
    const scale = 0.33 + Math.max(0, hitPulse)

    const spinAngle = (0.3 + bounceT * 0.7) * Math.PI * 4

    return {
      pos: new THREE.Vector3(x, y, 1.5),
      rot: new THREE.Euler(
        Math.sin(spinAngle) * 0.2,
        spinAngle,
        Math.cos(spinAngle) * 0.15
      ),
      scale,
    }
  }

  // Phase 6b: Drift from Visibility card down toward team section (86–90%)
  if (progress <= 0.90) {
    const t = ss((progress - 0.86) / 0.04)
    const lastBento = bentoCards.length >= 3 ? bentoCards[2] : { x: 1.1, y: 1.5 }
    const teamCenterY = teamCards.length >= 4
      ? (teamCards[0].y + teamCards[3].y) / 2
      : lastBento.y - 3.0
    const hover = Math.sin(time * 1.5) * 0.05
    return {
      pos: new THREE.Vector3(
        lerp(lastBento.x, 0, t),
        lerp(lastBento.y, teamCenterY + 2.0, t) + hover,
        1.5
      ),
      rot: new THREE.Euler(
        0.05,
        lerp(Math.PI * 2, Math.PI * 0.5, t),
        lerp(0.15, 0, t)
      ),
      scale: lerp(0.33, 0.30, t),
    }
  }

  // Phase 7: Orbit around team cards, revealing each (90–98%)
  if (progress <= 0.98 && teamCards.length >= 4) {
    const t = (progress - 0.90) / 0.08
    const lastBento = bentoCards.length >= 3 ? bentoCards[2] : { x: 1.1, y: 1.5 }

    // Compute orbit center and radii from team card spread
    const centerX = (teamCards[0].x + teamCards[3].x) / 2
    const centerY = (teamCards[0].y + teamCards[3].y) / 2
    const radiusX = Math.abs(teamCards[3].x - teamCards[0].x) / 2 + 1.0  // wider than card spread
    const radiusY = radiusX * 0.5  // elliptical — flatter vertically

    // First 12%: fly from Visibility card to top of orbit
    if (t <= 0.12) {
      const ft = ss(t / 0.12)
      // Reveal first card as we arrive
      if (ft > 0.5 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('satellite-reveal-card', { detail: { index: 0 } }))
      }
      const orbitStartX = centerX
      const orbitStartY = centerY + radiusY
      return {
        pos: new THREE.Vector3(
          lerp(lastBento.x, orbitStartX, ft),
          lerp(lastBento.y, orbitStartY, ft),
          1.5
        ),
        rot: new THREE.Euler(0.1, Math.PI * 0.5, lerp(0, -0.2, ft)),
        scale: lerp(0.33, 0.30, ft),
      }
    }

    // 88% of phase: full orbit (clockwise)
    const orbitT = (t - 0.12) / 0.88  // 0→1 = full loop
    const angle = -orbitT * Math.PI * 2 + Math.PI / 2  // start from top, go clockwise

    const x = centerX + Math.cos(angle) * radiusX
    const y = centerY + Math.sin(angle) * radiusY

    // Z oscillation — satellite goes behind cards at bottom, in front at top
    const z = 1.5 + Math.sin(angle) * 0.8

    // Reveal cards at specific orbit positions (4 cards at ~0%, 25%, 50%, 75%)
    const revealIndex = Math.min(Math.floor(orbitT * 4), 3)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('satellite-reveal-card', { detail: { index: revealIndex } }))
    }

    // Scale varies — larger when closer (in front), smaller when far (behind)
    const scalePulse = 0.28 + Math.sin(angle) * 0.04

    return {
      pos: new THREE.Vector3(x, y, z),
      rot: new THREE.Euler(
        Math.cos(angle) * 0.15,
        angle + Math.PI,  // face direction of travel
        Math.sin(angle) * 0.1
      ),
      scale: scalePulse,
    }
  }

  // Phase 8: Descend and exit from orbit (98–100%)
  {
    const centerX = teamCards.length >= 4 ? (teamCards[0].x + teamCards[3].x) / 2 : 0
    const centerY = teamCards.length >= 4 ? (teamCards[0].y + teamCards[3].y) / 2 : -1
    const radiusX = teamCards.length >= 4 ? Math.abs(teamCards[3].x - teamCards[0].x) / 2 + 1.0 : 3
    // Exit from the right side of the orbit
    const exitX = centerX + radiusX
    const exitY = centerY
    const t = ss((progress - 0.98) / 0.02)
    return {
      pos: new THREE.Vector3(
        lerp(exitX, exitX + 2.0, t),
        lerp(exitY, exitY - 3.0, t),
        lerp(1.5, -1.0, t)
      ),
      rot: new THREE.Euler(
        lerp(0.05, 0.4, t),
        Math.PI * 0.8,
        lerp(0.1, 0.5, t)
      ),
      scale: lerp(0.28, 0.1, t),
    }
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════
export default function SatelliteScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({ scrollProgress: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 100
    )
    camera.position.set(0, 0, 8)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Lighting
    scene.add(new THREE.AmbientLight(0x8888cc, 0.5))
    const sun = new THREE.DirectionalLight(0xffffff, 2.5)
    sun.position.set(5, 8, 6)
    scene.add(sun)
    const rim = new THREE.DirectionalLight(0x6688ff, 0.6)
    rim.position.set(-4, 2, -4)
    scene.add(rim)
    const back = new THREE.DirectionalLight(0xaabbff, 0.3)
    back.position.set(0, -3, -5)
    scene.add(back)

    // Satellite
    const { group: satellite, materials: glassMats } = createSatellite()
    satellite.position.set(7, 4, -3)
    satellite.scale.set(0, 0, 0)
    satellite.visible = false
    scene.add(satellite)

    // ASCII trail
    const asciiTrail = createAsciiTrail(scene)

    // State
    const state = stateRef.current
    const clock = new THREE.Clock()
    const currentPos = new THREE.Vector3(7, 4, -3)
    const currentRot = new THREE.Euler(0, 0, 0)
    let currentScale = 0

    // ScrollTrigger — extended through team section
    const scrollTrigger = ScrollTrigger.create({
      trigger: '.hero-video-section',
      start: 'top top',
      endTrigger: '.team-section-anchor',
      end: 'bottom bottom',
      scrub: 3,
      onUpdate: (self) => { state.scrollProgress = self.progress },
    })

    let frameId: number

    function animate() {
      frameId = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      const time = clock.getElapsedTime()
      const progress = state.scrollProgress

      // Update shader times
      for (const mat of glassMats) mat.uniforms.uTime.value = time

      // Visibility
      satellite.visible = progress > 0.001

      // Compute divider's Three.js world X from its actual DOM position
      let dividerWorldX = 0
      const dividerEl = document.querySelector('.text-showcase-divider-h')
      if (dividerEl) {
        const pos = domToWorld(dividerEl, camera)
        dividerWorldX = pos.x
      }

      // Compute bento card world positions from DOM
      const bentoEls = document.querySelectorAll('.magic-bento-card')
      const bentoCards: CardPos[] = []
      bentoEls.forEach((el, i) => {
        if (i < 3) bentoCards.push(domToWorld(el, camera)) // Intelligence, Personalization, Visibility
      })

      // Compute team card world positions from fan layout math
      // Cards use: x = distanceFromCenter * 130px, y = |distanceFromCenter| * -40px
      const teamContainer = document.querySelector('.team-section-anchor .relative.mt-20')
      const teamCardPositions: CardPos[] = []
      if (teamContainer) {
        const containerCenter = domToWorld(teamContainer, camera)
        const halfH = Math.tan((camera.fov / 2) * Math.PI / 180) * camera.position.z
        const halfW = halfH * camera.aspect
        const pxToWorldX = (halfW * 2) / window.innerWidth
        const pxToWorldY = (halfH * 2) / window.innerHeight
        const numMembers = 4
        const centerIndex = (numMembers - 1) / 2  // 1.5
        for (let i = 0; i < numMembers; i++) {
          const dist = i - centerIndex
          const offsetX = dist * 130 * pxToWorldX
          const offsetY = Math.abs(dist) * -40 * pxToWorldY
          teamCardPositions.push({
            x: containerCenter.x + offsetX,
            y: containerCenter.y - offsetY  // invert because world Y is up
          })
        }
      }

      // Target
      const target = getTargetTransform(progress, time, dividerWorldX, bentoCards, teamCardPositions)

      // Smooth lerp
      const lf = 1 - Math.pow(1 - LERP_SPEED, delta * 60)
      currentPos.x += (target.pos.x - currentPos.x) * lf
      currentPos.y += (target.pos.y - currentPos.y) * lf
      currentPos.z += (target.pos.z - currentPos.z) * lf
      currentRot.x += (target.rot.x - currentRot.x) * lf
      currentRot.y += (target.rot.y - currentRot.y) * lf
      currentRot.z += (target.rot.z - currentRot.z) * lf
      currentScale += (target.scale - currentScale) * lf

      satellite.position.copy(currentPos)
      satellite.rotation.set(currentRot.x, currentRot.y, currentRot.z)
      satellite.scale.setScalar(currentScale)

      // Trail (active during orbits and behind-bento orbit)
      const trailActive = (progress > 0.05 && progress < 0.50 || progress > 0.82) && progress < 0.96 && satellite.visible
      asciiTrail.update(satellite.position, trailActive, delta)

      // LED pulse
      const led = satellite.getObjectByName('blink-led')
      if (led && led instanceof THREE.Mesh) {
        const mat = led.material as THREE.ShaderMaterial
        mat.uniforms.uOpacity.value = 1.0 + Math.sin(time * 5) * 0.5
      }

      renderer.render(scene, camera)
    }

    animate()

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frameId)
      scrollTrigger.kill()
      asciiTrail.dispose()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="satellite-scroll-canvas" />
}
