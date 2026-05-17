package es.cafeprimavera.service;

import es.cafeprimavera.model.RegistroAppcc;
import es.cafeprimavera.repository.RegistroAppccRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RegistroAppccService {

    private final RegistroAppccRepository registroAppccRepository;

    public RegistroAppccService(RegistroAppccRepository registroAppccRepository) {
        this.registroAppccRepository = registroAppccRepository;
    }

    public List<RegistroAppcc> findAll() {
        return registroAppccRepository.findAll();
    }

    public Optional<RegistroAppcc> findById(Integer id) {
        return registroAppccRepository.findById(id);
    }

    public List<RegistroAppcc> findByTipo(String tipo) {
        return registroAppccRepository.findByTipo(tipo);
    }

    public List<RegistroAppcc> findByResultado(String resultado) {
        return registroAppccRepository.findByResultado(resultado);
    }

    public RegistroAppcc save(RegistroAppcc registro) {
        return registroAppccRepository.save(registro);
    }

    public void deleteById(Integer id) {
        registroAppccRepository.deleteById(id);
    }
}