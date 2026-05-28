package com.example.demo.scheduler;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("customTaskScheduler")
public class TaskScheduler {
    
    @Autowired
    private TaskRepository taskRepository;
    
    // Run exactly every 5 seconds without Kafka
    @Scheduled(fixedRate = 5000)
    public void processCompletedTasks() {
        List<Task> completedTasks = taskRepository.findByCompleted(true);
        
        List<String> taskTitles = completedTasks.stream()
                .map(Task::getTitle)
                .collect(Collectors.toList());
        
        String message = String.join(", ", taskTitles);
        
        if (!message.isEmpty()) {
            System.out.println("[" + LocalDateTime.now() + "] [Scheduler] HOORAY! You completed these tasks: " + message);
        } else {
            System.out.println("[" + LocalDateTime.now() + "] [Scheduler] You have no completed tasks right now! Time to get to work!");
        }
    }
}
