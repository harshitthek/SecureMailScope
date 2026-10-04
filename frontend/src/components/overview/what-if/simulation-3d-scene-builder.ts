import * as THREE from "three";

export interface NodePositions {
  client: THREE.Vector3;
  adversary: THREE.Vector3;
  gateway: THREE.Vector3;
  vault: THREE.Vector3;
  tapJunction: THREE.Vector3;
}

export const NODE_POSITIONS: NodePositions = {
  client: new THREE.Vector3(-7.2, 0, 0),
  adversary: new THREE.Vector3(-3.4, 3.8, -1.4),
  gateway: new THREE.Vector3(0, 0, 0),
  vault: new THREE.Vector3(6.2, 0, 0),
  tapJunction: new THREE.Vector3(-3.4, 0, 0),
};

export interface SceneAssets {
  clientGroup: THREE.Group;
  clientMesh: THREE.Mesh;
  clientOrbit: THREE.Mesh;
  adversaryGroup: THREE.Group;
  adversaryCore: THREE.Mesh;
  adversaryRing: THREE.Mesh;
  adversaryBeam: THREE.Mesh;
  adversaryCage: THREE.Mesh;
  gatewayGroup: THREE.Group;
  shieldMesh: THREE.Mesh;
  glassMesh: THREE.Mesh;
  coreMesh: THREE.Mesh;
  torus1: THREE.Mesh;
  torus2: THREE.Mesh;
  obelisks: THREE.Mesh[];
  vaultGroup: THREE.Group;
  vaultTowers: THREE.Mesh[];
  vaultLock: THREE.Mesh;
  vaultLeds: THREE.Mesh[];
  radarSweep: THREE.Line;
  radarRings: THREE.Group;
  motes: THREE.Points;
  shockwaveMesh: THREE.Mesh;
  sparkPoints: THREE.Points;
  sparkGeom: THREE.BufferGeometry;
  sparkVelocities: Float32Array;
  pointLightGateway: THREE.PointLight;
  pointLightAdversary: THREE.PointLight;
  pointLightClient: THREE.PointLight;
  pointLightVault: THREE.PointLight;
  textures: {
    cyan: THREE.CanvasTexture;
    emerald: THREE.CanvasTexture;
    red: THREE.CanvasTexture;
    amber: THREE.CanvasTexture;
    purple: THREE.CanvasTexture;
  };
  curves: {
    ingress: THREE.CatmullRomCurve3;
    tap: THREE.CatmullRomCurve3;
    egress: THREE.CatmullRomCurve3;
  };
}

export function createProceduralGlowTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.25, color);
    grad.addColorStop(0.65, color.replace("1)", "0.15)"));
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

export function buildCyberGround(scene: THREE.Scene): { radarSweep: THREE.Line; radarRings: THREE.Group; motes: THREE.Points } {
  // Main Dual Cyber Grid
  const gridHelper = new THREE.GridHelper(44, 44, 0x38bdf8, 0x14161f);
  gridHelper.position.y = -2.5;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.4;
  scene.add(gridHelper);

  // Holographic Concentric Radar Rings
  const radarRings = new THREE.Group();
  radarRings.position.set(0, -2.48, 0);
  radarRings.rotation.x = Math.PI / 2;

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.2 });
  [2.5, 5.5, 9.5, 14].forEach((radius) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 0.06, 64), ringMat);
    radarRings.add(ring);
  });
  scene.add(radarRings);

  // Radar Rotating Sweep Needle Line
  const sweepGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(14, 0, 0),
  ]);
  const sweepMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.4 });
  const radarSweep = new THREE.Line(sweepGeom, sweepMat);
  radarSweep.position.set(0, -2.47, 0);
  radarSweep.rotation.x = Math.PI / 2;
  scene.add(radarSweep);

  // Ambient Floating Cyber Motes (Digital Dust)
  const MOTE_COUNT = 180;
  const moteGeom = new THREE.BufferGeometry();
  const motePositions = new Float32Array(MOTE_COUNT * 3);
  for (let i = 0; i < MOTE_COUNT; i++) {
    motePositions[i * 3] = (Math.random() - 0.5) * 28;
    motePositions[i * 3 + 1] = Math.random() * 9 - 2;
    motePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  moteGeom.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.12,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });
  const motes = new THREE.Points(moteGeom, moteMat);
  scene.add(motes);

  return { radarSweep, radarRings, motes };
}

export function buildClientStation(): { group: THREE.Group; mesh: THREE.Mesh; orbit: THREE.Mesh } {
  const group = new THREE.Group();
  group.position.copy(NODE_POSITIONS.client);

  // Pedestal base
  const baseGeom = new THREE.CylinderGeometry(2.0, 2.4, 0.3, 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x141720, metalness: 0.85, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = -2.35;
  group.add(base);

  // Terminal column
  const colGeom = new THREE.CylinderGeometry(0.8, 1.0, 1.5, 6);
  const colMat = new THREE.MeshStandardMaterial({ color: 0x0f1118, metalness: 0.9, roughness: 0.2 });
  const column = new THREE.Mesh(colGeom, colMat);
  column.position.y = -1.5;
  group.add(column);

  // Holographic Client Core Polyhedron
  const meshGeom = new THREE.DodecahedronGeometry(1.4, 0);
  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    wireframe: true,
    roughness: 0.2,
    metalness: 0.8,
  });
  const mesh = new THREE.Mesh(meshGeom, meshMat);
  group.add(mesh);

  // Inner core sphere
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  group.add(core);

  // Orbiting scanner ring
  const orbitGeom = new THREE.TorusGeometry(2.0, 0.04, 16, 64);
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
  const orbit = new THREE.Mesh(orbitGeom, orbitMat);
  orbit.rotation.x = Math.PI / 3;
  group.add(orbit);

  // Vertical holographic beacon spire
  const spireGeom = new THREE.CylinderGeometry(0.05, 0.18, 4.0, 8);
  const spireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
  const spire = new THREE.Mesh(spireGeom, spireMat);
  spire.position.y = 2.2;
  group.add(spire);

  return { group, mesh, orbit };
}

export function buildAdversaryStation(): {
  group: THREE.Group;
  core: THREE.Mesh;
  ring: THREE.Mesh;
  beam: THREE.Mesh;
  cage: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.position.copy(NODE_POSITIONS.adversary);

  // Inverted sinister stealth polyhedral drone
  const coreGeom = new THREE.ConeGeometry(1.2, 2.2, 5);
  coreGeom.rotateX(Math.PI);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.9,
    roughness: 0.2,
    wireframe: true,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  group.add(core);

  // Hazard warning ring
  const ringGeom = new THREE.TorusGeometry(1.6, 0.05, 16, 48);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Active wiretap targeting laser beam pointing to wire junction
  const beamGeom = new THREE.CylinderGeometry(0.05, 0.09, 4.4, 8);
  beamGeom.translate(0, -2.2, 0);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75 });
  const beam = new THREE.Mesh(beamGeom, beamMat);
  group.add(beam);

  // Holographic Quarantine Containment Cage (Active in Stages 3-4)
  const cageGeom = new THREE.CylinderGeometry(1.9, 1.9, 3.2, 12, 1, true);
  const cageMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    wireframe: true,
    transparent: true,
    opacity: 0,
  });
  const cage = new THREE.Mesh(cageGeom, cageMat);
  group.add(cage);

  return { group, core, ring, beam, cage };
}

export function buildGatewayStation(): {
  group: THREE.Group;
  shieldMesh: THREE.Mesh;
  glassMesh: THREE.Mesh;
  coreMesh: THREE.Mesh;
  torus1: THREE.Mesh;
  torus2: THREE.Mesh;
  obelisks: THREE.Mesh[];
  shockwaveMesh: THREE.Mesh;
  sparkPoints: THREE.Points;
  sparkGeom: THREE.BufferGeometry;
  sparkVelocities: Float32Array;
} {
  const group = new THREE.Group();
  group.position.copy(NODE_POSITIONS.gateway);

  // Hexagonal fortress base
  const baseGeom = new THREE.CylinderGeometry(3.4, 3.9, 0.4, 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x161822, metalness: 0.9, roughness: 0.2 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = -2.3;
  group.add(base);

  // Outer Geodesic Energy Shield
  const shieldGeom = new THREE.IcosahedronGeometry(2.9, 1);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
  group.add(shieldMesh);

  // Inner Translucent Holographic Forcefield Sphere
  const glassGeom = new THREE.SphereGeometry(2.45, 32, 32);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    metalness: 0.85,
  });
  const glassMesh = new THREE.Mesh(glassGeom, glassMat);
  group.add(glassMesh);

  // Counter-rotating PQC Gimbal Rings (Cyan ML-KEM-768 + Emerald X25519)
  const torus1Geom = new THREE.TorusGeometry(3.1, 0.06, 16, 64);
  const torus1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
  const torus1 = new THREE.Mesh(torus1Geom, torus1Mat);
  group.add(torus1);

  const torus2Geom = new THREE.TorusGeometry(3.1, 0.06, 16, 64);
  const torus2Mat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.85 });
  const torus2 = new THREE.Mesh(torus2Geom, torus2Mat);
  torus2.rotation.y = Math.PI / 2;
  group.add(torus2);

  // Central Faceted Quantum Crystal Core
  const coreGeom = new THREE.OctahedronGeometry(1.4, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  group.add(coreMesh);

  // 4 Policy Obelisks (TLS 1.3, PFS, AEAD, PKI CA)
  const obelisks: THREE.Mesh[] = [];
  const obeliskPositions = [
    new THREE.Vector3(-2.2, -1.2, -2.2),
    new THREE.Vector3(2.2, -1.2, -2.2),
    new THREE.Vector3(2.2, -1.2, 2.2),
    new THREE.Vector3(-2.2, -1.2, 2.2),
  ];
  obeliskPositions.forEach((pos) => {
    const obeliskGeom = new THREE.BoxGeometry(0.38, 2.2, 0.38);
    const obeliskMat = new THREE.MeshStandardMaterial({ color: 0x14161f, metalness: 0.8, roughness: 0.2 });
    const obelisk = new THREE.Mesh(obeliskGeom, obeliskMat);
    obelisk.position.copy(pos);
    group.add(obelisk);
    obelisks.push(obelisk);
  });

  // Quarantine Shockwave Ring
  const shockwaveGeom = new THREE.RingGeometry(0.1, 0.25, 48);
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const shockwaveMesh = new THREE.Mesh(shockwaveGeom, shockwaveMat);
  group.add(shockwaveMesh);

  // Deflection Sparks Particles
  const SPARK_COUNT = 75;
  const sparkGeom = new THREE.BufferGeometry();
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkVelocities = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparkPositions[i * 3] = 0;
    sparkPositions[i * 3 + 1] = 0;
    sparkPositions[i * 3 + 2] = 0;
    sparkVelocities[i * 3] = (Math.random() - 0.5) * 0.14;
    sparkVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.14;
    sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.14;
  }
  sparkGeom.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0xef4444,
    size: 0.24,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0,
  });
  const sparkPoints = new THREE.Points(sparkGeom, sparkMat);
  group.add(sparkPoints);

  return {
    group,
    shieldMesh,
    glassMesh,
    coreMesh,
    torus1,
    torus2,
    obelisks,
    shockwaveMesh,
    sparkPoints,
    sparkGeom,
    sparkVelocities,
  };
}

export function buildVaultStation(): {
  group: THREE.Group;
  towers: THREE.Mesh[];
  lock: THREE.Mesh;
  leds: THREE.Mesh[];
} {
  const group = new THREE.Group();
  group.position.copy(NODE_POSITIONS.vault);

  // Base platform
  const baseGeom = new THREE.CylinderGeometry(2.2, 2.5, 0.25, 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x141720, metalness: 0.85, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = -2.35;
  group.add(base);

  // 3 Staggered monolithic blade server towers
  const towers: THREE.Mesh[] = [];
  const towerPositions = [
    new THREE.Vector3(-0.7, 0, 0),
    new THREE.Vector3(0, 0.3, -0.4),
    new THREE.Vector3(0.7, -0.2, 0.2),
  ];
  towerPositions.forEach((pos) => {
    const geom = new THREE.BoxGeometry(0.8, 3.2, 1.2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0f1118, roughness: 0.2, metalness: 0.9 });
    const tower = new THREE.Mesh(geom, mat);
    tower.position.copy(pos);
    group.add(tower);
    towers.push(tower);

    // Glowing edge frame
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
    );
    tower.add(edges);
  });

  // Running activity LEDs
  const leds: THREE.Mesh[] = [];
  for (let i = -1; i <= 1; i++) {
    const ledGeom = new THREE.BoxGeometry(0.6, 0.08, 0.05);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const led = new THREE.Mesh(ledGeom, ledMat);
    led.position.set(-0.7, i * 0.7, 0.62);
    group.add(led);
    leds.push(led);
  }

  // Top Cryptographic Lock Ring
  const lockGeom = new THREE.TorusGeometry(1.2, 0.06, 16, 48);
  const lockMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.8 });
  const lock = new THREE.Mesh(lockGeom, lockMat);
  lock.position.y = 2.4;
  lock.rotation.x = Math.PI / 2;
  group.add(lock);

  // Sky laser beam
  const beaconGeom = new THREE.CylinderGeometry(0.04, 0.2, 5, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.35 });
  const beacon = new THREE.Mesh(beaconGeom, beaconMat);
  beacon.position.y = 5.0;
  group.add(beacon);

  return { group, towers, lock, leds };
}

export function buildDataConduits(scene: THREE.Scene): {
  ingressCurve: THREE.CatmullRomCurve3;
  tapCurve: THREE.CatmullRomCurve3;
  egressCurve: THREE.CatmullRomCurve3;
  ingressTube: THREE.Mesh;
  tapTube: THREE.Mesh;
  egressTube: THREE.Mesh;
} {
  const ingressCurve = new THREE.CatmullRomCurve3([
    NODE_POSITIONS.client,
    NODE_POSITIONS.tapJunction,
    NODE_POSITIONS.gateway,
  ]);
  const ingressGeom = new THREE.TubeGeometry(ingressCurve, 40, 0.07, 8, false);
  const ingressMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
  const ingressTube = new THREE.Mesh(ingressGeom, ingressMat);
  scene.add(ingressTube);

  const tapCurve = new THREE.CatmullRomCurve3([
    NODE_POSITIONS.adversary,
    new THREE.Vector3(-3.4, 1.8, -0.6),
    NODE_POSITIONS.tapJunction,
  ]);
  const tapGeom = new THREE.TubeGeometry(tapCurve, 30, 0.05, 8, false);
  const tapMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 });
  const tapTube = new THREE.Mesh(tapGeom, tapMat);
  scene.add(tapTube);

  const egressCurve = new THREE.CatmullRomCurve3([
    NODE_POSITIONS.gateway,
    new THREE.Vector3(4.2, 0.2, 0),
    NODE_POSITIONS.vault,
  ]);
  const egressGeom = new THREE.TubeGeometry(egressCurve, 40, 0.07, 8, false);
  const egressMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.5 });
  const egressTube = new THREE.Mesh(egressGeom, egressMat);
  scene.add(egressTube);

  return { ingressCurve, tapCurve, egressCurve, ingressTube, tapTube, egressTube };
}
