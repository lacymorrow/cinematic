import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import BaseButton from './base-button'

const WrapperX = styled.div`
	flex: 1 1;
	overflow: auto;
`

const GridX = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, 200px);
	grid-gap: 1rem;

	padding: 15px 1rem;
`

const MovieX = styled( BaseButton )`
	transition-timing-function: ease-out;
	transition-property: color, background-color;

	height: 100%
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	text-align: left;

	border-radius: 6px;
	padding: 1rem .5rem;


	${props => props.active && `
		color: ${props.theme.movieItemColor};
		background-color: ${props.theme.movieItemBgColor};
	`}
`

const PosterX = styled.div`
	// Crop posters to same height

	height: 275px;
	overflow: hidden;

	img {
		width: 100%;
	}
`

const MovieInfoX = styled.div`
	h3 {
	    display: -webkit-box;
	    overflow: hidden;
		-webkit-line-clamp: 3;
	    -webkit-box-orient: vertical;

		margin-bottom: 0;

	}
	p {
		font-size: 12px;
	}


`

const MovieList = props => {

	const { current, data, handleChange } = props

	return (
		<WrapperX>
			<GridX>

				{data.map( movie => {

					return (
						<MovieX key={movie._id} active={current === movie._id} handleChange={() => handleChange( movie._id )}>
							<PosterX>
								<img src={movie.poster || '/static/default.png'} alt={`Poster for ${movie.title}`}/>
							</PosterX>
							<MovieInfoX>
								<h3>{movie.title}</h3>
								<p>{movie.Genre}</p>
								<p>{movie.runtime && `${movie.runtime} min`}</p>
							</MovieInfoX>
						</MovieX>
					)

				} )}
			</GridX>
		</WrapperX>
	)

}

MovieList.propTypes = {
	current: PropTypes.number,
	data: PropTypes.array,
	handleChange: PropTypes.func
}

MovieList.defaultProps = {
	data: []
}

export default MovieList
