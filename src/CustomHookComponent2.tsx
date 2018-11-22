import {h} from "preact";
import {prehook, useProps} from "../lib/prehook/prehook";
import {useWindowSize} from "./useWindowSize";


interface IProps
{
	color: number|string;
}

export default prehook <IProps> ( function CustomHookComponent2 ()
{
	// We use our custom hook to track window size
	const windowSize = useWindowSize();

	// Get props with default values
	const props = useProps<IProps>({
		color: 'black'
	});

	// Here returned render function is optimized to declare values
	return () =>
	{
		// Optimize values here to have clean DOM
		const { width, height } = windowSize.value;
		const ratio = .2;

		// We return our DOM
		return <div>
			<h3>Custom hook usage 2</h3>
			<div
				style={{
					margin: '0 auto',
					width: width * ratio,
					height: height * ratio,
					border: '2px solid grey',
					backgroundColor: props.value.color,
					borderRadius: 2
				}}
			/>
		</div>
	}
});
