export const earthVert = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const earthFrag = /* glsl */ `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform sampler2D waterMask;
uniform vec3 sunDirection;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float sunDot = dot(N, sunDirection);

  // 昼夜混合：smoothstep 造晨昏线柔和过渡带（约 ±7°）
  float dayMix = smoothstep(-0.12, 0.12, sunDot);

  vec3 dayColor = texture2D(dayMap, vUv).rgb;
  vec3 nightColor = texture2D(nightMap, vUv).rgb;
  // 城市灯光加暖色调
  nightColor *= vec3(1.0, 0.92, 0.78);

  vec3 color = mix(nightColor, dayColor, dayMix);

  // 水面高光：仅昼侧的海洋上出现太阳反光斑
  float water = texture2D(waterMask, vUv).r;
  vec3 R = reflect(-sunDirection, N);
  float spec = pow(max(dot(V, R), 0.0), 24.0) * water;
  color += vec3(0.9, 0.95, 1.0) * spec * dayMix;

  // 贴着地球边缘的蓝色大气散射（昼侧更亮）
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  color += vec3(0.25, 0.45, 1.0) * fresnel * max(dayMix, 0.15) * 0.6;

  gl_FragColor = vec4(color, 1.0);
}
`
