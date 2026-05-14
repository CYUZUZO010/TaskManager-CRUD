package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.EmbeddedKafkaZKBroker;

@Configuration
public class DevKafkaConfig {

    @Bean
    public EmbeddedKafkaBroker embeddedKafkaBroker() {
        // This starts an in-memory Kafka broker on port 9092
        return new EmbeddedKafkaZKBroker(1)
                .kafkaPorts(9092)
                .zkPort(2181);
    }
}
