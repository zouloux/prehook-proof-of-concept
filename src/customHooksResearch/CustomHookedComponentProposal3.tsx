import { h } from 'preact';
import {prehook, useEffect, useState} from '../../lib/prehook/prehook'


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

	return size;
}


export const CustomHookedComponentProposal3 = prehook( function ( props )
{
	const windowSize = useWindowSize();

	return () =>
	{
		const size = windowSize();
		return <div>
			<h3>Custom hook Proposal 3</h3>
			<p>Window width : { size.width }</p>
			<p>Window height : { size.height }</p>
		</div>
	}
});
