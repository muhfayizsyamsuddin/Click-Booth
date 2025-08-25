export default function TestPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f0e8",
        padding: "2rem",
      }}
    >
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: "#2a312d",
            marginBottom: "2rem",
          }}
        >
          ClickBooth Studio Test
        </h1>
        <p
          style={{ fontSize: "1.2rem", color: "#4a524e", marginBottom: "3rem" }}
        >
          Testing if content shows up properly
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            marginTop: "3rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "1rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Feature 1
            </h3>
            <p style={{ color: "#6b7470" }}>
              Professional photo booth experience
            </p>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "1rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Feature 2
            </h3>
            <p style={{ color: "#6b7470" }}>Advanced editing tools</p>
          </div>
        </div>
      </div>
    </div>
  );
}
