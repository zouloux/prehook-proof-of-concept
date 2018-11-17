/**
 * FIMXE - WIP
 */

const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

// Install node modules if needed
if ( !fs.existsSync('node_modules') )
{
	console.log('🕓  Installing node modules ...');
	spawnSync('npm', ['i'], {
		// FIXME : Does not works ?
		stdio: "pipe"
	});
}

const Bundler   = require('parcel-bundler');
const Path      = require('path');
const { Files } = require('@zouloux/files');
const Logger 	= require('parcel-bundler/lib/Logger');

// Production or dev mode
const production = ( process.argv[ 2 ] === 'production' );
process.env.NODE_ENV = production ? 'production' : 'dev';
console.log(production ? '🚀  Building for production' : '🤖  Development mode');

// Remove all dist files before each build
Files.setVerbose( false );
Files.getFolders('./dist/').remove();

// Application entry point
const entryFiles = [
	Path.join(__dirname, './src/index.html')
];

// Bundler options
const options = {
	outDir : './dist',
	outFile : 'index.html',
	publicUrl : './', // = base
	watch : !production,
	cache : true,
	cacheDir : '.cache',
	contentHash : false,
	minify : production,
	scopeHoist : production, // FIXME - Test it in dev with a certain flag ?
	target : 'browser',
	logLevel : 3,
	hmr : !production,
	sourceMaps : !production,
	detailedReport : production,
};

// Show a process output
const showProcessOutput = (process) =>
{
	const stdout = (process.stdout.read() || '').toString();
	const stderr = (process.stderr.read() || '').toString();

	stdout !== '' && Logger.log( stdout );
	stderr !== '' && Logger.log( stderr );
};

// Current running TSC process
// We keep it here to be able to reset it
let currentTscProcess;

/**
 * Check Typescript files.
 * Current Typescript checker will be killed to avoid double outputs.
 * TS errors will be shown in console.
 */
const checkTypescript = async () => new Promise( (resolve, reject) =>
{
	// Kill current running typescript checker
	( currentTscProcess )
	&&
	currentTscProcess.kill();

	// Show loader
	Logger.progress(' Checking typescript ...');

	// Check Typescript files with installed tsc
	currentTscProcess = spawn('./node_modules/typescript/bin/tsc', [ '--noEmit', '--pretty' ], {
		// FIXME - Maybe better for memory leaks ?
		//detached : true,
	});

	// When Typescript checker has done
	currentTscProcess.once('exit', (code) =>
	{
		// Stop loader
		Logger.stopSpinner();
		Logger.clear();

		// Show errors and outpus
		showProcessOutput( currentTscProcess );

		// No errors
		if ( code === 0 )
		{
			// TODO : Better line cleaning cause sometime we see old errors
			Logger.log(`👌  ${ Logger.chalk.green.bold('Typescript validated.') }` );
			resolve();
		}

		// Errors detected
		else reject( code );
	});
});

/**
 * Run bundler
 */
async function runBundle ()
{
	// Create Parcel bundler
	const bundler = new Bundler(entryFiles, options);

	// Check before build on production
	if ( production )
	{
		await checkTypescript();
		// TODO -> less check
	}

	// When a bundle is created
	bundler.on('bundled', async ( bundle ) =>
	{
		// Check after build, only on dev mode
		if ( !production )
		{
			await checkTypescript();
			// TODO -> less check
		}
	});

	// Start bundler
	const bundle = await bundler.bundle();
}

// Run bundler
runBundle();




