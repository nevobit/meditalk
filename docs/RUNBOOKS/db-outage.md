# Database Outage Runbook

## Overview

This runbook provides step-by-step procedures for responding to and resolving database outages in the repo system.

## Severity Levels

- **P0 (Critical)**: Complete database unavailability affecting all services
- **P1 (High)**: Partial database issues affecting major functionality
- **P2 (Medium)**: Performance degradation or intermittent issues
- **P3 (Low)**: Minor issues with minimal user impact

## Initial Response (0-5 minutes)

### 1. Incident Declaration

- [ ] Declare incident in the incident management system
- [ ] Notify on-call engineer and team lead
- [ ] Create incident Slack channel: `#incident-db-YYYYMMDD-HHMM`
- [ ] Update status page if public-facing

### 2. Initial Assessment

- [ ] Check database health endpoints
- [ ] Verify connectivity from application servers
- [ ] Check database monitoring dashboards
- [ ] Review recent deployments or configuration changes

## Investigation (5-30 minutes)

### 3. Root Cause Analysis

- [ ] Check database logs for errors
- [ ] Monitor resource utilization (CPU, memory, disk, network)
- [ ] Verify backup status and replication lag
- [ ] Check for connection pool exhaustion
- [ ] Review recent database queries and performance metrics

### 4. Impact Assessment

- [ ] Identify affected services and endpoints
- [ ] Determine user impact scope
- [ ] Check business-critical functions
- [ ] Assess data integrity status

## Response Actions (Based on Root Cause)

### 5. Connection Issues

**Symptoms**: Connection timeouts, connection refused errors
**Actions**:

- [ ] Check network connectivity between app and database
- [ ] Verify firewall rules and security groups
- [ ] Check DNS resolution
- [ ] Restart database connection pools if necessary

### 6. Performance Issues

**Symptoms**: Slow queries, high response times
**Actions**:

- [ ] Identify and kill long-running queries
- [ ] Check for missing indexes
- [ ] Review query execution plans
- [ ] Consider read replica promotion if available

### 7. Resource Exhaustion

**Symptoms**: High CPU, memory, or disk usage
**Actions**:

- [ ] Scale database resources if possible
- [ ] Clean up temporary tables and logs
- [ ] Optimize problematic queries
- [ ] Consider read replica offloading

### 8. Data Corruption

**Symptoms**: Data integrity errors, checksum failures
**Actions**:

- [ ] Stop all write operations immediately
- [ ] Assess corruption scope
- [ ] Initiate data recovery procedures
- [ ] Consider point-in-time recovery

## Recovery Procedures

### 9. Failover to Standby

If primary database is unrecoverable:

- [ ] Verify standby database health
- [ ] Promote standby to primary
- [ ] Update application configuration
- [ ] Verify data consistency
- [ ] Update DNS/load balancer configuration

### 10. Restore from Backup

If data recovery is needed:

- [ ] Identify last known good backup
- [ ] Calculate data loss window
- [ ] Restore to staging environment first
- [ ] Verify data integrity
- [ ] Plan production restore window

### 11. Service Restoration

- [ ] Gradually restore application services
- [ ] Monitor error rates and performance
- [ ] Verify critical business functions
- [ ] Update status page

## Communication

### 12. Stakeholder Updates

- [ ] Provide regular updates to leadership
- [ ] Communicate with customer support team
- [ ] Update external status page
- [ ] Prepare customer communications if needed

### 13. Post-Incident

- [ ] Schedule post-mortem within 24 hours
- [ ] Document lessons learned
- [ ] Update runbooks based on findings
- [ ] Implement preventive measures

## Escalation Matrix

| Time Elapsed | Escalate To         | Action                   |
| ------------ | ------------------- | ------------------------ |
| 15 minutes   | Team Lead           | Technical escalation     |
| 30 minutes   | Engineering Manager | Management notification  |
| 60 minutes   | CTO/VP Engineering  | Executive escalation     |
| 2 hours      | CEO                 | Critical business impact |

## Contact Information

### Primary Contacts

- **On-Call Engineer**: Check PagerDuty rotation
- **Database Team Lead**: [Contact Info]
- **Infrastructure Lead**: [Contact Info]

### Secondary Contacts

- **CTO**: [Contact Info]
- **VP Engineering**: [Contact Info]

## Useful Commands

### Health Checks

```bash
# Check database connectivity
pg_isready -h [host] -p [port]

# Check replication status
SELECT * FROM pg_stat_replication;

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

### Performance Monitoring

```bash
# Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Prevention Checklist

### Daily

- [ ] Review database performance metrics
- [ ] Check backup completion status
- [ ] Monitor replication lag

### Weekly

- [ ] Review slow query logs
- [ ] Check disk space usage
- [ ] Verify backup restore procedures

### Monthly

- [ ] Review and update runbooks
- [ ] Conduct disaster recovery drills
- [ ] Update contact information
