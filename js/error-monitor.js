// Advanced Error Monitoring and Logging System
class ErrorMonitor {
  constructor() {
    this.errors = [];
    this.performanceLogs = [];
    this.userActions = [];
    this.config = {
      maxErrors: 1000,
      maxLogs: 500,
      enableConsoleCapture: true,
      enableNetworkMonitoring: true,
      enablePerformanceMonitoring: true,
      enableUserTracking: true
    };
    this.init();
  }

  init() {
    this.setupErrorHandlers();
    this.setupPerformanceMonitoring();
    this.setupNetworkMonitoring();
    this.setupUserActionTracking();
    this.createErrorInterface();
    this.startHealthCheck();
  }

  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        severity: 'high'
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'promise_rejection',
        message: event.reason ? event.reason.message || event.reason : 'Promise rejected',
        stack: event.reason ? event.reason.stack : null,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        severity: 'medium'
      });
    });

    // Console error capture
    if (this.config.enableConsoleCapture) {
      this.interceptConsole();
    }
  }

  interceptConsole() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      this.logError({
        type: 'console_error',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        severity: 'medium'
      });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.logError({
        type: 'console_warning',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        severity: 'low'
      });
      originalWarn.apply(console, args);
    };
  }

  setupPerformanceMonitoring() {
    if (!this.config.enablePerformanceMonitoring) return;

    // Page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          this.logPerformance({
            type: 'page_load',
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstByte: perfData.responseStart - perfData.requestStart,
            domComplete: perfData.domComplete - perfData.domLoading,
            timestamp: new Date().toISOString(),
            url: window.location.href
          });
        }
      }, 0);
    });

    // Resource loading performance
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) { // Log slow resources (>1s)
            this.logPerformance({
              type: 'slow_resource',
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize || 0,
              timestamp: new Date().toISOString()
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }

    // Memory usage monitoring
    if (performance.memory) {
      setInterval(() => {
        const memInfo = performance.memory;
        if (memInfo.usedJSHeapSize > 50 * 1024 * 1024) { // Log if >50MB
          this.logPerformance({
            type: 'high_memory_usage',
            usedJSHeapSize: memInfo.usedJSHeapSize,
            totalJSHeapSize: memInfo.totalJSHeapSize,
            jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
            timestamp: new Date().toISOString()
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  setupNetworkMonitoring() {
    if (!this.config.enableNetworkMonitoring) return;

    // Monitor failed network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        if (!response.ok) {
          this.logError({
            type: 'network_error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            duration: endTime - startTime,
            timestamp: new Date().toISOString(),
            severity: response.status >= 500 ? 'high' : 'medium'
          });
        } else if (endTime - startTime > 5000) {
          this.logPerformance({
            type: 'slow_network_request',
            url: args[0],
            duration: endTime - startTime,
            status: response.status,
            timestamp: new Date().toISOString()
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        this.logError({
          type: 'network_failure',
          message: error.message,
          url: args[0],
          duration: endTime - startTime,
          timestamp: new Date().toISOString(),
          severity: 'high'
        });
        throw error;
      }
    };
  }

  setupUserActionTracking() {
    if (!this.config.enableUserTracking) return;

    // Track clicks
    document.addEventListener('click', (event) => {
      this.logUserAction({
        type: 'click',
        element: event.target.tagName,
        text: event.target.textContent?.substring(0, 50) || '',
        id: event.target.id || null,
        className: event.target.className || null,
        coordinates: { x: event.clientX, y: event.clientY },
        timestamp: new Date().toISOString()
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      this.logUserAction({
        type: 'form_submit',
        formId: event.target.id || null,
        formAction: event.target.action || null,
        fieldCount: event.target.elements.length,
        timestamp: new Date().toISOString()
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.logUserAction({
        type: 'visibility_change',
        hidden: document.hidden,
        timestamp: new Date().toISOString()
      });
    });

    // Track session duration
    let sessionStart = Date.now();
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStart;
      this.logUserAction({
        type: 'session_end',
        duration: sessionDuration,
        timestamp: new Date().toISOString()
      });
    });
  }

  logError(errorData) {
    // Add unique ID and additional context
    const error = {
      id: this.generateId(),
      ...errorData,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo()
    };

    this.errors.unshift(error);
    
    // Maintain max errors limit
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(0, this.config.maxErrors);
    }

    // Store in localStorage
    this.saveToStorage('errorLogs', this.errors);

    // Update error interface
    this.updateErrorInterface();

    // Send to analytics if available
    if (window.analytics) {
      window.analytics.trackEvent('error', error);
    }

    // Show critical errors to user
    if (error.severity === 'high') {
      this.showCriticalErrorNotification(error);
    }
  }

  logPerformance(perfData) {
    const performance = {
      id: this.generateId(),
      ...perfData,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId()
    };

    this.performanceLogs.unshift(performance);
    
    if (this.performanceLogs.length > this.config.maxLogs) {
      this.performanceLogs = this.performanceLogs.slice(0, this.config.maxLogs);
    }

    this.saveToStorage('performanceLogs', this.performanceLogs);
  }

  logUserAction(actionData) {
    const action = {
      id: this.generateId(),
      ...actionData,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId(),
      url: window.location.href
    };

    this.userActions.unshift(action);
    
    if (this.userActions.length > this.config.maxLogs) {
      this.userActions = this.userActions.slice(0, this.config.maxLogs);
    }

    this.saveToStorage('userActions', this.userActions);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('errorMonitorSessionId');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('errorMonitorSessionId', sessionId);
    }
    return sessionId;
  }

  getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser ? currentUser.id : null;
  }

  getConnectionInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      };
    }
    return null;
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data.slice(0, 100))); // Keep only last 100 items
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  loadFromStorage() {
    try {
      this.errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      this.performanceLogs = JSON.parse(localStorage.getItem('performanceLogs') || '[]');
      this.userActions = JSON.parse(localStorage.getItem('userActions') || '[]');
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
  }

  createErrorInterface() {
    if (document.getElementById('errorMonitorInterface')) return;

    const errorInterface = document.createElement('div');
    errorInterface.id = 'errorMonitorInterface';
    errorInterface.className = 'error-monitor-interface';
    errorInterface.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 350px;
      max-height: 400px;
      background: white;
      border: 2px solid #dc3545;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      display: none;
      overflow: hidden;
    `;

    errorInterface.innerHTML = `
      <div class="error-header" style="background: #dc3545; color: white; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 14px;">🚨 Error Monitor</h3>
        <button onclick="this.closest('.error-monitor-interface').style.display='none'" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">×</button>
      </div>
      <div class="error-stats" style="padding: 10px; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Total Errors: <strong id="totalErrors">0</strong></span>
          <span>Session: <strong id="sessionErrors">0</strong></span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #dc3545;">Critical: <strong id="criticalErrors">0</strong></span>
          <span style="color: #ffc107;">Warnings: <strong id="warningErrors">0</strong></span>
        </div>
      </div>
      <div class="error-controls" style="padding: 10px; display: flex; gap: 5px;">
        <button onclick="window.errorMonitor.clearErrors()" style="background: #6c757d; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Clear</button>
        <button onclick="window.errorMonitor.exportErrors()" style="background: #007bff; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Export</button>
        <button onclick="window.errorMonitor.showHealthReport()" style="background: #28a745; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">Health</button>
      </div>
      <div id="errorList" style="max-height: 250px; overflow-y: auto; padding: 0;"></div>
    `;

    document.body.appendChild(errorInterface);

    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '🚨';
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #dc3545;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      z-index: 10001;
    `;
    
    toggleButton.onclick = () => {
      errorInterface.style.display = errorInterface.style.display === 'none' ? 'block' : 'none';
    };

    document.body.appendChild(toggleButton);

    // Load existing data
    this.loadFromStorage();
    this.updateErrorInterface();
  }

  updateErrorInterface() {
    const totalErrors = document.getElementById('totalErrors');
    const sessionErrors = document.getElementById('sessionErrors');
    const criticalErrors = document.getElementById('criticalErrors');
    const warningErrors = document.getElementById('warningErrors');
    const errorList = document.getElementById('errorList');

    if (!totalErrors) return;

    const sessionId = this.getSessionId();
    const sessionErrorsCount = this.errors.filter(e => e.sessionId === sessionId).length;
    const criticalCount = this.errors.filter(e => e.severity === 'high').length;
    const warningCount = this.errors.filter(e => e.severity === 'low').length;

    totalErrors.textContent = this.errors.length;
    sessionErrors.textContent = sessionErrorsCount;
    criticalErrors.textContent = criticalCount;
    warningErrors.textContent = warningCount;

    // Update error list
    errorList.innerHTML = this.errors.slice(0, 10).map(error => `
      <div class="error-item" style="padding: 8px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="window.errorMonitor.showErrorDetails('${error.id}')">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="error-type" style="font-weight: bold; color: ${this.getSeverityColor(error.severity)};">${error.type}</span>
          <span class="error-time" style="font-size: 10px; color: #666;">${new Date(error.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="error-message" style="font-size: 11px; color: #333; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${error.message}</div>
      </div>
    `).join('');
  }

  getSeverityColor(severity) {
    switch (severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#6c757d';
      default: return '#333';
    }
  }

  showErrorDetails(errorId) {
    const error = this.errors.find(e => e.id === errorId);
    if (!error) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 10px; padding: 20px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: ${this.getSeverityColor(error.severity)};">Error Details</h3>
          <button onclick="this.closest('div').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        </div>
        <div style="font-size: 12px; line-height: 1.4;">
          <p><strong>Type:</strong> ${error.type}</p>
          <p><strong>Message:</strong> ${error.message}</p>
          <p><strong>Severity:</strong> <span style="color: ${this.getSeverityColor(error.severity)};">${error.severity}</span></p>
          <p><strong>Timestamp:</strong> ${new Date(error.timestamp).toLocaleString()}</p>
          <p><strong>URL:</strong> ${error.url}</p>
          ${error.filename ? `<p><strong>File:</strong> ${error.filename}:${error.lineno}:${error.colno}</p>` : ''}
          ${error.stack ? `<p><strong>Stack Trace:</strong><br><pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 10px;">${error.stack}</pre></p>` : ''}
          <p><strong>User Agent:</strong> ${error.userAgent || 'N/A'}</p>
          <p><strong>Viewport:</strong> ${error.viewport ? `${error.viewport.width}x${error.viewport.height}` : 'N/A'}</p>
          <p><strong>Session ID:</strong> ${error.sessionId}</p>
          ${error.userId ? `<p><strong>User ID:</strong> ${error.userId}</p>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  showCriticalErrorNotification(error) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      z-index: 10003;
      max-width: 400px;
      text-align: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Critical Error Detected</div>
      <div style="font-size: 12px; margin-bottom: 10px;">${error.message}</div>
      <button onclick="this.parentElement.remove()" style="background: white; color: #dc3545; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">Dismiss</button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  clearErrors() {
    if (confirm('Are you sure you want to clear all error logs?')) {
      this.errors = [];
      this.performanceLogs = [];
      this.userActions = [];
      localStorage.removeItem('errorLogs');
      localStorage.removeItem('performanceLogs');
      localStorage.removeItem('userActions');
      this.updateErrorInterface();
    }
  }

  exportErrors() {
    const exportData = {
      timestamp: new Date().toISOString(),
      session: this.getSessionId(),
      errors: this.errors,
      performanceLogs: this.performanceLogs,
      userActions: this.userActions.slice(0, 50), // Last 50 actions
      summary: this.generateSummary()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorelle-error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateSummary() {
    const summary = {
      totalErrors: this.errors.length,
      errorsByType: {},
      errorsBySeverity: { high: 0, medium: 0, low: 0 },
      averageResponseTime: 0,
      memoryUsage: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      } : null,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.errors.forEach(error => {
      summary.errorsByType[error.type] = (summary.errorsByType[error.type] || 0) + 1;
      summary.errorsBySeverity[error.severity]++;
    });

    const networkLogs = this.performanceLogs.filter(log => log.type === 'slow_network_request');
    if (networkLogs.length > 0) {
      summary.averageResponseTime = networkLogs.reduce((sum, log) => sum + log.duration, 0) / networkLogs.length;
    }

    return summary;
  }

  showHealthReport() {
    const summary = this.generateSummary();
    const healthScore = this.calculateHealthScore(summary);
    
    const report = `
System Health Report
===================

Overall Health Score: ${healthScore}/100 ${this.getHealthEmoji(healthScore)}

Error Summary:
- Total Errors: ${summary.totalErrors}
- Critical: ${summary.errorsBySeverity.high}
- Medium: ${summary.errorsBySeverity.medium}
- Low: ${summary.errorsBySeverity.low}

Performance:
- Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms
- Memory Usage: ${summary.memoryUsage ? (summary.memoryUsage.used / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}

Recommendations:
${this.generateHealthRecommendations(summary, healthScore).join('\n')}
    `;

    alert(report);
  }

  calculateHealthScore(summary) {
    let score = 100;

    // Deduct points for errors
    score -= summary.errorsBySeverity.high * 10;
    score -= summary.errorsBySeverity.medium * 5;
    score -= summary.errorsBySeverity.low * 2;

    // Deduct points for slow performance
    if (summary.averageResponseTime > 2000) score -= 15;
    else if (summary.averageResponseTime > 1000) score -= 10;

    // Deduct points for high memory usage
    if (summary.memoryUsage && summary.memoryUsage.used > 100 * 1024 * 1024) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  getHealthEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    if (score >= 50) return '🟠';
    return '🔴';
  }

  generateHealthRecommendations(summary, healthScore) {
    const recommendations = [];

    if (summary.errorsBySeverity.high > 0) {
      recommendations.push('⚠️ Address critical errors immediately');
    }

    if (summary.averageResponseTime > 2000) {
      recommendations.push('🐌 Optimize network requests - average response time is high');
    }

    if (summary.memoryUsage && summary.memoryUsage.used > 50 * 1024 * 1024) {
      recommendations.push('🧠 Monitor memory usage - approaching high levels');
    }

    if (summary.totalErrors > 50) {
      recommendations.push('🔧 Review error patterns and implement fixes');
    }

    if (healthScore >= 90) {
      recommendations.push('✅ System is running smoothly!');
    }

    return recommendations.length > 0 ? recommendations : ['✅ No specific recommendations at this time'];
  }

  startHealthCheck() {
    // Periodic health checks every 5 minutes
    setInterval(() => {
      const summary = this.generateSummary();
      const healthScore = this.calculateHealthScore(summary);
      
      if (healthScore < 50) {
        console.warn('System health is degrading. Health score:', healthScore);
        this.logError({
          type: 'health_warning',
          message: `System health score dropped to ${healthScore}`,
          severity: 'medium',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          details: summary
        });
      }
    }, 5 * 60 * 1000);
  }

  // Manual error logging for custom errors
  manualLog(type, message, severity = 'medium', details = {}) {
    this.logError({
      type: `manual_${type}`,
      message: message,
      severity: severity,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      details: details
    });
  }
}

// Initialize error monitor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.errorMonitor = new ErrorMonitor();
});
