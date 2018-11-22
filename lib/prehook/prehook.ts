import { shallowDiffers } from "./shallowDiffers";
import { Component, ComponentChildren, FunctionalComponent } from "preact";


// ----------------------------------------------------------------------------- HOOKED COMPONENT

/**
 * Interface of the current hooked component.
 * The only important info here is that hooked component holds its own effects.
 * Effects (with useEffect) add themselves to the hooked component through
 * addEffect()
 */
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

/**
 * An effect holds 3 optional handlers to know when the component is mount,
 * updated or unmount.
 */
interface IEffect
{
	mount	?: () => void
	update	?: () => void
	unmount	?: () => void
}

type IFactory <GProps> = (props : IGetProps<GProps>) => ( (...rest) => ComponentChildren );

/**
 * Prehook function is a Higher Order Component.
 * This function, when called, will return a decorated Preact component.
 * @param factory
 */
export function prehook <GProps = {}> ( factory : IFactory<GProps> ) : FunctionalComponent<GProps>
{
	// TODO : Terser is removing function name in production build.

	// Get name from factory function name
	const name = factory.name;

	return {

		// Create the prehook functional component
		// Not as a class which extends Component
		// This is the only way I found to set the component's name dynamically
		[ name ] : function ()
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
			this.render = factory.call( this );

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
	}[ name ];
}


// ----------------------------------------------------------------------------- USE PROPS

/**
 * To get current props and know when props are updated.
 */
interface IGetProps <GProps>
{
	// Calling without argument will return the current props
	// This is working like IUsedState
	() : GProps

	// Passing the name of a property as first argument
	// Will return a function which will return property value when called.
	// This is useful so effects know when a props change.
	( propName ?: (keyof GProps) ) : (() => keyof GProps)


	// The returned used state from useState has a property
	// named "value", which holds the current state as read-only.
	// This is working like IUsedState
	value ?: GProps
}

/**
 * Inject default properties into actual property bag.
 * Default props object does not need to satisfy all GProps interface but have
 * to declare only props of it.
 * @param defaultProps Default properties key and values.
 * @param actualProps Actual properties to default. Will be mutated.
 * @returns {GProps} Mutated and defaulted actualProps.
 */
function injectDefault <GProps> (defaultProps, actualProps) : GProps
{
	// NOTE : We allow mutation here because do not want to create a new
	// props instance. We mutate it so it's going to component as if it was
	// already with default values.

	// Inject every default prop into actual props
	// if this property key does not exists in actual props
	Object.keys( defaultProps ).map( propKey =>
	{
		// Inject in actual props if key is not present
		if ( !(propKey in actualProps) )
			actualProps[ propKey ] = defaultProps[ propKey ];
	});

	// Return actual props so we can chain
	return actualProps;
}

/**
 * TODO
 * @param {Partial<GProps>} defaultProps
 * @returns {IGetProps<GProps>}
 */
export function useProps <GProps> ( defaultProps ?: Partial<GProps> )
{
	// Get current component and keep its ref in this scope
	const component = getHookedComponent();

	// Throw errors if useProps has already been used on this component
	// Only on dev to exclude this code from production builds
	if ( process.env.NODE_ENV !== 'production' )
	{
		( hookedComponent.componentWillReceiveProps != null )
		&&
		console.error(`Prehook error // useProps can only be used once by component.`);
	}

	// Returned get props function.
	const getProps:IGetProps <GProps> = ( propName ? ) => (

		// If we have a property name as first argument
		// This is to watch the property from effects.
		( propName != null )

		// So we return a function which gives the value of the property
		? () => getProps.value[ propName ]

		// Otherwise (no first argument), we return the whole props object
		: getProps.value as any // FIXME any ?
	);

	// Set the value property on getProps for the first time
	// We set it as first props of the component
	getProps.value = injectDefault<GProps>(defaultProps, component.props);

	// Listen to new props from hooked component with componentWillReceiveProps
	component.componentWillReceiveProps = (props:GProps) =>
	{
		// Update value on the getProps so components can get the new props
		// without querying getProps()
		getProps.value = injectDefault<GProps>(defaultProps, props);
	};

	return getProps;
}


// ----------------------------------------------------------------------------- USE STATE

/**
 * Used state function interface returned by useState
 */
export interface IUsedState <GState>
{
	// Calling without argument will return the current state
	// This is working like IGetProps
	() : GState

	// Calling with a new state as first argument
	// Will set the state and re-render associated component
	// A promise is returned to know when component will be re-rendered
	( value : GState ) : Promise<any>

	// The returned used state from useState has a property
	// named "value", which holds the current state as read-only.
	// This is working like IGetProps
	value : GState
}


/**
 * TODO : DOC
 * @param state
 */
export function useState <GState> ( state:GState ) : IUsedState<GState>
{
	// Get current component and keep its ref in this scope
	const component = getHookedComponent();

	// Return a function which is getter and setter
	const stateFactory = function ( value ?: GState )
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
	return stateFactory as IUsedState<GState>;
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
