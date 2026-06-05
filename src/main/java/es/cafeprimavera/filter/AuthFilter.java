package es.cafeprimavera.filter;

import es.cafeprimavera.repository.EmpleadoRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class AuthFilter extends OncePerRequestFilter {

    private final EmpleadoRepository empleadoRepository;

    public AuthFilter(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

                // Permitir peticiones OPTIONS (preflight CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
}

        String path = request.getRequestURI();

        // Permitir login y swagger sin autenticación
        if (path.contains("/api/auth/login") ||
            path.contains("/swagger-ui") ||
            path.contains("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        String empleadoIdHeader = request.getHeader("X-Empleado-Id");

        if (empleadoIdHeader == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"No autenticado\"}");
            return;
        }

        try {
            Integer empleadoId = Integer.parseInt(empleadoIdHeader);
            boolean existe = empleadoRepository.findById(empleadoId)
                .map(e -> e.getActivo())
                .orElse(false);

            if (!existe) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Empleado no válido\"}");
                return;
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Header inválido\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}