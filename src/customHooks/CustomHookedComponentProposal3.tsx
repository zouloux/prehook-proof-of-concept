import { h } from 'preact';
import { useWindowSizeProposal1 } from './useWindowSizeProposal1'
import { prehook } from '../../lib/prehook/prehook'


interface IProps { }

export const CustomHookedComponentProposal3 = prehook <IProps> ( function ( props )
{
	const windowSize = useWindowSizeProposal1();

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
