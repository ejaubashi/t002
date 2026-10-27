// Quiet, original synthesized chords. Created only after an explicit sound gesture.
export function createRecordAudio() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) throw new Error('Audio is unavailable');
  const context = new Audio();
  const bus = context.createGain();bus.gain.value=0;bus.connect(context.destination);
  const oscillators=[0,1,2].map((_,i)=>{const node=context.createOscillator();node.type=i===0?'sine':'triangle';const gain=context.createGain();gain.gain.value=i===0?.45:.16;node.connect(gain);gain.connect(bus);node.start();return node;});
  let disposed=false, request=0;
  return {
    setTrack(track){const chords=[[146.83,220,293.66],[130.81,196,261.63],[164.81,246.94,329.63]];oscillators.forEach((node,i)=>node.frequency.setTargetAtTime(chords[track][i],context.currentTime,.25));},
    async setEnabled(enabled){
      if(disposed)return;
      const current=++request;
      if(enabled)await context.resume();
      if(disposed||current!==request)return;
      bus.gain.cancelScheduledValues(context.currentTime);
      bus.gain.setTargetAtTime(enabled?.055:0,context.currentTime,enabled?.12:.03);
    },
    dispose(){if(disposed)return;disposed=true;oscillators.forEach(node=>node.stop());context.close().catch(()=>{});},
  };
}
