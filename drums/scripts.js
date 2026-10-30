
/******************/
/* EVENT HANDLING */
/******************/
let play = document.querySelector("#play");
let playing = document.querySelector("#playing");

play.addEventListener("click", async () => {
    //hide the button
    play.style = "display: none";
    //show the message
    playing.style = "display: block";

    //Instantiate Tone.js
    await Tone.start();

    console.log('AudioContext is running!');

    // Your audio code goes here (e.g., synth.triggerAttackRelease())
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease("C4", "8n");
});
