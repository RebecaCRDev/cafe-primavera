package es.cafeprimavera.service;

import es.cafeprimavera.model.Evento;
import es.cafeprimavera.repository.EventoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;

    public EventoService(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    public List<Evento> findAll() {
        return eventoRepository.findAll();
    }

    public Optional<Evento> findById(Integer id) {
        return eventoRepository.findById(id);
    }

    public List<Evento> findConPlazas() {
        return eventoRepository.findByPlazasDisponiblesGreaterThan(0);
    }

    public Evento save(Evento evento) {
        return eventoRepository.save(evento);
    }

    public void deleteById(Integer id) {
        eventoRepository.deleteById(id);
    }
}