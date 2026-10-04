"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  NODE_POSITIONS,
  buildCyberGround,
  buildClientStation,
  buildAdversaryStation,
  buildGatewayStation,
  buildVaultStation,
  buildDataConduits,
  createProceduralGlowTexture,
} from "./simulation-3d-scene-builder";
import { ProjectedPos } from "./simulation-3d-pins";
import { ActivePacketInfo, DeflectionImpactInfo } from "./simulation-3d-interception-overlay";

interface UseSimulation3DParams {
  containerRef: React.RefObject<HTMLDivElement>;
  currentStage: number;
  enforceTls13: boolean;
  enforcePfs: boolean;
  enforceAead: boolean;
  renewCerts: boolean;
}

export function useSimulation3D({
  containerRef,
  currentStage,
  enforceTls13,
  enforcePfs,
  enforceAead,
  renewCerts,
}: UseSimulation3DParams) {
  const [fps, setFps] = useState<number>(60);
  const [clientPos, setClientPos] = useState<ProjectedPos>({ x: 0, y: 0, visible: false });
  const [adversaryPos, setAdversaryPos] = useState<ProjectedPos>({ x: 0, y: 0, visible: false });
  const [gatewayPos, setGatewayPos] = useState<ProjectedPos>({ x: 0, y: 0, visible: false });
  const [vaultPos, setVaultPos] = useState<ProjectedPos>({ x: 0, y: 0, visible: false });

  // Real-Time Transaction Tracking State
  const [activePacket, setActivePacket] = useState<ActivePacketInfo>({
    x: 0,
    y: 0,
    visible: false,
    phase: 0,
    label: "Client Ingress Handshake",
    sublabel: "EHLO + STARTTLS Requested",
    type: "CLIENT_HELLO",
    flowVector: "192.168.1.100:54322 → 10.0.0.5:587",
    protocol: "SMTP // RFC 3207 STARTTLS",
    payloadSnippet: "EHLO client.internal\r\n250-STARTTLS\r\nSTARTTLS\r\n",
    statusNotice: "Client initiating opportunistic TLS upgrade via STARTTLS",
    cipherInfo: "ClientHello: TLS 1.3, ML-KEM-768, AES-256-GCM",
    complianceNotice: "NIST SP 800-52r2 §3.1 IN PROGRESS",
  });
  const [deflectionImpact, setDeflectionImpact] = useState<DeflectionImpactInfo>({
    x: 0,
    y: 0,
    visible: false,
    intensity: 0,
  });
  const [liveCycleProgress, setLiveCycleProgress] = useState<number>(0);
  const [liveEventLog, setLiveEventLog] = useState<string>("SIMULATION IDLE: Ready for attack injection cycle.");
  const setCameraTargetRef = useRef<(node: "OVERVIEW" | "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT") => void>(() => {});

  const stageRef = useRef(currentStage);
  const tls13Ref = useRef(enforceTls13);
  const pfsRef = useRef(enforcePfs);
  const aeadRef = useRef(enforceAead);
  const certsRef = useRef(renewCerts);

  useEffect(() => { stageRef.current = currentStage; }, [currentStage]);
  useEffect(() => { tls13Ref.current = enforceTls13; }, [enforceTls13]);
  useEffect(() => { pfsRef.current = enforcePfs; }, [enforcePfs]);
  useEffect(() => { aeadRef.current = enforceAead; }, [enforceAead]);
  useEffect(() => { certsRef.current = renewCerts; }, [renewCerts]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020308, 0.022);

    const width = container.clientWidth || 850;
    const height = container.clientHeight || 540;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const cameraPos = new THREE.Vector3(1.2, 8.5, 21.0);
    const cameraPosTarget = new THREE.Vector3(1.2, 8.5, 21.0);
    const cameraLook = new THREE.Vector3(1.2, 0.8, 0);
    const cameraLookTarget = new THREE.Vector3(1.2, 0.8, 0);
    camera.position.copy(cameraPos);
    camera.lookAt(cameraLook);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020308, 1);
    container.appendChild(renderer.domElement);

    const cyanGlowTex = createProceduralGlowTexture("rgba(56, 189, 248, 1)");
    const emeraldGlowTex = createProceduralGlowTexture("rgba(52, 211, 153, 1)");
    const redGlowTex = createProceduralGlowTexture("rgba(239, 68, 68, 1)");
    const amberGlowTex = createProceduralGlowTexture("rgba(204, 145, 102, 1)");
    const purpleGlowTex = createProceduralGlowTexture("rgba(168, 85, 247, 1)");

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const pointLightClient = new THREE.PointLight(0x38bdf8, 2.8, 20);
    pointLightClient.position.set(-7.2, 2.5, 2.5);
    scene.add(pointLightClient);

    const pointLightAdversary = new THREE.PointLight(0xef4444, 2.5, 16);
    pointLightAdversary.position.set(-3.4, 4.5, 1);
    scene.add(pointLightAdversary);

    const pointLightGateway = new THREE.PointLight(0x34d399, 4.0, 26);
    pointLightGateway.position.set(0, 3.5, 3.5);
    scene.add(pointLightGateway);

    const pointLightVault = new THREE.PointLight(0x38bdf8, 2.8, 20);
    pointLightVault.position.set(6.2, 2.5, 2.5);
    scene.add(pointLightVault);

    const { radarSweep, radarRings, motes } = buildCyberGround(scene);
    const clientStation = buildClientStation();
    const adversaryStation = buildAdversaryStation();
    const gatewayStation = buildGatewayStation();
    const vaultStation = buildVaultStation();
    scene.add(clientStation.group, adversaryStation.group, gatewayStation.group, vaultStation.group);

    const { ingressCurve, tapCurve, egressCurve, ingressTube, tapTube, egressTube } = buildDataConduits(scene);

    // Primary Active Transactional In-Flight Sprite
    const heroPacketMat = new THREE.SpriteMaterial({
      map: cyanGlowTex,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const heroPacketSprite = new THREE.Sprite(heroPacketMat);
    heroPacketSprite.scale.set(1.1, 1.1, 1.1);
    scene.add(heroPacketSprite);

    // Background Conduit Particles (32 ambient particles)
    const PACKET_COUNT = 32;
    interface PacketEntity {
      sprite: THREE.Sprite;
      progress: number;
      speed: number;
      type: "INGRESS" | "MITM_ATTACK" | "EGRESS_STREAM";
    }
    const packets: PacketEntity[] = [];
    const packetGroup = new THREE.Group();

    for (let i = 0; i < PACKET_COUNT; i++) {
      const type = i < 14 ? "INGRESS" : i < 22 ? "MITM_ATTACK" : "EGRESS_STREAM";
      const map = type === "INGRESS" ? cyanGlowTex : type === "MITM_ATTACK" ? redGlowTex : emeraldGlowTex;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending })
      );
      sprite.scale.set(0.55, 0.55, 0.55);
      packetGroup.add(sprite);
      packets.push({ sprite, progress: Math.random(), speed: 0.007 + Math.random() * 0.004, type });
    }
    scene.add(packetGroup);

    setCameraTargetRef.current = (mode) => {
      if (mode === "CLIENT") {
        cameraPosTarget.set(-7.2, 3.8, 9.5);
        cameraLookTarget.set(-7.2, 0.5, 0);
      } else if (mode === "ADVERSARY") {
        cameraPosTarget.set(-3.4, 5.5, 8.5);
        cameraLookTarget.set(-3.4, 3.5, -1.0);
      } else if (mode === "GATEWAY") {
        cameraPosTarget.set(0, 3.8, 9.5);
        cameraLookTarget.set(0, 0.8, 0);
      } else if (mode === "VAULT") {
        cameraPosTarget.set(6.2, 3.8, 9.5);
        cameraLookTarget.set(6.2, 0.5, 0);
      } else {
        cameraPosTarget.set(1.2, 8.5, 21.0);
        cameraLookTarget.set(1.2, 0.8, 0);
      }
    };

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAzimuth = 0;
    let orbitPolar = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      orbitAzimuth -= (e.clientX - prevMouseX) * 0.004;
      orbitPolar = Math.max(-0.4, Math.min(0.6, orbitPolar + (e.clientY - prevMouseY) * 0.004));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      // Prevent canvas from intercepting natural page scrolling
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      cameraPosTarget.z = Math.max(12, Math.min(28, cameraPosTarget.z + e.deltaY * 0.012));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("wheel", onWheel, { passive: false });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nw = entry.contentRect.width;
        const nh = entry.contentRect.height;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    const projectNode = (worldPos: THREE.Vector3): ProjectedPos => {
      const v = worldPos.clone().project(camera);
      const isVisible = v.z < 1 && v.x >= -1.2 && v.x <= 1.2 && v.y >= -1.2 && v.y <= 1.2;
      const curW = container.clientWidth || 850;
      const curH = container.clientHeight || 540;
      return { x: (v.x * 0.5 + 0.5) * curW, y: (-(v.y * 0.5) + 0.5) * curH, visible: isVisible };
    };

    let animationFrameId: number;
    let frameCount = 0;
    let fpsTimer = performance.now();
    let shockwaveScale = 0.1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();

      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      cameraPos.lerp(cameraPosTarget, 0.055);
      cameraLook.lerp(cameraLookTarget, 0.055);
      camera.position.copy(cameraPos);
      camera.position.x += orbitAzimuth * 4;
      camera.position.y += orbitPolar * 3;
      camera.lookAt(cameraLook);

      radarSweep.rotation.z += 0.02;
      radarRings.rotation.z -= 0.002;

      const motesArr = motes.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 180; i++) motesArr[i * 3 + 1] += Math.sin(now * 0.002 + i) * 0.005;
      motes.geometry.attributes.position.needsUpdate = true;

      clientStation.mesh.rotation.y += 0.012;
      clientStation.orbit.rotation.z += 0.015;
      adversaryStation.core.rotation.y += 0.018;
      gatewayStation.shieldMesh.rotation.y += 0.006;
      gatewayStation.coreMesh.rotation.y -= 0.02;

      const torusSpeed = stageRef.current >= 3 ? 0.05 : 0.015;
      gatewayStation.torus1.rotation.x += torusSpeed;
      gatewayStation.torus2.rotation.y -= torusSpeed;
      vaultStation.lock.rotation.z += stageRef.current >= 4 ? 0.002 : 0.025;

      vaultStation.leds.forEach((led, idx) => {
        (led.material as THREE.MeshBasicMaterial).color.setHex(Math.sin(now * 0.008 + idx * 2) > 0 ? 0x34d399 : 0x09261a);
      });

      const policiesActive = [tls13Ref.current, pfsRef.current, aeadRef.current, certsRef.current];
      gatewayStation.obelisks.forEach((ob, idx) => {
        const isActive = policiesActive[idx] || stageRef.current >= 3;
        const mat = ob.material as THREE.MeshStandardMaterial;
        mat.color.setHex(isActive ? 0x34d399 : 0x14161f);
        mat.emissive.setHex(isActive ? 0x34d399 : 0x000000);
        mat.emissiveIntensity = isActive ? 0.7 : 0;
      });

      // ==========================================
      // REAL-TIME TRANSACTION KINEMATIC TIMELINE (7.5s Loop)
      // ==========================================
      const CYCLE_DURATION = 7.5;
      const cycleTime = (now * 0.001) % CYCLE_DURATION;
      const progressPercent = (cycleTime / CYCLE_DURATION) * 100;
      setLiveCycleProgress(progressPercent);

      const impactPointWorld = new THREE.Vector3(-2.4, 0, 0);
      let heroPos = new THREE.Vector3();
      const heroVisible = true;
      let activeType: ActivePacketInfo["type"] = "CLIENT_HELLO";
      let activeLabel = "Client Ingress";
      let activeSublabel = "EHLO + STARTTLS Requested";
      let flowVector = "192.168.1.100:54322 → 10.0.0.5:587";
      let protocol = "SMTP // RFC 3207 STARTTLS";
      let payloadSnippet = "EHLO client.defense.gov.in\r\n250-STARTTLS\r\nSTARTTLS\r\n";
      let statusNotice = "Client initiating opportunistic TLS upgrade via STARTTLS";
      let cipherInfo = "ClientHello offered: TLS 1.3, ML-KEM-768, AES-256-GCM";
      let complianceNotice = "NIST SP 800-52r2 §3.1 IN PROGRESS";
      let impactVisible = false;
      let impactIntensity = 0;
      let currentPhaseIdx = 0;

      if (cycleTime < 1.8) {
        // Phase 1: Client Ingress (0.0s - 1.8s)
        currentPhaseIdx = 0;
        const p = cycleTime / 1.8;
        heroPos = ingressCurve.getPoint(p * 0.5);
        heroPacketSprite.material.map = cyanGlowTex;
        activeType = "CLIENT_HELLO";
        activeLabel = "Client Ingress";
        activeSublabel = "EHLO + STARTTLS Requested";
        flowVector = "192.168.1.100:54322 → 10.0.0.5:587";
        protocol = "SMTP // RFC 3207 STARTTLS";
        payloadSnippet = "EHLO client.defense.gov.in\r\n250-STARTTLS\r\nSTARTTLS\r\n";
        statusNotice = "Client requesting opportunistic TLS upgrade via STARTTLS";
        cipherInfo = "ClientHello: TLS 1.3, ML-KEM-768, AES-256-GCM";
        complianceNotice = "NIST SP 800-52r2 §3.1 IN PROGRESS";
        setLiveEventLog("INGRESS: Client 192.168.1.100 initiating TLS handshake on port 587");
      } else if (cycleTime < 3.8) {
        // Phase 2: Vulnerability Emergence - MitM Attack Injection (1.8s - 3.8s)
        currentPhaseIdx = 1;
        const p = (cycleTime - 1.8) / 2.0;
        if (p < 0.45) {
          heroPos = tapCurve.getPoint(p / 0.45);
        } else {
          const wireP = 0.5 + ((p - 0.45) / 0.55) * 0.22;
          heroPos = ingressCurve.getPoint(wireP);
        }
        heroPacketSprite.material.map = redGlowTex;
        activeType = "ATTACK_INJECTION";
        activeLabel = "STRIPTLS Injection";
        activeSublabel = "MitM Proxy 10.0.0.99 strips 250-STARTTLS";
        flowVector = "10.0.0.99 (TAP) ⇄ Wire Conduit Junction";
        protocol = "STRIPTLS DOWNGRADE EXPLOIT";
        payloadSnippet = "250-AUTH LOGIN PLAIN\r\n[ALERT: 250-STARTTLS stripped by rogue proxy]";
        statusNotice = "Adversary proxy stripping STARTTLS capability to force cleartext transmission";
        cipherInfo = "Adversary forcing unencrypted plaintext TCP stream";
        complianceNotice = "THREAT: Cleartext Auth Leak Imminent";
        setLiveEventLog("THREAT: Rogue proxy injecting stripped capability into wire!");
      } else if (cycleTime < 4.8) {
        // Phase 3: Active Interception & Shield Deflection (3.8s - 4.8s)
        currentPhaseIdx = 2;
        heroPos.copy(impactPointWorld);
        heroPacketSprite.material.map = amberGlowTex;
        activeType = "DEFLECTION";
        activeLabel = "Perimeter Deflection";
        activeSublabel = "STRIPTLS Dropped (SSL Alert 70)";
        flowVector = "Gateway TAP-01 ⊣ [SHIELD] ⊣ 10.0.0.99";
        protocol = "RFC 8446 / RFC 8314 MANDATORY POLICY";
        payloadSnippet = "554 5.7.0 Must issue STARTTLS first\r\nSSL Alert 70 (Access Denied)";
        statusNotice = "Gateway detected missing STARTTLS and dropped packet at perimeter shield";
        cipherInfo = "Boundary shield repelled downgrade from reaching mailbox spool";
        complianceNotice = "ATTACK DEFLECTED: 0 Bytes Leaked";
        impactVisible = true;
        impactIntensity = Math.max(0, 1.0 - (cycleTime - 3.8) / 1.0);
        setLiveEventLog("INTERCEPTED: Downgrade attack deflected by Gateway mandatory policy!");

        // Trigger Deflection Shockwave & Radial Sparks
        shockwaveScale = 0.4 + (cycleTime - 3.8) * 2.8;
        gatewayStation.shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        (gatewayStation.shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = impactIntensity * 0.8;

        (gatewayStation.sparkPoints.material as THREE.PointsMaterial).opacity = impactIntensity;
        const sparkArr = gatewayStation.sparkGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < 75; i++) {
          sparkArr[i * 3] += gatewayStation.sparkVelocities[i * 3] * 1.5;
          sparkArr[i * 3 + 1] += gatewayStation.sparkVelocities[i * 3 + 1] * 1.5;
          sparkArr[i * 3 + 2] += gatewayStation.sparkVelocities[i * 3 + 2] * 1.5;
        }
        gatewayStation.sparkGeom.attributes.position.needsUpdate = true;
      } else if (cycleTime < 6.2) {
        // Phase 4: Post-Quantum Lattice Key Exchange (4.8s - 6.2s)
        currentPhaseIdx = 3;
        const p = (cycleTime - 4.8) / 1.4;
        heroPos = ingressCurve.getPoint(0.7 - p * 0.5);
        heroPacketSprite.material.map = purpleGlowTex;
        activeType = "PQC_KEY";
        activeLabel = "Post-Quantum KEM";
        activeSublabel = "ML-KEM-768 Ciphertext (FIPS 203)";
        flowVector = "Client 192.168.1.100 ⇄ Gateway TAP-01";
        protocol = "FIPS 203 / NIST PQC LATTICE HYBRID";
        payloadSnippet = "KeyShare: ML-KEM-768 (1184B) + X25519 (32B) negotiated";
        statusNotice = "Generating quantum-resilient lattice ciphertext to neutralize harvest-now attacks";
        cipherInfo = "Dual-layer hybrid lattice // Ephemeral Perfect Forward Secrecy";
        complianceNotice = "NIST FIPS 203 & RFC 8446 HARDENED";
        setLiveEventLog("PQC UPGRADE: Quantum-safe hybrid lattice key exchange established.");
      } else {
        // Phase 5: Hardened Mail Delivery into Vault (6.2s - 7.5s)
        currentPhaseIdx = 4;
        const p = (cycleTime - 6.2) / 1.3;
        heroPos = egressCurve.getPoint(p);
        heroPacketSprite.material.map = emeraldGlowTex;
        activeType = "VAULT_STREAM";
        activeLabel = "Sealed Vault Spool";
        activeSublabel = "AES-256-GCM (Zero Leakage)";
        flowVector = "Gateway TAP-01 → Mail Vault 10.0.0.5:465";
        protocol = "AUTHENTICATED AEAD SPOOLING";
        payloadSnippet = "250 2.0.0 Ok: Queued into Secure Mail Spool (Encrypted at Rest)";
        statusNotice = "Encrypted mail transaction verified and spooled with zero plaintext exposure";
        cipherInfo = "TLS_AES_256_GCM_SHA384 with 3072-bit CA-signed root cert";
        complianceNotice = "GRADE A+ POSTURE // 100/100 COMPLIANT";
        setLiveEventLog("VAULT INGEST: Encrypted mail payload delivered to Dovecot spool.");
      }

      // Reset sparks and shockwave when outside phase 3
      if (cycleTime < 3.8 || cycleTime >= 4.8) {
        const sparkArr = gatewayStation.sparkGeom.attributes.position.array as Float32Array;
        let needsReset = false;
        for (let i = 0; i < 75 * 3; i++) {
          if (sparkArr[i] !== 0) {
            sparkArr[i] = 0;
            needsReset = true;
          }
        }
        if (needsReset) {
          gatewayStation.sparkGeom.attributes.position.needsUpdate = true;
        }
        (gatewayStation.sparkPoints.material as THREE.PointsMaterial).opacity = 0;
        (gatewayStation.shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      heroPacketSprite.position.copy(heroPos);
      heroPacketSprite.visible = heroVisible;

      // Stage-specific scene aesthetics — ensure every stage resets all altered properties
      const activeStage = stageRef.current;
      if (activeStage === 0) {
        (clientStation.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
        (gatewayStation.shieldMesh.material as THREE.MeshStandardMaterial).color.setHex(0x6b7280);
        (gatewayStation.glassMesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
        (ingressTube.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        (tapTube.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        (egressTube.material as THREE.MeshBasicMaterial).color.setHex(0x232634);
        (adversaryStation.cage.material as THREE.MeshBasicMaterial).opacity = 0;
      } else if (activeStage === 1) {
        (clientStation.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xcc9166);
        (gatewayStation.shieldMesh.material as THREE.MeshStandardMaterial).color.setHex(0xcc9166);
        (gatewayStation.glassMesh.material as THREE.MeshStandardMaterial).color.setHex(0xcc9166);
        (ingressTube.material as THREE.MeshBasicMaterial).color.setHex(0xcc9166);
        (tapTube.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        (egressTube.material as THREE.MeshBasicMaterial).color.setHex(0xcc9166);
        (adversaryStation.cage.material as THREE.MeshBasicMaterial).opacity = 0;
      } else if (activeStage === 2) {
        (clientStation.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
        (gatewayStation.shieldMesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
        (gatewayStation.glassMesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
        (ingressTube.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        (tapTube.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        (egressTube.material as THREE.MeshBasicMaterial).color.setHex(0x181a24);
        (adversaryStation.cage.material as THREE.MeshBasicMaterial).opacity = 0;
      } else {
        (clientStation.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x34d399);
        (gatewayStation.shieldMesh.material as THREE.MeshStandardMaterial).color.setHex(0x34d399);
        (gatewayStation.glassMesh.material as THREE.MeshStandardMaterial).color.setHex(0x34d399);
        (ingressTube.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
        (tapTube.material as THREE.MeshBasicMaterial).color.setHex(0x232634);
        (egressTube.material as THREE.MeshBasicMaterial).color.setHex(0x34d399);
        (adversaryStation.cage.material as THREE.MeshBasicMaterial).opacity = 0.55;
      }

      // Animate ambient background stream
      for (const pkt of packets) {
        pkt.progress += pkt.speed * (activeStage >= 3 ? 1.5 : 1.0);
        if (pkt.progress > 1.0) pkt.progress = 0.0;
        if (pkt.type === "INGRESS") {
          pkt.sprite.position.copy(ingressCurve.getPoint(pkt.progress));
        } else if (pkt.type === "MITM_ATTACK") {
          pkt.sprite.position.copy(tapCurve.getPoint(pkt.progress));
        } else {
          pkt.sprite.position.copy(egressCurve.getPoint(pkt.progress));
        }
      }

      // Project Stations and Active In-Flight Transaction Packets to Screen
      setClientPos(projectNode(NODE_POSITIONS.client));
      setAdversaryPos(projectNode(NODE_POSITIONS.adversary));
      setGatewayPos(projectNode(NODE_POSITIONS.gateway));
      setVaultPos(projectNode(NODE_POSITIONS.vault));

      const heroScreen = projectNode(heroPos);
      setActivePacket({
        x: heroScreen.x,
        y: heroScreen.y,
        visible: heroScreen.visible,
        phase: currentPhaseIdx,
        label: activeLabel,
        sublabel: activeSublabel,
        type: activeType,
        flowVector,
        protocol,
        payloadSnippet,
        statusNotice,
        cipherInfo,
        complianceNotice,
      });

      const impactScreen = projectNode(impactPointWorld);
      setDeflectionImpact({
        x: impactScreen.x,
        y: impactScreen.y,
        visible: impactVisible && impactScreen.visible,
        intensity: impactIntensity,
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("wheel", onWheel);
      scene.traverse((object) => {
        if ((object as THREE.Mesh).geometry) {
          (object as THREE.Mesh).geometry.dispose();
        }
        if ((object as THREE.Mesh).material) {
          const mat = (object as THREE.Mesh).material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
      renderer.dispose();
      cyanGlowTex.dispose();
      emeraldGlowTex.dispose();
      redGlowTex.dispose();
      amberGlowTex.dispose();
      purpleGlowTex.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [containerRef]);

  const setCameraTarget = useCallback((node: "OVERVIEW" | "CLIENT" | "ADVERSARY" | "GATEWAY" | "VAULT") => {
    setCameraTargetRef.current(node);
  }, []);

  return {
    fps,
    clientPos,
    adversaryPos,
    gatewayPos,
    vaultPos,
    activePacket,
    deflectionImpact,
    liveCycleProgress,
    liveEventLog,
    setCameraTarget,
  };
}
