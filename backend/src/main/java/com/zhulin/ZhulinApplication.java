package com.zhulin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ZhulinApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZhulinApplication.class, args);
    }

}