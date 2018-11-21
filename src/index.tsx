import './index.less';
import { h, render } from 'preact';
import App from "./App";

// Enable React devtools on dev mode
// FIXME - Marche pas ?
import 'preact/debug';

// Render our app into the body
const mountNode = document.getElementById('app');
render(<App />, mountNode, mountNode.lastChild as any);
