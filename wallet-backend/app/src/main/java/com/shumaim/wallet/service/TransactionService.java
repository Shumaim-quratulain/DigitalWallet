package com.shumaim.wallet.service;

import jakarta.transaction.Transactional;
import com.shumaim.wallet.config.RabbitMQConfig;
import com.shumaim.wallet.entities.UserInfo;
import com.shumaim.wallet.entities.UserTransaction;
import com.shumaim.wallet.repository.UserRepository;
import com.shumaim.wallet.repository.UserTransactionRepository;
import com.shumaim.wallet.response.TransactionResponseDTO;
import com.shumaim.wallet.response.UserDetailsResponseDTO;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserTransactionRepository transactionRepository;

    @Autowired
    private AmqpTemplate rabbitTemplate;

    /**
     * Queue transaction for asynchronous processing.
     *
     * @return the consumer's reply, or {@code null} when the broker is
     *         unreachable / nobody answered in time. A {@code null} return
     *         tells the caller to fall back to synchronous processing.
     */
    public String queueTransaction(UserTransaction transaction) {
        try {
            Object response = rabbitTemplate.convertSendAndReceive(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.TXN_ROUTING_KEY,
                    transaction
            );
            return response == null ? null : response.toString();
        } catch (Exception ex) {
            // Broker down, serialization problem, timeout... let the caller
            // decide. We must not fail the transfer just because the queue is
            // not available on a local dev machine.
            System.err.println("RabbitMQ unavailable, falling back to synchronous processing: " + ex.getMessage());
            return null;
        }
    }


    /**
     * Actual transaction logic executed by the consumer
     */
    @Transactional
    public String processTransaction(UserTransaction transaction) {
        try {
            double amount = transaction.getAmount();
            UserInfo sender = transaction.getSender();
            UserInfo receiver = transaction.getReceiver();

            if (sender.getAccountBalance() < amount) {
                transaction.setStatus("failed");
                transactionRepository.save(transaction);
                return "Account balance is lower than the transaction amount.";
            }

            sender.setAccountBalance(sender.getAccountBalance() - amount);
            receiver.setAccountBalance(receiver.getAccountBalance() + amount);

            userRepository.save(sender);
            userRepository.save(receiver);

            transaction.setStatus("completed");
            transactionRepository.save(transaction);

            return "Transaction processed successfully";
        } catch (Exception e) {
            transaction.setStatus("failed");
            transactionRepository.save(transaction);
            e.printStackTrace();
            return "Transaction processing failed";
        }
    }


    /**
     * Get account balance of logged-in user
     */
    public Object getBalance(String username) {
        try {
            UserInfo userInfo = userRepository.findByUsername(username).orElse(null);
            return userInfo.getAccountBalance();
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    /**
     * Get all transactions where user is sender or receiver
     */
    public List<TransactionResponseDTO> getTransactions(String username) {

        UserInfo userInfo = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<UserTransaction> transactions = transactionRepository.findBySenderOrReceiver(userInfo, userInfo);

        return transactions.stream().map(txn -> {
            TransactionResponseDTO dto = new TransactionResponseDTO();
            dto.setId(txn.getId());
            dto.setSender(mapUserToDTO(txn.getSender()));
            dto.setReceiver(mapUserToDTO(txn.getReceiver()));
            dto.setAmount(txn.getAmount());
            dto.setDescription(txn.getDescription());
            dto.setDate(txn.getDate());
            dto.setStatus(txn.getStatus());

            if (txn.getSender().getUsername().equals(username)) {
                dto.setType("DEBITED");
            } else {
                dto.setType("CREDITED");
            }

            return dto;
        }).collect(Collectors.toList());

    }

    private UserDetailsResponseDTO mapUserToDTO(UserInfo user) {
        UserDetailsResponseDTO dto = new UserDetailsResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setBalance(user.getAccountBalance());
        return dto;
    }
}
