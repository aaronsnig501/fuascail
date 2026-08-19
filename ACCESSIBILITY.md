# Accessibility Notes

Fuascail is designed to be playable with a keyboard:

- Every interactive control is a native button.
- Numbered cipher cells can be selected with Tab and activated with Enter or Space.
- After selecting a numbered cell, guesses can be made with the on-screen keyboard or a physical keyboard.
- Focus states are intentionally visible.
- Motion is reduced when the user has `prefers-reduced-motion: reduce` enabled.

## Screen Reader Limitations

The puzzle format has an inherent screen-reader limitation: much of the challenge depends on visually scanning repeated numbered cells, their positions inside words, and the pattern of repeated numbers across the phrase. ARIA labels expose each cell's number, selected state, and solved state, but they cannot make that visual pattern as efficient to perceive as it is by sight.

The app should remain operable with a screen reader, but solving the puzzle may be slower and more cognitively demanding than the visual experience. The revealed answer and provenance note are announced as a result dialog when the puzzle ends.
