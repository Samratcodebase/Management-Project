import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Sparkles } from "lucide-react";
import "./App.css";

export default function App() {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setTilt({
      x: (0.5 - y) * 8,
      y: (x - 0.5) * 8,
    });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <main className="page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <motion.section
        ref={cardRef}
        className="glass-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="glass-shine" />

        <div className="jar-section">
          <motion.div
            className="jar-scene"
            animate={{ y: [0, -12, 0], rotateZ: [-2, 2, -2] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="spoon">
              <div className="spoon-handle" />
              <div className="spoon-head" />
              <div className="ghee-drop" />
            </div>

            <div className="jar-lid" />

            <div className="jar">
              <div className="jar-neck" />
              <div className="jar-glass">
                <div className="ghee-liquid">
                  <div className="liquid-shine" />
                </div>
                <div className="jar-label">Ghee</div>
                <div className="jar-reflection" />
              </div>
            </div>

            <div className="jar-shadow" />
            <div className="jar-glow" />
          </motion.div>
        </div>

        <div className="content-section">
          <div className="status">
            <span className="status-dot" />
            TEMPORARILY UNAVAILABLE
          </div>

          <h1>
            Owner is out for
            <span>Ghee Refill!</span>
          </h1>

          <p className="description">
            Our owner has temporarily stepped away to refill the Ghee. We're
            waiting for their return.
          </p>

          <motion.div
            className="waiting-pill"
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
            <strong>Please wait patiently!</strong>
          </motion.div>

          <p className="tagline">
            Good things take time.
            <br />
            Especially fresh Ghee.
          </p>

          <div className="footer-message">
            <Clock3 size={19} />
            <span>We'll be back soon.</span>
          </div>
        </div>

        <div className="corner-icon">
          <Sparkles size={19} />
        </div>
      </motion.section>

      <div className="bottom-note">
        <span>MADE WITH</span>
        <span className="heart">♥</span>
        <span>AND A LITTLE BIT OF GHEE</span>
      </div>
    </main>
  );
}
