package com.shumaim.wallet.entities;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name="transactions")
public class UserTransaction implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Column(name="transaction_id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "sender_id", referencedColumnName = "user_id")
    private UserInfo sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", referencedColumnName = "user_id")
    private UserInfo receiver;

    private int amount;

    private String description;

    private LocalDateTime date;

    private String status;
}
