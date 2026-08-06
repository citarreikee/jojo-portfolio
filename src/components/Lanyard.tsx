/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Canvas,
  extend,
  useFrame,
  type BufferGeometryNode,
  type MaterialNode,
  type ThreeEvent,
} from '@react-three/fiber'
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import cardGLB from '../assets/lanyard/card.glb'
import lanyard from '../assets/lanyard/lanyard.png'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: BufferGeometryNode<MeshLineGeometry, typeof MeshLineGeometry>
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>
  }
}

const blankPixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const frontUvRect = { x: 0, y: 0, width: 0.5, height: 0.755 }
const backUvRect = { x: 0.5, y: 0, width: 0.5, height: 0.757 }

type LanyardProps = {
  position?: [number, number, number]
  gravity?: [number, number, number]
  fov?: number
  transparent?: boolean
  frontImage?: string | null
  backImage?: string | null
  imageFit?: 'cover' | 'contain'
  lanyardImage?: string | null
  lanyardWidth?: number
  anchor?: [number, number, number]
  cardScale?: number
  ropeLength?: number
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  anchor = [2.35, 2.38, 0],
  cardScale = 2.25,
  ropeLength = 0.62,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1.5, isMobile ? 2 : 2.5]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            anchor={isMobile ? [0, 2.38, 0] : anchor}
            cardScale={cardScale}
            ropeLength={ropeLength}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  )
}

type BandProps = {
  maxSpeed?: number
  minSpeed?: number
  isMobile?: boolean
  frontImage?: string | null
  backImage?: string | null
  imageFit?: 'cover' | 'contain'
  lanyardImage?: string | null
  lanyardWidth?: number
  anchor?: [number, number, number]
  cardScale?: number
  ropeLength?: number
}

type LanyardRigidBody = RapierRigidBody & { lerped?: THREE.Vector3 }

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  anchor = [2.35, 2.38, 0],
  cardScale = 2.25,
  ropeLength = 0.62,
}: BandProps) {
  const band = useRef<
    THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>
  >(null!)
  const fixed = useRef<RapierRigidBody>(null!)
  const joint1 = useRef<LanyardRigidBody>(null!)
  const joint2 = useRef<LanyardRigidBody>(null!)
  const joint3 = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)
  const vector = new THREE.Vector3()
  const angularVelocity = new THREE.Vector3()
  const rotation = new THREE.Vector3()
  const direction = new THREE.Vector3()
  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  }

  const getLerped = (body: LanyardRigidBody) => {
    if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation())
    return body.lerped
  }

  const { nodes, materials } = useGLTF(cardGLB) as any
  const texture = useTexture(lanyardImage || lanyard)
  const frontTexture = useTexture(frontImage || blankPixel)
  const backTexture = useTexture(backImage || blankPixel)

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture
    if (!frontImage && !backImage) return baseMap

    const baseImage = baseMap.image as HTMLImageElement
    const sourceWidth = baseImage.width
    const sourceHeight = baseImage.height
    const textureScale = Math.max(1, Math.ceil(4096 / sourceWidth))
    const width = sourceWidth * textureScale
    const height = sourceHeight * textureScale
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return baseMap
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(baseImage, 0, 0, width, height)

    const drawFitted = (
      image: HTMLImageElement,
      rect: typeof frontUvRect,
    ) => {
      const x = rect.x * width
      const y = rect.y * height
      const targetWidth = rect.width * width
      const targetHeight = rect.height * height
      const fit = imageFit === 'contain' ? Math.min : Math.max
      const scale = fit(targetWidth / image.width, targetHeight / image.height)
      const drawnWidth = image.width * scale
      const drawnHeight = image.height * scale
      const drawnX = x + (targetWidth - drawnWidth) / 2
      const drawnY = y + (targetHeight - drawnHeight) / 2
      context.save()
      context.beginPath()
      context.rect(x, y, targetWidth, targetHeight)
      context.clip()
      context.drawImage(image, drawnX, drawnY, drawnWidth, drawnHeight)
      context.restore()
    }

    if (frontImage && frontTexture.image) {
      drawFitted(frontTexture.image as HTMLImageElement, frontUvRect)
    }
    if (backImage && backTexture.image) {
      drawFitted(backTexture.image as HTMLImageElement, backUvRect)
    }

    const composite = new THREE.CanvasTexture(canvas)
    composite.colorSpace = THREE.SRGBColorSpace
    composite.flipY = baseMap.flipY
    composite.anisotropy = 16
    composite.needsUpdate = true
    return composite
  }, [
    backImage,
    backTexture,
    frontImage,
    frontTexture,
    imageFit,
    materials.base.map,
  ])

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  )
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false)
  const [hovered, setHovered] = useState(false)

  useRopeJoint(fixed, joint1, [[0, 0, 0], [0, 0, 0], ropeLength])
  useRopeJoint(joint1, joint2, [[0, 0, 0], [0, 0, 0], ropeLength])
  useRopeJoint(joint2, joint3, [[0, 0, 0], [0, 0, 0], ropeLength])
  useSphericalJoint(joint3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ])

  useEffect(() => {
    if (!hovered) return
    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [dragged, hovered])

  useFrame((state, delta) => {
    if (dragged) {
      vector.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      direction.copy(vector).sub(state.camera.position).normalize()
      vector.add(direction.multiplyScalar(state.camera.position.length()))
      ;[card, joint1, joint2, joint3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vector.x - dragged.x,
        y: vector.y - dragged.y,
        z: vector.z - dragged.z,
      })
    }

    if (fixed.current) {
      ;[joint1, joint2].forEach((ref) => {
        const lerped = getLerped(ref.current)
        const distance = Math.max(
          0.1,
          Math.min(1, lerped.distanceTo(ref.current.translation())),
        )
        lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + distance * (maxSpeed - minSpeed)),
        )
      })
      curve.points[0].copy(joint3.current.translation())
      curve.points[1].copy(getLerped(joint2.current))
      curve.points[2].copy(getLerped(joint1.current))
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32))
      angularVelocity.copy(card.current.angvel())
      rotation.copy(card.current.rotation())
      card.current.setAngvel(
        {
          x: angularVelocity.x,
          y: angularVelocity.y - rotation.y * 0.25,
          z: angularVelocity.z,
        },
        true,
      )
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={anchor}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[ropeLength, 0, 0]} ref={joint1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[ropeLength * 2, 0, 0]} ref={joint2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[ropeLength * 3, 0, 0]} ref={joint3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[ropeLength * 4, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={cardScale}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(event: ThreeEvent<PointerEvent>) => {
              ;(event.target as Element).releasePointerCapture(event.pointerId)
              setDragged(false)
            }}
            onPointerDown={(event: ThreeEvent<PointerEvent>) => {
              ;(event.target as Element).setPointerCapture(event.pointerId)
              setDragged(
                new THREE.Vector3()
                  .copy(event.point)
                  .sub(vector.copy(card.current.translation())),
              )
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0.25 : 0.65}
                clearcoatRoughness={0.18}
                roughness={0.52}
                metalness={0.08}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={new THREE.Vector2(1000, isMobile ? 2000 : 1000)}
          useMap={1}
          map={texture}
          repeat={new THREE.Vector2(-4, 1)}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  )
}

useGLTF.preload(cardGLB)
