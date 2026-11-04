package com.shumaim.wallet.repository;

import com.shumaim.wallet.entities.UserInfo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<UserInfo,String> {
    Optional<UserInfo> findByUsername(String username);

    boolean existsByEmailAndUsernameNot(String email, String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    List<UserInfo> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);

}
