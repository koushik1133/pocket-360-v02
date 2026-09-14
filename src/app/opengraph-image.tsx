import { ImageResponse } from "next/og";

export const alt = "Pocket Reels 360 — Your spotlight, in motion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          padding: 72,
          color: "#fffaf2",
          background: "#11100f",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 0 0 55%",
            display: "flex",
            background:
              "radial-gradient(circle at 30% 45%, #d82b75 0, #5d1739 34%, #11100f 72%)",
            opacity: 0.82,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 5,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fffaf2",
                borderRadius: 999,
                color: "#ff5697",
                fontSize: 22,
              }}
            >
              ▶
            </div>
            POCKET REELS 360
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <p
              style={{
                margin: 0,
                color: "#ff8ab6",
                fontSize: 18,
                letterSpacing: 5,
                textTransform: "uppercase",
              }}
            >
              Shoot · Edit · Deliver
            </p>
            <h1
              style={{
                maxWidth: 840,
                margin: 0,
                fontSize: 84,
                lineHeight: 0.96,
                letterSpacing: -4,
              }}
            >
              Your spotlight,
              <br />
              in motion.
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 20, color: "#bbb3a9" }}>
            Dallas · NYC · Chicago · Charlotte
          </p>
        </div>
      </div>
    ),
    size,
  );
}
