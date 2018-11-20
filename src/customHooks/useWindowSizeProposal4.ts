import { useEffect, useState } from '../../lib/prehook/prehook'

export function useWindowSizeProposal4 ()
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
