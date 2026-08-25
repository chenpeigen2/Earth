import * as THREE from 'three'

/**
 * 太阳直下点（subsolar point）近似计算：太阳此刻直射的经纬度。
 * 赤纬用 Cooper 公式近似（误差 < 1°）；经度忽略均时差（±16 分钟，视觉可忽略）。
 */
export function computeSubsolarPoint(date: Date): { lat: number; lon: number } {
  const dayOfYear =
    (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000

  // 太阳赤纬：夏至 +23.44°，冬至 -23.44°
  const lat =
    (-23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365.24))

  // UTC 正午太阳直射经度 0°，每过 1 小时向西移 15°（东经为正）
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const lon = (12 - utcHours) * 15

  return { lat, lon }
}

/**
 * 经纬度 → 世界空间单位向量。与 SphereGeometry 贴图 UV 对齐：
 * 经度 0°（格林尼治）在 +X，东经 90° 在 -Z，北极 +Y。
 * 仅在地球 mesh rotation.y = 0 时成立；地球自转后需再绕 Y 轴旋转。
 */
export function geoToVector(latDeg: number, lonDeg: number): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latDeg)
  const lon = THREE.MathUtils.degToRad(lonDeg)
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon),
  ).normalize()
}

/** 当前时刻的太阳方向（世界空间，要求地球 rotation.y = 0）。可传入 target 复用向量 */
export function computeSunDirection(date: Date, target = new THREE.Vector3()): THREE.Vector3 {
  const { lat, lon } = computeSubsolarPoint(date)
  const latRad = THREE.MathUtils.degToRad(lat)
  const lonRad = THREE.MathUtils.degToRad(lon)
  return target
    .set(
      Math.cos(latRad) * Math.cos(lonRad),
      Math.sin(latRad),
      -Math.cos(latRad) * Math.sin(lonRad),
    )
    .normalize()
}
