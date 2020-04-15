import { darken, invert } from 'polished'
import { objectMap } from '../helpers/util'

/*
	This is (obviously) the app color scheme.
	I'm so deaf to color palletes that I haven't actually picked one.
	This mess will be here until I have someone tell me it looks good,
	then we can clean it up.
*/

const colors = {
	black: '#000',
	darker: '#222',
	dark: '#555',
	gray: '#676767',
	light: '#888',
	lighter: '#c7c7c7',
	white: '#fff',

	blue: '#01a6f6',
	yellow: '#dba139',

	// Material design blue
	mblue1: '#82B1FF',
	mblue2: '#448AFF',
	mblue4: '#2979FF',
	mblue7: '#2962FF',

	// Material design purple
	purple: '#6200ee',
	darkPurple: '#3700b3',
	cyan: '#03dac6',
	darkCyan: '#018786',
	darkRed: '#b00020'
}

const colorSchemes = {
	blue: {

		primaryColor: colors.mblue7,
		primaryVariantColor: colors.mblue2,

		secondaryColor: colors.cyan,
		secondaryVariantColor: colors.darkCyan,

		backgroundColor: colors.white,
		surfaceColor: colors.white,
		errorColor: colors.darkRed,

		onPrimaryColor: colors.white,
		onSecondaryColor: colors.black,
		onBackgroundColor: colors.black,
		onSurfaceColor: colors.black,
		onErrorColor: colors.white
	},
	purple: {

		primaryColor: colors.purple,
		primaryVariantColor: colors.darkPurple,

		secondaryColor: colors.cyan,
		secondaryVariantColor: colors.darkCyan,

		backgroundColor: colors.white,
		surfaceColor: colors.white,
		errorColor: colors.darkRed,

		onPrimaryColor: colors.white,
		onSecondaryColor: colors.black,
		onBackgroundColor: colors.black,
		onSurfaceColor: colors.black,
		onErrorColor: colors.white

	}
}

const colorScheme = colorSchemes.blue

const lightTheme = {
	primaryColor: colorScheme.primaryColor,
	onPrimaryColor: colorScheme.onPrimaryColor,
	secondaryColor: colorScheme.secondaryColor,
	onSecondaryColor: colorScheme.onSecondaryColor,

	headerColor: colorScheme.onSurfaceColor,
	headerBgColor: colorScheme.surfaceColor,

	displayColor: colorScheme.onSurfaceColor,
	displayBgColor: darken( 0.03, colorScheme.surfaceColor ),

	movieItemColor: colorScheme.onPrimaryColor,
	movieItemBgColor: colorScheme.primaryColor,

	infoColor: colorScheme.onSurfaceColor,
	infoBgColor: darken( 0.01, colorScheme.surfaceColor ),

	sidebarColor: colorScheme.onSurfaceColor,
	sidebarBgColor: darken( 0.02, colorScheme.surfaceColor ),

	highlightColor: colorScheme.primaryColor,
	highlightSecondaryColor: colorScheme.primaryVariantColor,

	borderColor: colors.lighter,
	borderFocusColor: '#569aff',
	borderHoverColor: colors.light,
	selectColor: colors.gray,

	buttonColor: colorScheme.onSurfaceColor,
	buttonBgColor: colorScheme.surfaceColor,

	buttonActiveColor: colorScheme.onPrimaryColor,
	buttonActiveBgColor: colorScheme.primaryColor,

	buttonFocusColor: '#F50',

	buttonHoverColor: colorScheme.onSecondaryColor,
	buttonHoverBgColor: colorScheme.secondaryColor,

	progressColor: colorScheme.primaryColor

}

// /* Light mode */
// const lightTheme = {
// 	primaryColor: colors.blue,

// 	headerColor: colors.darker,
// 	headerBgColor: colors.white,

// 	displayColor: '#999',
// 	displayBgColor: '#ccc',

// 	infoColor: colors.darker,
// 	infoBgColor: colors.white,

// 	sidebarColor: colors.darker,
// 	sidebarBgColor: colors.white,

// 	highlightColor: colors.blue,
// 	highlightSecondaryColor: darken( 0.15, colors.blue ),

// 	borderColor: colors.lighter,
// 	borderFocusColor: '#569aff',
// 	borderHoverColor: colors.light,
// 	selectColor: colors.gray,

// 	buttonColor: colors.darker,
// 	buttonBgColor: colors.white,

// 	buttonActiveColor: colors.white,
// 	buttonActiveBgColor: colors.blue,

// 	buttonHoverColor: 'red',
// 	buttonHoverBgColor: 'blue',

// 	buttonFocusColor: '#F50',
// 	buttonFocusBgColor: 'teal',

// 	searchColor: 'rgba(246, 247, 249, 0.5)'
// }

/* Dark mode */
const darkTheme = {
	searchColor: colors.yellow
}

// Merge any non-existant colors
const dark = { ...objectMap( lightTheme, value => invert( value ) ), ...darkTheme }

const light = { ...objectMap( darkTheme, value => invert( value ) ), ...lightTheme }

export { dark, light, colors }
