import { normalize } from 'polished'
import { createGlobalStyle } from 'styled-components'

// Styles and Elements
export const GlobalStyle = createGlobalStyle`
	${normalize()}
	* {
		box-sizing: border-box;

		transition-duration: .3s;
		transition-delay: 0s;
		transition-timing-function: ease-out;

		&::selection {
			color: ${props => props.theme.onSecondaryColor};
			background: ${props => props.theme.secondaryColor};
			// text-shadow: 2px 2px 2px ${props => props.theme.primaryColor};
		}
	}

	#__next {
		height: 100%;
	}

	html,
	body {
		height: 100vh;
		margin: 0;
		overflow: hidden;

		font-size: 16px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue',
			sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
		text-rendering: optimizeLegibility;
		font-feature-settings: 'liga', 'clig', 'kern';
	}
`
