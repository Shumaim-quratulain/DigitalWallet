package com.shumaim.wallet.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransactionResponseDTO {
    private String id;
    private UserDetailsResponseDTO sender;
    private UserDetailsResponseDTO receiver;
    private double amount;
    private String description;
    private LocalDateTime date;
    private String status;
    private String type;

}
