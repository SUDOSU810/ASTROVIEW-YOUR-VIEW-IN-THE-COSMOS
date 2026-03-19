import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair, Trophy, RotateCcw, ChevronRight, Star, Zap,
  Clock, ArrowLeft, Heart, Target, Sparkles, Eye, Gamepad2,
  Telescope, Info, Search, X,
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  STAR_CATALOG, CONSTELLATIONS, type ConstellationData, type DifficultyTier,
  getTierConfig, celestialToCartesian, cartesianToCelestial,
  findConstellationAtPoint,
} from '../data/constellationBoundaries';
import './SkyClickGame.css';

/* ═══════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════ */
const SKY_RADIUS = 100;
const CORRECT_SCORE = 10;
const WRONG_PENALTY = 3;
const STREAK_THRESHOLD = 3;
const MAX_HEARTS = 3;

type PageMode = 'explore' | 'game';
type GameState = 'menu' | 'playing' | 'levelup' | 'gameover';

/* Utility */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */
export default function SkyClickGame() {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    raycaster: THREE.Raycaster;
    starPoints: THREE.Points;
    lineGroups: Map<string, THREE.LineSegments>;
    boundaryMeshes: Map<string, THREE.Mesh>;
    highlightGroup: THREE.Group;
    labelSprites: Map<string, THREE.Vector3>;
    animFrame: number;
  } | null>(null);

  /* ── Page mode: explore (Stellarium) vs game ── */
  const [pageMode, setPageMode] = useState<PageMode>('explore');

  /* ── Hide body scrollbar ── */
  useEffect(() => {
    document.documentElement.classList.add('skyclick-active');
    return () => document.documentElement.classList.remove('skyclick-active');
  }, []);

  /* ── Explore state ── */
  const [selectedConstellation, setSelectedConstellation] = useState<ConstellationData | null>(null);
  const [showConstellationLines, setShowConstellationLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  /* ── Game state ── */
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<DifficultyTier>('easy');
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Current target ── */
  const [targetConstellation, setTargetConstellation] = useState<ConstellationData | null>(null);
  const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [scorePop, setScorePop] = useState<number | null>(null);
  const [constellationInfo, setConstellationInfo] = useState<ConstellationData | null>(null);

  /* ── Queue ── */
  const queueRef = useRef<ConstellationData[]>([]);

  /* ── Tier config ── */
  const tierConfig = useMemo(() => getTierConfig(difficulty), [difficulty]);

  /* ── Filtered constellations for search ── */
  const filteredConstellations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return CONSTELLATIONS.filter(c =>
      c.name.toLowerCase().includes(q) || c.abbr.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  /* ═══════════════════════════════════════════════════════
     Three.js Setup
     ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.01);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.zoomSpeed = 0.5;
    controls.rotateSpeed = 0.4;
    controls.minDistance = 0.01;
    controls.maxDistance = 0.01;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 2.5 };

    // ── Stars ──
    const starPositions: number[] = [];
    const starColors: number[] = [];
    const starSizes: number[] = [];

    // Realistic color from magnitude (proxy for B-V color index)
    // Bright stars (low mag) → blue-white; dim stars → warm white/yellow
    const getStarColor = (mag: number): [number, number, number] => {
      const t = Math.max(0, Math.min(1, (mag + 1.5) / 8));
      // Hot (bright) → cool (dim): blue-white→white→yellow→orange
      const r = 0.65 + t * 0.35;
      const g = 0.7 + (1 - t) * 0.3 - t * 0.15;
      const b = 1.0 - t * 0.5;
      return [r, g, b];
    };

    STAR_CATALOG.forEach(star => {
      const [x, y, z] = celestialToCartesian(star.ra, star.dec, SKY_RADIUS);
      starPositions.push(x, y, z);
      const [r, g, b] = getStarColor(star.mag);
      starColors.push(r, g, b);
      // Stellarium-like sizing: exponential brightness falloff
      const brightness = Math.pow(10, -0.4 * star.mag);
      const size = Math.max(1.0, Math.min(8.0, brightness * 6.0));
      starSizes.push(size);
    });

    // Background stars: many more for a rich sky feel
    for (let i = 0; i < 4000; i++) {
      const ra = Math.random() * 360;
      const dec = Math.asin(2 * Math.random() - 1) * (180 / Math.PI); // uniform on sphere
      const [x, y, z] = celestialToCartesian(ra, dec, SKY_RADIUS);
      starPositions.push(x, y, z);
      const warmth = Math.random();
      starColors.push(
        0.55 + warmth * 0.35,
        0.58 + (1 - warmth) * 0.25,
        0.65 + (1 - warmth) * 0.3
      );
      starSizes.push(0.4 + Math.random() * 0.8);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    // Custom shader for round, soft-glow stars (Stellarium-like)
    const starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          // Soft glow: bright center fading to edge
          float alpha = 1.0 - smoothstep(0.0, 0.5, d);
          alpha = pow(alpha, 1.5);
          gl_FragColor = vec4(vColor, alpha * 0.95);
        }
      `,
      vertexColors: true,
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // ── Constellation Lines ──
    const lineGroups = new Map<string, THREE.LineSegments>();
    const starMap = new Map(STAR_CATALOG.map(s => [s.id, s]));

    CONSTELLATIONS.forEach(c => {
      const linePositions: number[] = [];
      c.lines.forEach(([id1, id2]) => {
        const s1 = starMap.get(id1);
        const s2 = starMap.get(id2);
        if (s1 && s2) {
          const [x1, y1, z1] = celestialToCartesian(s1.ra, s1.dec, SKY_RADIUS * 0.999);
          const [x2, y2, z2] = celestialToCartesian(s2.ra, s2.dec, SKY_RADIUS * 0.999);
          linePositions.push(x1, y1, z1, x2, y2, z2);
        }
      });
      if (linePositions.length > 0) {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x3a7bbd, transparent: true, opacity: 0.35, linewidth: 1,
        });
        const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
        lineSegments.visible = true;
        lineGroups.set(c.abbr, lineSegments);
        scene.add(lineSegments);
      }
    });

    // ── Label positions (centroid of each constellation's stars) ──
    const labelSprites = new Map<string, THREE.Vector3>();
    CONSTELLATIONS.forEach(c => {
      const cStars = c.starIds.map(id => starMap.get(id)).filter(Boolean) as typeof STAR_CATALOG;
      if (cStars.length > 0) {
        const avgRa = cStars.reduce((s, st) => s + st.ra, 0) / cStars.length;
        const avgDec = cStars.reduce((s, st) => s + st.dec, 0) / cStars.length;
        const [x, y, z] = celestialToCartesian(avgRa, avgDec, SKY_RADIUS * 0.995);
        labelSprites.set(c.abbr, new THREE.Vector3(x, y, z));
      }
    });

    // Boundary meshes placeholder
    const boundaryMeshes = new Map<string, THREE.Mesh>();

    // Highlight group
    const highlightGroup = new THREE.Group();
    scene.add(highlightGroup);

    // Ambient light
    scene.add(new THREE.AmbientLight(0x333344, 0.5));

    // ── Milky Way band ──
    const milkyWayGeo = new THREE.SphereGeometry(SKY_RADIUS * 0.99, 64, 64);
    const milkyWayCanvas = document.createElement('canvas');
    milkyWayCanvas.width = 1024;
    milkyWayCanvas.height = 512;
    const ctx = milkyWayCanvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(8,12,30,0)');
    grad.addColorStop(0.3, 'rgba(12,18,45,0)');
    grad.addColorStop(0.42, 'rgba(18,28,60,0.06)');
    grad.addColorStop(0.48, 'rgba(22,35,75,0.12)');
    grad.addColorStop(0.52, 'rgba(25,38,80,0.14)');
    grad.addColorStop(0.58, 'rgba(18,28,60,0.06)');
    grad.addColorStop(0.7, 'rgba(12,18,45,0)');
    grad.addColorStop(1, 'rgba(8,12,30,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);
    // Add subtle "dust" noise
    for (let i = 0; i < 2000; i++) {
      const px = Math.random() * 1024;
      const py = 200 + (Math.random() - 0.5) * 160;
      const alpha = Math.random() * 0.03;
      ctx.fillStyle = `rgba(100,120,180,${alpha})`;
      ctx.fillRect(px, py, 2, 2);
    }
    const milkyWayTex = new THREE.CanvasTexture(milkyWayCanvas);
    const milkyWayMat = new THREE.MeshBasicMaterial({
      map: milkyWayTex, transparent: true, side: THREE.BackSide, depthWrite: false,
    });
    scene.add(new THREE.Mesh(milkyWayGeo, milkyWayMat));

    // ── Nebula glows ──
    const nebulaColors = [
      { ra: 83, dec: -5, color: [255, 80, 120], size: 15 }, // Orion Nebula
      { ra: 280, dec: 33, color: [60, 140, 255], size: 12 }, // Ring Nebula area
      { ra: 202, dec: -12, color: [80, 100, 200], size: 10 }, // Virgo cluster
    ];
    nebulaColors.forEach(n => {
      const nebulaGeo = new THREE.SphereGeometry(n.size, 16, 16);
      const [nx, ny, nz] = celestialToCartesian(n.ra, n.dec, SKY_RADIUS * 0.98);
      const nebulaMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`rgb(${n.color[0]},${n.color[1]},${n.color[2]})`),
        transparent: true, opacity: 0.04, side: THREE.BackSide, depthWrite: false,
      });
      const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
      nebulaMesh.position.set(nx, ny, nz);
      scene.add(nebulaMesh);
    });

    // ── Animation Loop ──
    let time = 0;
    const animate = () => {
      const animFrame = requestAnimationFrame(animate);
      time += 0.003;
      sceneRef.current!.animFrame = animFrame;
      controls.update();

      // Twinkle
      const sizes = starGeometry.getAttribute('size') as THREE.BufferAttribute;
      for (let i = 0; i < STAR_CATALOG.length; i++) {
        const brightness = Math.pow(10, -0.4 * STAR_CATALOG[i].mag);
        const baseSz = Math.max(1.0, Math.min(8.0, brightness * 6.0));
        sizes.setX(i, baseSz * (0.9 + 0.1 * Math.sin(time * 2.0 + i * 1.7)));
      }
      sizes.needsUpdate = true;

      // Update HTML labels position
      if (labelContainerRef.current) {
        const labelEls = labelContainerRef.current.querySelectorAll<HTMLDivElement>('[data-abbr]');
        labelEls.forEach(el => {
          const abbr = el.dataset.abbr!;
          const pos = labelSprites.get(abbr);
          if (!pos) return;
          const projected = pos.clone().project(camera);
          const x = (projected.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-projected.y * 0.5 + 0.5) * container.clientHeight;
          // Check if behind camera
          const behind = projected.z > 1;
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          el.style.opacity = behind ? '0' : '0.7';
          el.style.display = behind ? 'none' : '';
        });
      }

      renderer.render(scene, camera);
    };

    const animFrame = requestAnimationFrame(animate);

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = {
      scene, camera, renderer, controls, raycaster,
      starPoints, lineGroups, boundaryMeshes, highlightGroup, labelSprites, animFrame,
    };

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  /* ═══════════════════════════════════════════════════════
     Update constellation lines visibility
     ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!sceneRef.current) return;
    const { lineGroups } = sceneRef.current;
    if (pageMode === 'explore') {
      lineGroups.forEach(l => {
        (l.material as THREE.LineBasicMaterial).opacity = showConstellationLines ? 0.35 : 0;
        (l.material as THREE.LineBasicMaterial).color.setHex(0x3a7bbd);
      });
    } else {
      const showLines = tierConfig.showLines;
      lineGroups.forEach(l => {
        (l.material as THREE.LineBasicMaterial).opacity = showLines ? 0.3 : 0.05;
        (l.material as THREE.LineBasicMaterial).color.setHex(0x1a3a5c);
      });
    }
  }, [pageMode, showConstellationLines, tierConfig.showLines]);

  /* ═══════════════════════════════════════════════════════
     Timer (game mode only)
     ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    if (pageMode !== 'game' || gameState !== 'playing' || feedback) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageMode, gameState, round, feedback]);

  /* ═══════════════════════════════════════════════════════
     Highlight constellation in scene
     ═══════════════════════════════════════════════════════ */
  const highlightConstellation = useCallback((constellation: ConstellationData, color: number, duration: number) => {
    if (!sceneRef.current) return;
    const { highlightGroup, lineGroups } = sceneRef.current;

    // Clear
    while (highlightGroup.children.length > 0) {
      const child = highlightGroup.children[0];
      highlightGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    // Lines glow
    const existingLines = lineGroups.get(constellation.abbr);
    if (existingLines) {
      const glowGeo = existingLines.geometry.clone();
      const glowMat = new THREE.LineBasicMaterial({
        color, transparent: true, opacity: 0.85, linewidth: 2,
      });
      highlightGroup.add(new THREE.LineSegments(glowGeo, glowMat));
    }

    // Boundary fill
    const boundaryPts = constellation.boundary.map(p =>
      new THREE.Vector3(...celestialToCartesian(p.ra, p.dec, SKY_RADIUS * 0.997))
    );
    if (boundaryPts.length >= 3) {
      const centroid = new THREE.Vector3();
      boundaryPts.forEach(p => centroid.add(p));
      centroid.divideScalar(boundaryPts.length);
      centroid.normalize().multiplyScalar(SKY_RADIUS * 0.997);

      const vertices: number[] = [];
      for (let i = 0; i < boundaryPts.length; i++) {
        const j = (i + 1) % boundaryPts.length;
        vertices.push(centroid.x, centroid.y, centroid.z);
        vertices.push(boundaryPts[i].x, boundaryPts[i].y, boundaryPts[i].z);
        vertices.push(boundaryPts[j].x, boundaryPts[j].y, boundaryPts[j].z);
      }
      const shape = new THREE.BufferGeometry();
      shape.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const mat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false,
      });
      highlightGroup.add(new THREE.Mesh(shape, mat));
    }

    if (duration > 0) {
      setTimeout(() => {
        if (!sceneRef.current) return;
        while (highlightGroup.children.length > 0) {
          const child = highlightGroup.children[0];
          highlightGroup.remove(child);
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        }
      }, duration);
    }
  }, []);

  /* ═══════════════════════════════════════════════════════
     EXPLORE MODE — Click to learn
     ═══════════════════════════════════════════════════════ */
  const handleExploreClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (pageMode !== 'explore' || !sceneRef.current) return;

    const { camera, raycaster, renderer } = sceneRef.current;
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    const skyGeo = new THREE.SphereGeometry(SKY_RADIUS, 64, 64);
    const skyMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    const intersects = raycaster.intersectObject(skyMesh);
    skyGeo.dispose();
    skyMat.dispose();

    if (intersects.length === 0) {
      setSelectedConstellation(null);
      highlightConstellation(CONSTELLATIONS[0], 0, 0); // clear highlight
      return;
    }

    const point = intersects[0].point;
    const { ra, dec } = cartesianToCelestial(point.x, point.y, point.z);
    const clicked = findConstellationAtPoint(ra, dec, CONSTELLATIONS);

    if (clicked) {
      setSelectedConstellation(clicked);
      highlightConstellation(clicked, 0x00f5ff, 0); // persistent highlight
    } else {
      setSelectedConstellation(null);
      // Clear highlights
      if (sceneRef.current) {
        const { highlightGroup } = sceneRef.current;
        while (highlightGroup.children.length > 0) {
          const child = highlightGroup.children[0];
          highlightGroup.remove(child);
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        }
      }
    }
  }, [pageMode, highlightConstellation]);

  /* Navigate to a specific constellation */
  const navigateToConstellation = useCallback((c: ConstellationData) => {
    if (!sceneRef.current) return;
    const { controls, camera } = sceneRef.current;
    // Compute center of constellation
    const starMap = new Map(STAR_CATALOG.map(s => [s.id, s]));
    const cStars = c.starIds.map(id => starMap.get(id)).filter(Boolean) as typeof STAR_CATALOG;
    if (cStars.length === 0) return;
    const avgRa = cStars.reduce((s, st) => s + st.ra, 0) / cStars.length;
    const avgDec = cStars.reduce((s, st) => s + st.dec, 0) / cStars.length;
    const [x, y, z] = celestialToCartesian(avgRa, avgDec, SKY_RADIUS * 0.5);
    const target = new THREE.Vector3(x, y, z);
    controls.target.copy(target.clone().normalize().multiplyScalar(SKY_RADIUS));
    camera.lookAt(target);
    controls.update();
    setSelectedConstellation(c);
    highlightConstellation(c, 0x00f5ff, 0);
    setShowSearch(false);
    setSearchQuery('');
  }, [highlightConstellation]);

  /* ═══════════════════════════════════════════════════════
     GAME MODE — Click Handler
     ═══════════════════════════════════════════════════════ */
  const lastClickTime = useRef(0);

  const handleGameClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (pageMode !== 'game' || gameState !== 'playing' || feedback || !targetConstellation || !sceneRef.current) return;

    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    lastClickTime.current = now;

    const { camera, raycaster, renderer } = sceneRef.current;
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    const skyGeo = new THREE.SphereGeometry(SKY_RADIUS, 64, 64);
    const skyMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    const intersects = raycaster.intersectObject(skyMesh);
    skyGeo.dispose();
    skyMat.dispose();

    if (intersects.length === 0) return;

    const point = intersects[0].point;
    const { ra, dec } = cartesianToCelestial(point.x, point.y, point.z);
    const clicked = findConstellationAtPoint(ra, dec, tierConfig.constellations);

    if (clicked && clicked.abbr === targetConstellation.abbr) {
      const streakMultiplier = streak >= STREAK_THRESHOLD ? 2 : 1;
      const timeBonus = Math.floor(timeLeft / 2);
      const points = (CORRECT_SCORE + timeBonus) * streakMultiplier * targetConstellation.scoreWeight;

      setScore(s => s + points);
      setScorePop(points);
      setTimeout(() => setScorePop(null), 800);
      setStreak(s => s + 1);
      setFeedback('correct');
      setFeedbackText(`✓ ${clicked.name}`);
      setConstellationInfo(clicked);
      highlightConstellation(clicked, 0x4ade80, 2000);
      setTimeout(() => advanceRound(), 1800);
    } else {
      setScore(s => Math.max(0, s - WRONG_PENALTY));
      setStreak(0);
      setFeedback('wrong');
      setFeedbackText(clicked ? `✗ That's ${clicked.name}` : '✗ No constellation there');
      if (clicked) highlightConstellation(clicked, 0xf87171, 1500);
      setTimeout(() => highlightConstellation(targetConstellation, 0xfbbf24, 1500), 800);

      setHearts(prev => {
        const newHearts = prev - 1;
        if (newHearts <= 0) {
          setTimeout(() => setGameState('gameover'), 1800);
          return 0;
        }
        setTimeout(() => advanceRound(), 1800);
        return newHearts;
      });
    }
  }, [pageMode, gameState, feedback, targetConstellation, tierConfig.constellations, streak, timeLeft, highlightConstellation]);

  /* ═══════════════════════════════════════════════════════
     Game Flow Helpers
     ═══════════════════════════════════════════════════════ */
  const advanceRound = useCallback(() => {
    const nextRound = round + 1;
    if (nextRound >= queueRef.current.length) {
      setGameState('levelup');
      return;
    }
    setRound(nextRound);
    setTargetConstellation(queueRef.current[nextRound]);
    setTimeLeft(tierConfig.timerSeconds);
    setFeedback(null);
    setConstellationInfo(null);
  }, [round, tierConfig.timerSeconds]);

  const handleTimeout = useCallback(() => {
    setStreak(0);
    setScore(s => Math.max(0, s - 2));
    setFeedback('wrong');
    setFeedbackText('⏰ Time\'s Up!');
    setHearts(prev => {
      const newHearts = prev - 1;
      if (newHearts <= 0) {
        setTimeout(() => setGameState('gameover'), 1500);
        return 0;
      }
      setTimeout(() => advanceRound(), 1500);
      return newHearts;
    });
  }, [advanceRound]);

  const startGame = useCallback(() => {
    const pool = tierConfig.constellations;
    const shuffled = shuffle(pool);
    queueRef.current = shuffled;
    setScore(0);
    setHearts(MAX_HEARTS);
    setStreak(0);
    setRound(0);
    setTotalRounds(shuffled.length);
    setFeedback(null);
    setConstellationInfo(null);
    setSelectedConstellation(null);
    setGameState('playing');
    setTargetConstellation(shuffled[0]);
    setTimeLeft(tierConfig.timerSeconds);
  }, [tierConfig]);

  const handleRestart = () => {
    setGameState('menu');
    setScore(0);
    setHearts(MAX_HEARTS);
    setStreak(0);
    setFeedback(null);
    setConstellationInfo(null);
  };

  const handleNextDifficulty = () => {
    if (difficulty === 'easy') setDifficulty('medium');
    else if (difficulty === 'medium') setDifficulty('hard');
    setGameState('menu');
  };

  const switchToExplore = () => {
    setPageMode('explore');
    setGameState('menu');
    setFeedback(null);
    setSelectedConstellation(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const switchToGame = () => {
    setPageMode('game');
    setSelectedConstellation(null);
    // Clear explore highlights
    if (sceneRef.current) {
      const { highlightGroup } = sceneRef.current;
      while (highlightGroup.children.length > 0) {
        const child = highlightGroup.children[0];
        highlightGroup.remove(child);
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      }
    }
  };

  /* ═══════════════════════════════════════════════════════
     Unified click handler
     ═══════════════════════════════════════════════════════ */
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (pageMode === 'explore') handleExploreClick(e);
    else handleGameClick(e);
  }, [pageMode, handleExploreClick, handleGameClick]);

  /* Timer bar values */
  const timerFraction = gameState === 'playing' ? timeLeft / tierConfig.timerSeconds : 1;
  const timerColor = timerFraction > 0.5 ? '#4ade80' : timerFraction > 0.25 ? '#fbbf24' : '#f87171';

  /* ═══════════════════════════════════════════════════════
     JSX
     ═══════════════════════════════════════════════════════ */
  return (
    <div className="sky-click-game">
      {/* ── Three.js Canvas ── */}
      <div ref={mountRef} className="sky-click-canvas" onClick={handleCanvasClick} />

      {/* ── HTML Constellation Labels (explore mode) ── */}
      {pageMode === 'explore' && showLabels && (
        <div ref={labelContainerRef} className="sky-click-labels-container">
          {CONSTELLATIONS.map(c => (
            <div
              key={c.abbr}
              data-abbr={c.abbr}
              className={`sky-click-label ${selectedConstellation?.abbr === c.abbr ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedConstellation(c);
                highlightConstellation(c, 0x00f5ff, 0);
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      )}

      {/* ── Top-left toolbar: Back + Mode Toggle ── */}
      <div className="sky-click-toolbar">
        <button className="sky-click-back-btn" onClick={() => navigate('/sky-events')}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* ═══════ MODE TOGGLE ═══════ */}
        <div className="sky-mode-toggle">
          <button
            className={`sky-mode-btn ${pageMode === 'explore' ? 'active' : ''}`}
            onClick={switchToExplore}
          >
            <Telescope className="w-4 h-4" />
            Explore
          </button>
          <button
            className={`sky-mode-btn ${pageMode === 'game' ? 'active' : ''}`}
            onClick={switchToGame}
          >
            <Gamepad2 className="w-4 h-4" />
            Game
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          EXPLORE MODE UI
          ═══════════════════════════════════════════ */}
      {pageMode === 'explore' && (
        <>
          {/* Explore Top Bar */}
          <div className="sky-explore-topbar">
            {/* The brand logo was removed here to prevent overlap with the top-left toolbar */}
            <div className="sky-explore-controls" style={{ marginLeft: 'auto' }}>
              <button
                className={`sky-explore-toggle ${showConstellationLines ? 'active' : ''}`}
                onClick={() => setShowConstellationLines(!showConstellationLines)}
                title="Toggle constellation lines"
              >
                <Star className="w-4 h-4" />
                Lines
              </button>
              <button
                className={`sky-explore-toggle ${showLabels ? 'active' : ''}`}
                onClick={() => setShowLabels(!showLabels)}
                title="Toggle labels"
              >
                <Info className="w-4 h-4" />
                Labels
              </button>
              <button
                className="sky-explore-toggle"
                onClick={() => setShowSearch(!showSearch)}
                title="Search constellations"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Panel */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                className="sky-search-panel"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="sky-search-input-wrap">
                  <Search className="w-4 h-4" style={{ color: '#a0a7c0' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search constellations..."
                    className="sky-search-input"
                    autoFocus
                  />
                  {searchQuery && (
                    <button className="sky-search-clear" onClick={() => setSearchQuery('')}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {filteredConstellations.length > 0 && (
                  <div className="sky-search-results">
                    {filteredConstellations.map(c => (
                      <button
                        key={c.abbr}
                        className="sky-search-result"
                        onClick={() => navigateToConstellation(c)}
                      >
                        <Star className="w-3.5 h-3.5" style={{ color: '#00f5ff' }} />
                        <span>{c.name}</span>
                        <span className="sky-search-abbr">{c.abbr}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Constellation Info Panel */}
          <AnimatePresence>
            {selectedConstellation && (
              <motion.div
                className="sky-explore-info-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={selectedConstellation.abbr}
              >
                <button className="sky-explore-info-close" onClick={() => {
                  setSelectedConstellation(null);
                  if (sceneRef.current) {
                    const { highlightGroup } = sceneRef.current;
                    while (highlightGroup.children.length > 0) {
                      const child = highlightGroup.children[0];
                      highlightGroup.remove(child);
                      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
                        child.geometry.dispose();
                        (child.material as THREE.Material).dispose();
                      }
                    }
                  }
                }}>
                  <X className="w-4 h-4" />
                </button>
                <div className="sky-explore-info-abbr">{selectedConstellation.abbr}</div>
                <h3 className="sky-explore-info-name">{selectedConstellation.name}</h3>
                <div className="sky-explore-info-difficulty" style={{
                  color: selectedConstellation.difficulty === 'easy' ? '#4ade80'
                    : selectedConstellation.difficulty === 'medium' ? '#fbbf24' : '#f87171'
                }}>
                  {selectedConstellation.difficulty === 'easy' ? '★' : selectedConstellation.difficulty === 'medium' ? '★★' : '★★★'} {selectedConstellation.difficulty.charAt(0).toUpperCase() + selectedConstellation.difficulty.slice(1)}
                </div>
                <p className="sky-explore-info-desc">{selectedConstellation.description}</p>
                <div className="sky-explore-info-stats">
                  <div className="sky-explore-info-stat">
                    <span>Stars</span>
                    <strong>{selectedConstellation.starIds.length}</strong>
                  </div>
                  <div className="sky-explore-info-stat">
                    <span>Connections</span>
                    <strong>{selectedConstellation.lines.length}</strong>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom hint */}
          <div className="sky-explore-hint">
            <Eye className="w-4 h-4" />
            <span>Drag to explore · Click constellations to learn · Scroll to zoom</span>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════
          GAME MODE UI
          ═══════════════════════════════════════════ */}
      {pageMode === 'game' && (
        <>
          {/* ═══════ GAME MENU ═══════ */}
          <AnimatePresence>
            {gameState === 'menu' && (
              <motion.div
                className="sky-click-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="sky-click-menu-badge">
                  <Crosshair className="w-4 h-4" />
                  <span>SKY CLICK CHALLENGE</span>
                </div>

                <h1>Sky Click</h1>

                <p className="sky-click-menu-sub">
                  Find and click on constellations in the 3D star sky.
                  Test your celestial navigation skills!
                </p>

                <div className="sky-click-difficulty-select">
                  {(['easy', 'medium', 'hard'] as DifficultyTier[]).map(d => {
                    const cfg = getTierConfig(d);
                    const stars = d === 'easy' ? 1 : d === 'medium' ? 2 : 3;
                    return (
                      <button
                        key={d}
                        className={`sky-click-diff-btn ${difficulty === d ? 'selected' : ''}`}
                        style={{
                          '--diff-color': cfg.color,
                          '--diff-glow': cfg.color + '30',
                        } as React.CSSProperties}
                        onClick={() => setDifficulty(d)}
                      >
                        <div className="sky-click-diff-stars">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="w-4 h-4" style={{ color: cfg.color, fill: cfg.color }} />
                          ))}
                        </div>
                        <span>{cfg.label}</span>
                        <span className="sky-click-diff-label">
                          {cfg.constellations.length} constellations · {cfg.timerSeconds}s
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button className="sky-click-start-btn" onClick={startGame}>
                  <Target className="w-5 h-5" />
                  Start Challenge
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="sky-click-instructions">
                  <div className="sky-click-instruction">
                    <Eye className="w-4 h-4" /> Drag to look around
                  </div>
                  <div className="sky-click-instruction">
                    <Crosshair className="w-4 h-4" /> Click on target constellation
                  </div>
                  <div className="sky-click-instruction">
                    <Zap className="w-4 h-4" /> Build streaks for 2x multiplier
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ PLAYING HUD ═══════ */}
          <AnimatePresence>
            {gameState === 'playing' && (
              <motion.div
                className="sky-click-hud"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="sky-click-topbar">
                  <div className="sky-click-brand">
                    <div className="sky-click-brand-icon">
                      <Crosshair className="w-5 h-5" style={{ color: '#00f5ff' }} />
                    </div>
                    <h2>Sky Click</h2>
                  </div>

                  <div className="sky-click-stats-bar">
                    <div className="sky-click-stat">
                      <Star className="w-4 h-4" style={{ color: tierConfig.color }} />
                      <span style={{ color: tierConfig.color }}>{tierConfig.label}</span>
                    </div>
                    <div className="sky-click-stat">
                      <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />
                      <span className="sky-click-stat-value">{score}</span>
                    </div>
                    <div className="sky-click-stat">
                      <Target className="w-4 h-4" style={{ color: '#00f5ff' }} />
                      <span className="sky-click-stat-value">{round + 1}/{totalRounds}</span>
                    </div>
                    <div className="sky-click-hearts">
                      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                        <span key={i} className={`sky-click-heart ${i >= hearts ? 'lost' : ''}`}>❤️</span>
                      ))}
                    </div>
                  </div>
                </div>

                {!feedback && (
                  <div className="sky-click-timer-wrap">
                    <div className="sky-click-timer">
                      <Clock className="w-3.5 h-3.5" style={{ color: timerColor }} />
                      <div className="sky-click-timer-track">
                        <div className="sky-click-timer-fill" style={{ width: `${timerFraction * 100}%`, background: timerColor }} />
                      </div>
                      <span className="sky-click-timer-text" style={{ color: timerColor }}>{timeLeft}s</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ TARGET PROMPT ═══════ */}
          <AnimatePresence>
            {gameState === 'playing' && targetConstellation && !feedback && (
              <motion.div
                className="sky-click-target"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                key={targetConstellation.abbr}
              >
                <div className="sky-click-target-card">
                  <div className="sky-click-target-label">Find this constellation</div>
                  <div className="sky-click-target-name">{targetConstellation.name}</div>
                  {tierConfig.showBoundaryHint && (
                    <div className="sky-click-target-hint">{targetConstellation.description}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ STREAK ═══════ */}
          {gameState === 'playing' && streak >= STREAK_THRESHOLD && (
            <div className="sky-click-streak">
              <div className="sky-click-streak-count">{streak}</div>
              <div className="sky-click-streak-label">Streak</div>
              <div className="sky-click-streak-multiplier">×2 Bonus</div>
            </div>
          )}

          {/* ═══════ FEEDBACK ═══════ */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                className="sky-click-feedback"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className={`sky-click-feedback-card ${
                  feedback === 'correct' ? 'sky-click-feedback-correct' : 'sky-click-feedback-wrong'
                }`}>
                  <div className="sky-click-feedback-emoji">{feedback === 'correct' ? '✨' : '💫'}</div>
                  {feedbackText}
                  {constellationInfo && feedback === 'correct' && (
                    <div className="sky-click-feedback-tooltip">{constellationInfo.description}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ SCORE POP ═══════ */}
          <AnimatePresence>
            {scorePop !== null && (
              <motion.div
                className="sky-click-score-pop"
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -60, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{ color: '#4ade80' }}
              >
                +{scorePop}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ LEVEL UP ═══════ */}
          <AnimatePresence>
            {gameState === 'levelup' && (
              <motion.div className="sky-click-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  className="sky-click-overlay-card"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <div className="sky-click-levelup-stars">✦ ✦ ✦</div>
                  <h2 style={{
                    background: `linear-gradient(135deg, ${tierConfig.color}, #fff)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {difficulty === 'hard' ? '🌟 Constellation Master!' : 'Challenge Complete!'}
                  </h2>
                  <p>{difficulty === 'hard' ? 'You\'ve mastered all difficulty tiers!' : `You conquered ${tierConfig.label} difficulty!`}</p>
                  <div className="sky-click-overlay-stats">
                    <div className="sky-click-overlay-stat">
                      <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} /> Score: {score}
                    </div>
                    <div className="sky-click-overlay-stat">
                      <Heart className="w-4 h-4" style={{ color: '#f87171' }} /> Hearts: {hearts}/{MAX_HEARTS}
                    </div>
                  </div>
                  <div className="sky-click-overlay-btns">
                    {difficulty !== 'hard' && (
                      <button className="sky-click-btn sky-click-btn-primary" onClick={handleNextDifficulty}>
                        <Sparkles className="w-4 h-4" /> Next Difficulty <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    <button className="sky-click-btn" onClick={handleRestart}>
                      <RotateCcw className="w-4 h-4" /> {difficulty === 'hard' ? 'Play Again' : 'Main Menu'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ GAME OVER ═══════ */}
          <AnimatePresence>
            {gameState === 'gameover' && (
              <motion.div className="sky-click-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  className="sky-click-overlay-card"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <Heart className="w-16 h-16" style={{ color: '#f87171', fill: '#f87171', margin: '0 auto 1rem' }} />
                  <h2 style={{
                    background: 'linear-gradient(135deg, #f87171, #fca5a5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>Out of Hearts</h2>
                  <p>The cosmos is vast! Keep practicing to improve.</p>
                  <div className="sky-click-overlay-stats">
                    <div className="sky-click-overlay-stat">
                      <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} /> Score: {score}
                    </div>
                    <div className="sky-click-overlay-stat">
                      <Target className="w-4 h-4" style={{ color: '#00f5ff' }} /> Round: {round + 1}/{totalRounds}
                    </div>
                  </div>
                  <div className="sky-click-overlay-btns">
                    <button className="sky-click-btn sky-click-btn-primary" onClick={() => { handleRestart(); startGame(); }}>
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                    <button className="sky-click-btn" onClick={handleRestart}>
                      <ArrowLeft className="w-4 h-4" /> Main Menu
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
