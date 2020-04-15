import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import config from '../config'
import { BulletX } from '../styled/components'

const RatingsX = styled.div`
	position: relative;
	height: 150px;
	${props => {

		const fraction = parseInt( 100 / props.total, 10 )

		return `
		@keyframes fadeInOut {
			0% {
			    opacity: 0;
			    transform: translateY(25%);
			}
			5% {
			    opacity: 1;
			    transform: translateY(0%);
			}
			${fraction}% {
			    opacity: 1;
			    transform: translateY(0%);
			}
			${fraction + 5}% {
			    opacity: 0;
			    transform: translateY(-25%);
			}
			100% {
			    opacity: 0;
			    transform: translateY(-25%);
			}
		}
		`

	}}
`

const RatingX = styled.div`
	position: absolute;
	opacity: 0;
	animation-fill-mode: both;
	animation-iteration-count: infinite;
	animation-duration: ${parseInt( config.RATING_DELAY / 1000, 10 )}s;
	animation-delay: ${props => ( props.index * parseInt( config.RATING_DELAY / 1000, 10	 ) / props.total )}s;
	animation-name: fadeInOut;

`

// TODO: Fix animation
const Ratings = props => {

	const { current, data } = props

	if ( data.length > 0 ) {

		return (
			<RatingsX total={data.length}>
				{data.map( ( rating, i ) => (
					<RatingX key={rating.name} active={current === i} index={i} total={data.length}>
						<h5>{rating.name} Rating</h5>
						{[ ...new Array( 10 ) ].map( ( _, j ) => <BulletX key={`${rating.name}${j.toString()}`} active={Math.round( rating.score ) > j}/> )}
						<p>{rating.score} / 10</p>
					</RatingX>
				) )}
			</RatingsX>
		)

	}

	return null

}

Ratings.propTypes = {
	current: PropTypes.number,
	data: PropTypes.array
}

Ratings.defaultProps = {
	current: 0,
	data: []
}

export default Ratings
