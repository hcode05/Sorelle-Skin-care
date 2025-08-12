// Advanced Analytics Engine for Sorelle
class AnalyticsEngine {
  constructor() {
    this.charts = {};
    this.data = {
      users: [],
      orders: [],
      products: [],
      sessions: [],
      events: []
    };
    this.realTimeInterval = null;
    this.init();
  }

  init() {
    this.loadData();
    this.initializeCharts();
    this.startRealTimeMonitoring();
    this.trackUserBehavior();
  }

  // Data Generation for Demo Purposes
  generateDemoData() {
    const demoData = {
      users: this.generateUsers(500),
      orders: this.generateOrders(1200),
      products: this.generateProductData(),
      sessions: this.generateSessions(2000),
      events: this.generateEvents(5000)
    };
    
    localStorage.setItem('analyticsData', JSON.stringify(demoData));
    return demoData;
  }

  generateUsers(count) {
    const users = [];
    const skinTypes = ['oily', 'dry', 'combination', 'sensitive'];
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];
    
    for (let i = 0; i < count; i++) {
      users.push({
        id: `user_${i}`,
        registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        skinType: skinTypes[Math.floor(Math.random() * skinTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        totalSpent: Math.floor(Math.random() * 10000) + 500,
        ordersCount: Math.floor(Math.random() * 20) + 1,
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        segment: this.getUserSegment(Math.floor(Math.random() * 10000) + 500)
      });
    }
    return users;
  }

  generateOrders(count) {
    const orders = [];
    const products = ['Vitamin C Serum', 'Hyaluronic Acid', 'Niacinamide', 'Retinol Cream', 'Sunscreen'];
    
    for (let i = 0; i < count; i++) {
      const orderDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      orders.push({
        id: `order_${i}`,
        userId: `user_${Math.floor(Math.random() * 500)}`,
        date: orderDate,
        amount: Math.floor(Math.random() * 5000) + 200,
        products: this.generateOrderProducts(products),
        status: ['completed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
        channel: ['website', 'mobile', 'social'][Math.floor(Math.random() * 3)]
      });
    }
    return orders;
  }

  generateOrderProducts(productList) {
    const count = Math.floor(Math.random() * 3) + 1;
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push({
        name: productList[Math.floor(Math.random() * productList.length)],
        price: Math.floor(Math.random() * 2000) + 300,
        quantity: Math.floor(Math.random() * 3) + 1
      });
    }
    return products;
  }

  generateProductData() {
    return [
      { name: 'Vitamin C Serum', sales: 450, revenue: 675000, views: 2300, conversions: 19.6 },
      { name: 'Hyaluronic Acid', sales: 380, revenue: 456000, views: 1900, conversions: 20.0 },
      { name: 'Niacinamide Serum', sales: 320, revenue: 384000, views: 1600, conversions: 20.0 },
      { name: 'Retinol Night Cream', sales: 290, revenue: 580000, views: 1400, conversions: 20.7 },
      { name: 'SPF 50 Sunscreen', sales: 520, revenue: 416000, views: 2600, conversions: 20.0 }
    ];
  }

  generateSessions(count) {
    const sessions = [];
    const pages = ['/', '/products', '/cart', '/checkout', '/profile'];
    
    for (let i = 0; i < count; i++) {
      sessions.push({
        id: `session_${i}`,
        userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 500)}` : null,
        startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 1800) + 30, // 30s to 30min
        pages: Math.floor(Math.random() * 8) + 1,
        bounceRate: Math.random() > 0.7,
        converted: Math.random() > 0.8,
        source: ['organic', 'social', 'direct', 'email'][Math.floor(Math.random() * 4)]
      });
    }
    return sessions;
  }

  generateEvents(count) {
    const events = [];
    const eventTypes = ['page_view', 'product_view', 'add_to_cart', 'purchase', 'signup', 'login'];
    
    for (let i = 0; i < count; i++) {
      events.push({
        id: `event_${i}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 500)}` : null,
        sessionId: `session_${Math.floor(Math.random() * 2000)}`,
        properties: {
          page: ['/', '/products', '/cart', '/checkout'][Math.floor(Math.random() * 4)],
          product: Math.random() > 0.5 ? 'Vitamin C Serum' : null,
          value: Math.random() > 0.7 ? Math.floor(Math.random() * 2000) + 300 : null
        }
      });
    }
    return events;
  }

  getUserSegment(totalSpent) {
    if (totalSpent >= 5000) return 'VIP';
    if (totalSpent >= 2000) return 'Premium';
    if (totalSpent >= 500) return 'Regular';
    return 'New';
  }

  loadData() {
    let storedData = localStorage.getItem('analyticsData');
    if (!storedData) {
      this.data = this.generateDemoData();
    } else {
      this.data = JSON.parse(storedData);
    }
    this.updateKPIs();
  }

  updateKPIs() {
    const timeRange = parseInt(document.getElementById('timeRange')?.value || 30);
    const cutoffDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    
    // Calculate KPIs
    const totalUsers = this.data.users.length;
    const recentOrders = this.data.orders.filter(order => new Date(order.date) > cutoffDate);
    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = recentOrders.length;
    const sessions = this.data.sessions.filter(session => new Date(session.startTime) > cutoffDate);
    const conversions = sessions.filter(session => session.converted).length;
    const conversionRate = sessions.length > 0 ? (conversions / sessions.length * 100).toFixed(1) : 0;

    // Update DOM
    if (document.getElementById('totalUsers')) {
      document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
      document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
      document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
      document.getElementById('conversionRate').textContent = `${conversionRate}%`;
    }

    // Calculate growth rates (simplified)
    const growthRate = Math.floor(Math.random() * 20) + 5;
    const elements = ['userGrowth', 'revenueGrowth', 'orderGrowth', 'conversionGrowth'];
    elements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        const rate = Math.floor(Math.random() * 30) + 5;
        element.textContent = `+${rate}%`;
        element.className = `kpi-change ${rate > 15 ? 'positive' : 'neutral'}`;
      }
    });
  }

  initializeCharts() {
    this.initSalesChart();
    this.initProductChart();
    this.initHeatmap();
    this.initSegmentationChart();
    this.initFunnelChart();
    this.initForecastChart();
  }

  initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    const labels = this.getLast30Days();
    const data = labels.map(() => Math.floor(Math.random() * 50000) + 10000);

    this.charts.sales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Revenue',
          data: data,
          borderColor: '#e478a4',
          backgroundColor: 'rgba(228, 120, 164, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  initProductChart() {
    const ctx = document.getElementById('productChart');
    if (!ctx) return;

    const products = this.data.products;
    
    this.charts.product = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: products.map(p => p.name),
        datasets: [{
          label: 'Sales',
          data: products.map(p => p.sales),
          backgroundColor: ['#e478a4', '#d16096', '#c14a82', '#b1356e', '#a1205a'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  initHeatmap() {
    const heatmapContainer = document.getElementById('heatmapChart');
    if (!heatmapContainer) return;

    // Generate heatmap data
    const heatmapData = this.generateHeatmapData();
    
    heatmapContainer.innerHTML = `
      <div class="heatmap-grid">
        ${heatmapData.map(day => `
          <div class="heatmap-day" style="background-color: ${this.getHeatmapColor(day.intensity)}">
            <span class="heatmap-value">${day.value}</span>
          </div>
        `).join('')}
      </div>
      <div class="heatmap-legend">
        <span>Less</span>
        <div class="legend-colors">
          <div style="background-color: #eee"></div>
          <div style="background-color: #fdb4c7"></div>
          <div style="background-color: #f584a7"></div>
          <div style="background-color: #e478a4"></div>
          <div style="background-color: #d16096"></div>
        </div>
        <span>More</span>
      </div>
    `;
  }

  generateHeatmapData() {
    const data = [];
    for (let i = 0; i < 365; i++) {
      const intensity = Math.random();
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        intensity: intensity,
        value: Math.floor(intensity * 100)
      });
    }
    return data;
  }

  getHeatmapColor(intensity) {
    if (intensity < 0.2) return '#eee';
    if (intensity < 0.4) return '#fdb4c7';
    if (intensity < 0.6) return '#f584a7';
    if (intensity < 0.8) return '#e478a4';
    return '#d16096';
  }

  initSegmentationChart() {
    const ctx = document.getElementById('segmentationChart');
    if (!ctx) return;

    const segments = this.calculateSegments();
    
    this.charts.segmentation = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(segments),
        datasets: [{
          data: Object.values(segments),
          backgroundColor: ['#e478a4', '#d16096', '#c14a82', '#b1356e'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  calculateSegments() {
    const segments = { VIP: 0, Premium: 0, Regular: 0, New: 0 };
    this.data.users.forEach(user => {
      segments[user.segment]++;
    });
    return segments;
  }

  initFunnelChart() {
    const funnelData = this.calculateFunnelData();
    
    if (document.getElementById('funnelVisits')) {
      document.getElementById('funnelVisits').textContent = funnelData.visits.toLocaleString();
      document.getElementById('funnelViews').textContent = funnelData.views.toLocaleString();
      document.getElementById('funnelCarts').textContent = funnelData.carts.toLocaleString();
      document.getElementById('funnelPurchases').textContent = funnelData.purchases.toLocaleString();
    }

    // Create funnel visualization
    const funnelContainer = document.getElementById('funnelChart');
    if (funnelContainer) {
      const maxValue = funnelData.visits;
      funnelContainer.innerHTML = `
        <div class="funnel-step" style="width: 100%">
          <span>Homepage Visits: ${funnelData.visits.toLocaleString()}</span>
        </div>
        <div class="funnel-step" style="width: ${(funnelData.views/maxValue*100)}%">
          <span>Product Views: ${funnelData.views.toLocaleString()}</span>
        </div>
        <div class="funnel-step" style="width: ${(funnelData.carts/maxValue*100)}%">
          <span>Cart Additions: ${funnelData.carts.toLocaleString()}</span>
        </div>
        <div class="funnel-step" style="width: ${(funnelData.purchases/maxValue*100)}%">
          <span>Purchases: ${funnelData.purchases.toLocaleString()}</span>
        </div>
      `;
    }
  }

  calculateFunnelData() {
    const events = this.data.events;
    return {
      visits: events.filter(e => e.type === 'page_view').length,
      views: events.filter(e => e.type === 'product_view').length,
      carts: events.filter(e => e.type === 'add_to_cart').length,
      purchases: events.filter(e => e.type === 'purchase').length
    };
  }

  initForecastChart() {
    const ctx = document.getElementById('forecastChart');
    if (!ctx) return;

    const historicalData = this.getLast30Days().map(() => Math.floor(Math.random() * 50000) + 10000);
    const forecastData = this.generateForecast(historicalData);
    
    this.charts.forecast = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...this.getLast30Days(), ...this.getNext30Days()],
        datasets: [{
          label: 'Historical',
          data: [...historicalData, ...Array(30).fill(null)],
          borderColor: '#e478a4',
          backgroundColor: 'rgba(228, 120, 164, 0.1)'
        }, {
          label: 'Forecast',
          data: [...Array(30).fill(null), ...forecastData],
          borderColor: '#666',
          borderDash: [5, 5],
          backgroundColor: 'rgba(102, 102, 102, 0.1)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
  }

  generateForecast(historical) {
    // Simple linear trend forecast
    const trend = (historical[historical.length - 1] - historical[0]) / historical.length;
    const forecast = [];
    let lastValue = historical[historical.length - 1];
    
    for (let i = 0; i < 30; i++) {
      lastValue += trend + (Math.random() - 0.5) * 5000;
      forecast.push(Math.max(0, Math.floor(lastValue)));
    }
    
    return forecast;
  }

  startRealTimeMonitoring() {
    this.updateRealTimeMetrics();
    this.realTimeInterval = setInterval(() => {
      this.updateRealTimeMetrics();
    }, 5000); // Update every 5 seconds
  }

  updateRealTimeMetrics() {
    if (document.getElementById('activeUsers')) {
      document.getElementById('activeUsers').textContent = Math.floor(Math.random() * 50) + 10;
      document.getElementById('pageViews').textContent = Math.floor(Math.random() * 20) + 5;
      document.getElementById('errorRate').textContent = (Math.random() * 2).toFixed(2) + '%';
    }
  }

  trackUserBehavior() {
    // Track page views
    this.trackEvent('page_view', {
      page: window.location.pathname,
      timestamp: new Date(),
      userAgent: navigator.userAgent
    });

    // Track clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
        this.trackEvent('click', {
          element: e.target.tagName,
          text: e.target.textContent,
          href: e.target.href || null
        });
      }
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent('scroll', { depth: maxScroll });
        }
      }
    });
  }

  trackEvent(eventType, properties) {
    const event = {
      type: eventType,
      timestamp: new Date(),
      properties: properties,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId()
    };

    // Store event
    let events = JSON.parse(localStorage.getItem('userEvents') || '[]');
    events.push(event);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events = events.slice(-1000);
    }
    
    localStorage.setItem('userEvents', JSON.stringify(events));
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser ? currentUser.id : null;
  }

  getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  }

  getNext30Days() {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  }

  exportData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      kpis: this.getKPIData(),
      chartData: this.getChartData(),
      userData: this.data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorelle-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getKPIData() {
    return {
      totalUsers: document.getElementById('totalUsers')?.textContent || '0',
      totalRevenue: document.getElementById('totalRevenue')?.textContent || '₹0',
      totalOrders: document.getElementById('totalOrders')?.textContent || '0',
      conversionRate: document.getElementById('conversionRate')?.textContent || '0%'
    };
  }

  getChartData() {
    const chartData = {};
    Object.keys(this.charts).forEach(chartKey => {
      if (this.charts[chartKey] && this.charts[chartKey].data) {
        chartData[chartKey] = this.charts[chartKey].data;
      }
    });
    return chartData;
  }
}

// Global functions for UI interactions
function updateAnalytics() {
  if (window.analytics) {
    window.analytics.updateKPIs();
    window.analytics.initializeCharts();
  }
}

function refreshAnalytics() {
  if (window.analytics) {
    window.analytics.loadData();
    window.analytics.initializeCharts();
  }
  
  // Show refresh animation
  const btn = event.target;
  btn.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    btn.style.transform = 'rotate(0deg)';
  }, 500);
}

function exportData() {
  if (window.analytics) {
    window.analytics.exportData();
  }
}

function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName + 'Tab').classList.add('active');
  event.target.classList.add('active');
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.analytics = new AnalyticsEngine();
});
