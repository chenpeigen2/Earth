import * as THREE from 'three'
import { EARTH_RADIUS } from './constants'
import { earthVert, earthFrag } from './shaders/earth'
import type { EarthTextures } from './loadTextures'

/** 创建地球 mesh：昼夜混合 + 水面高光 + 边缘大气散射的自定义 ShaderMaterial */
export function createEarth(textures: EarthTextures, sunDirection: THREE.Vector3): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 96, 96)
  const material = new THREE.ShaderMaterial({
    vertexShader: earthVert,
    fragmentShader: earthFrag,
    uniforms: {
      dayMap: { value: textures.day },
      nightMap: { value: textures.night },
      waterMask: { value: textures.water },
      sunDirection: { value: sunDirection.clone() },
    },
  })
  return new THREE.Mesh(geometry, material)
}
