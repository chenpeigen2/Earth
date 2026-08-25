import * as THREE from 'three'
import { CLOUD_SCALE, EARTH_RADIUS } from './constants'

/** 创建云层 mesh：Lambert 材质 + 场景中的 DirectionalLight 提供昼夜明暗 */
export function createClouds(cloudTexture: THREE.Texture): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS * CLOUD_SCALE, 96, 96)
  const material = new THREE.MeshLambertMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  return new THREE.Mesh(geometry, material)
}
