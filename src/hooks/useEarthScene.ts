import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  CAMERA_DISTANCE,
  CLOUD_ROTATION_SPEED,
  EARTH_ROTATION_SPEED,
  MAX_ZOOM,
  MIN_ZOOM,
  REAL_EARTH_ROTATION_SPEED,
  RESUME_DELAY,
} from '../three/constants'
import { loadEarthTextures } from '../three/loadTextures'
import { computeSunDirection } from '../three/sunPosition'
import { createEarth } from '../three/createEarth'
import { createClouds } from '../three/createClouds'
import { createAtmosphere } from '../three/createAtmosphere'
import { createStars } from '../three/createStars'

const Y_AXIS = new THREE.Vector3(0, 1, 0)

/**
 * Three.js 地球场景完整生命周期：挂载时创建 renderer/scene/camera，
 * 动画循环驱动自转，OrbitControls 提供交互；卸载时完整 dispose。
 *
 * realTime=false（演示模式）：太阳方向取挂载时刻的真实位置后固定于世界空间，
 *   地球加速自转，昼夜分布与挂载时刻一致；
 * realTime=true（实时模式）：太阳方向每帧按当前真实时间计算（换算到地球当前朝向），
 *   地球按真实角速度自转，晨昏线始终对应"现在"。
 */
export function useEarthScene(realTime = false) {
  const containerRef = useRef<HTMLDivElement>(null)
  const realTimeRef = useRef(realTime)

  useEffect(() => {
    realTimeRef.current = realTime
  }, [realTime])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let resumeTimer: ReturnType<typeof setTimeout> | undefined

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      300,
    )
    camera.position.set(0, 0.6, CAMERA_DISTANCE)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = MIN_ZOOM
    controls.maxDistance = MAX_ZOOM

    // 初始太阳方向：当前真实时间（地球初始 rotation.y = 0，可直接用地理方向）
    const initialSun = computeSunDirection(new Date())

    // 平行光只作用于云层（Lambert 材质），方向与地球 shader 的太阳方向一致
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2)
    sunLight.position.copy(initialSun)
    scene.add(sunLight)

    const stars = createStars()
    scene.add(stars)

    // 贴图异步加载完成后再加入地球各层；若期间组件已卸载则直接释放
    let earth: THREE.Mesh | null = null
    let clouds: THREE.Mesh | null = null
    let atmosphere: THREE.Mesh | null = null
    let textures: Awaited<ReturnType<typeof loadEarthTextures>> | null = null

    const setSunDirection = (dir: THREE.Vector3) => {
      if (earth) {
        const material = earth.material as THREE.ShaderMaterial
        material.uniforms.sunDirection.value.copy(dir)
      }
      if (atmosphere) {
        const material = atmosphere.material as THREE.ShaderMaterial
        material.uniforms.sunDirection.value.copy(dir)
      }
      sunLight.position.copy(dir)
    }

    loadEarthTextures().then((loaded) => {
      if (disposed) {
        Object.values(loaded).forEach((t) => t.dispose())
        return
      }
      textures = loaded
      earth = createEarth(loaded, initialSun)
      clouds = createClouds(loaded.clouds)
      atmosphere = createAtmosphere(initialSun)
      scene.add(earth, clouds, atmosphere)
    })

    // 交互期间暂停自转，松手延时恢复（仅演示模式使用）
    let autoRotate = true
    controls.addEventListener('start', () => {
      autoRotate = false
      if (resumeTimer) clearTimeout(resumeTimer)
    })
    controls.addEventListener('end', () => {
      if (resumeTimer) clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => {
        autoRotate = true
      }, RESUME_DELAY)
    })

    const clock = new THREE.Clock()
    const tmpSun = new THREE.Vector3()
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta()

      if (realTimeRef.current) {
        // 实时模式：真实角速度自转，太阳按当前时间计算并换算到地球当前朝向
        if (earth) earth.rotation.y += delta * REAL_EARTH_ROTATION_SPEED
        if (clouds) clouds.rotation.y += delta * REAL_EARTH_ROTATION_SPEED * 1.15
        computeSunDirection(new Date(), tmpSun)
        tmpSun.applyAxisAngle(Y_AXIS, earth ? earth.rotation.y : 0)
        setSunDirection(tmpSun)
      } else if (autoRotate) {
        // 演示模式：太阳固定于世界空间，地表随自转经过昼夜
        if (earth) earth.rotation.y += delta * EARTH_ROTATION_SPEED
        if (clouds) clouds.rotation.y += delta * CLOUD_ROTATION_SPEED
      } else if (clouds) {
        // 交互暂停时云层保持缓慢漂移，画面不死板
        clouds.rotation.y += delta * CLOUD_ROTATION_SPEED * 0.3
      }

      controls.update()
      renderer.render(scene, camera)
    })

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    })
    resizeObserver.observe(container)

    const disposeMesh = (mesh: THREE.Mesh | null) => {
      if (!mesh) return
      mesh.geometry.dispose()
      const material = mesh.material as THREE.Material
      material.dispose()
    }

    return () => {
      disposed = true
      if (resumeTimer) clearTimeout(resumeTimer)
      resizeObserver.disconnect()
      renderer.setAnimationLoop(null)
      controls.dispose()
      disposeMesh(earth)
      disposeMesh(clouds)
      disposeMesh(atmosphere)
      disposeMesh(stars as unknown as THREE.Mesh)
      textures?.day.dispose()
      textures?.night.dispose()
      textures?.water.dispose()
      textures?.clouds.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return containerRef
}
