package com.swp.horseracing.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConstraintFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // Drop check constraints created by Hibernate enum mappings that block new enum values
            jdbcTemplate.execute("ALTER TABLE user_attachments DROP CONSTRAINT IF EXISTS user_attachments_doc_type_check");
            System.out.println("Dropped user_attachments_doc_type_check successfully.");
        } catch (Exception e) {
            System.out.println("Could not drop constraint: " + e.getMessage());
        }
        
        try {
            jdbcTemplate.execute("ALTER TABLE user_attachments DROP CONSTRAINT IF EXISTS user_attachments_doc_type_check1");
            System.out.println("Dropped user_attachments_doc_type_check1 successfully.");
        } catch (Exception e) {
            System.out.println("Could not drop constraint1: " + e.getMessage());
        }
    }
}
