/**
 * TODO : This is WIP and this is not the subject :)
 */


// TODO Check node_modules and npm i

const Bundler   = require('parcel-bundler');
const Path      = require('path');
const { Files } = require('@zouloux/files');
const { spawn } = require('child_process');
const Logger 	= require('parcel-bundler/lib/Logger');



const production = ( process.argv[ 2 ] === 'production' );
process.env.NODE_ENV = production ? 'production' : 'dev';
console.log(production ? 'Compiling for production ...' : 'Dev mode ...');

// Remove all dist files
Files.setVerbose( false );
Files.getFolders('./dist/').remove();

// Emplacement du fichier unique en point d'entrée :
const entryFiles = Path.join(__dirname, './src/index.html');
// OU : Plusieurs fichiers avec un glob (cela peut être aussi un .js)
// const entryFiles = './src/*.js';
// OU : Plusieurs fichiers dans un tableau
// const entryFiles = ['./src/index.html', './un/autre/repertoire/scripts.js'];

// Options de l'empaqueteur
const options = {
	outDir : './dist', // Le répertoire out pour mettre les fichiers construits, par défaut dist
	outFile : 'index.html', // Le nom du fichier en sortie
	publicUrl : './', // L'URL du serveur, par défaut 'dist'
	watch : !production, // Surveiller les fichiers et les reconstruire lors d'un changement, par défaut pour
						 // process.env.NODE_ENV !== 'production'
	cache : true, // Active ou non la mise en cache, la valeur par défaut est true
	cacheDir : '.cache', // Le répertoire où le cache est placé, par défaut .cache
	contentHash : false, // Désactive l'inclusion du hachage de contenu sur le nom du fichier
	minify : production, // Minifie les fichiers, activé par défaut si process.env.NODE_ENV === 'production'
	scopeHoist : production, // Active le flag expérimental de scope hoisting/tree shaking, pour des paquets
							 // plus petits en production
	target : 'browser', // la cible de compilation : browser/node/electron, par défaut browser
	/*
	 https: { // Définit une paire personnalisée {key, cert}, utilisez true pour en générer un ou false pour utiliser http
	 cert: './ssl/c.crt', // chemin vers le certificat personnalisé
	 key: './ssl/k.key' // chemin vers la clé personnalisée
	 },
	 */
	logLevel : 3, // 3 = Tout consigner, 2 = Consigner les erreurs et les avertissements, 1 = Consigner
				  // uniquement les erreurs
	hmr : !production, // Active ou désactive le HMR lors de la surveillance (watch)
	//hmrPort: 0, // Le port sur lequel la socket HMR (Hot Module Reload) fonctionne, par défaut à un port
	// libre aléatoire (0 dans node.js se traduit en un port libre aléatoire)
	sourceMaps : !production, // Active ou désactive les sourcemaps, par défaut activé (pas encore pris en
							  // charge dans les versions minifiées)
	//hmrHostname: '', // Un nom d'hôte pour le rechargement de module à chaud, par défaut à ''
	detailedReport : production, // Afficher un rapport détaillé des paquets, ressources, tailles des fichiers
								// et durées de build, par défaut à false, les rapports ne sont affichés que
								// si le mode watch est désactivé
};

let currentTscProcess;

const showProcessOutput = (process) =>
{
	const stdout = (process.stdout.read() || '').toString();
	const stderr = (process.stderr.read() || '').toString();

	stdout !== '' && Logger.log( stdout );
	stderr !== '' && Logger.log( stderr );
}

const checkTypescript = () =>
{
	if ( currentTscProcess )
	{
		currentTscProcess.kill();
	}

	Logger.progress(' Checking typescript ...');

	currentTscProcess = spawn('./node_modules/typescript/bin/tsc', [ '--noEmit', '--pretty' ], {
		//detached : true,
	});

	currentTscProcess.once('exit', (code) =>
	{
		Logger.stopSpinner();
		Logger.clear();

		showProcessOutput( currentTscProcess );

		if ( code === 0 )
		{
			Logger.log('👌  ' + Logger.chalk.green.bold(`Typescript validated.`) );
		}
	});
}


async function runBundle ()
{
	// Initialise un empaqueteur (bundler) en utilisant l'emplacement de l'entrée et les options fournies
	const bundler = new Bundler(entryFiles, options);

	bundler.on('bundled', ( bundle ) =>
	{
		this.checkTypescript();
		// TODO -> less check ?
	});

	// Démarre l'empaqueteur, cela renvoie le paquet principal
	// Utilisez les événements si vous êtes en mode watch, car cette Promise n'est résolue qu'une seule fois
	// et non à chaque reconstruction
	const bundle = await bundler.bundle();
}


runBundle();




