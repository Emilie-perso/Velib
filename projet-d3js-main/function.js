/*-----------Variables------------------ */
//groupement des données 
const groupBy = (key, arr) => arr.reduce((cache, product) =>
({
    ...cache, [product[key]]:
        product[key] in cache ? cache[product[key]].concat(product) : [product]
}),
    {})


/*-------------------------------Functions----------------------------------- */


/*------------liste déroulante -----------------*/
function liste_deroulante(nom_commune) {
    for (i = 0; i < nom_commune.length; i++) {
        var sel = document.getElementById('listeCommune');
        var opt = null;
        opt = document.createElement('option');
        opt.value = nom_commune[i];
        opt.innerHTML = nom_commune[i];
        sel.appendChild(opt);

    }
}



/*----- fonction update legend  ---------- */
// change la valeur de la légende capacité max 
function update_legend(id) {
    d3.select("#capa").selectAll("p").remove();
    var new_data = data.filter(d => d.nom_commune == id);
    let list_capacite = [];
    for (i in new_data) {
        list_capacite.push(new_data[i].capacite)
    }
    d3.select("#capa").append('p').text(" Capacité maximale : " + d3.max(list_capacite))
    d3.select("#capa").append('p').text("Nombre de station : " + new_data.length)

}







