/**
* Theme: Larkon - Responsive Bootstrap 5 Admin Dashboard
* Author: Techzaa
* Module/App: Dashboard
*/

//
// Conversions
// 
var options = {
    chart: {
        height: 292,
        type: 'radialBar',
    },
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
                name: {
                    fontSize: '14px',
                    color: "undefined",
                    offsetY: 100
                },
                value: {
                    offsetY: 55,
                    fontSize: '20px',
                    color: undefined,
                    formatter: function (val) {
                        return val + "%";
                    }
                }
            },
            track: {
                background: "rgba(170,184,197, 0.2)",
                margin: 0
            },
        }
    },
    fill: {
        gradient: {
            enabled: true,
            shade: 'dark',
            shadeIntensity: 0.2,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 65, 91]
        },
    },
    stroke: {
        dashArray: 4
    },
    colors: ["#ff6c2f", "#22c55e"],
    series: [65.2],
    labels: ['Returning Customer'],
    responsive: [{
        breakpoint: 380,
        options: {
            chart: {
                height: 180
            }
        }
    }],
    grid: {
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    }
}

// Initialize Conversions Chart
function initConversionsChart() {
    const chartElement = document.querySelector("#conversions");
    if (!chartElement) {
        console.warn('Conversions chart element not found');
        return;
    }
    
    if (typeof ApexCharts === 'undefined') {
        console.warn('ApexCharts library not loaded');
        return;
    }
    
    try {
        console.log('Initializing Conversions chart...');
        var chart = new ApexCharts(chartElement, options);
        chart.render();
        console.log('Conversions chart initialized successfully');
    } catch (error) {
        console.error('Error initializing Conversions chart:', error);
    }
}


//
//Performance-chart
//
var options = {
    series: [{
        name: "Page Views",
        type: "bar",
        data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67],
    },
    {
        name: "Clicks",
        type: "area",
        data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35],
    },
    ],
    chart: {
        height: 313,
        type: "line",
        toolbar: {
            show: false,
        },
    },
    stroke: {
        dashArray: [0, 0],
        width: [0, 2],
        curve: 'smooth'
    },
    fill: {
        opacity: [1, 1],
        type: ['solid', 'gradient'],
        gradient: {
            type: "vertical",
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 90]
        },
    },
    markers: {
        size: [0, 0],
        strokeWidth: 2,
        hover: {
            size: 4,
        },
    },
    xaxis: {
        categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        axisTicks: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
    },
    yaxis: {
        min: 0,
        axisBorder: {
            show: false,
        }
    },
    grid: {
        show: true,
        strokeDashArray: 3,
        xaxis: {
            lines: {
                show: false,
            },
        },
        yaxis: {
            lines: {
                show: true,
            },
        },
        padding: {
            top: 0,
            right: -2,
            bottom: 0,
            left: 10,
        },
    },
    legend: {
        show: true,
        horizontalAlign: "center",
        offsetX: 0,
        offsetY: 5,
        markers: {
            width: 9,
            height: 9,
            radius: 6,
        },
        itemMargin: {
            horizontal: 10,
            vertical: 0,
        },
    },


    plotOptions: {
        bar: {
            columnWidth: "30%",
            barHeight: "70%",
            borderRadius: 3,
        },
    },
    colors: ["#ff6c2f", "#22c55e"],
    tooltip: {
        shared: true,
        y: [{
            formatter: function (y) {
                if (typeof y !== "undefined") {
                    return y.toFixed(1) + "k";
                }
                return y;
            },
        },
        {
            formatter: function (y) {
                if (typeof y !== "undefined") {
                    return y.toFixed(1) + "k";
                }
                return y;
            },
        },
        ],
    },
}

// Initialize Performance Chart
function initPerformanceChart() {
    const chartElement = document.querySelector("#dash-performance-chart");
    if (!chartElement) {
        console.warn('Performance chart element not found');
        return;
    }
    
    if (typeof ApexCharts === 'undefined') {
        console.warn('ApexCharts library not loaded');
        return;
    }
    
    try {
        console.log('Initializing Performance chart...');
        var chart = new ApexCharts(chartElement, options);
        chart.render();
        console.log('Performance chart initialized successfully');
    } catch (error) {
        console.error('Error initializing Performance chart:', error);
    }
}


class VectorMap {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 5;
    }

    initWorldMapMarker() {
        // Check if element exists and map data is loaded
        const element = document.querySelector('#world-map-markers');
        if (!element) {
            console.warn('World map element not found, element may not be rendered yet');
            return;
        }
        
        console.log('World map element found, proceeding with initialization...');

        // Check if jsVectorMap is available
        if (typeof jsVectorMap === 'undefined') {
            console.warn('jsVectorMap library not loaded');
            return;
        }
        
        console.log('jsVectorMap library loaded successfully');

        // Check if world map data is loaded
        if (!jsVectorMap.maps || !jsVectorMap.maps.world) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.warn(`World map data not loaded, retrying ${this.retryCount}/${this.maxRetries} in 1000ms...`);
                setTimeout(() => {
                    this.initWorldMapMarker();
                }, 1000);
                return;
            } else {
                console.error('World map data failed to load after maximum retries');
                return;
            }
        }
        
        console.log('World map data loaded successfully');

        try {
            console.log('Creating jsVectorMap instance...');
            const map = new jsVectorMap({
                map: 'world',
                selector: '#world-map-markers',
                zoomOnScroll: false, // Disable zoom on scroll to avoid passive event listener issues
                zoomButtons: false,
                markersSelectable: true,
                markers: [
                    { name: "Canada", coords: [56.1304, -106.3468] },
                    { name: "Brazil", coords: [-14.2350, -51.9253] },
                    { name: "Russia", coords: [61, 105] },
                    { name: "China", coords: [35.8617, 104.1954] },
                    { name: "United States", coords: [37.0902, -95.7129] }
                ],
                markerStyle: {
                    initial: { fill: "#7f56da" },
                    selected: { fill: "#22c55e" }
                },
                labels: {
                    markers: {
                        render: marker => marker.name
                    }
                },
                regionStyle: {
                    initial: {
                        fill: 'rgba(169,183,197, 0.3)',
                        fillOpacity: 1,
                    },
                },
            });
            console.log('World map initialized successfully!');
        } catch (error) {
            console.error('Error initializing world map:', error);
        }
    }

    init() {
        this.initWorldMapMarker();
    }

}

// Wait for all scripts to load
function waitForScripts() {
    if (typeof jsVectorMap !== 'undefined' && jsVectorMap.maps && jsVectorMap.maps.world) {
        new VectorMap().init();
    } else {
        setTimeout(waitForScripts, 100);
    }
}

// Initialize charts immediately (original behavior)
initConversionsChart();
initPerformanceChart();

document.addEventListener('DOMContentLoaded', function (e) {
    // Only initialize if we're on dashboard page
    const worldMapElement = document.querySelector('#world-map-markers');
    if (worldMapElement) {
        console.log('Dashboard page detected, initializing world map...');
        // Start checking for scripts
        waitForScripts();
    } else {
        console.log('Not on dashboard page, skipping world map initialization');
    }
});