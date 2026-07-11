import { useState } from "react";
import { loadAudioSettings, setSfxVolume, setBgmVolume } from "../services/audioSettings";

interface Props {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: Props) {
  const initial = loadAudioSettings();
  const [sfx, setSfx] = useState(initial.sfxVolume);
  const [bgm, setBgm] = useState(initial.bgmVolume);

  function handleSfx(v: number) {
    setSfx(v);
    setSfxVolume(v);
  }

  function handleBgm(v: number) {
    setBgm(v);
    setBgmVolume(v);
  }

  return (
    <div className="game-menu-overlay">
      <div className="settings-panel">
        <h2 className="settings-title">设置</h2>

        <div className="settings-body">
          {/* 音效音量 */}
          <div className="settings-row">
            <label className="settings-label">音效音量</label>
            <div className="settings-slider-wrap">
              <input
                type="range"
                className="settings-slider"
                min={0}
                max={1}
                step={0.05}
                value={sfx}
                onChange={e => handleSfx(parseFloat(e.target.value))}
              />
              <span className="settings-value">{Math.round(sfx * 100)}%</span>
            </div>
          </div>

          {/* BGM 音量 */}
          <div className="settings-row">
            <label className="settings-label">背景音乐</label>
            <div className="settings-slider-wrap">
              <input
                type="range"
                className="settings-slider"
                min={0}
                max={1}
                step={0.05}
                value={bgm}
                onChange={e => handleBgm(parseFloat(e.target.value))}
              />
              <span className="settings-value">{Math.round(bgm * 100)}%</span>
            </div>
          </div>
        </div>

        <button className="start-btn back-btn" onClick={onClose}>
          确认
        </button>
      </div>
    </div>
  );
}
