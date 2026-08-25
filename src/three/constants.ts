/** 地球半径（场景单位） */
export const EARTH_RADIUS = 1

/** 云层球体相对地球的放大倍数 */
export const CLOUD_SCALE = 1.015

/** 大气光晕球体相对地球的放大倍数 */
export const ATMOSPHERE_SCALE = 1.08

/** 地球自转角速度（rad/s，演示用加速值） */
export const EARTH_ROTATION_SPEED = 0.03

/** 云层自转角速度（略快于地球，产生相对漂移） */
export const CLOUD_ROTATION_SPEED = 0.037

/** 实时模式下地球真实自转角速度：2π / 86400 rad/s */
export const REAL_EARTH_ROTATION_SPEED = (Math.PI * 2) / 86400

/** 相机初始距离（相对地球半径） */
export const CAMERA_DISTANCE = 3

/** OrbitControls 缩放范围（相对地球半径） */
export const MIN_ZOOM = 1.5
export const MAX_ZOOM = 8

/** 交互结束后延时多久恢复自转（ms） */
export const RESUME_DELAY = 2000

/** 星空数量 */
export const STAR_COUNT = 4000
