# Deployment Rollback Runbook

## Overview

This runbook provides procedures for rolling back deployments when issues are detected in production, staging, or other environments in the repo system.

## Severity Levels

- **P0 (Critical)**: Complete service outage, security vulnerability, data corruption
- **P1 (High)**: Major functionality broken, high error rates
- **P2 (Medium)**: Minor functionality issues, performance degradation
- **P3 (Low)**: Cosmetic issues, non-critical features affected

## Pre-Rollback Assessment (0-5 minutes)

### 1. Incident Declaration

- [ ] Declare incident in the incident management system
- [ ] Notify on-call engineer and team lead
- [ ] Create incident Slack channel: `#incident-rollback-YYYYMMDD-HHMM`
- [ ] Update status page if public-facing

### 2. Impact Assessment

- [ ] Identify affected services and endpoints
- [ ] Determine user impact scope
- [ ] Check business-critical functions
- [ ] Assess data integrity status

### 3. Rollback Decision

- [ ] Confirm rollback is the appropriate action
- [ ] Identify target rollback version
- [ ] Verify rollback artifacts are available
- [ ] Check rollback dependencies

## Rollback Procedures

### 4. Database Rollback (If Required)

**Only if database schema or data changes were deployed**

**WARNING**: Database rollbacks can cause data loss. Proceed with extreme caution.

- [ ] Stop all application services
- [ ] Create database backup before rollback
- [ ] Execute database rollback scripts
- [ ] Verify database integrity
- [ ] Document any data loss

### 5. Application Rollback

#### 5.1 Blue-Green Deployment Rollback

- [ ] Switch traffic back to previous environment
- [ ] Verify health checks pass on previous environment
- [ ] Monitor error rates and performance
- [ ] Update DNS/load balancer configuration
- [ ] Terminate failed environment

#### 5.2 Rolling Deployment Rollback

- [ ] Stop deployment pipeline
- [ ] Roll back to previous version on all instances
- [ ] Verify all instances are running previous version
- [ ] Monitor application health
- [ ] Resume normal operations

#### 5.3 Container/Kubernetes Rollback

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/[deployment-name]

# Check rollback status
kubectl rollout status deployment/[deployment-name]

# Verify pods are running
kubectl get pods -l app=[app-label]
```

#### 5.4 Serverless Function Rollback

```bash
# Rollback Lambda function
aws lambda update-function-code \
  --function-name [function-name] \
  --s3-bucket [bucket-name] \
  --s3-key [previous-version-key]

# Update function alias
aws lambda update-alias \
  --function-name [function-name] \
  --name [alias-name] \
  --function-version [previous-version]
```

### 6. Configuration Rollback

- [ ] Revert configuration changes
- [ ] Update environment variables
- [ ] Restore feature flags
- [ ] Verify configuration is applied

### 7. Infrastructure Rollback

- [ ] Roll back infrastructure changes (Terraform, CloudFormation)
- [ ] Verify infrastructure health
- [ ] Check resource availability
- [ ] Monitor infrastructure metrics

## Post-Rollback Verification

### 8. Health Checks

- [ ] Verify all services are healthy
- [ ] Check application logs for errors
- [ ] Monitor error rates and performance
- [ ] Test critical user flows
- [ ] Verify data consistency

### 9. Monitoring and Alerting

- [ ] Ensure monitoring is working correctly
- [ ] Verify alerting thresholds are appropriate
- [ ] Check dashboard metrics
- [ ] Monitor for any new issues

### 10. Communication

- [ ] Update status page
- [ ] Notify stakeholders of rollback completion
- [ ] Communicate with customer support team
- [ ] Prepare customer communications if needed

## Environment-Specific Procedures

### 11. Production Rollback

- [ ] Follow full rollback procedure
- [ ] Coordinate with all stakeholders
- [ ] Monitor closely for 24 hours
- [ ] Schedule post-mortem

### 12. Staging Rollback

- [ ] Follow standard rollback procedure
- [ ] Document issues for production deployment
- [ ] Update deployment checklist
- [ ] Notify development team

### 13. Development Environment Rollback

- [ ] Simple version revert
- [ ] Document the issue
- [ ] Update development guidelines
- [ ] Notify team members

## Rollback Automation

### 14. Automated Rollback Triggers

- [ ] High error rate (> 5%)
- [ ] Health check failures
- [ ] Performance degradation
- [ ] Security alerts
- [ ] Manual trigger

### 15. Rollback Scripts

```bash
#!/bin/bash
# Example automated rollback script

# Set variables
DEPLOYMENT_NAME="repo-api"
PREVIOUS_VERSION="v1.2.3"
CURRENT_VERSION="v1.2.4"

# Rollback deployment
kubectl rollout undo deployment/$DEPLOYMENT_NAME

# Wait for rollback to complete
kubectl rollout status deployment/$DEPLOYMENT_NAME

# Verify rollback
kubectl get pods -l app=$DEPLOYMENT_NAME

# Send notification
curl -X POST $SLACK_WEBHOOK \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Rollback completed for $DEPLOYMENT_NAME\"}"
```

## Communication

### 16. Stakeholder Updates

- [ ] Provide regular updates to leadership
- [ ] Communicate with customer support team
- [ ] Update external status page
- [ ] Prepare customer communications if needed

### 17. Post-Incident

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
- **DevOps Team Lead**: [Contact Info]
- **Infrastructure Lead**: [Contact Info]

### Secondary Contacts

- **CTO**: [Contact Info]
- **VP Engineering**: [Contact Info]

## Useful Commands

### Kubernetes Commands

```bash
# Check deployment status
kubectl get deployments

# View deployment history
kubectl rollout history deployment/[deployment-name]

# Rollback to specific revision
kubectl rollout undo deployment/[deployment-name] --to-revision=[revision-number]

# Check pod status
kubectl get pods -l app=[app-label]

# View logs
kubectl logs -l app=[app-label] --tail=100
```

### Docker Commands

```bash
# List running containers
docker ps

# Stop and remove containers
docker stop [container-id]
docker rm [container-id]

# Pull previous image
docker pull [image-name]:[previous-tag]

# Run previous version
docker run -d [image-name]:[previous-tag]
```

### AWS Commands

```bash
# Update ECS service
aws ecs update-service \
  --cluster [cluster-name] \
  --service [service-name] \
  --task-definition [task-definition-arn]

# Check service status
aws ecs describe-services \
  --cluster [cluster-name] \
  --services [service-name]
```

## Prevention Checklist

### Pre-Deployment

- [ ] Test rollback procedures in staging
- [ ] Verify rollback artifacts are available
- [ ] Document rollback steps
- [ ] Set up monitoring and alerting

### During Deployment

- [ ] Monitor deployment progress
- [ ] Watch for error rate increases
- [ ] Check health endpoints
- [ ] Verify functionality

### Post-Deployment

- [ ] Monitor for 30 minutes minimum
- [ ] Check all critical user flows
- [ ] Verify performance metrics
- [ ] Update deployment documentation

## Rollback Best Practices

### Always

- [ ] Have a rollback plan before deploying
- [ ] Test rollback procedures regularly
- [ ] Keep previous versions available
- [ ] Document all rollback decisions

### Never

- [ ] Roll back without understanding the issue
- [ ] Skip health checks after rollback
- [ ] Forget to communicate with stakeholders
- [ ] Ignore lessons learned from rollbacks
