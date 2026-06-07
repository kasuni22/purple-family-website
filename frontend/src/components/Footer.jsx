export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <p style={styles.footerText}>Made by 💜 Kasuni Kariyawasam</p>
        <p style={styles.footerText}>© 2026 Purple Family. All rights reserved.</p>
        <p style={styles.footerSmall}>Built with 🐍 Python & ⚛️ React</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#2d0a4e",
    padding: "1.5rem",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  footerContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  footerText: {
    color: "white",
    margin: "0.5rem 0",
    fontSize: "0.95rem",
  },
  footerSmall: {
    color: "#d4b8ff",
    margin: "0.5rem 0",
    fontSize: "0.85rem",
  },
};
