package com.shumaim.wallet.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class TransactionRequestDTO {
    private String sender;
    private String receiver;
    private int amount;
    private String description;
}
