# Cache Miss Spike Runbook

## Overview

This runbook provides procedures for responding to cache miss spikes that can cause performance degradation and increased database load in the repo system.

## Severity Levels

- **P0 (Critical)**: Cache miss rate > 50%, severe performance impact
- **P1 (High)**: Cache miss rate 25-50%, noticeable performance degradation
- **P2 (Medium)**: Cache miss rate 10-25%, moderate performance impact
- **P3 (Low)**: Cache miss rate < 10%, minimal impact

## Initial Response (0-5 minutes)

### 1. Incident Declaration

- [ ] Declare incident in the incident management system
- [ ] Notify on-call engineer and team lead
- [ ] Create incident Slack channel: `#incident-cache-YYYYMMDD-HHMM`
- [ ] Update status page if public-facing

### 2. Initial Assessment

- [ ] Check cache hit/miss ratio dashboards
- [ ] Monitor application response times
- [ ] Check database connection pool usage
- [ ] Review recent deployments or configuration changes

## Investigation (5-30 minutes)

### 3. Cache Performance Analysis

- [ ] Identify which cache layers are affected (Redis, CDN, application cache)
- [ ] Check cache eviction rates and memory usage
- [ ] Monitor cache key patterns and access frequency
- [ ] Review cache configuration and TTL settings

### 4. Impact Assessment

- [ ] Measure response time degradation
- [ ] Check database load increase
- [ ] Identify affected user segments or features
- [ ] Assess business impact

## Response Actions (Based on Root Cause)

### 5. Cache Eviction Issues

**Symptoms**: High eviction rates, memory pressure
**Actions**:

- [ ] Check Redis memory usage and configuration
- [ ] Review cache key expiration policies
- [ ] Consider increasing cache memory allocation
- [ ] Implement cache warming strategies

### 6. Cache Key Explosion

**Symptoms**: Too many unique cache keys, low hit rates
**Actions**:

- [ ] Identify cache key patterns causing explosion
- [ ] Implement key normalization strategies
- [ ] Review cache key generation logic
- [ ] Consider cache key versioning

### 7. Cache Invalidation Issues

**Symptoms**: Stale data, inconsistent cache state
**Actions**:

- [ ] Review cache invalidation logic
- [ ] Check for race conditions in cache updates
- [ ] Implement proper cache versioning
- [ ] Consider write-through or write-behind strategies

### 8. Traffic Pattern Changes

**Symptoms**: Sudden increase in unique requests
**Actions**:

- [ ] Analyze traffic patterns and user behavior
- [ ] Check for new features or deployments
- [ ] Review CDN configuration and edge caching
- [ ] Implement adaptive caching strategies

## Recovery Procedures

### 9. Immediate Mitigation

- [ ] Increase cache memory allocation if possible
- [ ] Implement cache warming for critical data
- [ ] Add circuit breakers for cache-dependent operations
- [ ] Enable fallback mechanisms

### 10. Cache Warming

- [ ] Identify critical cache keys and data
- [ ] Implement background cache warming jobs
- [ ] Pre-populate cache with frequently accessed data
- [ ] Monitor cache hit rates during warming

### 11. Performance Optimization

- [ ] Review and optimize cache key strategies
- [ ] Implement cache compression if applicable
- [ ] Consider multi-level caching strategies
- [ ] Optimize cache serialization/deserialization

### 12. Service Restoration

- [ ] Gradually restore cache-dependent features
- [ ] Monitor performance metrics closely
- [ ] Verify cache hit rates are improving
- [ ] Update status page

## Communication

### 13. Stakeholder Updates

- [ ] Provide regular updates to leadership
- [ ] Communicate with customer support team
- [ ] Update external status page
- [ ] Prepare customer communications if needed

### 14. Post-Incident

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
- **Backend Team Lead**: [Contact Info]
- **Infrastructure Lead**: [Contact Info]

### Secondary Contacts

- **CTO**: [Contact Info]
- **VP Engineering**: [Contact Info]

## Useful Commands

### Redis Health Checks

```bash
# Check Redis info
redis-cli info

# Check memory usage
redis-cli info memory

# Check cache hit/miss stats
redis-cli info stats | grep keyspace

# Monitor cache operations
redis-cli monitor
```

### Cache Performance Monitoring

```bash
# Check cache hit rate
redis-cli info stats | grep keyspace_hits
redis-cli info stats | grep keyspace_misses

# Check memory usage
redis-cli info memory | grep used_memory_human

# Check eviction stats
redis-cli info stats | grep evicted_keys
```

### Application Cache Monitoring

```bash
# Check application cache metrics
curl -s http://localhost:8080/metrics | grep cache

# Check cache health endpoint
curl -s http://localhost:8080/health/cache
```

## Prevention Checklist

### Daily

- [ ] Review cache hit/miss ratios
- [ ] Monitor cache memory usage
- [ ] Check cache eviction rates

### Weekly

- [ ] Review cache key patterns
- [ ] Analyze cache performance trends
- [ ] Check cache configuration

### Monthly

- [ ] Review and update runbooks
- [ ] Conduct cache performance testing
- [ ] Update cache strategies

## Cache Configuration Best Practices

### Redis Configuration

```conf
# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Network
timeout 300
tcp-keepalive 60
```

### Application Cache Settings

```javascript
// Example cache configuration
const cacheConfig = {
  ttl: 3600, // 1 hour
  maxSize: 1000,
  evictionPolicy: 'lru',
  compression: true,
};
```

## Monitoring Alerts

### Critical Alerts

- Cache miss rate > 50%
- Redis memory usage > 90%
- Cache response time > 100ms

### Warning Alerts

- Cache miss rate > 25%
- Redis memory usage > 80%
- Cache eviction rate > 100/sec
