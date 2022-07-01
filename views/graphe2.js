let dropdown = document.getElementById("locality-dropdown");
dropdown.length = 0;

let defaultOption = document.createElement("option");
defaultOption.text = "Choisissez le type de vélos";

dropdown.add(defaultOption);
dropdown.selectedIndex = 0; 

const list = ["Vélos mécaniques", "Vélos électriques"];
for (i =0; i < list.length; i++) 
{
 option = document.createElement('option');
 option.text = list[i];
 dropdown.add(option);
}

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

        for (i = 1; i < sm.length; i++)
        {
          smc.push(sm[i].mechanical)
          sn.push(sm[i].nom_commune)
          se.push(sm[i].ebike)
        }
    }

 /*-----------Affichage du graphe avec l'ensemble des valeurs------------- */
 //définition des variables      
    var width = 1000;
    var height = 550;
    var margin = {
     top: 20,
     right: 10,
     bottom: 125,
     left: 20
  };
function update(){ 
var selectType = document.getElementById("locality-dropdown").value;
if (selectType == "Vélos mécaniques") {

d3.selectAll("svg").remove();
// définition du svg 
var svg = d3.select("#barchart")
   .append("svg")
   .style("background", "rgba(233, 233, 233, 0.6)")
   .attr("width", width)
   .attr("height", height);

var g = svg
   .append("g")
   .attr("transform", `translate(${margin.left}, ${margin.top})`);

const customWidth = width - margin.left - margin.right;
const customHeight = height - margin.top - margin.bottom;

g.append("rect")
  .attr("fill", "#e3e3e3")
  .attr("width", customWidth)
  .attr("height", customHeight);

// ajout des axes x et y 
var xscale = d3.scaleBand()
  .domain(d3.range(smc.length))
  .rangeRound([0, width - margin.left - margin.right]) 
  .paddingInner(0.1);

var yscale = d3.scaleLinear()
  .domain([0, d3.max(smc)])
  .range([0, height - margin.top - margin.bottom]);

var x_axis = d3.axisBottom().scale(xscale);

var y_axis = d3.axisLeft().scale(yscale);

  var xa = d3.scalePoint()
  .domain(sn) 
  .range([48, width - 40]);  
  var xAxis = d3.axisBottom(xa);

svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-60)")
      .attr("fill", "black");


//build bars
g.append("g")
 .attr("class", "rect__container")
 .selectAll("rect")
 .data(d3.values(smc), key)
 .enter()
 .append("rect")
 .on("mouseover", onMouseOver) //Add listener for the mouseover event
 .on("mouseout", onMouseOut)   //Add listener for the mouseout event
 .attr("x", function(d,i){
   return xscale(i);
})
 .attr("y", function(d){
   return customHeight - yscale(d);
})
 .attr("width", xscale.bandwidth() + 1)
 .attr("height", function(d) {
   return yscale(d);
})
.attr("fill", "steelblue")

  //mouseover event handler function
  function onMouseOver(d, i) {
    d3.select(this).attr('fill', 'orange');
    d3.select(this)
        .transition()     // adds animation
        .ease(d3.easeLinear)
        .duration(400)
        .attr('width', xscale.bandwidth() + 5)
        .attr("y", function(d) { return yscale(d); })
        .attr("height", function(d) { return  customHeight - yscale(d) ; });

      g.append("text")
       .attr('class', 'val') 
       .attr('x', function() {
           return xscale(d);
       })
       .attr('y', function() { return yscale(d) + 50;})
       .text(function() {
        return [sn[i] + ' ' + d];}); // Value of the text
  }

  //mouseout event handler function
  function onMouseOut(d, i) {
      // use the text label class to remove label on mouseout
      d3.select(this).attr('fill', 'steelblue');
      d3.select(this)
        .transition()     // adds animation
        .ease(d3.easeLinear)
        .duration(400)
        .attr('width', xscale.bandwidth() + 1)
        .attr("y", function(d) { return customHeight - yscale(d); })
        .attr("height", function(d) { return  yscale(d); });

      d3.selectAll('.val')
        .remove()
  }

//text labels on bars
g.selectAll("text")
 .data(d3.values(smc), key)
 .enter()
 .append("text")
 .text(function(d) { return d; })
 .attr("x", function(d,i){
    return xscale(i) + xscale.bandwidth() / 2 ;
 })
 .attr("y", function(d){
    return customHeight - yscale(d) -2 ;
 })
 .attr("font-family" , "sans-serif")
 .attr("font-size" , "9px")
 .attr("fill" , "black")
 .attr("text-anchor", "middle");

 svg.append("text")      // text label for the x axis
        .attr("x", width / 2)
        .attr("y",  height - 2)
        .style("text-anchor", "middle")
        .attr("fill" , "black")
        .text("Communes");

 g.append("text")     // text label for the y axis
        .attr("transform", "rotate(-90)")       
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill" , "black")
        .text("Vélos mécaniques");
}

else if (selectType == "Vélos électriques") {
  d3.selectAll("svg").remove();
  // définition du svg 
var svg = d3.select("#barchart")
.append("svg")
.style("background", "rgba(233, 233, 233, 0.6)")
.attr("width", width)
.attr("height", height);

var g = svg
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

const customWidth = width - margin.left - margin.right;
const customHeight = height - margin.top - margin.bottom;

g.append("rect")
.attr("fill", "#e3e3e3")
.attr("width", customWidth)
.attr("height", customHeight);

// ajout des axes x et y 
var xscale = d3.scaleBand()
.domain(d3.range(se.length))
.rangeRound([0, width - margin.left - margin.right]) 
.paddingInner(0.1);

var yscale = d3.scaleLinear()
.domain([0, d3.max(se)])
.range([0, height - margin.top - margin.bottom]);

var x_axis = d3.axisBottom().scale(xscale);

var y_axis = d3.axisLeft().scale(yscale);

var xa = d3.scalePoint()
.domain(sn) 
.range([48, width - 40]);  
var xAxis = d3.axisBottom(xa);

svg.append("g")
   .attr("transform", `translate(0,${height - margin.bottom})`)
   .call(xAxis)
   .selectAll("text")
   .style("text-anchor", "end")
   .attr("fill", "black")
   .attr("dx", "-.8em")
   .attr("dy", ".15em")
   .attr("transform", "rotate(-60)");

g.append("g")
 .attr("class", "rect__container")
 .selectAll("rect")
 .data(d3.values(se), key)
 .enter()
 .append("rect")
 .on("mouseover", onMouseOver) //Add listener for the mouseover event
 .on("mouseout", onMouseOut)   //Add listener for the mouseout event
 .attr("x", function(d,i){
   return xscale(i);
})
 .attr("y", function(d){
   return customHeight - yscale(d);
})
 .attr("width", xscale.bandwidth() + 1)
 .attr("height", function(d) {
   return yscale(d);
})
.attr("fill", "steelblue")

  //mouseover event handler function
  function onMouseOver(d, i) {
    d3.select(this).attr('fill', 'orange');
    d3.select(this)
        .transition()     // adds animation
        .ease(d3.easeLinear)
        .duration(400)
        .attr('width', xscale.bandwidth() + 5)
        .attr("y", function(d) { return yscale(d); })
        .attr("height", function(d) { return  customHeight - yscale(d) ; });

      g.append("text")
       .attr('class', 'val') 
       .attr('x', function() {
           return xscale(d);
       })
       .attr('y', function() { return yscale(d) + 50;})
       .text(function() {
        return [sn[i] + ' ' + d];}); // Value of the text
  }

  //mouseout event handler function
  function onMouseOut(d, i) {
      // use the text label class to remove label on mouseout
      d3.select(this).attr('fill', 'steelblue');
      d3.select(this)
        .transition()     // adds animation
        .ease(d3.easeLinear)
        .duration(400)
        .attr('width', xscale.bandwidth() + 1)
        .attr("y", function(d) { return customHeight - yscale(d); })
        .attr("height", function(d) { return  yscale(d); });

      d3.selectAll('.val')
        .remove()
  }

//text labels on bars
g.selectAll("text")
 .data(d3.values(se), key)
 .enter()
 .append("text")
 .text(function(d) { return d; })
 .attr("x", function(d,i){
    return xscale(i) + xscale.bandwidth() / 2 ;
 })
 .attr("y", function(d){
    return customHeight - yscale(d) -2 ;
 })
 .attr("font-family" , "sans-serif")
 .attr("font-size" , "9px")
 .attr("fill" , "black")
 .attr("text-anchor", "middle");

 svg.append("text")      // text label for the x axis
        .attr("x", width / 2)
        .attr("y",  height - 2)
        .style("text-anchor", "middle")
        .attr("fill" , "black")
        .text("Communes");

 g.append("text")     // text label for the y axis
        .attr("transform", "rotate(-90)")       
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill" , "black")
        .text("Vélos électriques");

   } 
  }
