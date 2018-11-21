import { shallowDiffers } from "./shallowDiffers";
import {Component} from "preact";


// ----------------------------------------------------------------------------- HOOKED COMPONENT

// TODO
interface IHookedComponent extends Component
{
	addEffect( effect:IEffect );
}


// The current hooked component.
// This is only set when a component is in factory phase
// Hooks are beeing declared.
let hookedComponent:IHookedComponent;

/**
 * Get the current hooked component.
 * This will return the current component in factory phase.
 * There can be only one component in factory phase.
 * If this returns null, this means there is no component in factory phase and
 * you shouldn't call this from a hook, or a hook is used outside a factory phase.
 */
export function getHookedComponent ()
{
	// Throw errors if a hook is used outside the factory phase
	// Only on dev to exclude this code from production builds
	if ( process.env.NODE_ENV !== 'production' )
	{
		( hookedComponent == null )
		&&
		console.error(`Prehook error // A hook is being used outside of a component's factory phase.`);
	}
	return hookedComponent;
}


// ----------------------------------------------------------------------------- PREHOOK COMPONENT HOC

// TODO : Doc
interface IEffect
{
	mount	?: () => void
	update	?: () => void
	unmount	?: () => void
}


// TODO : Better type with no any
//type IGetProps <GProps> = ( propName ?: (keyof GProps) ) => GProps|any;

interface IGetProps <GProps>
{
	( propName ?: (keyof GProps) ) : GProps|any

	value : GProps
}


// TODO : Better type with no () => any
type IFactory <GProps> = (props:IGetProps<GProps>) => (() => any);

/**
 * TODO : Explain HOC, functional, render, etc ...
 * @param factory
 * @param fileName
 */
export function prehook <GProps = {}> ( factory : IFactory<GProps>, fileName ?: string)
{
	// Parse name from Node's __filename
	let name = 'Component';
	if ( fileName != null )
	{
		const pathParts = fileName.split('/');
		name = pathParts[ pathParts.length - 1 ].split('.')[0];
	}

	// Create the returned functional component
	// Not as a class which extends Component
	function Component (props, context) // FIXME- Do we keep context ?
	{
		// List of effects associated to this component instance
		let effects:IEffect[] = [];

		/**
		 * Name
		 */

		// Set display name on instance
		this.displayName = name;

		// Show this component as string
		this.toString = () => `<${ name } ... />`;


		/**
		 * LifeCycle
		 */

		// When component is mounted by Preact
		this.componentDidMount = () => (
			// Call mount or update method on all effects
			effects.forEach( e => e.mount && e.mount() )
		);

		// When component is updated by props or state
		this.componentDidUpdate = () => (
			// Call update method on all effects
			effects.forEach( e => e.update && e.update() )
		);

		// When component will be removed by Preact
		this.componentWillUnmount = () => (
			// Call unmount method on all effects
			effects.forEach( e => e.unmount && e.unmount() )
		);

		// Do a shallow differs detection to allow changes only when
		// props or states changes. This will prevent render and save CPU cycles.
		this.shouldComponentUpdate = ( nextProps ) => (
			shallowDiffers( this.props, nextProps )
		);


		/**
		 * Get props from factory and render
		 */

		// TODO DOC
		const getProps:IGetProps <GProps> = ( propName ) => (
			( propName != null )
			? () => getProps()[ propName ]
			: ( this.props || props )
		);

		// TODO DOC
		getProps.value = props;

		this.componentWillReceiveProps = (props) =>
		{
			getProps.value = props;
		};


		/**
		 * Connecting hooks and init factory
		 */

		// Add an effect to this component instance
		this.addEffect = ( effect:IEffect ) => effects.push( effect );

		// Set current hook as this component
		// All hook declared in the next factory will be added to this hook
		// No other components can be created at the same time so it should be ok
		hookedComponent = this;

		// Here we call our component factory function
		// with current scope and arguments.
		// We save factory return as this render method so Preact can call it.
		this.render = factory.call( this, getProps, context );

		// Remove current hooked component reference
		// now we are done with this factory
		hookedComponent = null;


		/**
		 * Render
		 */

		// Return first render because we are in functional component
		// And preact won't call render() for this time.
		return this.render.apply( this );
	}

	// Set name on functional component
	Object.defineProperty(Component, 'name', { value: name });

	// Return functional component
	return Component;
}


// ----------------------------------------------------------------------------- USE STATE

/**
 * Used state function interface returned by useState
 */
export interface IUsedState <T>
{
	// Calling without argument will return the current state
	() : T

	// Calling with a new state as first argument
	// Will set the state and re-render associated component
	// A promise is returned to know when component will be re-rendered
	( value : T ) : Promise<any>

	// The returned used state from useState has a property
	// named "value", which holds the current state as read-only.
	readonly value : T
}


/**
 * TODO : DOC
 * @param state
 */
export function useState <T> ( state:T ) : IUsedState<T>
{
	// Get current component and keep its ref in this scope
	const component = getHookedComponent();

	// Return a function which is getter and setter
	const stateFactory = function ( value ?: T )
	{
		// Just return state if there is no new state to set
		if ( value == null ) return stateFactory.value;

		// Save state value as a prop of the used state
		// Storing it on the function will hold the value for this state
		stateFactory.value = value;

		// Update component and return when complete as a promise
		return new Promise(
			resolve => component.forceUpdate( resolve )
		)
	};

	// Set value for first time (before state is ever used)
	stateFactory.value = state;

	// Return state factory
	return stateFactory as IUsedState<T>;
}

// ----------------------------------------------------------------------------- USE EFFECT

// TODO : Proposer une API qui permet de vérifier les changements autre que les states
// TODO : Comme les props par ex, mais ça va être compliqué vu que ce ne sont pas des fonctions ?

// TODO : DOC
// TODO : Better type
type IMountHandler = () => (() => void)|null|undefined|void;

// TODO : Doc
type IStates = ( (...rest) => any )[];


/**
 * TODO : DOC
 * @param statesOrEffect
 * @param mountHandler
 */
export function useEffect ( statesOrEffect : (IStates | IMountHandler | IEffect | boolean), mountHandler ?: IMountHandler )
{
	// Get current component and keep its ref in this scope
	const component = getHookedComponent();

	// Get type of first argument to detect how to add our effect
	const typeofFirst = typeof statesOrEffect;
	const isArrayFirst = Array.isArray( statesOrEffect );

	// Check if first argument is already an effect
	if ( typeofFirst === 'object' && !isArrayFirst )
	{
		// Just add it, no lifecycle management
		component.addEffect( statesOrEffect as IEffect );
		return;
	}

	// Check if states parameter is present
	// And collapse arguments if mountHandler is on states argument slot
	let states:IStates = statesOrEffect as IStates;
	if ( mountHandler == null && typeofFirst === 'function' )
	{
		mountHandler = (statesOrEffect as IMountHandler);
		states = null;
	}

	// Optionnal unmount handler called returned by mountHandler
	let unmountHandler:() => void;

	// Function which calls unmount handler only if it exists
	const unmount = () => unmountHandler && unmountHandler();

	// Function which calls mount and get unmountHandler as a return
	const mount = () => unmountHandler = mountHandler() || null;

	if (
		// If first argument is a false
		( typeofFirst === 'boolean' && !statesOrEffect )
		// or if first argument is an empty array
		|| ( isArrayFirst && (statesOrEffect as IStates).length == 0 )
	) {
		// This is a subscribe effect.
		// Only mount and unmount will be called, update will never fire.
		component.addEffect({ mount, unmount });
		return;
	}

	// Function which update states values to check differs
	const updateStates = () => states.map( state => state() );

	// If we have state to optimize behavior.
	// Empty array is considered as no states to check
	const hasStates = !!states;

	// Get current states to check values if we have to
	let currentStates = hasStates && updateStates();

	// Add an effect to the component
	component.addEffect({

		// We add mount and unmount functions
		mount,
		unmount,

		// Update function will check state changes
		update : () =>
		{
			// If we have states changes to check
			if ( hasStates )
			{
				// Get new states values
				const newStates = updateStates();

				// Extract changes between old and new states values
				// TODO : ShallowDiffers ici ? Ce serait mieux pour les objects !
				// TODO : Shallow uniquement si c'est un objet du coup faut check donc perte de perfs
				// TODO : Peut-être pas utile car en fait on veut update lorsque state change de ref
				// TODO : Donc ça devrait le faire ! A tester ...
				const differences = newStates.filter( (state, i) => state != currentStates[ i ] );

				// Register new states values
				currentStates = newStates;

				// If we have no changes on states
				// do not update this effect
				if ( differences.length == 0 ) return;
			}

			// Unmount current effect to unregister before updating
			// Update and register unmount handler
			unmount();
			mount();
		}
	})
}
