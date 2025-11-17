package desarrollo_web_renato_valdes.spring_app.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AvisoAdopcionRepository extends JpaRepository<AvisoAdopcion, Integer> {

    @Query("SELECT a FROM AvisoAdopcion a JOIN FETCH a.comuna c JOIN FETCH c.region")
    List<AvisoAdopcion> findAllWithComuna();
}
