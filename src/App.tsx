import { useState } from 'react'
import { useEarthScene } from './hooks/useEarthScene'

export default function App() {
  const [realTime, setRealTime] = useState(false)
  const containerRef = useEarthScene(realTime)

  return (
    <div className="earth-container" ref={containerRef}>
      <div className="title">EARTH</div>
      <button
        type="button"
        className={`mode-toggle ${realTime ? 'active' : ''}`}
        onClick={() => setRealTime((v) => !v)}
      >
        {realTime ? '☀ 实时昼夜 · 开' : '☀ 实时昼夜 · 关'}
      </button>
      <div className="hint">
        {realTime ? '晨昏线与当前真实时间同步' : '演示模式：加载时昼夜与真实时间一致'}
      </div>
    </div>
  )
}
