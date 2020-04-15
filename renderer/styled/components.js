import styled from 'styled-components'
import Button from '../components/button'

export const ContainerX = styled.div`
	display: flex;
	position: relative;
	flex-direction: row;
	height: 100%;
	align-items: stretch;
`

export const WrapperX = styled.div`
	flex-grow: 0;
	flex-shrink: 1;
	flex-basis: 100%;
	${props => props.isVisible && `
		flex-basis: calc(100% - 500px);
	`}

	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: stretch;
	transition: flex-basis .3s ease .1s;
`

export const HeaderX = styled.div`
	flex: 0 0 80px;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	color: ${props => props.theme.headerColor};
	background: ${props => props.theme.headerBgColor};

	&>* {
		margin-right: 1rem;
	}
	&>*:first-child {
		margin-right: 0;
	}
`

export const MainX = styled.div`
	flex: 1 1 100%;
	display: flex;
	flex-direction: row;
	overflow: hidden;

`

export const DisplayX = styled.div`
	flex: 1 1 80%;

	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;

    transition-property: color, background-color;
    color: ${props => props.theme.displayColor};
    background-color: ${props => props.theme.displayBgColor};
`

export const NoMoviesTextX = styled.h4`
	margin: 0 auto;
	padding: 5rem 2rem;
	font-size: 1.6rem;
`

export const ShuffleButtonX = styled( Button )`
	display: flex;
`

export const SortWrapperX = styled.div`
	flex: 0 0 60px;

	display: flex;
	flex-direction: row;
	align-items: center;
`

// TODO bullet styles
export const BulletX = styled.div`
	display: inline-block;
	margin: 4px 8px 4px 0;
	border-radius: 50%;
	width: 1em;
	height: 1em;
	background-color: ${props => props.theme.onPrimaryColor};
	box-shadow: 1px 1px 5px #BBB;

	transition-property: background-color;
	${props => props.active && `
		background-color: ${props.theme.primaryColor};
	`}
`
