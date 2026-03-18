package es.cafeprimavera.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evento")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String nombre;

    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false)
    private Integer plazasTotales;

    @Column(nullable = false)
    private Integer plazasDisponibles;

    @Column(nullable = false)
    private Double precio = 0.0;

    @Column(nullable = false)
    private String tipo;

    @ManyToOne
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public Integer getPlazasTotales() { return plazasTotales; }
    public void setPlazasTotales(Integer plazasTotales) { this.plazasTotales = plazasTotales; }
    public Integer getPlazasDisponibles() { return plazasDisponibles; }
    public void setPlazasDisponibles(Integer plazasDisponibles) { this.plazasDisponibles = plazasDisponibles; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }
}