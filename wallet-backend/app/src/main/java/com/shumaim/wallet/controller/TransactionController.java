package com.shumaim.wallet.controller;

import com.shumaim.wallet.entities.UserInfo;
import com.shumaim.wallet.entities.UserTransaction;
import com.shumaim.wallet.repository.UserRepository;
import com.shumaim.wallet.request.TransactionRequestDTO;
import com.shumaim.wallet.response.TransactionResponseDTO;
import com.shumaim.wallet.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("v1/transaction")
@CrossOrigin
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/send-money")
    public ResponseEntity<?> sendMoney(
            @RequestBody TransactionRequestDTO request,
            Authentication authentication
    ) {
        try {
            if (request.getReceiver() == null || request.getReceiver().isBlank()) {
                return ResponseEntity.badRequest().body("Receiver ID cannot be empty");
            }
            if (request.getAmount() <= 0) {
                return ResponseEntity.badRequest().body("Amount must be greater than zero");
            }

            UserInfo sender = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Sender not found"));
            UserInfo receiver = userRepository.findById(request.getReceiver())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));

            if (sender.getId().equals(receiver.getId())) {
                return ResponseEntity.badRequest().body("Sender and receiver must be different users");
            }

            UserTransaction transaction = new UserTransaction();
            transaction.setId("TXN_" + UUID.randomUUID());
            transaction.setSender(sender);
            transaction.setReceiver(receiver);
            transaction.setAmount(request.getAmount());
            transaction.setDescription(request.getDescription());
            transaction.setStatus("processing");
            transaction.setDate(LocalDateTime.now());

            String message = transactionService.queueTransaction(transaction);

            // Broker unavailable or no consumer answered -> process inline so the
            // transfer still completes on a local machine without RabbitMQ.
            if (message == null) {
                message = transactionService.processTransaction(transaction);
            }

            if (!"Transaction processed successfully".equals(message)) {
                HttpStatus status = message != null
                        && message.contains("lower than the transaction amount")
                        ? HttpStatus.UNPROCESSABLE_ENTITY
                        : HttpStatus.SERVICE_UNAVAILABLE;
                return ResponseEntity.status(status)
                        .body(message == null ? "Transaction processing failed" : message);
            }
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Exception occurred: " + e.getMessage());
        }
    }


    @GetMapping("/request-balance")
    public ResponseEntity<?> requestBalance() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("No JWT token provided or token is invalid.");
            }

            String username = authentication.getName();
            Object balance = transactionService.getBalance(username);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Exception occurred while fetching balance: " + e.getMessage());
        }
    }

    @GetMapping("/getTransactionList")
    public ResponseEntity<?> getTransactionList(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("No JWT token provided or token is invalid.");
            }

            String username = authentication.getName();
            List<TransactionResponseDTO> allTransactions = transactionService.getTransactions(username);

            // Sort by date descending
            allTransactions.sort((a, b) -> b.getDate().compareTo(a.getDate()));

            // Default offset to 0 if not provided
            if (offset == null) offset = 0;

            // Apply limit and offset
            if (limit != null) {
                int toIndex = Math.min(offset + limit, allTransactions.size());
                if (offset > allTransactions.size()) {
                    return ResponseEntity.ok(Collections.emptyList());
                }
                allTransactions = allTransactions.subList(offset, toIndex);
            }

            return ResponseEntity.ok(allTransactions);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Exception occurred while fetching transactions: " + e.getMessage());
        }
    }
}
