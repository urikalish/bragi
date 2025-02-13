import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box/Box';
import { UnderConstruction } from '../../components/UnderConstruction';

export const HomePage = React.memo(() => {
	const useStyles = makeStyles(() => ({
		root: {
			position: 'relative',
			height: '100%',
			userSelect: 'none',
		},
	}));
	const classes = useStyles();

	return (
		<Box id="HomePage" className={classes.root}>
			<UnderConstruction />
		</Box>
	);
});
