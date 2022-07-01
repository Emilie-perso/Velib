const path = require('path');


module.exports = {
  //le mode est la production/Décrit dans le développement
  // ""Notez qu'il est entouré de
  mode: "development",
  //Quel fichier lire par défaut=> ./src/index.js
  entry: './public/index.js',
  //Où cracher la compilation du fichier lu par entrée
  output: {
    path: path.resolve(__dirname, 'public'),
    //échantillon à dist.Crachez avec le nom de fichier js
    filename: 'sample.js',
    publicPath: '/'

  },
  devServer: {
    inline: false,
    contentBase: "./public",
  },

  module: {
    rules: [{ test: /\.s[ac]ss$/i, 
      use:[  'css-loader', 'style-loader', 'sass-loader'], 
      exclude: /node_modules/, },
      {
           test: /\.(png|svg|jpg|gif)$/,
            use: [
               'file-loader',
               ],
             },]
  },
}
  /*module: {
    rules: [
      
      //Lecture et compilation de fichiers Sass
      {
        //Pour les fichiers avec les extensions sass et scss
        test: /\.s[ac]ss$/i,
        type: 'javascript/dynamic',
        use: [
          //Fonction à sortir pour lier la balise
          "style-loader",
          //Possibilité de regrouper CSS
          "css-loader",
          // sass2css
          "sass-loader",
        ],
        loader: 'bable-loader',
        exclude: "/node_modules/",
      },
      {
        //Extension de fichier cible
        test: /\.(gif|png|jpg|eot|wof|woff|ttf|svg)$/,
        //Importer des images comme Base 64
        type: "asset/inline",
      },
    ],
  },
  // ES5(IE11 etc.)Désignation pour (obligatoire pour Webpack 5 et supérieur)
  target: ["web", "es5"],
}
*/;