package es.cafeprimavera.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cierre_caja")
public class CierreCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, name = "total_efectivo")
    private Double totalEfectivo = 0.0;

    @Column(nullable = false, name = "total_tarjeta")
    private Double totalTarjeta = 0.0;

    @Column(nullable = false, name = "total_bizum")
    private Double totalBizum = 0.0;

    @Column(nullable = false, name = "total_general")
    private Double totalGeneral = 0.0;

    @Column(nullable = false, name = "num_pedidos")
    private Integer numPedidos = 0;

    @Column(nullable = false, name = "num_cancelados")
    private Integer numCancelados = 0;

    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public Double getTotalEfectivo() { return totalEfectivo; }
    public void setTotalEfectivo(Double totalEfectivo) { this.totalEfectivo = totalEfectivo; }
    public Double getTotalTarjeta() { return totalTarjeta; }
    public void setTotalTarjeta(Double totalTarjeta) { this.totalTarjeta = totalTarjeta; }
    public Double getTotalBizum() { return totalBizum; }
    public void setTotalBizum(Double totalBizum) { this.totalBizum = totalBizum; }
    public Double getTotalGeneral() { return totalGeneral; }
    public void setTotalGeneral(Double totalGeneral) { this.totalGeneral = totalGeneral; }
    public Integer getNumPedidos() { return numPedidos; }
    public void setNumPedidos(Integer numPedidos) { this.numPedidos = numPedidos; }
    public Integer getNumCancelados() { return numCancelados; }
    public void setNumCancelados(Integer numCancelados) { this.numCancelados = numCancelados; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}