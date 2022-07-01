/*---------Récupération des données -----------------*/


const data = [];
var data_capacity = [];
var data_numdocksavailable = [];
var data_numbike = [];
var nom_commune = [];
const xhr = new XMLHttpRequest();
xhr.responseType = "json";
xhr.open(
    "GET",
    "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=500&facet=name&facet=nom_arrondissement_communes&facet=numbikesavailable&facet=capacity&facet=numdocksavailable"
);
xhr.send();
xhr.onload = function () {

    if (xhr.status < 400) {
        let reponse = xhr.response.records;
        for (let i in reponse) {
            let response_i = reponse[i].fields;
            let commune = response_i.nom_arrondissement_communes;
            let nom = response_i.name;
            let capacite = response_i.capacity;
            let bornette = response_i.numdocksavailable;
            let velo = response_i.numbikesavailable;
            data_capacity.push(capacite);
            data_numdocksavailable.push(bornette);
            data_numbike.push(velo);
            data.push({ name: nom, capacity: capacite, nom_commune: commune, numdocksavailable: bornette, numbikesavailable: velo });
            var index = (nom_commune.indexOf(commune) > -1)
            if (index == false) {
                nom_commune.push(commune)
            }
        }

        //tri des données 
        nom_commune = nom_commune.sort();

        //groupement des données 
        const groupBy = (key, arr) => arr.reduce((cache, product) =>
        ({
            ...cache, [product[key]]:
                product[key] in cache ? cache[product[key]].concat(product) : [product]
        }),
            {})
        dataByCommune = groupBy('nom_commune', data);

    }
    /*----------------- Affichage ---------------------------- */

    /*------Affichage de la liste déroulante--------- */

    for (i = 0; i < nom_commune.length; i++) {
        var sel = document.getElementById('listeCommune');
        var opt = null;
        opt = document.createElement('option');
        opt.value = nom_commune[i];
        opt.innerHTML = nom_commune[i];
        sel.appendChild(opt);
    }

    /*-----------Affichage du graphe avec l'ensemble des valeurs------------- */
    //définition des variables  
    var width = 1500;
    var height = 1000;
    var margin = 50;
    var max_numdock = d3.values(data_numdocksavailable);
    var max_capacity = d3.values(data_capacity);
    var max_numbike = d3.values(data_numbike);
    var min_numbike = d3.values(data_numbike);

console.log(max_numbike);
console.log(min_numbike);

    // définition du svg 
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // définition div avec coordonnées de points 
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    //ajout des axes x et y 
    var xscale = d3.scaleLinear()
        .domain([0, d3.max(max_numdock)])
        .range([20, width - 100]);

    var yscale = d3.scaleLinear()
        .domain([0, d3.max(max_capacity)])
        .range([height / 2, 0]);

    var x_axis = d3.axisBottom()
        .scale(xscale);

    var y_axis = d3.axisLeft()
        .scale(yscale);

    svg.append("g")
        .attr("transform", "translate(50, 20)")
        .call(y_axis);

    var xAxisTranslate = height / 2 + 20;

    svg.append("g")
        .attr("transform", "translate(50, " + xAxisTranslate + ")")
        .call(x_axis);

    // ajout d'un scale pour la taille d'une bulle
    var zscale = d3.scaleLinear()
        .domain([d3.min(min_numbike), d3.max(max_numbike)])
        .range([1, 20]);
    // ajout des points
    // svg.append('g')
    //     .selectAll("dot")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", function (d) { return xscale(d.numdocksavailable); })
    //     //.attr("transform", "translate(50, 20)")
    //     .attr("cy", function (d) { return yscale(d.capacity); })
    //     .attr("transform", "translate(50, 20)")
    //     .attr("r", function (d) { return zscale(d.numbikesavailable); })
    //     .style("fill", "#69b3a2")
    //     .style("opacity", "0.7")
    //     .attr("stroke", "black");

    // var circle = svg.select("g").selectAll("circle")
    //     .data(data);

    /* ----- Fonction de mise à jour des données sur le graphe ------*/
    function updateData(id) {
        // définition div avec coordonnées de points 
        // var div = d3.select("body").append("div")
        //     .attr("class", "tooltip")
        //     .style("opacity", 0);

        console.log(data.filter(d => d.nom_commune == id));
        d3.selectAll("circle").remove();
        svg.append("g")
            .selectAll("dot")
            .data(data.filter(d => d.nom_commune == id))
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xscale(d.numdocksavailable); })
            .attr("cy", function (d) { return yscale(d.capacity); })
            .attr("transform", "translate(50, 20)")
            .attr("r", function (d) { return zscale(d.numbikesavailable); })
            .style("fill", "#69b3a2")
            .style("opacity", "0.7")
            .attr("stroke", "black")
            .on('mouseover', function (d, i) {
                d3.select(this).transition()
                    .duration('100')
                    .attr("r", 9);
                div.transition()
                    .duration(100)
                    .style("opacity", 1);
                div.html("<span>Nombre de bornette libre :" + d.numdocksavailable, "</span>", "<span> Capacité de la bornette : " + d.capacity, "</span>", "<span> Nombre de vélo libre : " + d.numbikesavailable, "</span>")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            })
            .on('mouseout', function (d, i) {
                d3.select(this).transition()
                    .duration('200')
                    .attr("r", 5);
                div.transition()
                    .duration('200')
                    .style("opacity", 0);
            });
    }

    /*-----Code lors d'un choix sur la liste déroulante---*/
    /*------------ Fonction de récuperation des données en fonction de la commune sélectionnée ---------------*/
    d3.select('#listeCommune')
        .on('change', function () {
            var id = d3.select(this).property('value');
            updateData(id);
        });



}









