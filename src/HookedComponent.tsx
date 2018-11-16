import { h } from 'preact';
import { prehook, useEffect, useState } from '../lib/prehook/prehook'
import { useRef } from '../lib/prehook/useRef'

// A quick utils to generate a an array of a random length
const generateRandomLengthArray = (max = 10) => Array.from({
	length: Math.random() * max
})


interface IProps
{
	defaultSuperProp	?: number

	onDetach			?: () => void

	color				:number
}


export const HookedComponent = prehook <IProps> ( function ( props )
{
	/**
	 * The factory phase only runs once.
	 * This is different from React's implementation which run this every times
	 * the component needs to update.
	 *
	 * This may be a less functional approach (props never changes here for ex)
	 * but it seems less "auto-magic" for hooks (they can be in conditions here),
	 * it does not break HMR and also it should be faster.
	 */
	console.log('Factory phase ...', this);

	/**
	 * TODO - Doc about useState != React.useState
	 */

	/**
	 * Isolating a state and an associated effect
	 * Effect updates only when state changes.
	 * Also, this state is an object.
	 */
	const clickState = useState({
		// TODO
		superProp: props().defaultSuperProp || 0
	});
	useEffect( [clickState], () =>
	{
		console.log('Click update', clickState());
	});
	async function clickStateHandler ( e )
	{
		// TODO
		clickState({
			superProp: clickState().superProp + 1
		})
		// TODO
		.then(
			() => console.log('After Click')
		)
	}


	/**
	 * An other state with it's effect to show associated updates
	 * Also, this is state is a number.
	 */
	const otherState = useState( 5 );
	useEffect( [otherState], () =>
	{
		console.log('Other update', otherState());
	});
	function clickOtherHandler ( e )
	{
		// TODO
		otherState(
			otherState() - 1
		);
	}


	/**
	 * Here is an example of subscribe type of hook.
	 *
	 * In this configuration
	 * - subscribe is called after each render.
	 * - unsubscribe is called before every subscribe call but the first
	 */
	/*
	useEffect( () =>
	{
		// Here we can subscribe to any model or external event / signal
		console.log('Subscribe effect', props());

		return () =>
		{
			// And here we unsubscribe.
			console.log('Unsubscribe effect');
		}
	})
	*/


	/**
	 * TODO DOC
	 */
	/*
	useEffect({
		mount: () => {
			console.log('Custom effect mount')
		},
		update: () => {
			console.log('Custom effect update')
		},
		unmount: () => {
			console.log('Custom effect unmount')
		}
	})
	*/


	/**
	 * TODO DOC
	 */
	const colorRef = useRef();
	useEffect( [ props('color') ], () =>
	{
		console.log('Color props updated to', props().color);
		console.log('Ref to color div :', colorRef())
	});

	/**
	 * TODO : Doc
	 */

	// Create a state to create a fake list with changing length
	const listItemStates = useState( generateRandomLengthArray() );

	// This ref will target all list items
	const listMultiRef = useRef();

	// Here we show all list refs
	// Only when the list is changing
	useEffect( [listItemStates], () =>
	{
		console.log( 'List item refs :', listMultiRef() );
	});

	function clickListRefsHandler ()
	{
		// Update the list state when clicking the button
		listItemStates( generateRandomLengthArray() )
	}



	/**
	 * Here is the returned render function.
	 * In react, we return DOM directly. This is an important difference and
	 * if allow us to declare factory phase once and render phase several times.
	 */
	return () => (
		console.log('Render phase ...'),
		<div>
			{/* Show color from props  */}
			<div
				style={{
					background: props().color,
					width: 100,
					height: 30
				}}
				children={ props().color }

				// Here we re-build the component each time our color is changing
				// we store the ref through the declared colorRef
				key={ props().color }
				ref={ colorRef }
			/>

			{/* Test of an object state to check updates */}
			<h3>Click state</h3>
			<p>Value : { clickState().superProp }</p>
			<button onClick={ clickStateHandler }>Click me</button>

			{/* Test of another state to check updates */}
			<h3>Other state</h3>
			<p>Value : { otherState() }</p>
			<button onClick={ clickOtherHandler }>Click me</button>

			{/* Test of props callback and detach events */}
			<h3>Callback</h3>
			<p>
				This will remove this component from the DOM by calling a prop callback.
				<br/>This is meant to test detach effects.
			</p>
			<button onClick={ props().onDetach }>Detach this component</button>

			{/* Test of multi-refs */}
			<h3>List refs</h3>
			<p>This part shows how we can multi-ref DOM elements (or components).</p>
			<button onClick={ clickListRefsHandler }>Update number of items</button>
			<ul>
				{/* Browse and build all list items from listItemStates array */}
				{
					listItemStates()
					.map( (el, i) =>
						<li ref={ listMultiRef(i) }>
							List item {i}
						</li>
					)
				}
			</ul>

			{/* Here we add children from props */}
			<h4>{ props().children }</h4>
		</div>
	)

	// TODO - Doc
}, __filename);
