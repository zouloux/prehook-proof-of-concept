import { h } from 'preact';
import { IUsedState, prehook, useEffect, useState } from '../../lib/prehook/prehook'


// TODO : DOC
export function exposeState <T> ( state : IUsedState<T> )
{
	return function ( pProp : keyof T )
	{
		return state.value[ pProp ];
	}
}



function useWindowSize ()
{
	const size = useState({
		width : window.innerWidth,
		height : window.innerHeight
	});

	function resizeHandler ( e )
	{
		size({
			width : window.innerWidth,
			height : window.innerHeight
		});
	}

	useEffect(false, () =>
	{
		window.addEventListener('resize', resizeHandler);

		return () =>
		{
			window.removeEventListener('resize', resizeHandler);
		}
	});

	return exposeState( size );
}


export const CustomHookedComponentProposal2 = prehook( function ( props )
{
	const windowSize = useWindowSize();

	return () => (
		<div>
			<h3>Custom hook Proposal 2</h3>
			<p>Window width : { windowSize('width') }</p>
			<p>Window height : { windowSize('height') }</p>
		</div>
	)
});
