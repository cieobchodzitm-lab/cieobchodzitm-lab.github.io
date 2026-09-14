import Link from "next/link";
import { HelmetInteractive } from "@/components/HelmetInteractive";

export const metadata = {
  title: "PHANTOM DEFENSE - Hełm Patrolowy z NINI Dronem",
  description: "Projekt hełmu patrolowego z pionowym dronem toroidalnym - silnik magnetyczny, podwójny rotator, doładowanie magnetyczne",
};

export default function HelmetPage() {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-header__brand">
            <span className="mark">⌁</span> THE BRIDGE
          </Link>
          <nav className="site-header__nav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/helmet" className="active">PHANTOM DEFENSE</Link>
          </nav>
          <div className="site-header__user">
            <span className="pill pill--gold">PROTOTYP Mk.IV</span>
          </div>
        </div>
      </header>

      <main className="main helmet-main">
        {/* HERO */}
        <section className="helmet-hero">
          <div className="helmet-hero__content">
            <p className="kicker">Angel Guardian Technologies · Phantom Defense</p>
            <h1>
              <span className="orange">PHANTOM DEFENSE:</span>
              <br />
              Hełm Patrolowy z NINI Dronem
            </h1>
            <p className="subtitle">
              Rewolucyjny system hełm-dron dla patroli, SAR i obronności. 
              Dron w pozycji <strong>wertykalnej z tyłu hełmu</strong> — śmigło toroidalne, silnik magnetyczny z podwójnym rotatorem i doładowaniem indukcyjnym.
            </p>
            <div className="cta">
              <span className="pill pill--operational"><span className="dot" /> NIJ III · 1320g</span>
              <span className="pill pill--gold">~30 min mobilizacji</span>
              <span className="pill pill--operational"><span className="dot" /> 100x niższy koszt niż SAR heli</span>
            </div>

            <div className="spec-mini-grid">
              <div className="spec-mini">
                <b>Pozycja drona</b>
                <span>Wertykalna, tył hełmu — RAIL-V</span>
              </div>
              <div className="spec-mini">
                <b>Napęd</b>
                <span>MagLev + Podwójny Rotator</span>
              </div>
              <div className="spec-mini">
                <b>Śmigło</b>
                <span>Toroidalne — 40% ciszej</span>
              </div>
              <div className="spec-mini">
                <b>Ładowanie</b>
                <span>Magnetyczne 80% w 22min</span>
              </div>
            </div>
          </div>
          <div className="helmet-hero__visual">
            <div className="hero-image-frame">
              <img src="/helmet/hero-rear.jpg" alt="Hełm z dronem z tyłu - widok tylny" />
              <div className="image-badge">Widok tylny — dokowanie wertykalne</div>
            </div>
          </div>
        </section>

        <HelmetInteractive />

        {/* WYZWANIE vs PRZEŁOM - z infografiki */}
        <section className="comparison-section">
          <div className="grid-2">
            <div className="card card--challenge">
              <h3>WYZWANIE: Tradycyjne Metody</h3>
              <div className="challenge-grid">
                <div>
                  <h4>Zespół pieszy</h4>
                  <p><span className="icon">🕐</span> &gt; 6 godzin</p>
                  <p><span className="icon">💰</span> Umiarkowany koszt</p>
                  <p className="muted">Ograniczony zasięg, zmęczenie, ryzyko</p>
                </div>
                <div>
                  <h4>Śmigłowiec SAR</h4>
                  <p><span className="icon">🕐</span> ~6 godzin (średnio)</p>
                  <p><span className="icon">💰</span> Bardzo wysoki (5-10 tys. €/h)</p>
                  <p><span className="icon">🚫</span> Brak lotów we mgle / silny wiatr</p>
                </div>
              </div>
            </div>
            <div className="card card--breakthrough">
              <h3><span className="orange">PRZEŁOM:</span> PHANTOM DEFENSE</h3>
              <div className="breakthrough-stats">
                <div className="big-stat">
                  <div className="circle-stat">
                    <span>~30</span>
                    <small>minut</small>
                  </div>
                  <p>Skraca czas dotarcia o ponad <b>90%</b></p>
                </div>
                <div className="big-stat">
                  <div className="pill pill--gold" style={{fontSize: '1.2rem', padding: '0.5rem 1rem'}}>100x niższe koszty</div>
                  <p>Działa w każdych warunkach<br/>(mgła, silny wiatr do 45km/h)</p>
                  <p style={{marginTop: '0.5rem'}}><span className="mono">Dron = ✕ Śmigłowiec</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="table-wrap" style={{marginTop: '1rem'}}>
            <table>
              <thead>
                <tr>
                  <th>Metoda</th>
                  <th>Czas mobilizacji</th>
                  <th>Koszt operacji</th>
                  <th>Odporność na pogodę</th>
                  <th>Detekcja</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{background: 'rgba(212,175,55,0.08)'}}>
                  <td><b style={{color: '#d4af37'}}>PHANTOM DEFENSE</b></td>
                  <td><span className="pill pill--gold">~30 minut</span></td>
                  <td><b>Niski</b></td>
                  <td><span className="pill pill--operational">Wysoka</span></td>
                  <td>95% AI termal 820m</td>
                </tr>
                <tr>
                  <td>Zespół pieszy</td>
                  <td><span className="pill pill--down">&gt; 6 godzin</span></td>
                  <td>Umiarkowany</td>
                  <td>Średnia</td>
                  <td>Wzrokowa</td>
                </tr>
                <tr>
                  <td>Śmigłowiec SAR</td>
                  <td><span className="pill pill--muted">~6 godzin</span></td>
                  <td><span className="pill pill--bad">Bardzo wysoki</span></td>
                  <td><span className="pill pill--bad">Niska (brak lotów we mgle)</span></td>
                  <td>Termowizja + wzrok</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SPECJALISTYCZNA KONSTRUKCJA DRONA - TWOJE WYMAGANIA */}
        <section className="tech-deep">
          <h2>SPECYFIKACJA TECHNICZNA — NINI V2 VERTICAL</h2>
          <p className="hint">Zgodnie z wymaganiami: pionowo z tyłu, śmigło toroidalne, silnik magnetyczny, podwójny rotator, doładowanie</p>

          <div className="grid-2">
            <div className="card">
              <img src="/helmet/side-mount.jpg" alt="Hełm z bocznym mocowaniem drona" style={{width: '100%', borderRadius: '8px', marginBottom: '1rem'}} />
              <h3>◈ System Dokowania RAIL-V (Tył Hełmu)</h3>
              <ul className="tech-list">
                <li><b>Pozycja:</b> Wertykalna, 0° odchylenia, środek ciężkości -12mm za osią hełmu — nie zaburza balansu przy biegu</li>
                <li><b>Mocowanie:</b> Szyna magnetyczna + 2x POGO pin 30A + zatrzask sprężynowy</li>
                <li><b>Czas zwolnienia:</b> 0.8s (gest potyliczny lub komenda głosowa "NINI START")</li>
                <li><b>Auto-dokowanie:</b> Dron wraca i dokuje autonomicznie — prowadzenie IR + magnetyczne</li>
                <li><b>Ochrona:</b> Dron w pozycji transportowej chowa śmigła wewnątrz toroidalnej obręczy — brak ryzyka zaczepienia</li>
              </ul>
            </div>

            <div className="card">
              <img src="/helmet/drone-detail.jpg" alt="Detal drona toroidalnego" style={{width: '100%', borderRadius: '8px', marginBottom: '1rem'}} />
              <h3>◈ NINI Drone — Napęd Toroidalny MagLev</h3>
              <ul className="tech-list">
                <li><b>Śmigło toroidalne (looped):</b> Zamknięta pętla, brak końcówek — -40% hałasu (52dB @ 3m), +25% ciąg, bezpieczne dotknięcie w locie, brak turbulencji końcowej</li>
                <li><b>Silnik magnetyczny:</b> Bezszczotkowy łożyskowany magnetycznie (MagLev), lewitacja wirnika, 0 tarcia, 0 zużycia, 22 000 RPM</li>
                <li><b>Podwójny rotator (coaxial):</b> Dwa przeciwbieżne rotory toroidalne na jednej osi — kompensacja momentu, zawis bez obrotu, stabilność w wietrze 45km/h</li>
                <li><b>Doładowanie:</b> 
                  <ul>
                    <li>Indukcyjne Qi2 65W z hełmu podczas dokowania</li>
                    <li>POGO DC 14.4V / 30A — 0-80% w 22 min</li>
                    <li>Regeneracyjne — podczas opadania odzyskuje 8% energii</li>
                  </ul>
                </li>
                <li><b>Bateria:</b> Li-Po 4S 950mAh + superkondensator 100F do startu impulsowego</li>
              </ul>
            </div>
          </div>

          <div className="stat-grid" style={{marginTop: '1.5rem'}}>
            <div className="stat-tile">
              <div className="label">Wymiary drona</div>
              <div className="value">110×90×22<small style={{fontSize: '0.9rem'}}>mm</small></div>
              <div className="delta">W pozycji wertykalnej na hełmie</div>
            </div>
            <div className="stat-tile">
              <div className="label">Waga drona</div>
              <div className="value">118<small style={{fontSize: '0.9rem'}}>g</small></div>
              <div className="delta">Z baterią — ultra-light</div>
            </div>
            <div className="stat-tile">
              <div className="label">Czas lotu</div>
              <div className="value">18<small style={{fontSize: '0.9rem'}}>min</small></div>
              <div className="delta">12 min z termowizją 640p + AI</div>
            </div>
            <div className="stat-tile">
              <div className="label">Zasięg / Pułap</div>
              <div className="value">1.2<small style={{fontSize: '0.9rem'}}>km / 300m</small></div>
              <div className="delta">Link szyfrowany 256-bit</div>
            </div>
          </div>
        </section>

        {/* HEŁM SPEC */}
        <section className="helmet-spec">
          <h2>Hełm Patrolowy AEGIS Mk.IV — Baza</h2>
          <div className="grid-2">
            <div className="card">
              <h3>◈ Ochrona balistyczna NIJ III</h3>
              <p>Hełm z tytanu Grade 5 + włókno węglowe T700, wyściółka D3O + MIPS. Waga całkowita systemu: <b>1320g</b> (bez drona), 1438g z NINI.</p>
              <div className="divider" />
              <h4>Systemy hełmu:</h4>
              <ul className="tech-list">
                <li><b>AR HUD:</b> Waveguide 40° FOV, 2000 nits, nakładka z drona — terma + AI bounding box</li>
                <li><b>Łączność:</b> Mesh 868MHz + LTE + BT 5.3, PTT, bone conduction</li>
                <li><b>Zasilanie:</b> Pakiet 5200mAh 14.4V w potylicy — zasila hełm 12h + 4 pełne ładowania drona</li>
                <li><b>Audio:</b> Aktywna redukcja 32dB + nasłuch kierunkowy</li>
                <li><b>NV / Kamera:</b> Szyna ARC, uchwyt NVG, kamera 4K hełmu 155°</li>
              </ul>
            </div>
            <div className="card">
              <h3>◈ Specyfikacja i przewaga technologiczna</h3>
              <div className="feature-stack">
                <div className="feature">
                  <div className="feature-icon">◈</div>
                  <div>
                    <b>Integracja 100% In-House</b>
                    <p>Angel Guardian samodzielnie rozwija CAD, firmware (PIO, GPS, failsafes) oraz analizę FMEA. Brak zależności zewnętrznych.</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">◈</div>
                  <div>
                    <b>95% skuteczności detekcji termalnej</b>
                    <p>Zaawansowane sensory AI identyfikują cele ludzkie z odległości 820 metrów, nawet w roicy — model YOLOv9-thermal + LiDAR.</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">◈</div>
                  <div>
                    <b>Ochrona balistyczna NIJ III</b>
                    <p>Hełm z tytanu i włókna węglowego zapewnia najwyższy standard bezpieczeństwa. Toroidalne śmigło eliminuje ryzyko cięcia.</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">◈</div>
                  <div>
                    <b>Cicha praca patrolowa</b>
                    <p>52dB vs 78dB standardowy quad — dron niewykrywalny z 25m. Tryb szeptu — 38dB @ 5m (tylko jeden rotor).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SCENARIUSZE */}
        <section className="scenarios">
          <h2>Scenariusze Operacyjne</h2>
          <div className="card-grid">
            <div className="card">
              <h3>◈ Patrol miejski / interwencja</h3>
              <p>Policjant uwalnia NINI gestem — dron leci 30m przed, skanuje zaułki termowizją. Obraz w HUD. Toroidalne śmigło — bezpieczne w tłumie, nie tnie przy kontakcie.</p>
              <span className="pill pill--operational pill--sm">Czas reakcji 0.8s</span>
            </div>
            <div className="card">
              <h3>◈ SAR górski — mgła</h3>
              <p>Śmigłowiec nie poleci. Patrol pieszy &gt;6h. NINI startuje z hełmu, leci 800m w mgle, LiDAR + terma wykrywa poszkodowanego. Współrzędne GPS wracają na hełm. Czas: ~30 min.</p>
              <span className="pill pill--gold pill--sm">Działa w każdych warunkach</span>
            </div>
            <div className="card">
              <h3>◈ Nocny patrol graniczny</h3>
              <p>Podwójny rotator = stabilny zawis bez dryfu. Silnik MagLev = brak sygnatury akustycznej IR. Doładowanie z hełmu — nieograniczone loty wahadłowe: 18min lot, 22min ładowanie, repeat.</p>
              <span className="pill pill--muted pill--sm">IP55 + wiatr 45km/h</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="card" style={{textAlign: 'center', padding: '2.5rem'}}>
            <h2 style={{color: 'var(--gold)'}}>Gotowy do prototypowania?</h2>
            <p className="muted" style={{maxWidth: '600px', margin: '0.8rem auto'}}>
              System PHANTOM DEFENSE z wertykalnym NINI V2 — toroidalne śmigło, podwójny rotator magnetyczny i doładowanie z hełmu. 
              Projekt open dla Angel Guardian Technologies.
            </p>
            <div style={{display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap'}}>
              <Link href="/" className="btn btn--primary">← Wróć do THE BRIDGE</Link>
              <a href="#top" className="btn">Pobierz specyfikację PDF (soon)</a>
            </div>
            <p style={{marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
              Operator: Zbigniew Szymon Kołacz · phantom@angelguardian.tech · <span className="gold">Ad Astra Una</span>
            </p>
          </div>
        </section>
      </main>

      <style>{`
        .helmet-main {
          max-width: 1200px;
        }
        .helmet-hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2.5rem;
          align-items: start;
          padding: 2rem 0 3rem;
          border-bottom: 1px solid var(--border);
        }
        .helmet-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1.1;
          margin: 0.6rem 0 1rem;
        }
        .helmet-hero h1 .orange {
          color: #ff7a18;
          background: none;
          -webkit-text-fill-color: #ff7a18;
        }
        .helmet-hero .subtitle {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 560px;
        }
        .helmet-hero .cta {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin: 1.4rem 0;
        }
        .spec-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
          margin-top: 1.8rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem;
        }
        .spec-mini b {
          display: block;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .spec-mini span {
          font-size: 0.9rem;
          color: var(--text);
        }
        .hero-image-frame {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1);
        }
        .hero-image-frame img {
          width: 100%;
          height: auto;
          display: block;
        }
        .image-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.9));
          color: #fff;
          padding: 2rem 1rem 0.8rem;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }
        .comparison-section, .tech-deep, .helmet-spec, .scenarios {
          padding: 2.5rem 0;
          border-bottom: 1px solid var(--border);
        }
        .comparison-section h3, .tech-deep h2, .helmet-spec h2, .scenarios h2 {
          color: var(--gold);
          margin-bottom: 1.2rem;
        }
        .comparison-section h3 .orange {
          color: #ff7a18;
        }
        .card--challenge {
          border-left: 3px solid #64748b;
        }
        .card--breakthrough {
          border-left: 3px solid #ff7a18;
          background: linear-gradient(135deg, var(--bg-card), rgba(255,122,24,0.06));
        }
        .challenge-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 0.8rem;
        }
        .challenge-grid h4 {
          font-size: 0.9rem;
          color: var(--text);
          margin-bottom: 0.4rem;
        }
        .challenge-grid p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0.15rem 0;
        }
        .challenge-grid .icon {
          margin-right: 0.3rem;
        }
        .breakthrough-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
          align-items: center;
        }
        .big-stat {
          text-align: center;
        }
        .circle-stat {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 3px solid #ff7a18;
          border-top-color: #334155;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.6rem;
          background: var(--bg-elevated);
        }
        .circle-stat span {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }
        .circle-stat small {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .tech-list {
          list-style: none;
          padding: 0;
        }
        .tech-list li {
          position: relative;
          padding-left: 1.2rem;
          margin: 0.6rem 0;
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .tech-list li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: var(--gold);
        }
        .tech-list li b {
          color: var(--text);
        }
        .tech-list li ul {
          margin-top: 0.4rem;
          list-style: disc;
          padding-left: 1.2rem;
        }
        .tech-list li ul li {
          padding-left: 0;
          margin: 0.2rem 0;
        }
        .tech-list li ul li::before {
          display: none;
        }
        .feature-stack {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .feature {
          display: flex;
          gap: 0.9rem;
        }
        .feature-icon {
          color: var(--gold);
          font-size: 1.1rem;
          margin-top: 0.1rem;
        }
        .feature b {
          display: block;
          color: var(--text);
          font-size: 0.95rem;
          margin-bottom: 0.2rem;
        }
        .feature p {
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .cta-section {
          padding: 2rem 0 1rem;
        }
        @media (max-width: 900px) {
          .helmet-hero {
            grid-template-columns: 1fr;
          }
          .challenge-grid, .breakthrough-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <footer className="site-footer">
        <p><span className="gold">Ad Astra Una</span> · PHANTOM DEFENSE Mk.IV · NINI V2 Vertical Toroidal</p>
        <p>Operator: Zbigniew Szymon Kołacz · phantom@angelguardian.tech</p>
      </footer>
    </>
  );
}
