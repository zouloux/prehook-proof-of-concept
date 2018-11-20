import { h } from 'preact';
import { useWindowSizeProposal2 } from './useWindowSizeProposal2'
import { prehook } from '../../lib/prehook/prehook'


interface IProps { }

export const CustomHookedComponentProposal2 = prehook <IProps> ( function ( props )
{
	const windowSize = useWindowSizeProposal2();

	return () => (
		<div>
			<h3>Custom hook Proposal 2</h3>
			<p>Window width : { windowSize('width') }</p>
			<p>Window height : { windowSize('height') }</p>
		</div>
	)
});
