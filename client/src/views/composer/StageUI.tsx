import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import { ScoreModel } from '../../model/scoreModel';
import { SettingsContextContainer } from '../../hooks/useSettingsContext';
import { PartUI } from './PartUI';
import { AppDataHelper } from '../../services/appDataHelper';

export interface StageUIProps {
	score: ScoreModel | null;
}

export const StageUI = ({ score }: StageUIProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'relative',
			//width: '21cm',
			//height: '29.7cm',
			height: '100%',
			textAlign: 'center',
			//backgroundColor: '#eee',
			backgroundColor: '#fff',
			//backgroundImage: 'linear-gradient(135deg, #fff 47.06%, #ccc 47.06%, #ccc 50%, #fff 50%, #fff 97.06%, #ccc 97.06%, #ccc 100%)',
			//backgroundSize: '24px 24px',
			padding: '2.54cm 1.32cm 3.67cm 1.9cm',
			//opacity: 0.9,
			overflow: 'auto',
			'@media print': {
				padding: '0 !important',
				opacity: 1,
				overflow: 'visible',
			},
		},
		content: {
			maxHeight: '27.7cm',
			overflow: 'hidden',
			backgroundColor: '#fff',
			color: '#000',
		},
		header: {
			paddingBottom: 32,
		},
		scoreTitle: {
			display: 'flex',
			justifyContent: 'center',
			color: '#000',
		},
		scoreCredits: {
			display: 'flex',
			justifyContent: 'center',
			color: '#666',
		},
		arrangedBy: {
			display: 'flex',
			justifyContent: 'center',
			color: '#999',
		},
		partContainer: {
			display: 'flex',
			justifyContent: 'center',
		},
	}));
	const classes = useStyles();

	const { pageWidth, stageWidth } = SettingsContextContainer.useContainer();

	return (
		<>
			{score && (
				<Box id="StageUI" className={`${classes.root} no-scrollbar`} style={{ width: `${pageWidth}px`, padding: `${(pageWidth - stageWidth) / 2}px` }}>
					<Box className={classes.content} style={{ width: `${stageWidth}px` }}>
						<Box className={classes.header}>
							<Typography variant="h4" className={classes.scoreTitle}>
								{score.scoreInfo.scoreTitle}
							</Typography>
							<Typography variant="h6" className={classes.scoreCredits}>
								{score.scoreInfo.scoreCredits}
							</Typography>
						</Box>
						{score.parts.map((part, i) => (
							<Box key={i} className={classes.partContainer}>
								<PartUI part={part} />
							</Box>
						))}
						{score.scoreInfo.arrangerName && (
							<Typography variant="body2" className={classes.arrangedBy}>{`Arranged by ${score.scoreInfo.arrangerName} using ${AppDataHelper.appName}`}</Typography>
						)}
						{!score.scoreInfo.arrangerName && (
							<Typography variant="body2" className={classes.arrangedBy}>
								{AppDataHelper.appName}
							</Typography>
						)}
					</Box>
				</Box>
			)}
		</>
	);
};
