export const atmosphereVert = /* glsl */ `
varying vec3 vViewNormal;
varying vec3 vWorldNormal;

void main() {
  vViewNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const atmosphereFrag = /* glsl */ `
uniform vec3 sunDirection;
uniform vec3 glowColor;

varying vec3 vViewNormal;
varying vec3 vWorldNormal;

void main() {
  // 边缘光晕强度（视线空间 fresnel）
  float intensity = pow(0.65 - dot(vViewNormal, vec3(0.0, 0.0, 1.0)), 4.0);
  // 昼侧光晕更亮：太阳方向与球面法线的贴近程度
  float sunFactor = 0.6 + 0.4 * max(dot(vWorldNormal, sunDirection), 0.0);
  gl_FragColor = vec4(glowColor, 1.0) * intensity * sunFactor;
}
`
