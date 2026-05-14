package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);

    @KafkaListener(topics = "${spring.kafka.topic.name:task-events}", groupId = "${spring.kafka.consumer.group-id:task-group}")
    public void consume(String message) {
        logger.info("Received Kafka Message: \n====================================\n{}\n====================================", message);
    }
}
