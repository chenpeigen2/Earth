import * as THREE from 'three'
import dayUrl from '../assets/textures/earth-blue-marble.jpg'
import nightUrl from '../assets/textures/earth-night.jpg'
import waterUrl from '../assets/textures/earth-water.png'
import cloudsUrl from '../assets/textures/fair_clouds_4k.png'

export interface EarthTextures {
  day: THREE.Texture
  night: THREE.Texture
  water: THREE.Texture
  clouds: THREE.Texture
}

/** 预加载全部贴图（白天/夜晚/云层为 SRGB 色彩，水面遮罩保持线性） */
export function loadEarthTextures(): Promise<EarthTextures> {
  const loader = new THREE.TextureLoader()

  const load = (url: string, srgb: boolean) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          if (srgb) texture.colorSpace = THREE.SRGBColorSpace
          texture.anisotropy = 4
          resolve(texture)
        },
        undefined,
        reject,
      )
    })

  return Promise.all([
    load(dayUrl, true),
    load(nightUrl, true),
    load(waterUrl, false),
    load(cloudsUrl, true),
  ]).then(([day, night, water, clouds]) => ({ day, night, water, clouds }))
}
