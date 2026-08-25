import * as THREE from 'three'
import { STAR_COUNT } from './constants'

/** 创建星空：随机分布在远处球壳上的点，带亮度差异模拟星等 */
export function createStars(): THREE.Points {
  const positions = new Float32Array(STAR_COUNT * 3)
  const colors = new Float32Array(STAR_COUNT * 3)

  for (let i = 0; i < STAR_COUNT; i++) {
    // 均匀随机方向 + 80~120 半径球壳
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 80 + Math.random() * 40
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // 亮度随机（幂分布让多数星偏暗、少数亮），色温轻微冷暖变化
    const brightness = Math.pow(Math.random(), 2.5) * 0.9 + 0.1
    const warm = Math.random() * 0.15
    colors[i * 3] = brightness * (1.0 - warm * 0.3)
    colors[i * 3 + 1] = brightness * (1.0 - warm * 0.1)
    colors[i * 3 + 2] = brightness
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
  })

  return new THREE.Points(geometry, material)
}
