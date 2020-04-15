import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { rgba } from 'polished'
import { FiExternalLink as ImdbIcon, FiTv as WatchIcon } from 'react-icons/fi'

import config from '../config'
import strings from '../helpers/strings'
import { openFile, openUrl } from '../helpers/safe-ipc'
import { BulletX } from '../styled/components'
import Button from './button'
import IconButton from './icon-button'
import Ratings from './ratings'

// TODO: default backdrop loading/not-found image

const WrapperX = styled.div`
	/* old way of animating flex-basis */
	// flex-basis: 0px;
	// flex-grow: 0;
	// flex-shrink: 1;
	// overflow: hidden;

	// display: flex;
	// flex-direction: column;
	// justify-content: space-between;
	box-shadow: 0 5px 10px rgba(0,0,0,0.19), 0 3px 3px rgba(0,0,0,0.23);

	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	transition: transform .5s ease-out;
	transform: translateX(500px);
	background: ${props => props.theme.infoBgColor};

	${props => props.isVisible && `
		// flex-basis: 500px;
		transform: translateX(0px);
	`}
`

const PanelX = styled.div`
	width: 500px;
	height: 100%;
    overflow-y: auto;
`

const BackdropX = styled.div`
	width: 500px;
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	z-index: -1;
	&::before {
		content: '';
		position: absolute;
		top: ${props => props.height}px;
		height: ${props => props.height}px;
		right: 0;
		left: 0;
		background: linear-gradient(to bottom, ${props => rgba( props.theme.infoBgColor, 0 )}, ${props => rgba( props.theme.infoBgColor, 1 )});
	}
`

const BackdropImgX = styled.img`
	width: 100%;
`

const BackdropMirrorX = styled( BackdropImgX )`
	margin-top: -3px;
	filter: FlipV;
	transform: scaleY(-1);
`

const InfoWrapperX = styled.div`
	// Scroll container
	height: 100%;
	overflow-y: auto;
`

const InfoX = styled.div`
	transition-timing-function: ease-out;
	transition-property: color, background;
	color: ${props => props.theme.infoColor};
	background: linear-gradient(to bottom, ${props => rgba( props.theme.infoBgColor, 0.8 )} 0%, ${props => rgba( props.theme.infoBgColor, 1 )} 20%)});
	margin-top: ${props => props.height}px;
	padding: 1rem 1rem ${props => props.height}px;
`

const TitleX = styled.h2`
	margin-top: 0;
`

const CopyX = styled.p``

const PlotX = styled.p``

const TrailerCopyX = styled( CopyX )`
	text-align: center;
	text-transform: uppercase;

	span {
		position: relative;

		&:before {
			right: 100%;
			margin-right: 15px;
		}

		&:after {
			left: 100%;
			margin-left: 15px;
		}

		&:before,
		&:after {
			content: "";
			position: absolute;
			height: 5px;
			border-bottom: 1px solid black;
			border-top: 1px solid black;
			top: 5px;
			width: 150px;
		}
	}
`

const TrailerX = styled.div`
	position: fixed;
	z-index: 30;
	bottom: 0;
	width: 500px;
	height: ${props => props.height}px;

	iframe {
		margin-bottom: -4px;
	}
`

const BulletsX = styled.div`
	position: absolute;
	z-index: 3;
	top: 0;
	left: 0;
	padding: 1rem;
	opacity: 0.5;
	transition: opacity .2s ease-in;

	&:hover {
		opacity: 0.95;
	}
`

const MovieInfo = props => {

	const { data, height, isVisible } = props

	const [ currentRating, setCurrentRating ] = useState( 0 )
	const [ currentTrailer, setCurrentTrailer ] = useState( 0 )

	useEffect( () => {

		let timer

		if ( data.ratings && data.ratings.length > 1 ) {

			timer = setInterval( () => {

				setCurrentRating( ( currentRating + 1 ) % data.ratings.length )

			}, config.RATING_DELAY )

			return () => clearInterval( timer )

		}

	}, [ data, currentRating ] )

	return (
		<WrapperX isVisible={isVisible}>
			{data.title && (
				<PanelX>
					<BackdropX height={height}>
						<BackdropImgX src={data.backdrop} alt={`Backdrop for ${data.title}`}/>
						<BackdropMirrorX src={data.backdrop} alt=""/>
					</BackdropX>

					<InfoWrapperX>
						<InfoX height={height}>

							<TitleX>{data.title} {data.year && `(${data.year})`}</TitleX>

							{data.Genre && <CopyX>{data.Genre}</CopyX>}
							{data.runtime && <CopyX>{data.runtime} minutes</CopyX>}
							<IconButton icon={<WatchIcon size={24}/>} handleChange={() => openFile( data.filepath )}>Watch</IconButton>
							{data.imdbId && <IconButton icon={<ImdbIcon size={24}/>} handleChange={() => openUrl( `http://www.imdb.com/title/${data.imdbId}` )}>{strings.movie.imdbLink}</IconButton>}

							<Ratings current={currentRating} data={data.ratings}/>

							<PlotX>{data.plot}</PlotX>

							{data.Language && <CopyX><b>Language:</b> {data.Language}</CopyX> }
							{data.Rated && <CopyX><b>Rated:</b> {data.Rated}</CopyX> }

							{data.Director && <CopyX><b>{strings.movie.director}:</b> {data.Director}</CopyX> }
							{data.Actors && <CopyX><b>{strings.movie.actor}:</b> {data.Actors}</CopyX> }
							{data.trailers && <TrailerCopyX><span>{strings.movie.trailer}</span></TrailerCopyX> }
						</InfoX>
					</InfoWrapperX>

					{data.trailers && (
						<TrailerX height={height}>
							{data.trailers.length > 1 && (
								<BulletsX>
									{data.trailers.map( ( trailer, i ) => {

										return <BulletX key={trailer} as={Button} active={currentTrailer === i} data="" handleChange={() => setCurrentTrailer( i )}/>

									} )}
								</BulletsX>
							)}
							<iframe allowFullScreen width="500" height="281" frameBorder="0" src={`https://www.youtube-nocookie.com/embed/${data.trailers[currentTrailer]}?rel=0&showinfo=0`}/>
						</TrailerX>
					)}
				</PanelX>
			)}
		</WrapperX>
	)

}

MovieInfo.propTypes = {
	data: PropTypes.object,
	height: PropTypes.number,
	isVisible: PropTypes.bool
}

MovieInfo.defaultProps = {
	data: {},
	height: 280
}

export default MovieInfo
