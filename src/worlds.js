import {tensionSVG,reliefSVG,driftSVG,scoreSVG} from './living-artworks.js';

export const worlds=[
 {brand:'ORBIT® / AUDIOVISUAL EXPERIMENT',lines:['ORBIT',''],artline:'Sound<br>takes shape.',caption:'001 — TENSION. A line becomes a space.',hint:'MOVE TO DEFORM THE FIELD',chapter:'One line.\nNo fixed form.',text:'An open field of lime threads folds through space. Change the signal, pull the surface or send a pulse through it. Nothing is solid; everything responds.'},
 {brand:'FORM & FIELD / MATERIAL STUDIES',lines:['Quiet','by nature.'],caption:'002 — INTERVAL. A single fold, endless points of view.',hint:'DRAG TO TURN THE ARTWORK',chapter:'Matter.\nAnd the space between.',text:'One continuous paper relief, shaped around an empty interval. Change its pigment, turn it under the light and move closer to the surface.'},
 {brand:'OFFGRID / OUTDOOR JOURNEYS',lines:['somewhere,','slower.'],caption:'003 — DRIFT. The shape of a slower moment.',hint:'MOVE THE LIGHT. LET IT DRIFT.',chapter:'A horizon\nwithout a boundary.',text:'Suspended topographic lines trace an imagined place. Shift the light from dawn to night and let the drawing open as the story unfolds.'},
 {brand:'GOOD NOISE / INDEPENDENT CULTURE',lines:['GOOD','NOISE'],caption:'004 — RESONANCE. Three scores for the eye.',hint:'TURN THE MARK. REVERSE THE ARTWORK.',chapter:'A different score.\nA different point of view.',text:'Three original graphic scores, each with its own rhythm and movement. Turn the mark, reverse the artwork and find your composition. Sound is always optional.'},
];
export function worldArtwork(index){
 if(index===0)return '<div class="tension-fallback">'+tensionSVG()+'</div>';
 if(index===1)return '<div class="form-aperture" aria-hidden="true"></div><div class="relief-fallback"><div class="relief-paper">'+reliefSVG('gallery-relief')+'</div></div>';
 if(index===2)return '<div class="world-drift">'+driftSVG()+'</div>';
 return '<div class="world-score">'+scoreSVG(0)+'</div>';
}
