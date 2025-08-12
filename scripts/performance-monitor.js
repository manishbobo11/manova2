/**
 * Performance Monitoring Script for Manova Backend
 * Monitors response times, health status, and performance metrics
 */

const https = require('https');
const http = require('http');

class PerformanceMonitor {
  constructor(baseUrl = 'https://manova2.onrender.com') {
    this.baseUrl = baseUrl;
    this.metrics = {
      healthChecks: [],
      responseTimes: [],
      errors: []
    };
  }

  async checkHealth() {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/health');
      const responseTime = Date.now() - startTime;
      
      const metric = {
        timestamp: new Date().toISOString(),
        endpoint: '/health',
        status: response.status,
        responseTime,
        data: response.data
      };
      
      this.metrics.healthChecks.push(metric);
      
      console.log(`✅ Health Check: ${response.status} (${responseTime}ms)`);
      console.log(`   Uptime: ${response.data.uptime}s`);
      console.log(`   Memory: ${Math.round(response.data.memory.heapUsed / 1024 / 1024)}MB`);
      console.log(`   Regions: ${response.data.regions.render} → ${response.data.regions.azure}`);
      
      return metric;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMetric = {
        timestamp: new Date().toISOString(),
        endpoint: '/health',
        error: error.message,
        responseTime
      };
      
      this.metrics.errors.push(errorMetric);
      console.error(`❌ Health Check Failed: ${error.message} (${responseTime}ms)`);
      
      return errorMetric;
    }
  }

  async testStreamingEndpoint(message = 'Hello, how are you?') {
    const startTime = Date.now();
    
    try {
      // Test streaming endpoint (without auth for monitoring)
      const response = await this.makeRequest(`/api/sarthi/stream?message=${encodeURIComponent(message)}`);
      const responseTime = Date.now() - startTime;
      
      const metric = {
        timestamp: new Date().toISOString(),
        endpoint: '/api/sarthi/stream',
        status: response.status,
        responseTime
      };
      
      this.metrics.responseTimes.push(metric);
      
      console.log(`✅ Streaming Test: ${response.status} (${responseTime}ms)`);
      
      return metric;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMetric = {
        timestamp: new Date().toISOString(),
        endpoint: '/api/sarthi/stream',
        error: error.message,
        responseTime
      };
      
      this.metrics.errors.push(errorMetric);
      console.log(`⚠️  Streaming Test: ${error.message} (${responseTime}ms) - Expected for unauthenticated requests`);
      
      return errorMetric;
    }
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Manova-Performance-Monitor/1.0'
        }
      };
      
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              status: res.statusCode,
              data: jsonData
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: data
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  getStats() {
    const healthChecks = this.metrics.healthChecks;
    const responseTimes = this.metrics.responseTimes;
    const errors = this.metrics.errors;
    
    if (healthChecks.length === 0) {
      return { message: 'No metrics collected yet' };
    }
    
    const avgResponseTime = healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length;
    const successRate = (healthChecks.filter(check => check.status === 200).length / healthChecks.length) * 100;
    
    return {
      totalChecks: healthChecks.length,
      successRate: `${successRate.toFixed(1)}%`,
      avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
      errors: errors.length,
      lastCheck: healthChecks[healthChecks.length - 1].timestamp
    };
  }

  printStats() {
    const stats = this.getStats();
    console.log('\n📊 Performance Statistics:');
    console.log(`   Total Checks: ${stats.totalChecks}`);
    console.log(`   Success Rate: ${stats.successRate}`);
    console.log(`   Avg Response Time: ${stats.avgResponseTime}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Last Check: ${stats.lastCheck}`);
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  async function runMonitor() {
    console.log('🔍 Starting Performance Monitor...\n');
    
    // Run health check
    await monitor.checkHealth();
    
    // Run streaming test
    await monitor.testStreamingEndpoint();
    
    // Print statistics
    monitor.printStats();
    
    console.log('\n✅ Performance monitoring completed');
  }
  
  runMonitor().catch(console.error);
}

module.exports = PerformanceMonitor;
