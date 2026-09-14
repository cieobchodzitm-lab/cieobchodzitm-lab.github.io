"use client";
import { useState } from "react";

export function HelmetInteractive() {
  const [mode, setMode] = useState<"docked" | "flight" | "scan">("docked");
  const [battery, setBattery] = useState(87);

  return (
    <section className="interactive-section">
      <div className="card interactive-card">
        <div className="interactive-header">
          <h3>◈ Symulator Systemu RAIL-V — Live</h3>
          <div className="mode-switch">
            <button className={`btn btn--sm ${mode === "docked" ? "chosen" : ""}`} onClick={() => setMode("docked")}>DOKOWANIE</button>
            <button className={`btn btn--sm ${mode === "flight" ? "chosen" : ""}`} onClick={() => { setMode("flight"); setBattery(b => Math.max(12, b-3)); }}>LOT</button>
            <button className={`btn btn--sm ${mode === "scan" ? "chosen" : ""}`} onClick={() => { setMode("scan"); setBattery(b => Math.max(8, b-5)); }}>SCAN TERMAL</button>
          </div>
        </div>

        <div className="interactive-body">
          <div className="helmet-viz">
            <div className={`helmet-model ${mode}`}>
              <div className="helmet-shape">
                <div className="helmet-dome">AEGIS Mk.IV</div>
                <div className={`drone-unit ${mode}`}>
                  <div className="toroidal-prop">
                    <div className="toroid-ring"></div>
                    <div className="toroid-ring inner"></div>
                    <div className={`rotor double ${mode === "docked" ? "" : "spinning"}`}></div>
                  </div>
                  <div className="drone-label">NINI V2</div>
                  <div className="mag-contacts">
                    <span className="led green"></span>
                    <span className="led gold"></span>
                  </div>
                </div>
              </div>
              <div className="status-lines">
                <div className="line"><span>RAIL-V:</span> <b className={mode === "docked" ? "ok" : "warn"}>{mode === "docked" ? "LOCKED MAG" : "RELEASED 0.8s"}</b></div>
                <div className="line"><span>Toroidal RPM:</span> <b>{mode === "docked" ? "0" : mode === "flight" ? "22,000" : "18,500 (cichy)"} </b></div>
                <div className="line"><span>Podwójny rotator:</span> <b>{mode === "docked" ? "STANDBY" : "CONTRA-ROTATING ✓"}</b></div>
                <div className="line"><span>Ładowanie:</span> <b>{mode === "docked" ? "65W INDUKCYJNE + POGO 30A" : "REGEN -8% podczas zniżania"}</b></div>
              </div>
            </div>
          </div>

          <div className="telemetry">
            <div className="telemetry-grid">
              <div className="t-item">
                <label>Bateria NINI</label>
                <div className="battery-bar">
                  <div className="fill" style={{width: `${battery}%`, background: battery > 30 ? '#4ade80' : '#f87171'}}></div>
                </div>
                <span>{battery}% · {Math.floor(battery * 0.18)} min lotu</span>
              </div>
              <div className="t-item">
                <label>Silnik MagLev</label>
                <span className="mono">{mode === "docked" ? "LEVITATION IDLE · 0.2W" : "22k RPM · 0 tarcia · 48°C"}</span>
              </div>
              <div className="t-item">
                <label>Hałas</label>
                <span className="mono">{mode === "docked" ? "0 dB" : mode === "scan" ? "38 dB (tryb szeptu)" : "52 dB @3m (-40% vs quad)"}</span>
              </div>
              <div className="t-item">
                <label>Detekcja AI</label>
                <span className="mono">{mode === "scan" ? "HUMAN 820m · 95% · LiDAR 20m" : "STANDBY"}</span>
              </div>
            </div>

            <div className="tech-explain">
              <h4>Dlaczego wertykalnie z tyłu?</h4>
              <ul>
                <li><b>Balans:</b> Środek ciężkości drona (118g) leży -12mm za osią — nie ciągnie głowy do przodu jak montaż czołowy</li>
                <li><b>Bezpieczeństwo:</b> Toroidalna obręcz chroni — nawet przy potknięciu nie tnie, można biec przez krzaki</li>
                <li><b>Szybki start:</b> Gest odchylenia głowy 25° + komenda — dron wystrzeliwuje w górę, omija ramiona</li>
                <li><b>Doładowanie:</b> W pozycji wertykalnej styki POGO + indukcja mają największą powierzchnię — 65W bez kabli</li>
              </ul>
            </div>

            <div className="action-row">
              <button className="btn btn--primary" onClick={() => { setMode("flight"); setBattery(100); }}>⟡ Symuluj zwolnienie NINI (0.8s)</button>
              <button className="btn" onClick={() => { setMode("docked"); setBattery(b => Math.min(100, b+15)); }}>⟡ Dokuj + ładuj (+15%)</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .interactive-section {
          padding: 1.5rem 0 2.5rem;
        }
        .interactive-card {
          background: linear-gradient(180deg, #1e232e, #1a1e26);
          border: 1px solid #2a2f38;
          border-left: 3px solid #d4af37;
        }
        .interactive-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .interactive-header h3 {
          color: #d4af37;
          font-size: 1.05rem;
        }
        .mode-switch {
          display: flex;
          gap: 0.5rem;
        }
        .mode-switch .btn.chosen {
          border-color: #d4af37;
          color: #d4af37;
          background: rgba(212,175,55,0.12);
        }
        .interactive-body {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 2rem;
        }
        .helmet-viz {
          background: #0c0e12;
          border: 1px solid #2a2f38;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 380px;
        }
        .helmet-model {
          width: 100%;
        }
        .helmet-shape {
          width: 180px;
          height: 140px;
          background: linear-gradient(180deg, #2a2f38, #14171d);
          border-radius: 90px 90px 20px 20px;
          margin: 0 auto;
          position: relative;
          border: 1px solid #3a404c;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 10px 20px rgba(0,0,0,0.5);
        }
        .helmet-dome {
          font-size: 0.7rem;
          color: #9a968f;
          letter-spacing: 0.15em;
        }
        .drone-unit {
          position: absolute;
          right: -30px;
          top: 20px;
          width: 60px;
          height: 90px;
          background: #1a1e26;
          border: 1px solid #d4af37;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px;
          transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 0 20px rgba(212,175,55,0.2);
        }
        .drone-unit.flight {
          transform: translate(120px, -80px) rotate(-10deg) scale(1.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.3);
        }
        .drone-unit.scan {
          transform: translate(80px, -120px) rotate(5deg) scale(1.15);
          box-shadow: 0 0 50px rgba(74,222,128,0.3);
        }
        .toroidal-prop {
          width: 44px;
          height: 44px;
          position: relative;
          margin-top: 2px;
        }
        .toroid-ring {
          position: absolute;
          inset: 0;
          border: 3px solid #5a6475;
          border-radius: 50%;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }
        .toroid-ring.inner {
          inset: 8px;
          border-color: #d4af37;
          border-width: 2px;
        }
        .rotor {
          position: absolute;
          inset: 12px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0deg, #d4af37 30deg, transparent 60deg, transparent 180deg, #d4af37 210deg, transparent 240deg);
        }
        .rotor.double::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 180deg, transparent 0deg, #4ade80 30deg, transparent 60deg, transparent 180deg, #4ade80 210deg, transparent 240deg);
          opacity: 0.7;
        }
        .rotor.spinning {
          animation: spin 0.3s linear infinite;
        }
        .rotor.spinning.double::after {
          animation: spinReverse 0.25s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          to { transform: rotate(-360deg); }
        }
        .drone-label {
          font-size: 0.55rem;
          color: #d4af37;
          letter-spacing: 0.1em;
          margin-top: 4px;
          font-weight: 700;
        }
        .mag-contacts {
          display: flex;
          gap: 3px;
          margin-top: 3px;
        }
        .led {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .led.green { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
        .led.gold { background: #d4af37; box-shadow: 0 0 6px #d4af37; }
        .status-lines {
          margin-top: 1.2rem;
          width: 100%;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: 0.8rem;
          border: 1px solid #1e232e;
        }
        .status-lines .line {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          padding: 0.2rem 0;
          border-bottom: 1px dashed #1e232e;
        }
        .status-lines .line:last-child { border: none; }
        .status-lines .line span { color: #9a968f; }
        .status-lines .line b { color: #e8e6e3; font-weight: 600; }
        .status-lines .line b.ok { color: #4ade80; }
        .status-lines .line b.warn { color: #fbbf24; }
        .telemetry {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .telemetry-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
        }
        .t-item {
          background: #14171d;
          border: 1px solid #2a2f38;
          border-radius: 8px;
          padding: 0.8rem;
        }
        .t-item label {
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9a968f;
          margin-bottom: 0.4rem;
        }
        .t-item .mono {
          font-family: ui-monospace, monospace;
          font-size: 0.82rem;
          color: #e8e6e3;
        }
        .battery-bar {
          height: 8px;
          background: #0c0e12;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #2a2f38;
          margin-bottom: 0.3rem;
        }
        .battery-bar .fill {
          height: 100%;
          transition: width 0.5s ease;
        }
        .tech-explain {
          background: rgba(212,175,55,0.06);
          border: 1px solid rgba(212,175,55,0.15);
          border-radius: 8px;
          padding: 1rem;
        }
        .tech-explain h4 {
          font-size: 0.9rem;
          color: #d4af37;
          margin-bottom: 0.6rem;
        }
        .tech-explain ul {
          list-style: none;
          padding: 0;
        }
        .tech-explain li {
          font-size: 0.85rem;
          color: #9a968f;
          padding: 0.25rem 0 0.25rem 1rem;
          position: relative;
          line-height: 1.4;
        }
        .tech-explain li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #d4af37;
        }
        .tech-explain li b { color: #e8e6e3; }
        .action-row {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .interactive-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
