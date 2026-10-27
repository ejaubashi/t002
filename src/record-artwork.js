// Figma studies translated to editable inline vectors and one record data model.
export const records = [
  { name: 'AFTER HOURS', copy: 'FEEL<br>THE<br><em>FREQUENCY.</em>', speed: 48, rhythm: 1.6, movement: 'ribbon' },
  { name: 'SOFT SIGNAL', copy: 'soft<br>signal.<br><em>STAY AWHILE.</em>', speed: 24, rhythm: .65, movement: 'rosette' },
  { name: 'ELECTRIC FEEL', copy: 'ELECTRIC<br>FEEL.<br><em>PLAY IT AGAIN.</em>', speed: 66, rhythm: 2.3, movement: 'signal' },
];
export function recordArtwork(track) {
  let shapes = '';
  if (track === 0) {
    for (let i = 0; i < 12; i++) shapes += `<path d="M-30 ${60+i*17} C100 ${-50+i*22},240 ${390-i*12},510 ${60+i*17}"/>`;
  } else if (track === 1) {
    for (let i = 0; i < 10; i++) shapes += `<ellipse cx="240" cy="170" rx="45" ry="140" transform="rotate(${i*18} 240 170)"/>`;
  } else {
    for (let i = 0; i < 9; i++) shapes += `<path d="M${30+i*20} 330 200 ${-30+i*15} 290 ${270-i*12} 470 ${30+i*30}"/>`;
  }
  return `<svg viewBox="0 0 480 340" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><g class="cover-${records[track].movement}">${shapes}</g></svg>`;
}
