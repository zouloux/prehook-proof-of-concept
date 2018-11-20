import { h } from 'preact';
import { useWindowSizeProposal4 } from './useWindowSizeProposal4'
import { prehook } from '../../lib/prehook/prehook'


interface IProps { }

export const CustomHookedComponentProposal4 = prehook <IProps> ( function ( props )
{
	const windowSize = useWindowSizeProposal4();

	return () => (
		<div>
			<h3>Custom hook Proposal 4</h3>
			<p>Window width : { windowSize.value.width }</p>
			<p>Window height : { windowSize.value.height }</p>
		</div>
	)
});
