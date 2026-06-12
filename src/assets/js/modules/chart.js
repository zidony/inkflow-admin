import { t, i18n } from './i18n.js';
import Chart from 'chart.js/auto';

export class ChartManager {
  constructor() {
    this.chartInstance = null;
    this.init();
  }

  getThemeColors(theme) {
    const isDark = theme === 'dark';
    return {
      gridColor: isDark ? '#2a3454' : '#f1f5f9',
      textColor: isDark ? '#94a3b8' : '#94a3b8',
      barColorStart: isDark ? 'rgba(6, 182, 212, 0.85)' : 'rgba(13, 110, 204, 0.85)',
      barColorEnd: isDark ? 'rgba(13, 110, 204, 0.45)' : 'rgba(6, 182, 212, 0.45)'
    };
  }

  renderChart(theme) {
    const canvas = document.getElementById('visits-chart');
    if (!canvas) return;

    // Destroy existing chart to prevent canvas redraw bugs
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const colors = this.getThemeColors(theme);

    this.chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: i18n.list('months'),
        datasets: [
          {
            label: t('visitsLabel'),
            data: [1200, 1900, 1500, 2800, 2200, 3100, 2600, 3800, 3200, 4100, 3700, 4800],
            backgroundColor: function (ctx) {
              const chart = ctx.chart;
              if (!chart.chartArea) return colors.barColorStart;
              const gradient = chart.ctx.createLinearGradient(
                0,
                chart.chartArea.top,
                0,
                chart.chartArea.bottom
              );
              gradient.addColorStop(0, colors.barColorStart);
              gradient.addColorStop(1, colors.barColorEnd);
              return gradient;
            },
            borderRadius: 5,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: "'Plus Jakarta Sans',sans-serif", size: 11 },
            bodyFont: { family: "'Plus Jakarta Sans',sans-serif", size: 12 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 }
            }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans',sans-serif", size: 10 }
            }
          }
        }
      }
    });
  }

  init() {
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';

    // Render initially on window load or immediately if document is already ready
    if (document.readyState === 'complete') {
      this.renderChart(initialTheme);
    } else {
      window.addEventListener('load', () => this.renderChart(initialTheme));
    }

    // Dynamic redraw on theme change
    window.addEventListener('inkflowThemeChanged', e => {
      this.renderChart(e.detail.theme);
    });
  }
}
