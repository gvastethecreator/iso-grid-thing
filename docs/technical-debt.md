# Technical Debt

## Release decisions

- Choose a license before public distribution. No license was added because this is an owner decision.
- Complete a human visual review of the production build on the supported desktop and mobile sizes.

## Measurement

- Capture a repeatable DevTools performance trace with many image and video assets under sustained dragging. The automated suite already covers the maximum 128 x 128 grid, but it does not replace a trace of media-heavy interaction.
