# UptimeRobot Configuration for Manova Backend

## Setup Instructions

### 1. Create UptimeRobot Account
- Go to https://uptimerobot.com/
- Sign up for a free account (50 monitors)

### 2. Add New Monitor
- **Monitor Type**: HTTP(s)
- **Friendly Name**: Manova Backend Health Check
- **URL**: `https://your-render-app.onrender.com/health`
- **Monitoring Interval**: 5 minutes
- **Timeout**: 30 seconds

### 3. Advanced Settings
- **Alert When Down**: Yes
- **Alert When Up**: Yes
- **Alert After**: 1 failure
- **Alert Contacts**: Your email

### 4. Expected Response
The health endpoint should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 987654321,
    "heapUsed": 123456789,
    "external": 12345
  },
  "regions": {
    "render": "us-east-1",
    "azure": "eastus"
  },
  "environment": "production"
}
```

### 5. Benefits
- ✅ Keeps Render service warm (prevents cold starts)
- ✅ Monitors service health
- ✅ Alerts on downtime
- ✅ Tracks uptime statistics
- ✅ Free tier available

### 6. Alternative Services
If UptimeRobot doesn't work for you:
- **Pingdom**: https://www.pingdom.com/
- **StatusCake**: https://www.statuscake.com/
- **Cron-job.org**: https://cron-job.org/
- **GitHub Actions**: Create a scheduled workflow

### 7. GitHub Actions Alternative
Create `.github/workflows/health-check.yml`:
```yaml
name: Health Check
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Health Endpoint
        run: |
          curl -f https://your-render-app.onrender.com/health || exit 1
```

## Monitoring Dashboard
Once configured, you can view:
- Uptime percentage
- Response times
- Downtime history
- Geographic performance
- SSL certificate status
