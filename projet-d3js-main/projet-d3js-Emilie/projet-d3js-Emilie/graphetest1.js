




//récupération des données
listederoulante();

function affichage(x, y, z, data) {
    //tracer le graphe 
    var width = 1500;
    var height = 1000;
    var margin = 50;
    var max_numdock = d3.values(x);
    var max_capacity = d3.values(z);
    var max_numbike = d3.values(y);
    var min_numbike = d3.values(y);
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);


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

    // Add a scale for bubble size
    var zscale = d3.scaleLinear()
        .domain([d3.min(min_numbike), d3.max(max_numbike)])
        .range([1, 20]);

    console.log(data)
    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xscale(d.numdocksavailable); })
        //.attr("transform", "translate(50, 20)")
        .attr("cy", function (d) { return yscale(d.capacity); })
        .attr("transform", "translate(50, 20)")
        .attr("r", function (d) { return zscale(d.numbikesavailable); })
        .style("fill", "#69b3a2")
        .style("opacity", "0.7")
        .attr("stroke", "black");

    var circle = svg.select("g").selectAll("circle")
        .data(data);

    //circle.exit().remove();//remove unneeded circles
    circle.enter().append("circle")
        .attr("r", 0);//create any new circles needed

    //update all circles to new positions
    circle.transition()
        .duration(1000)
        .attr("cx", function (d) { return xscale(d.numdocksavailable);; })
        .attr("cy", function (d) { return yscale(d.capacity); })
        .attr("r", function (d) { return zscale(d.numbikesavailable); });
}



// fonction liste déroulante

function listederoulante() {
    var data_commune = [];
    var sel = document.getElementById('listeCommune');
    var opt = null;
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
                var index = (data_commune.indexOf(commune) > -1)
                if (index == false) {
                    data_commune.push(commune)
                }
            }

        }
        data_commune.sort();
        for (i = 0; i < data_commune.length; i++) {

            opt = document.createElement('option');
            opt.value = data_commune[i];
            opt.innerHTML = data_commune[i];
            sel.appendChild(opt);
        }


    }



}

// Changement de valeur lors du changement de la sélection 

d3.select("#listeCommune").on("change", change)

// fonction change 
function change() {
    input = this.options[this.selectedIndex].value;
    const data = [];
    var isRunning = false;
    var data_capacity = [];
    var data_numdocksavailable = [];
    var data_numbike = [];
    var data_commune = [];
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    
    xhr.open(
        "GET",
        "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=nom_arrondissement_communes%3D%22" + input + "&rows=500&facet=name&facet=nom_arrondissement_communes&facet=numbikesavailable&facet=capacity&facet=numdocksavailable"
    );
    xhr.send();
    // const promise = new Promise((resolve, reject) => {
    xhr.onload = function () {
        if (xhr.status < 400) {

            let reponse = xhr.response.records;
            
            for (let i in reponse) {
                let response_i = reponse[i].fields;
                let nom = response_i.name;
                let capacite = response_i.capacity;
                let bornette = response_i.numdocksavailable;
                let velo = response_i.numbikesavailable;
                data_capacity.push(capacite);
                data_numdocksavailable.push(bornette);
                data_numbike.push(velo);
                data.push({ name: nom, capacity: capacite, numdocksavailable: bornette, numbikesavailable: velo });

            }
            
            affichage(data_numdocksavailable, data_numbike, data_capacity, data);
        }
    }

    // if (isRunning === true) {
    //     resolve()
    // } else {
    //     reject()
    // }

    // })

    // promise.then(() => {
    //     console.log(data_numdocksavailable)
    // })


}
