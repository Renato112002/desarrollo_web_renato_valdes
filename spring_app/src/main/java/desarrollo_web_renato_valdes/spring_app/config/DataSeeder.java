package desarrollo_web_renato_valdes.spring_app.config;

import desarrollo_web_renato_valdes.spring_app.models.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            ComunaRepository comunaRepo,
            AvisoAdopcionRepository avisoRepo
    ) {
        return args -> {

            if (avisoRepo.count() > 0) {
                return;
            }

            List<Comuna> comunas = comunaRepo.findAll();
            Random random = new Random();
            String[] sectores = {"Centro", "Norte", "Sur", "Oriente", "Poniente"};
            String[] tipos = {"gato", "perro"};

            for (int i = 0; i < 50; i++) {
                Comuna comuna = comunas.get(random.nextInt(comunas.size()));
                AvisoAdopcion aviso = new AvisoAdopcion();
                aviso.setFechaIngreso(LocalDateTime.now().minusDays(random.nextInt(30)));
                aviso.setComuna(comuna);
                aviso.setSector(sectores[random.nextInt(sectores.length)]);
                aviso.setTipo(tipos[random.nextInt(tipos.length)]);
                aviso.setCantidad(random.nextInt(4) + 1);
                aviso.setEdad(random.nextInt(12) + 1);
                aviso.setUnidadMedida("m");
                aviso.setDescripcion("Descripción de prueba");
                aviso.setNombre("Nombre");
                aviso.setEmail("email@emaildeprueba.com");
                aviso.setFechaEntrega(LocalDateTime.now().plusDays(random.nextInt(10) + 1));
                avisoRepo.save(aviso);
            }
        };
    }
}