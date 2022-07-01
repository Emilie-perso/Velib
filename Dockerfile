#Spécification la version de nodejs.
FROM node:12.0

#Packages
RUN apt-get update && apt-get install -y \
    sudo \
    wget \
    vim 


#Création d'un répertoire d'application
RUN mkdir /app
#Utilisation du répertoire de l'application comme répertoire de développement
WORKDIR /app

#Emballage en conteneur.json et packate-lock
COPY package*.json ./
#Package: Installation du package décrit dans json.
RUN npm i

#Nœud installé_Copie des fichiers tels que le module du côté du conteneur.
COPY . .

CMD ["node","app.js"]