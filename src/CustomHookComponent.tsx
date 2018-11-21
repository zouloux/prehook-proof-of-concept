import {h} from "preact";
import {prehook} from "../lib/prehook/prehook";
import {useWindowSize} from "./useWindowSize";


export default prehook <{}> ( function CustomHookComponent ( props )
{
	const windowSize = useWindowSize();

	return () => (
		<div>
			<h3>Custom hook usage 1</h3>
			<p>Window width : { windowSize.value.width }</p>
			<p>Window height : { windowSize.value.height }</p>
		</div>
	)
});
