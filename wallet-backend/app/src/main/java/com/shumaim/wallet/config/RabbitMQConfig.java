package com.shumaim.wallet.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

@Configuration
public class RabbitMQConfig {

    public static final String TXN_QUEUE = "transaction.queue";
    public static final String NOTIFY_QUEUE = "notify.queue";
    public static final String LOGGING_QUEUE = "logging.queue";
    public static final String EXCHANGE = "banking.queue";

    public static final String TXN_ROUTING_KEY = "txn.process";
    public static final String NOTIFY_ROUTING_KEY = "notify.send";
    public static final String LOGGING_ROUTING_KEY = "logging.store";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue txnQueue() {
        return new Queue(TXN_QUEUE);
    }

    @Bean
    public Queue notifyQueue() {
        return new Queue(NOTIFY_QUEUE);
    }

    @Bean
    public Queue loggingQueue() {
        return new Queue(LOGGING_QUEUE);
    }

    @Bean
    public Binding txnBinding() {
        return BindingBuilder.bind(txnQueue()).to(exchange()).with(TXN_ROUTING_KEY);
    }
    @Bean
    public Binding notifyBinding() {
        return BindingBuilder.bind(notifyQueue()).to(exchange()).with(NOTIFY_ROUTING_KEY);
    }
    @Bean
    public Binding loggingBinding() {
        return BindingBuilder.bind(loggingQueue()).to(exchange()).with(LOGGING_ROUTING_KEY);
    }
    /**
     * Reuse Spring Boot's auto-configured ObjectMapper instead of building a
     * bare `new Jackson2JsonMessageConverter()`. The auto-configured mapper has
     * the JavaTimeModule registered, which is REQUIRED because UserTransaction
     * carries a java.time.LocalDateTime `date` field. Without it, publishing a
     * transaction to the queue fails with:
     * "Java 8 date/time type `java.time.LocalDateTime` not supported by default".
     */
    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
