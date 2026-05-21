package es.cafeprimavera.service;

import es.cafeprimavera.model.Mesa;
import es.cafeprimavera.repository.MesaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MesaService {

    private final MesaRepository mesaRepository;

    public MesaService(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    public List<Mesa> findAll() {
        return mesaRepository.findAll();
    }

    public Optional<Mesa> findById(Integer id) {
        return mesaRepository.findById(id);
    }

    public List<Mesa> findByZona(String zona) {
        return mesaRepository.findByZona(zona);
    }

    public Mesa cambiarEstado(Integer id, String estado) {
        Mesa mesa = mesaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
        mesa.setEstado(estado);
        if ("LIBRE".equals(estado)) {
            mesa.setNombreReserva(null);
            mesa.setHoraReserva(null);
            mesa.setPersonasReserva(null);
        }
        return mesaRepository.save(mesa);
    }

    public Mesa reservar(Integer id, String nombreReserva, String horaReserva, Integer personasReserva) {
        Mesa mesa = mesaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
        mesa.setEstado("RESERVADA");
        mesa.setNombreReserva(nombreReserva);
        mesa.setHoraReserva(horaReserva);
        mesa.setPersonasReserva(personasReserva);
        return mesaRepository.save(mesa);
    }

    public Mesa save(Mesa mesa) {
        return mesaRepository.save(mesa);
    }
}