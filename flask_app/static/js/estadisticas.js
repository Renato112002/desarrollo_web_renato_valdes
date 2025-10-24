document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/estadisticas")
        .then((res) => res.json())
        .then((data) => {
            let azul = "#1a4a7a";
            let celeste = "#1eb1e4";

            // LÍNEAS: avisos por día
            Highcharts.chart("grafico_lineas", {
                chart: { type: "line" },
                title: { text: null },
                credits: { enabled: true },
                xAxis: {
                    categories: data.lineas.dias,
                    tickInterval: 1,
                    labels: { step: 1, rotation: -45 }
                },
                yAxis: {
                    title: { text: "Cantidad" },
                    allowDecimals: false,
                    tickInterval: 1,
                    min: 0
                },
                tooltip: {
                    pointFormat: "<b>{point.y}</b> aviso(s)"
                },
                legend: { enabled: false },
                series: [{
                    name: "Avisos",
                    data: data.lineas.valores,
                    color: azul,
                    marker: { enabled: true, radius: 3 },
                }],
            });

            // TORTA: distribución por tipo
            Highcharts.chart("grafico_torta", {
                chart: { type: "pie" },
                title: { text: null },
                credits: { enabled: true },
                tooltip: {
                    pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)"
                },
                accessibility: {
                    point: { valueSuffix: "%" }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        dataLabels: {
                            enabled: true,
                            format: "{point.name}: {point.y}"
                        }
                    }
                },
                series: [{
                    name: "Avisos",
                    colorByPoint: true,
                    data: data.torta.tipos.map((t, i) => ({
                        name: t.charAt(0).toUpperCase() + t.slice(1),
                        y: data.torta.valores[i],
                        color: i === 0 ? azul : celeste
                    }))
                }]
            });

            // BARRAS: gatos vs perros por mes
            Highcharts.chart("grafico_barras", {
                chart: { type: "column" },
                title: { text: null },
                credits: { enabled: true},
                xAxis: {
                    categories: data.barras.meses,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: { text: "Cantidad" },
                    allowDecimals: false,
                    tickInterval: 1
                },
                tooltip: {
                    shared: true
                },
                legend: { layout: "horizontal", align: "center", verticalAlign: "bottom" },
                plotOptions: {
                    column: { pointPadding: 0.1, borderWidth: 0, groupPadding: 0.12 }
                },
                series: [
                    { name: "Gatos", data: data.barras.gatos, color: azul },
                    { name: "Perros", data: data.barras.perros, color: celeste }
                ]
            });
        })
        .catch((err) => {
            console.error("Error al cargar estadísticas:", err);
            ["grafico_lineas", "grafico_torta", "grafico_barras"].forEach(id => {
                let el = document.getElementById(id);
                if (el) el.innerHTML = "<p style='color:#c0392b'>No se pudieron cargar las estadísticas.</p>";
            });
        });
});
