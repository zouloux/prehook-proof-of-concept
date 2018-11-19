import "./App.less"
import {h} from 'preact'
import { HookedComponent } from "./HookedComponent";
import { prehook, useState } from '../lib/prehook/prehook'

// Quick function to generate a random hex color code
const getRandomColor = () => '#' + Math.floor( Math.random() * 16777215 ).toString( 16 );

// App props
interface IProps { }

/**
 * Declare our App component as a Prehook component.
 * We use IProps to define which props are available on this component.
 */
export const App = prehook <IProps> ( function ( props )
{
	// We create a state to toggle HookedComponent visibility
	// The default value of the state is true
	const isHookedComponentVisible = useState( true );

	// We create a color state to test if updating props from here
	// works well inside HookedComponent
	const colorState = useState( getRandomColor() );

	// We define a default superProp for our HookedComponent here
	// This random will never change for this App instance,
	// even if we re-render this App !
	const defaultSuperProp = Math.floor( Math.random() * 100 );

	// Here we return the render function, not that this is different from
	// React approach, we will see why inside HookedComponent.
	return () => (
		<div class="App">
			<h1>Hello Prehook 🚀</h1>
			<p>Open dev console and check source code to know more.</p>

			{
				/* State value is gathered by calling state without argument */
				isHookedComponentVisible()

				? <div>

					{/* This button will update colorState when clicked */}
					<h3>Props with hooked components</h3>
					<p>This example will show update cycle when updating props of an hooked component.</p>
					<button onClick={ e => colorState( getRandomColor() ) }>
						Change color on HookedComponent
					</button>

					{/* Add HookedComponent into DOM if our state is true */}
					<HookedComponent
						defaultSuperProp={ defaultSuperProp }
						color={ colorState() }
						onDetach={ () => isHookedComponentVisible( false ) }
					>
						{/* Here we add a dynamic child with the children property */}
						<div>Child from App</div>
					</HookedComponent>
				</div>

				/* We show a button to re-attach the component as a new instance */
				: <button
					onClick={ e => isHookedComponentVisible( true ) }
					children="Re-attach a new instance of HookedComponent"
				/>
			}
		</div>
	)
});
