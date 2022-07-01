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
    "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=1400&facet=name&facet=nom_arrondissement_communes&facet=numbikesavailable&facet=capacity&facet=numdocksavailable"
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

        dataByCommune = groupBy('nom_commune', data);

    }
    /*----------------- Affichage liste déroulante ---------------------------- */
    liste_deroulante(nom_commune);


    /*-----------Affichage du graphe avec l'ensemble des valeurs------------- */
    //définition des variables  
    var width = 900;
    var height = 600;

    var margin_top = 1 / 10 * height;
    var margin_right = 1 / 10 * width;
    var marg_inter = margin_right / 2;
    var max_numdock = d3.values(data_numdocksavailable);
    var max_capacity = d3.values(data_capacity);
    var numbike = d3.values(data_numbike);


    // définition du svg 
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "background");

    // définition div avec coordonnées de points 
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    //ajout des axes x et y 
    var xscale = d3.scaleLinear()
        .domain([0, d3.max(max_numdock)])
        .range([0, width * 3 / 4]);

    var yscale = d3.scaleLinear()
        .domain([0, d3.max(max_capacity)])
        .range([2 / 3 * height, 0]);

    var x_axis = d3.axisBottom()
        .scale(xscale);

    var y_axis = d3.axisLeft()
        .scale(yscale);



    svg.append("g")
        .attr("transform", `translate(${margin_right}, ${margin_top})`)
        .call(y_axis);

    // var xAxisTranslate = height / 2 + 70;
    var xAxisTranslate = 2 / 3 * height + margin_top + 10;

    svg.append("g")
        .attr("transform", `translate(${margin_right + 10}, ${xAxisTranslate})`)
        .call(x_axis);

    // ajout des labels 

    //label  axe Y 
    svg.append("text")
        .attr("x", -height / 2 + margin_top)
        .attr("y", marg_inter)
        .attr("transform", 'rotate(-90)')
        .style("text-anchor", "middle")
        .text("Capacité")
        .style("font-family", "Arial");
    // label axe X  
    svg.append("text")
        .attr("x", width / 2 - 10)
        .attr("y", xAxisTranslate + marg_inter)
        .style("text-anchor", "middle")
        .text("Nombre de bornettes disponibles")
        .style("font-family", "Arial");

    // ajout d'un scale pour la taille d'une bulles
    var zscale = d3.scaleLinear()
        .domain([d3.min(numbike), d3.max(numbike)])
        .range([10, 25]);


    /* ----- Fonction de mise à jour des données sur le graphe ------*/
    function updateData(id) {

        console.log(data.filter(d => d.nom_commune == id));
        d3.selectAll("circle").remove();
        svg.append("g")
            .selectAll("dot")
            .data(data.filter(d => d.nom_commune == id))
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xscale(d.numdocksavailable) + margin_right + 10; })
            .attr("cy", function (d) { return yscale(d.capacity) + margin_top; })
            .attr("r", function (d) { return zscale(d.numbikesavailable); })
            .style("fill", "#E58F72")
            .style("opacity", "0.6")
            .attr("stroke", "grey")
            .on('mouseover', function (d,) {
                d3.select(this).transition()
                    .duration('100')
                    .attr("r", 30)
                    .style("fill", "#E57272")
                    .style("opacity", "0.7");
                div.transition()
                    .duration(100)
                    .style("opacity", "1");

                div.text(" Nombre de vélos disponibles : " + d.numbikesavailable + " - x : " + d.numdocksavailable + " - y : " + d.capacity)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");


            })
            .on('mouseout', function (d, i) {
                d3.select(this).transition()
                    .duration('200')
                    .attr("r", function (d) { return zscale(d.numbikesavailable); })
                    .style("fill", "#E58F72")
                    .style("opacity", "0.6");
                div.transition()
                    .duration('200')
                    .style("opacity", "0");
            });
    }

    /*-----Code lors d'un choix sur la liste déroulante---*/
    /*------------  Récuperation des données en fonction de la commune sélectionnée ---------------*/
    d3.select('#listeCommune')
        .on('change', function () {
            var id = d3.select(this).property('value');
            updateData(id);
        });

}







