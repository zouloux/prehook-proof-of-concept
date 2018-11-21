import {useEffect, useState} from "../lib/prehook/prehook";

// Quick helper to convert window size from window to a width / height object
const getWindowSize = () => ({
	width : window.innerWidth,
	height : window.innerHeight
});

/**
 * We export our custom hook to be usable in any component.
 * This will help us to know when window is updated and which is the current size.
 */
export function useWindowSize ()
{
	// Declare the state containing the current window size
	const sizeState = useState( getWindowSize() );

	// When window is resized
	function resizeHandler ()
	{
		// Update the state with the new window size
		sizeState( getWindowSize() );
	}

	// Listen when hooked component is mounted / unmounted
	// This is an alternative API, cleaner in this case.
	// Only when you do not need updates and shared scope between mount and unmount
	useEffect({
		mount: () => window.addEventListener('resize', resizeHandler),
		unmount: () => window.removeEventListener('resize', resizeHandler)
	});

	// Return the window size state
	return sizeState;
}