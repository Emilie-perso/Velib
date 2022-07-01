/*---------Récupération des données -----------------*/


const data = [];
var group = "";
var nom_commune = [];
var data_capacity = [];
const xhr = new XMLHttpRequest();
xhr.responseType = "json";
xhr.open(
    "GET",
    "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=1400&facet=name&facet=nom_arrondissement_communes&facet=coordonnees_geo&facet=capacity"
);
xhr.send();
xhr.onload = function () {

    if (xhr.status < 400) {
        let reponse = xhr.response.records;
        for (let i in reponse) {
            let response_i = reponse[i].fields;
            let commune = response_i.nom_arrondissement_communes;
            let name = response_i.name;
            let coordonnees_geo = response_i.coordonnees_geo;
            let capacity = response_i.capacity;
            let scale = { A: 10, B: 15, C: 20, D: 30 };
            for (cle in scale) {
                if (capacity < scale[cle]) {
                    console.log(cle);
                    console.log(scale[cle]);
                    console.log(capacity)

                    group = cle;
                    break;
                } else {

                    group = "E";
                }
            }
            data_capacity.push(capacity);
            data.push({ nom: name, nom_commune: commune, capacite: capacity, coordonnees: coordonnees_geo, groupe: group });
            var index = (nom_commune.indexOf(commune) > -1)
            if (index == false) {
                nom_commune.push(commune)
            }
        }
        //tri des données 
        nom_commune = nom_commune.sort();

    }

    /*----------------- Affichage liste déroulante ---------------------------- */
    liste_deroulante(nom_commune);

    /*------------------------Affichage de la carte---------------------------- */
    //déclaration des variables 
    var capacity = d3.values(data_capacity);
    min_capacity = d3.min(capacity);
    max_capacity = d3.max(capacity);


    // Echelle de couleur 
    const color = d3.scaleOrdinal()
        .domain(["A", "B", "C", "D", "E"])
        .range(["#86A91A", "#1AA998", "#1A4CA9", "#C4146F", "#C414B9"]);

    // déclaration de l'id où la div va apparaître 
    var map = L
        .map('mapid')
        .setView([47, 2], 5);   // center position + zoom

    // Ajout d'une couche layer à la map 
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 14,
    }).addTo(map);

    // Ajout d'une couche svg 
    // L.svg().addTo(map);

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    svg.attr("width", "1500").attr("height", "1500");
    svg.attr("class", "leaflet-zoom-hide");
    // Ajout legend 

    var svg_legend = d3.select("body")
        .select("#legend")
        .append("svg")
        .attr("width", 200)
        .attr("height", 300)
        ;
    var legend = [{
        abs: "20", ord: "15", abs1: "40", ord1: "20", color: "#86A91A", text: "< 10"
    },
    { abs: "20", ord: "45", abs1: "40", ord1: "50", color: "#1AA998", text: " entre 10 et 14" },
    { abs: "20", ord: "75", abs1: "40", ord1: "80", color: "#1A4CA9", text: " entre 15 et 19" },
    { abs: "20", ord: "105", abs1: "40", ord1: "110", color: "#C4146F", text: " entre 20 et 30 " },
    { abs: "20", ord: "135", abs1: "40", ord1: "140", color: "#C414B9", text: " > 30" }
    ]


    svg_legend.append('g')
        .selectAll("dot")
        .data(legend)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return d.abs })
        .attr("cy", function (d) { return d.ord })
        .attr("r", "14")
        .attr("fill", function (d) { return d.color });


    svg_legend.append('g')
        .selectAll("text")
        .data(legend)
        .enter()
        .append("text")
        .text(function (d) { return d.text })
        .attr("x", function (d) { return d.abs1 })
        .attr("y", function (d) { return d.ord1 })
        .style("fill","white");


    // ajout d'une echelle pour la taille des bulles 
    var zscale = d3.scaleLinear()
        .domain([(min_capacity + 5), (max_capacity + 5)])
        .range([5, 30]);


    // définition div avec coordonnées de points 
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // fonction affichage données au clique sur la liste déroulante 

    function update_data_map(id) {
        // Ajout des bulles
        // //d3.selectAll("circle").remove();
        // d3.select("#mapid")
        //     .selectAll("circle").remove();
        // d3.select("#mapid")
        //     .select("svg")
        //     .selectAll("myCircles")
        //     .data(data.filter(d => d.nom_commune == id))
        //     .enter()
        //     .append("circle")
        //     .attr("cx", function (d) {
        //         return map.latLngToLayerPoint(d.coordonnees).x
        //     })
        //     .attr("cy", function (d) { return map.latLngToLayerPoint(d.coordonnees).y })
        //     .attr("r", function (d) { return zscale(d.capacite) })
        //     .style("fill", d => color(d.groupe))
        //     .attr("stroke", d => color(d.groupe))
        //     .attr("stroke-width", 1)
        //     .attr("fill-opacity", .6);




        svg.selectAll("circle").remove();
        svg.selectAll("myCircles")
            .data(data.filter(d => d.nom_commune == id))
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return map.latLngToLayerPoint(d.coordonnees).x
            })
            .attr("cy", function (d) { return map.latLngToLayerPoint(d.coordonnees).y })
            .attr("r", function (d) { return zscale(d.capacite) })
            .style("fill", d => color(d.groupe))
            .attr("stroke", d => color(d.groupe))
            .attr("stroke-width", 1)
            .attr("fill-opacity", .6)
            .on("mouseover", function (d) {

                d3.select(this).transition()
                    .duration('100')
                    .style("stroke", "black");


                div.transition()
                    .duration(100)
                    .style("opacity", "1");

                div.text(" Station : " + d.nom + " ; Capacité : " + d.capacite)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");

            })
            .on("mouseout", function (d) {

                d3.select(this).transition()
                    .duration('100')
                    .style("stroke", d => color(d.groupe));
                div.transition()
                    .duration(100)
                    .style("opacity", "0");
            })
            ;

        //zoom sur la commune choisie 
        var view = data.filter(d => d.nom_commune == id);
        map.setView(view[1].coordonnees, 12);

        console.log(view);
    }

    // Fonction qui modifie les données si quelque chose change 
    function update() {
        // d3.selectAll("circle")
        // d3.select("#mapid")
        //     .selectAll("circle")
        //     .attr("cx", function (d) { return map.latLngToLayerPoint(d.coordonnees).x })
        //     .attr("cy", function (d) { return map.latLngToLayerPoint(d.coordonnees).y });


        svg.selectAll("circle")
            .attr("cx", function (d) { return map.latLngToLayerPoint(d.coordonnees).x })
            .attr("cy", function (d) { return map.latLngToLayerPoint(d.coordonnees).y });


    }

    // Changement de la position des bulles au moment d'un zoom ou déplacement de la carte
    map.on("moveend", update);


    /*-----Code lors d'un choix sur la liste déroulante---*/
    /*------------  Récuperation des données en fonction de la commune sélectionnée ---------------*/
    d3.select('#listeCommune')
        .on('change', function () {
            var id = d3.select(this).property('value');
            update_data_map(id);
            update_legend(id);

        });


}