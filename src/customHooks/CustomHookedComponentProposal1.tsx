import { h } from 'preact';
import { useWindowSizeProposal1 } from './useWindowSizeProposal1'
import { prehook } from '../../lib/prehook/prehook'


interface IProps { }

export const CustomHookedComponentProposal1 = prehook <IProps> ( function ( props )
{
	const windowSize = useWindowSizeProposal1();

	return () => (
		<div>
			<h3>Custom hook Proposal 1</h3>
			<p>Window width : { windowSize().width }</p>
			<p>Window height : { windowSize().height }</p>
		</div>
	)
});
