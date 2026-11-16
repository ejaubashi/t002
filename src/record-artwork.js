import {scoreSVG} from './living-artworks.js';
export const records=[
 {name:'AFTER HOURS',copy:'GOOD<br><em>NOISE</em>',speed:6,rhythm:1.6,movement:'ribbon'},
 {name:'SOFT SIGNAL',copy:'soft<br>signal.<br><em>STAY AWHILE.</em>',speed:3,rhythm:.65,movement:'rosette'},
 {name:'ELECTRIC FEEL',copy:'ELECTRIC<br>FEEL.<br><em>PLAY IT AGAIN.</em>',speed:9,rhythm:2.3,movement:'signal'},
];
export function recordArtwork(track){return scoreSVG(track);}
