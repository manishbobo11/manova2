# Performance & Network Optimizations

## Overview

This document outlines all performance and network optimizations implemented for the Manova backend to ensure fast, reliable, and scalable operation.

## 🚀 Implemented Optimizations

### **1. Global HTTP/HTTPS Keep-Alive Agents**

**Location**: `server.js`
```javascript
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 12000,
  freeSocketTimeout: 30000,
});
```

**Benefits**:
- ✅ **Connection Reuse**: Prevents TCP handshake overhead
- ✅ **Reduced Latency**: Faster subsequent requests
- ✅ **Resource Efficiency**: Better memory and CPU utilization
- ✅ **Scalability**: Handles concurrent requests efficiently

### **2. GZIP Compression**

**Location**: `server.js`
```javascript
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress SSE responses
    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

**Benefits**:
- ✅ **Bandwidth Reduction**: 60-80% smaller responses
- ✅ **Faster Loading**: Reduced transfer time
- ✅ **Cost Savings**: Lower bandwidth costs
- ✅ **SSE Exclusion**: Preserves streaming performance

### **3. Production Environment Configuration**

**Location**: `server.js`, `vite.config.js`
```javascript
// Production optimizations
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  console.log('🚀 Running in PRODUCTION mode');
  process.env.GENERATE_SOURCEMAP = 'false';
}

// Vite build optimization
build: {
  sourcemap: process.env.NODE_ENV !== 'production',
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['framer-motion', 'lucide-react'],
        charts: ['chart.js', 'react-chartjs-2', 'recharts']
      }
    }
  }
}
```

**Benefits**:
- ✅ **No Source Maps**: Smaller bundle size
- ✅ **Code Splitting**: Better caching and loading
- ✅ **Minification**: Reduced file sizes
- ✅ **Tree Shaking**: Eliminates unused code

### **4. Health Check Endpoint**

**Location**: `server.js`
```javascript
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    regions: {
      render: process.env.RENDER_REGION || 'Unknown',
      azure: process.env.AZURE_OPENAI_REGION || 'Unknown'
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(health);
});
```

**Benefits**:
- ✅ **Service Monitoring**: UptimeRobot integration
- ✅ **Performance Tracking**: Response time monitoring
- ✅ **Resource Monitoring**: Memory usage tracking
- ✅ **Geographic Verification**: Region proximity checking

### **5. Geographic Region Logging**

**Location**: `server.js`
```javascript
const logRegions = () => {
  console.log('🌍 Region Information:');
  console.log(`   Render Region: ${process.env.RENDER_REGION || 'Unknown'}`);
  console.log(`   Azure Region: ${process.env.AZURE_OPENAI_REGION || 'Unknown'}`);
  
  // Check geographic proximity
  const closeRegions = {
    'us-east-1': ['eastus', 'eastus2'],
    'us-west-1': ['westus', 'westus2', 'westus3'],
    'us-central-1': ['centralus', 'northcentralus', 'southcentralus'],
    'eu-west-1': ['westeurope', 'northeurope'],
    'ap-southeast-1': ['southeastasia', 'eastasia'],
  };
  
  const isClose = closeRegions[renderRegion]?.includes(azureRegion);
  console.log(`   Geographic Proximity: ${isClose ? '✅ Close' : '⚠️  Distant'}`);
};
```

**Benefits**:
- ✅ **Latency Optimization**: Ensures close geographic proximity
- ✅ **Performance Monitoring**: Tracks region relationships
- ✅ **Deployment Guidance**: Helps optimize region selection
- ✅ **Cost Optimization**: Reduces cross-region data transfer

### **6. Request Timeout & Fast-Fail**

**Location**: All Azure OpenAI calls
```javascript
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-key": azureKey,
    "Connection": "keep-alive"
  },
  body: JSON.stringify(payload),
  agent: httpsAgent,
  signal: AbortSignal.timeout(12000) // 12s timeout
});
```

**Benefits**:
- ✅ **Fast Fail**: Prevents hanging requests
- ✅ **User Experience**: Quick error responses
- ✅ **Resource Management**: Frees up connections
- ✅ **Reliability**: Graceful degradation

### **7. UptimeRobot Integration**

**Configuration**: `uptimerobot-config.md`
- **Monitoring Interval**: 5 minutes
- **Timeout**: 30 seconds
- **Health Endpoint**: `/health`
- **Benefits**: Keeps service warm, prevents cold starts

## 📊 Performance Monitoring

### **Performance Monitor Script**

**Location**: `scripts/performance-monitor.js`
```bash
node scripts/performance-monitor.js
```

**Features**:
- ✅ **Health Check Monitoring**: Tracks `/health` endpoint
- ✅ **Response Time Tracking**: Measures API performance
- ✅ **Error Rate Monitoring**: Tracks failure rates
- ✅ **Statistics Reporting**: Provides performance insights

### **Metrics Tracked**
- Response times
- Success rates
- Memory usage
- Uptime statistics
- Geographic latency
- Error frequencies

## 🔧 Configuration Files

### **Render Configuration**

**Location**: `render.yaml`
```yaml
services:
  - type: web
    name: manova-backend
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: NODE_ENV=production node server.js
    healthCheckPath: /health
    scaling:
      minInstances: 1
      maxInstances: 3
```

**Features**:
- ✅ **Production Environment**: NODE_ENV=production
- ✅ **Health Checks**: Automatic health monitoring
- ✅ **Auto Scaling**: Handles traffic spikes
- ✅ **Security Headers**: XSS protection, content type options

### **Package Dependencies**

**Added**: `package.json`
```json
{
  "compression": "^1.7.4"
}
```

## 🚀 Deployment Checklist

### **Pre-Deployment**
- [ ] Set `NODE_ENV=production`
- [ ] Configure Azure region proximity
- [ ] Set up UptimeRobot monitoring
- [ ] Verify environment variables
- [ ] Test health endpoint

### **Post-Deployment**
- [ ] Monitor health endpoint response
- [ ] Check geographic proximity logs
- [ ] Verify compression is working
- [ ] Test streaming endpoint performance
- [ ] Monitor memory usage

## 📈 Performance Benchmarks

### **Expected Improvements**
- **Response Time**: 30-50% reduction
- **Bandwidth Usage**: 60-80% reduction
- **Connection Efficiency**: 90%+ reuse rate
- **Cold Start Time**: Eliminated with UptimeRobot
- **Error Rate**: <1% with timeout handling

### **Monitoring Commands**
```bash
# Health check
curl https://your-app.onrender.com/health

# Performance monitoring
node scripts/performance-monitor.js

# Compression test
curl -H "Accept-Encoding: gzip" -I https://your-app.onrender.com/health
```

## 🔍 Troubleshooting

### **Common Issues**
1. **High Response Times**: Check geographic proximity
2. **Memory Leaks**: Monitor with health endpoint
3. **Connection Errors**: Verify keep-alive configuration
4. **Compression Issues**: Check Accept-Encoding headers

### **Debug Commands**
```bash
# Check regions
curl https://your-app.onrender.com/health | jq '.regions'

# Test compression
curl -H "Accept-Encoding: gzip" -v https://your-app.onrender.com/health

# Monitor performance
node scripts/performance-monitor.js
```

## 🎯 Best Practices

### **Development**
- Always test with production-like data
- Monitor memory usage during development
- Use performance monitoring script regularly
- Verify geographic proximity in staging

### **Production**
- Keep UptimeRobot monitoring active
- Monitor health endpoint regularly
- Track performance metrics over time
- Optimize regions based on user location

### **Maintenance**
- Regular performance audits
- Update dependencies for security
- Monitor for memory leaks
- Optimize based on usage patterns

## 📚 Additional Resources

- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/performance/)
- [Express.js Compression](https://github.com/expressjs/compression)
- [HTTP Keep-Alive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Keep-Alive)
- [UptimeRobot Documentation](https://uptimerobot.com/api)

