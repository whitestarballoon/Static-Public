Wsbdata.Wsbgraphs = {

    setHighchartsOptions: function () {
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
    },

    createChart: function (chart) {
        if (! $('div#' + chart.div).length || !chart)
        {
            return;
        }
        chart.isRendered = true;
        var seriesArray = [];

        for (var i = 0; i < chart.traces.length; i++) {
            seriesArray.push({
                name: chart.traces[i].title,
                id: chart.traces[i].id,
                data: []
                });
        }
        
        chart.chartItem = new Highcharts.StockChart({
            chart: {
                renderTo: chart.div,
                defaultSeriesType: 'spline',
                marginRight: 10
            },
            title: {
                text: chart.title
            },
             rangeSelector: {
                buttons: [{
                    type: 'day',
                    count: 2,
                    text: '3d'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1d'  
                }, {
                    type: 'minute',
                    count: 720,
                    text: '12h'
                }, {
                    type: 'minute',
                    count: 360,
                    text: '6h'
                },
                {
                    type: 'all',
                    text: 'All'
                }],
                selected: 4,
                inputEnabled: false
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            /*tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' + Highcharts.numberFormat(this.y, 2);
                }
            },*/
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: seriesArray
        });

    }
};