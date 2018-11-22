import './HookedComponent.less'
import {ComponentChildren, h} from 'preact';
import {prehook, useEffect, useProps, useState} from '../lib/prehook/prehook'
import { useRef } from '../lib/prehook/useRef'

// A quick utils to generate a an array of a random length
const generateRandomLengthArray = (max = 10) => Array.from({
	length: Math.random() * max
});

interface IProps
{
	defaultSuperProp	?: number
	onDetach			?: () => void
	color				:  number|string
	children			?: ComponentChildren
}

export default prehook <IProps> ( function HookedComponent ()
{
	/**
	 * 1. THE FACTORY PHASE
	 *
	 * The factory phase only runs once.
	 * This is different from React's implementation which run this every times
	 * the component needs to update.
	 *
	 * This may be a less functional approach,
	 * but it seems less "auto-magic" for hooks (they can be in conditions here),
	 * it does not break HMR and also it should be faster.
	 *
	 * Also, this is still available !
	 * To expose public API, or get component name for example.
	 */
	console.log('Factory phase ...', this);

	/**
	 * 2. ABOUT PROPS
	 *
	 * Because this factory phase is ran only once, accessing props changes would
	 * be impossible. This is why props are optionally gathered from useProps hook.
	 *
	 * -> props.value.color gives the color at any time (not only in factory phase scope !)
	 *
	 * First parameter of useProps is default props
	 */
	const props = useProps<IProps>({
		defaultSuperProp: 0
	});


	/**
	 * 3. USE STATE
	 *
	 * React useState return a tuple. Here we return only a function which will
	 * act as a getter and a setter of the state. So we carry only one ref.
	 * Also, this ref is a function because this allow us to compute the
	 * Factory phase only once.
	 */

	/**
	 * Isolating a state and an associated effect
	 * Effect updates only when state changes.
	 * Also, this state is an object.
	 */
	const clickState = useState({
		// Here we get the default value from props
		superProp: props.value.defaultSuperProp
	});

	/**
	 * 4. USE EFFECT
	 *
	 * Note how useEffect can detect changes on clickState.
	 * We just pass clickState (which is a function) and useEffect will get
	 * the check the new value every times the component is rendered.
	 * This effect will be ran only when clickState changes.
	 *
	 * Also, changes are on top to be more readable. Effect implementation can
	 * be long and clickState will be invisible until we scroll bottom.
	 *
	 * First argument is optional and can be collapsed.
	 */
	useEffect( [clickState], () =>
	{
		console.log('Click state update', clickState.value);
	});

	/**
	 * 5. SET STATE
	 */
	async function clickStateHandler ( e )
	{
		// We update the state by calling the clickState function.
		clickState({
			// We get the state to increment by calling it again but without argument
			superProp: clickState.value.superProp + 1
		})
		// clickState is returning a Promise if we use it to change the state !
		// This is handy to know when the state is really updated
		.then(
			() => console.log('After click')
		)
	}

	/**
	 * 6. EFFECT OPTIMIZATION
	 */

	/**
	 * An other state with it's effect to show associated updates
	 * Also, this is state is a number and not an object.
	 */
	const otherState = useState( 5 );
	useEffect( [otherState], () =>
	{
		console.log('Other update', otherState());
	});
	function clickOtherHandler ( e )
	{
		// Here we quickly increment the state by getting then setting
		otherState( otherState.value - 1 );
	}

	/**
	 * 7. SUBSCRIBE / UNSUBSCRIBE & EVERY RENDER EFFECT
	 */

	/**
	 * Here is an example of subscribe effect type of hook.
	 * The goal is to subscribe to an event / signal / model when the component
	 * is mount, and to unsubscribe when unmount. Component state and props
	 * do not change this behavior.
	 *
	 * We activate it by passing false as the first argument here.
	 * An empty array also works, but I find this API more expressive.
	 *
	 * - First function is called after component is mount and first rendered.
	 * - Second function is called when component is unmount.
	 */
	useEffect( false, () =>
	{
		function resizeHandler ()
		{
			console.log('Subscribe effect // Window size changed', window.innerWidth)
		}

		// Here we can subscribe to any model or external event / signal
		console.log('Subscribe effect // Start listening to resize events.');
		window.addEventListener('resize', resizeHandler);

		// When component is destroyed, we stop listening to resizes
		return () =>
		{
			console.log('Subscribe effect // Stop listening to resize events.');
			window.removeEventListener('resize', resizeHandler);
		}
	});

	/**
	 * Effect hook called after every renders.
	 * - First function is called after each render.
	 * - Second function is called before every subscribe call but the first.
	 */
	useEffect( () =>
	{
		console.log('Every render effect // Mount and update');
		return () => console.log('Every render effect // Unmount');
	});

	/**
	 * 8. LIFECYCLE EFFECT
	 *
	 * This can be useful if you do not need the scoped effect or if you need
	 * more specific usage of mount vs update.
	 * All handlers are optional so this is flexible.
	 */
	useEffect({
		mount: () => {
			console.log('Lifecycle effect // Mount')
		},
		update: () => {
			console.log('Lifecycle effect // Update')
		},
		unmount: () => {
			console.log('Lifecycle effect // Unmount')
		}
	});

	/**
	 * 9. USE REF (SINGLE)
	 *
	 * Here we declare a ref to target a single DOM Element / Preact component
	 * in the returned render function bellow.
	 */
	const colorRef = useRef();

	/**
	 * 9. PROPS CHANGES AND EFFECTS
	 *
	 * We call props('color') to create a function which return the current
	 * color prop value. So this will be managed as a state() function.
	 * This effect will fire only when the color prop will change.
	 */
	useEffect( [ props('color') ], () =>
	{
		console.log('Color props updated to', props.value.color);
		console.log('Ref to color div :', colorRef())
	});

	/**
	 * 10. USE REFS (MULTIPLE)
	 */

	// Create a state to create a fake list with changing length
	const listItemStates = useState( generateRandomLengthArray() );

	// This ref will target all list items
	const listMultiRef = useRef();

	// Here we show all list refs
	// Only when the list is changing
	useEffect( [listItemStates], () =>
	{
		// Here the returning value is an array of Element (or Component) !
		console.log( 'List item refs :', listMultiRef() );
	});

	function clickListRefsHandler ()
	{
		// Update the list state when clicking the button
		listItemStates( generateRandomLengthArray() )
	}

	/**
	 * 11. RENDER
	 *
	 * Here is the returned render function.
	 * In react, we return DOM directly. This is an important difference and
	 * if allow us to declare factory phase once and render phase several times.
	 */
	return () => (
		console.log('Render phase ...'),
		<div class="HookedComponent">
			<h2>Hooked Component</h2>

			{/* Show color from props  */}
			<p>Color from props :</p>
			<div
				class="HookedComponent_color"
				style={{
					background: props.value.color
				}}
				children={ props.value.color }

				// Here we re-build the component each time our color is changing
				// we store the ref through the declared colorRef
				key={ props.value.color }
				ref={ colorRef }
			/>
			<hr/>

			{/* Test of an object state to check updates */}
			<h3>Click state</h3>
			<p>Value : { clickState.value.superProp }</p>
			<button onClick={ clickStateHandler }>Click me</button>
			<hr/>

			{/* Test of another state to check updates */}
			<h3>Other state</h3>
			<p>Value : { otherState() }</p>
			<button onClick={ clickOtherHandler }>Click me</button>
			<hr/>

			{/* Test of multi-refs */}
			<h3>List refs</h3>
			<p>This part shows how we can multi-ref DOM elements (or components).</p>
			<button onClick={ clickListRefsHandler }>Update number of items</button>
			<ul>
				{/* Browse and build all list items from listItemStates array */}
				{ listItemStates().map( (el, i) =>
					<li ref={ listMultiRef(i) }>
						Item n°{i}
					</li>
				)}
			</ul>
			<hr/>

			{/* Here we add children from props */}
			{ props.value.children }
			<hr/>

			{/* Test of props callback and detach events */}
			<h3>Callback</h3>
			<p>
				This will remove this component from the DOM by calling a prop callback.
				<br/>This is meant to test detach effects.
			</p>
			<button onClick={ props.value.onDetach }>Detach this component</button>
		</div>
	)
});
