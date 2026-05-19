function Carta() {
  return (
    <div style={{ background: "#f9f5f0", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Cabecera */}
        <div
          style={{
            background: "#4a6030",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            marginBottom: "2rem",
            border: "3px solid #c8b89a",
          }}
        >
          <h1
            style={{
              color: "#f5e6d3",
              fontSize: "2.5rem",
              letterSpacing: "0.2em",
              marginBottom: "0.3rem",
            }}
          >
            CARTA
          </h1>
          <p
            style={{
              color: "#c8b89a",
              letterSpacing: "0.15em",
              fontSize: "0.9rem",
            }}
          >
            CAFÉ PRIMAVERA · BEBIDAS DE ESPECIALIDAD
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Cafetería e infusiones */}
          <div className="card" style={{ borderTop: "4px solid #4a6030" }}>
            <h2
              style={{
                color: "#4a6030",
                textAlign: "center",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1.2rem",
              }}
            >
              Cafetería e Infusiones
            </h2>
            {[
              ["Ristretto", "2,50€"],
              ["Latte", "2,80€"],
              ["Latte Macchiato", "3,50€"],
              ["Café Bombón", "2,50€"],
              ["Capuccino", "3,50€"],
              ["Capuccino Salón des Fleurs", "3,75€"],
              ["Café Especial", "3,75€"],
              ["Café Vienés", "3,75€"],
              ["Cacao a la taza", "3,75€"],
            ].map(([nombre, precio]) => (
              <div
                key={nombre}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.4rem 0",
                  borderBottom: "1px dotted #e8ddd0",
                }}
              >
                <span style={{ color: "#3a3028", fontSize: "0.9rem" }}>
                  {nombre}
                </span>
                <span
                  style={{
                    color: "#4a6030",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {precio}
                </span>
              </div>
            ))}

            <h2
              style={{
                color: "#4a6030",
                textAlign: "center",
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "1.5rem 0 1rem",
              }}
            >
              Té Frío
            </h2>
            {[
              ["Green Matcha", "2,50€"],
              ["Pink Vitality", "2,80€"],
            ].map(([nombre, precio]) => (
              <div
                key={nombre}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.4rem 0",
                  borderBottom: "1px dotted #e8ddd0",
                }}
              >
                <span style={{ color: "#3a3028", fontSize: "0.9rem" }}>
                  {nombre}
                </span>
                <span
                  style={{
                    color: "#4a6030",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {precio}
                </span>
              </div>
            ))}
          </div>

          {/* Dulces y Brownies */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div className="card" style={{ borderTop: "4px solid #c8a86b" }}>
              <h2
                style={{
                  color: "#c8a86b",
                  textAlign: "center",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1.2rem",
                }}
              >
                Dulces
              </h2>
              {[
                ["Tarta de Bayas del Bosque", "4,50€"],
                ["Tartaleta de Frutas de Temporada", "4,50€"],
                ["Pan blanco de chocolate", "3,95€"],
              ].map(([nombre, precio]) => (
                <div
                  key={nombre}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.4rem 0",
                    borderBottom: "1px dotted #e8ddd0",
                  }}
                >
                  <span style={{ color: "#3a3028", fontSize: "0.9rem" }}>
                    {nombre}
                  </span>
                  <span
                    style={{
                      color: "#c8a86b",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    {precio}
                  </span>
                </div>
              ))}
            </div>

            <div className="card" style={{ borderTop: "4px solid #7a4a2a" }}>
              <h2
                style={{
                  color: "#7a4a2a",
                  textAlign: "center",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1.2rem",
                }}
              >
                Brownies
              </h2>
              {[
                ["Clásico de chocolate", "3,50€"],
                ["Vegano de chocolate", "3,95€"],
                ["Pink con frambuesas", "3,95€"],
              ].map(([nombre, precio]) => (
                <div
                  key={nombre}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.4rem 0",
                    borderBottom: "1px dotted #e8ddd0",
                  }}
                >
                  <span style={{ color: "#3a3028", fontSize: "0.9rem" }}>
                    {nombre}
                  </span>
                  <span
                    style={{
                      color: "#7a4a2a",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    {precio}
                  </span>
                </div>
              ))}
            </div>

            <div className="card" style={{ borderTop: "4px solid #c8a86b" }}>
              <h2
                style={{
                  color: "#c8a86b",
                  textAlign: "center",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1rem",
                }}
              >
                Rolls & Cookies
              </h2>
              {[
                ["Cinnamon Roll", "2,95€"],
                ["Chocolate Roll", "2,95€"],
                ["Cookie Monster", "2,95€"],
              ].map(([nombre, precio]) => (
                <div
                  key={nombre}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.4rem 0",
                    borderBottom: "1px dotted #e8ddd0",
                  }}
                >
                  <span style={{ color: "#3a3028", fontSize: "0.9rem" }}>
                    {nombre}
                  </span>
                  <span
                    style={{
                      color: "#c8a86b",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    {precio}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Salados */}
          <div className="card" style={{ borderTop: "4px solid #4a6030" }}>
            <h2
              style={{
                color: "#4a6030",
                textAlign: "center",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1.2rem",
              }}
            >
              Salados
            </h2>
            {[
              ["Bocatín Jamón Ibérico", "3,95€"],
              ["Sandwich Tomate Berenjena", "3,95€"],
            ].map(([nombre, precio]) => (
              <div
                key={nombre}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.4rem 0",
                  borderBottom: "1px dotted #e8ddd0",
                }}
              >
                <span style={{ color: "#3a3028", fontSize: "0.9rem" }}>
                  {nombre}
                </span>
                <span
                  style={{
                    color: "#4a6030",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {precio}
                </span>
              </div>
            ))}
          </div>

          {/* Desayunos */}
          <div className="card" style={{ borderTop: "4px solid #4a6030" }}>
            <h2
              style={{
                color: "#4a6030",
                textAlign: "center",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1.2rem",
              }}
            >
              Desayunos
            </h2>
            {[
              ["Pan verde · Salmón ahumado, rúcula y crema de eneldo", "7,50€"],
              ["Pan blanco · Pavo, manzana verde y mostaza y miel", "7,50€"],
              ["Pan de tomate · Queso crema de berenjena y havarti", "7,50€"],
            ].map(([nombre, precio]) => (
              <div
                key={nombre}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.6rem 0",
                  borderBottom: "1px dotted #e8ddd0",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    color: "#3a3028",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                  }}
                >
                  {nombre}
                </span>
                <span
                  style={{
                    color: "#4a6030",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {precio}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#9e8e7e",
            fontSize: "0.8rem",
            fontStyle: "italic",
          }}
        >
          🌸 Todos nuestros productos son elaborados con ingredientes de
          temporada
        </div>
      </div>
    </div>
  );
}

export default Carta;
