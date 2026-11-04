package com.shumaim.wallet.repository;

import com.shumaim.wallet.entities.UserInfo;
import com.shumaim.wallet.entities.UserTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTransactionRepository extends JpaRepository<UserTransaction, String> {
    List<UserTransaction> findBySenderOrReceiver(UserInfo sender, UserInfo receiver);
}
