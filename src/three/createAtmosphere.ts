import * as THREE from 'three'
import { ATMOSPHERE_SCALE, EARTH_RADIUS } from './constants'
import { atmosphereVert, atmosphereFrag } from './shaders/atmosphere'

/** 创建大气光晕 mesh：外层球壳背面渲染 + 加法混合 */
export function createAtmosphere(sunDirection: THREE.Vector3): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS * ATMOSPHERE_SCALE, 96, 96)
  const material = new THREE.ShaderMaterial({
    vertexShader: atmosphereVert,
    fragmentShader: atmosphereFrag,
    uniforms: {
      sunDirection: { value: sunDirection.clone() },
      glowColor: { value: new THREE.Color(0.3, 0.55, 1.0) },
    },
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  })
  return new THREE.Mesh(geometry, material)
}
