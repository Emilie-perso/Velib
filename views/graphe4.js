/*---------Récupération des données -----------------*/
const url = "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=10000&sort=mechanical&facet=name&facet=nom_arrondissement_communes&facet=mechanical&facet=ebike"

const data = [];
var data_name 
var data_m_velo = [];
var data_e_velo = [];
var nom_commune = [];
var dataByCommune = [];
var sm = [];
var sn = [];
var smc = [];
var se =[];
var key = function (d) {
    return d.key;}

const xhr = new XMLHttpRequest();
xhr.responseType = "json";
xhr.open(
  "GET",
   url  
);
xhr.send();
xhr.onload = function () {
      if (xhr.status < 400) {
          let reponse = xhr.response.records;
          for (let i in reponse) {
              let response_i = reponse[i].fields;
              let commune = response_i.nom_arrondissement_communes;
              let nom = response_i.name;
              let e_velo = response_i.ebike;
              let m_velo = response_i.mechanical;
              data_m_velo.push(m_velo);
              data_e_velo.push(e_velo);
              data.push({ nom_commune: commune, name: nom, mechanical: m_velo, ebike: e_velo });
              var index = (nom_commune.indexOf(commune) > -1)
               if (index == false) {
                nom_commune.push(commune) }
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
      data.reduce(function(res, value) {
        if (!res[value.nom_commune]) {
            res[value.nom_commune] = { nom_commune: value.nom_commune, mechanical : 0, ebike : 0 };
            sm.push(res[value.nom_commune]) 
        }
        res[value.nom_commune].mechanical += value.mechanical;
        res[value.nom_commune].ebike += value.ebike;
        return res;
        }, {});

        
          smc.push(sm[0])
          console.log(smc);
          sn.push(sm[0].mechanical)
          sn.push(sm[0].ebike)
         console.log(sn);
          
         var n = ["vélos mécaniques", "vélos électriques"];

         console.log();
         var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        var width = 1000;
        var height = 550;
        var margin = 150;
        var margin2 = 10;
        var h = height /2 + margin2;
        var w = width /2 + margin;

        var svg = d3.select("#piechart")
             .append("svg")
             .style("background", "rgba(233, 233, 233, 1)")
             .attr("width", width)
             .attr("height", height);
        
        radius = Math.min(width, height - 50 ) / 2;

       
        svg.append("circle").attr("cx",790).attr("cy",30).attr("r", 6).style("fill", "#377eb8").style('fill-opacity', '0.8')
        svg.append("circle").attr("cx",790).attr("cy",60).attr("r", 6).style("fill", "#4daf4a").style('fill-opacity', '0.8')
        svg.append("text").attr("x", 800).attr("y", 30).text(" Vélos mécaniques").style("font-size", "20px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 800).attr("y", 60).text(" Vélos électriques").style("font-size", "20px").attr("alignment-baseline","middle")
 
        var g = svg
        .append("g")
        .attr("transform", "translate(" + w  + ","  + h + ")");

        var color = d3.scaleOrdinal(['#377eb8','#4daf4a']);

         // Generate the pie
         var pie = d3.pie() ;

        // Generate the arcs
        var arc = d3.arc()
          .innerRadius(100)
          .outerRadius(radius); 

        var path = d3.arc()
           .outerRadius(radius - 10)
           .innerRadius(0);

        //Generate groups
        var arcs = g.selectAll(".arc")
                       .data(pie(sn))
                       .enter().append("g")
                       .attr("class", "arc")
                       .style('fill-opacity', '0.8');
                //Draw arc paths
              arcs.append("path")
              .attr("fill", function(d, i) {
              return color(i);
    })
              .attr("d", arc)
              .on("mouseover", function (d) {

               


                div.transition()
                    .duration(100)
                    .style("opacity", "1");

                div.text( d.value)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");

            })
            .on("mouseout", function (d) {

               
                div.transition()
                    .duration(100)
                    .style("opacity", "0");
            })
            ;

           svg.append("g")
               .attr("transform", "translate(" + (width / 5 - 75 ) + "," + height/2 + ")")
               .append("text")
               .text("Vélos dans Paris")
               .style("fill", "black")
               .attr("class", "title")
      }
