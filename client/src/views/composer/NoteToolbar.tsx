import React, { useCallback, useEffect, useMemo, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Button, IconButton, Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { NoteModel, ScoreModel } from '../../model/scoreModel';
import { Score } from '../../model/score';
import { SelectionContextContainer } from '../../hooks/useSelectionContext';
import { MusicalHelper } from '../../services/musicalHelper';
import { SoundHelper } from '../../services/soundHelper';
import { Measure } from '../../model/measure';

export interface NoteToolbarProps {
	score: ScoreModel | null;
	onUpdateScore: () => void;
}

export const NoteToolbar = ({ score, onUpdateScore }: NoteToolbarProps) => {
	const useStyles = makeStyles(() => ({
		root: {
			display: 'grid',
			gridTemplate: 'auto auto auto / 1fr',
			gap: '24px 0',
			borderRadius: 16,
			backgroundColor: '#444',
			padding: 24,
			opacity: 0.9,
			//width: 827,
		},
		panel: {
			display: 'inline-flex',
			alignItems: 'center',
			height: 32,
			borderRadius: 16,
			backgroundColor: '#333',
			padding: '0 12px 0 4px',
			marginLeft: 16,
			'&:first-of-type': {
				marginLeft: 0,
			},
		},
		panelText: {
			marginLeft: 4,
			color: '#999',
			transition: 'all 0.2s ease-in-out',
			'&.clickable': {
				marginLeft: 2,
			},
			'&.clickable:not(.disabled)': {
				cursor: 'pointer',
			},
			'&.clickable:not(.disabled):hover': {
				color: '#fff',
			},
			'&.disabled': {
				color: '#666',
				pointerEvents: 'none',
			},
		},
		actionButton: {
			width: 24,
			height: 24,
			textAlign: 'center',
			cursor: 'pointer',
			transition: 'all 0.2s ease-in-out',
			color: '#ccc',
			'&:hover': {
				color: '#fff',
			},
			'&.disabled': {
				pointerEvents: 'none',
				color: '#666',
			},
		},
		noteDurationButton: {
			borderRadius: 24,
		},
	}));
	const classes = useStyles();

	const { selection } = SelectionContextContainer.useContainer();
	const [canChangeDuration, setCanChangeDuration] = useState<any>({
		6: false,
		12: false,
		18: false,
		24: false,
		36: false,
		48: false,
		72: false,
		96: false,
	});
	const [canPitchDown, setCanPitchDown] = useState(false);
	const [canPitchUp, setCanPitchUp] = useState(false);
	const [canOctaveDown, setCanOctaveDown] = useState(false);
	const [canOctaveUp, setCanOctaveUp] = useState(false);
	const [canDelete, setCanDelete] = useState(false);

	const noteDurationOptions = useMemo(
		() => [
			{ durationDivs: 6, label: '1/16' },
			{ durationDivs: 12, label: '1/8' },
			{ durationDivs: 18, label: '3/16' },
			{ durationDivs: 24, label: '1/4' },
			{ durationDivs: 36, label: '3/8' },
			{ durationDivs: 48, label: '1/2' },
			{ durationDivs: 72, label: '3/4' },
			{ durationDivs: 96, label: '1' },
		],
		[],
	);

	useEffect(() => {
		setCanPitchDown(false);
		setCanPitchUp(false);
		setCanOctaveDown(false);
		setCanOctaveUp(false);
		setCanDelete(false);
		if (!score || !selection || selection.items.length === 0) {
			return;
		}
		let measure;
		let note;
		let noteDetails;

		let noteDurationsOK: any = {};
		noteDurationOptions.forEach((o) => {
			noteDurationsOK[o.durationDivs] = selection.items.every((item) => {
				measure = item.measureId && Score.findMeasure(score, item.measureId);
				if (!measure) return false;
				return Measure.canChangeNoteDuration(measure, item.voiceId, item.noteId, o.durationDivs);
			});
		});
		setCanChangeDuration(noteDurationsOK);
		setCanPitchDown(
			selection.items.every((item) => {
				note = item.noteId && Score.findNote(score, item.noteId);
				if (!note || note.isRest) {
					return false;
				}
				noteDetails = MusicalHelper.parseNote(note.fullName);
				return !(noteDetails.step === 'C' && !noteDetails.alter && noteDetails.octave === MusicalHelper.minOctave);
			}),
		);
		setCanPitchUp(
			selection.items.every((item) => {
				note = item.noteId && Score.findNote(score, item.noteId);
				if (!note || note.isRest) {
					return false;
				}
				noteDetails = MusicalHelper.parseNote(note.fullName);
				return !(noteDetails.step === 'B' && !noteDetails.alter && noteDetails.octave === MusicalHelper.maxOctave);
			}),
		);
		setCanOctaveDown(
			selection.items.every((item) => {
				note = item.noteId && Score.findNote(score, item.noteId);
				if (!note || note.isRest) {
					return false;
				}
				noteDetails = MusicalHelper.parseNote(note.fullName);
				return noteDetails.octave !== MusicalHelper.minOctave;
			}),
		);
		setCanOctaveUp(
			selection.items.every((item) => {
				note = item.noteId && Score.findNote(score, item.noteId);
				if (!note || note.isRest) {
					return false;
				}
				noteDetails = MusicalHelper.parseNote(note.fullName);
				return noteDetails.octave !== MusicalHelper.maxOctave;
			}),
		);
		setCanDelete(
			selection.items.every((item) => {
				note = item.noteId && Score.findNote(score, item.noteId);
				return note && !note.isRest;
			}),
		);
	}, [selection, score, noteDurationOptions]);

	const getSelectedNonRestNotes = useCallback(() => {
		if (!score || !selection) {
			return [];
		}
		const notes: NoteModel[] = [];
		selection.items.forEach((item) => {
			const note = Score.findNote(score, item.noteId);
			if (note && !note.isRest) {
				notes.push(note);
			}
		});
		return notes;
	}, [score, selection]);

	const handleClickDelete = useCallback(() => {
		const notes: NoteModel[] = getSelectedNonRestNotes();
		if (notes.length) {
			notes.forEach((note) => {
				note.fullName = '';
				note.isRest = true;
			});
			onUpdateScore();
		}
	}, [getSelectedNonRestNotes, onUpdateScore]);

	const handleChangePitch = useCallback(
		(event) => {
			const notes: NoteModel[] = getSelectedNonRestNotes();
			if (notes.length) {
				notes.forEach((note) => {
					if (!score) {
						return;
					}
					const measure = Score.findMeasure(score, note.measureId);
					if (!measure) {
						return;
					}
					if (event.currentTarget.dataset.amount === 'octave') {
						const noteDetails = MusicalHelper.parseNote(note.fullName);
						note.fullName = `${noteDetails.step}${noteDetails.alter}${
							event.currentTarget.dataset.direction === 'up' ? noteDetails.octave + 1 : noteDetails.octave - 1
						}`;
					} else {
						note.fullName = MusicalHelper.changePitch(note.fullName, measure.musicalScale, event.currentTarget.dataset.direction === 'up');
					}
					SoundHelper.playShortNote(note.fullName);
				});
				onUpdateScore();
			}
		},
		[getSelectedNonRestNotes, score, onUpdateScore],
	);

	const handleClickNoteDuration = useCallback(() => {}, []);

	return (
		<Box id="NoteToolbar" className={classes.root}>
			<Box>
				<Box className={classes.panel}>
					{noteDurationOptions.map((o, i) => (
						<Button
							key={i}
							onClick={handleClickNoteDuration}
							disabled={!canChangeDuration[o.durationDivs]}
							className={`${classes.actionButton} ${classes.noteDurationButton} ${canChangeDuration[o.durationDivs] ? '' : 'disabled'}`}
						>
							{o.label}
						</Button>
					))}
				</Box>
			</Box>
			<Box>
				<Box className={classes.panel}>
					<IconButton onClick={handleChangePitch} data-direction="down" data-amount="semitone" className={`${classes.actionButton}`} disabled={!canPitchDown}>
						<ArrowDownwardIcon titleAccess="Pitch Down" />
					</IconButton>
					<IconButton onClick={handleChangePitch} data-direction="up" data-amount="semitone" className={`${classes.actionButton}`} disabled={!canPitchUp}>
						<ArrowUpwardIcon titleAccess="Pitch Up" />
					</IconButton>
					<Typography variant="body1" className={`${classes.panelText} ${canPitchUp || canPitchDown ? '' : 'disabled'}`}>
						Semitone
					</Typography>
				</Box>
				<Box className={classes.panel}>
					<IconButton onClick={handleChangePitch} data-direction="down" data-amount="octave" className={`${classes.actionButton}`} disabled={!canOctaveDown}>
						<ArrowDownwardIcon titleAccess="Octave Down" />
					</IconButton>
					<IconButton onClick={handleChangePitch} data-direction="up" data-amount="octave" className={`${classes.actionButton}`} disabled={!canOctaveUp}>
						<ArrowUpwardIcon titleAccess="Octave Up" />
					</IconButton>
					<Typography variant="body1" className={`${classes.panelText} ${canPitchUp || canPitchDown ? '' : 'disabled'}`}>
						Octave
					</Typography>
				</Box>
			</Box>
			<Box>
				<Box className={classes.panel}>
					<IconButton onClick={handleClickDelete} className={`${classes.actionButton}`} disabled={!canDelete}>
						<DeleteForeverIcon titleAccess="Delete" />
					</IconButton>
					<Typography onClick={handleClickDelete} variant="body1" className={`${classes.panelText} clickable ${canDelete ? '' : 'disabled'}`}>
						Delete
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};
