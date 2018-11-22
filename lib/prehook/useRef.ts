import { getHookedComponent } from "./prehook";

// TODO : add current and all props

/**
 * TODO : DOC
 * TODO : Type
 */
export function useRef ()
{
	// List of all referenced components / nodes
	let nodes:any[] = [];

	// If we are in multi or single ref mode
	// In multi mode, myRef() will return an array
	// Otherwise, myRef() will return the ref of targeted element
	let multi = false;

	// Quickly add an effect on the current hooked component
	// This will help us to know when the component is unmount.
	getHookedComponent().addEffect({
		// Kill nodes array so returned functions are annihilated
		unmount: () => nodes = null
	});

	// We return a ref function.
	// The first argument is the ref given by Preact or the key of the multi ref
	// If no argument is given or null, the node or nodes will be returned.
	return function ( r ?: any )
	{
		// Do not continue if component has be unmount
		if (!nodes) return;

		// Get type of argument to know if we are in single / multi / getter mode
		const typeofFirst = typeof r;

		// We are in multi ref mode because there is a key argument
		if ( typeofFirst === 'string' || typeofFirst === 'number' )
		{
			// Enable multi ref mode
			multi = true;

			// In multi ref mode, we return a function for Preact to bind refs
			// First argument is mandatory here because this is used by Preact only
			return function ( rr:any )
			{
				// Do not continue if component has be unmount
				if (!nodes) return;

				// If the ref is null
				// Preact is removing this item for the current key
				if ( rr == null )
				{
					// We delete the node and adjust array length
					// r is the key given by the first callback, remember ? :)
					// this is the key
					delete nodes[ r ];
					nodes.length --;
					return;
				}

				// Otherwise we add this ref for the current key
				// and ajust array length
				nodes.length ++;
				nodes[ r ] = rr;
			}
		}

		// If the first argument is not a string or a number
		// and if there is a ref given by Preact
		// We are in solo mode
		// FIXME - null ? Never killing a solo node or what ?
		else if ( r != null )
		{
			// So we set the ref directly
			nodes[ 0 ] = r;
		}

		// If there is no argument given (undefined and not null)
		// We return the targeted ref or refs
		else return (
			// All nodes as an array in multi ref mode
			multi ? nodes
			// Only the first in solo ref mode
			: nodes[0]
		)
	}
}
