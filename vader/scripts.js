// create connection points to the elements in the dom so we can trigger the sounds
// tone.js can not play sounds unless there is a user interaction causing it to do so
//so we add a play button that starts everything off when the user presses it.
let play = document.querySelector("#play");
let playing = document.querySelector("#playing");



function makeSingleSound(){
    // Start the Tone JS Library so we can use it's classes
    Tone.start();

    /*
    create a new Synthesizer and tell it the type of waveform we want to use
    then allow it to play an array of notes in the 4 different waveforms
    Waveforms:
    Sine: Only the fundamental frequency passed to it (Ex: 200Hz)
    Square: The fundamental frequency plus every other harmonic frequncy F: 200Hz, H:600Hz, 1000Hz, 1400Hz.....
    Triangle: The fundamental frequency plus every other harmonic frequncy F: 200Hz, H:600Hz, 1000Hz, 1400Hz.....However the amplitude decreases more rapidly as the harmonics increase  
    Sawtooth: The fundamental frequency plus all harmonic frequncies F: 200Hz, H: 400Hz, 600Hz, 800Hz, 1000Hz, 1200Hz.....
    Note: no matter how many harmonics a note has we still perceive the fundamental as the note's pitch, the others simply "color" the sound.
    */
    let waveforms = ["sine","triangle","square","sawtooth"];
    let notes = ["A3", "B3", "C#4", "D4", "E4", "F#4", "G#4", "A4"];
    //imperial march
    //let notes = ["A4", "A4", "A4", "F4", "C5", "A4", "F4", "C5", "A4"];
    let multiplier = 0;
    
    /*
    play the notes with each of the different waveforns
    this loop rips straight through and the notes will all get added to a 
    queue where they are then played at the time specified 
    in the triggerAttackRelease function.  Basically we are setting this 
    to play the notes one second apart.  I wanted to ouput to the screen
    which waveform you are currentyl hearing but I have not figured out 
    how to do that yet since these all get called asynchronously. 
    */
    for(x = 0; x < waveforms.length; x++){     
        //play each note in the current waveform
        for(y = 0; y < notes.length; y++){           
            //this allows us to correctly make the time 1 second from the last note 
            //based on the number of notes that we have added to the array
            if(x != 0){
                multiplier = (x * notes.length);
            }

            let synth = new Tone.Synth({
            oscillator: {type: waveforms[x]},
            envelope: {attack: 0.1, decay: 0.3, sustain: 0.8, release: 0.1},
            volume: -12
            }).toDestination();

            synth.triggerAttackRelease(notes[y], 0.9, multiplier+y);
        }
    }
}

//Using the Poly Synthesizer so we can play multiple notes at once.  
//My understanding is that it really just creates a bunch of single synths 
//And runs them all at the same time. 
function playMultipleNotes(){
    Tone.start();

    let synth = new Tone.PolySynth(
        Tone.Synth,
        {
            oscillator: "square",
            envelope: {attack: 01, decay: 0.3, sustain: 0.8, release: 0.1},
            volume: -12
        }
    ).toDestination();

    //We're able to pass an array of notes to this function as well as just a single note.
    synth.triggerAttackRelease(["A3", "C#4"], 0.9, 0);
    synth.triggerAttackRelease(["B3", "D4"], 0.9, 1);
    synth.triggerAttackRelease(["C#4", "E4"], 0.9, 2);
    synth.triggerAttackRelease(["D4", "F#4"], 0.9, 3);
    synth.triggerAttackRelease(["E4", "G#4"], 0.9, 4);
    synth.triggerAttackRelease(["F#4", "A4"], 0.9, 5);
    synth.triggerAttackRelease(["G#4", "B4"], 0.9, 6);
    synth.triggerAttackRelease(["E4", "A4", "C#5"], 1.9, 7);
}

//This will show a simple loop using a transport.  The timing for a transport looks like this "0:0:0" (bars:quarters:sixteeths) notation. (Everything is zero indexed)
//Broken down to me "current bar number : current beat within that bar : current 16th note within that beat"
//Remember Quarter notes (4 beats in a bar), Eighth notes (8 beats in a bar), 16th notes (16 beats in a bar) 
//Example: "6:3:2" is the third sixteenth note of the fourth beat of the seventh bar. (Zero based indexing) 
//Tone JS defaults to 120 BPM (Beats per minute) so a beat every 0.5 seconds.
function transportLoop(){

    Tone.start();
    
    //we are not passing in an oscillator, evnelope or volume so we will get the defaults
    let synth = new Tone.Synth().toDestination();

    //the loop function take two args, a function that will do something with the time passed to it, and how often that function should be called
    //4n is the same as 1/4 note or a quarter note.(8n = Eighth Notes, 16n = Sixteenth Notes....)
    let loop = new Tone.Loop(time => {
        synth.triggerAttackRelease("C4", "16n", time);
        //notice time is (0.5 seconds (since BPM is defaulted to 120), but not dead on. 
        console.log(`Time: ${time} Seconds, \nLoop Position: ${Tone.Transport.position}`);
    }, "4n");

    //looks like we call the loop for 4 bars starting immediately
    //this allows us to be 16th note granular on where we start and where we finish
    //(bars:quarters:sixteeths)
    loop.start("0:0:0");
    loop.stop("4:0:0");

    // ^^^^^^^^^^^
    //if you want "tighter" code you can chain the start and stop methods to the end of the Loop method then you won't need to create a variable
    //Ex. Tone.Loop(callback function(),"how often to call back").start("0:0:0").stop("4:0:0");
    //I'll leave it exploded for the sake of learning, going forward I'll use the shorthand.

    //this is how we can set the Beats Per Minute if we want to (default is 120 bpm)
    //Tone.Transport.bpm.value = 60;

    Tone.Transport.start();
}


function transportPentatonic(){
    Tone.start()
    /*
    we are going to try and play multiple notes at once so we'll use a PolySynth
    remember the first argument to the PolySynth method is a "single synth" 
    we'll use the "default" envelope but pass in an oscillator type and the desired volume 
    */
    let synth = new Tone.Synth(
        {
            oscillator: {type: "triangle"},
            volume: -9
        }
    ).toDestination();

    //the petatonic scale + one octive 
    let notes = ["C4", "D4", "E4", "G4", "A4", "C5"];
    let counter = 0;
    /*
    give us 8 bars of 8th notes randomly picking a note from our "notes" array
    notice the count output, because we are using eighth notes that's "faster" than the quarter notes picked up by the 
    middle Loop position so you see things like:
    Loop Position: 0:0:0
    Loop Position: 0:0:2
    Loop Position: 0:1:0
    Loop Position: 0:1:2
    Ending at...
    Loop Position: 7:3:2 (because the next iteration would be 8:0:0 which it won't include)
    It's usgin the sixteenth notes section to keep track (remember there is 2 16th notes in an 8th note).
    That's how the loop is getting called.
    */
    new Tone.Loop(time => {   
   
        //50/50 shot of if we play that note or not (this adds random rests into the solo)
        if(Math.random() < 0.5){
            // randomly pick a note from the array
            let note = notes[Math.floor(Math.random() * notes.length)];
            console.log(`Note:${note} Played`);
            //play that note for 1/32 at the specified time
            synth.triggerAttackRelease(note, "32n", time);
        }
        else{
            //output that we rested and didn't play a note
            console.log(`Rest`);
        }
        //this is just our info blcok to make sure things look and work like we "understand" them too.
        console.log(`Time: ${time} Seconds, \nLoop Position: ${Tone.Transport.position} Count: ${++counter}`);
    }, "8n").start("0:0:0").stop("8:0:0");

    //Kick of the Transport
    Tone.Transport.start();
}


function transportSequence(){

    Tone.start();

    //use the defaults
    let synth = new Tone.Synth().toDestination();

    /* 
    We are going to play all the notes in the array that we pass to this function for 4 bars as 8th notes and 
    we'll repeat going through the array when we hit the end, also the "nulls" are essentially "rests" meaning
    no note get's played there.  This is helpful for long runs of non-varying timimg. 
    */
    new Tone.Sequence((time,note) => {
        synth.triggerAttackRelease(note, "16n", time);
    }, ["C4", null, "B3", "C4", "G3", "A3", null, "B3"], "8n")
       .start("0:0:0")
       .stop("4:0:0");
    

    /* Imperial March */
    /*
    new Tone.Sequence((time,note) => {
        synth.triggerAttackRelease(note, "8n", time);
    }, ["A4", null, "A4", null, "A4", null, "F4", "C5", "A4", null, "F4", "C5", "A4", null], "4n").start("0:0:0").stop("3:1:0");
    */

    Tone.Transport.start();
}

function transportPart(){
    Tone.start();
    
    //use the defaults (maybe vader it up after????)
    let synth = new Tone.Synth({
        oscillator: {type:"sine"},
        volume: 3
    }).toDestination();

    /*
    here we are passing an arrar of notes that will get called at a specitif time which we are also passing in
    if we want to ues a polySynth would could pass this structure instead
    ["0:0:0", ["A2","C2","D3"]]
    */
    new Tone.Part((time, note) => {
        synth.triggerAttackRelease(note,"16n",time);
    }, [
        ["0:0:0", "A2"],
        ["0:1:2", "A2"],
        ["0:3:0", "A2"],
        ["1:0:2", "F2"],
        ["1:1:2", "C3"],
        ["1:2:0", "A2"],
        ["1:3:2", "F2"],
        ["2:0:2", "C3"],
        ["2:1:0", "A2"]
    ]).start("0:0:0");

    //this is how we can set the Beats Per Minute if we want to (default is 120 bpm)
    Tone.Transport.bpm.value = 110;
    Tone.Transport.start();
}

//the event listener for clicking on the play button
play.addEventListener("click", () =>{
    //hide the button
    play.style = "display: none";
    playing.style = " ";

    /*
    As we add different functions to go through the examples we'll call them from here
    so we can easily comment them out once we move onto the next example so we don't need to
    keeep commenting out bigh chunks of code
    */
    
    //makeSingleSound();
    //playMultipleNotes();

    //now we are going to start building songs so we will use transports to do so
    //the following function calls will invoke a transport inside the function.
    
    //a basic loop that playes one pitch 4x in each of the 4 bars
    //transportLoop();

    //let use the transport loop to play a random note from the pentatonic scale
    //and build a makeshift solo randomly in the code :-)
    //transportPentatonic();

    //now we are going to try and just play a sequence of notes using the Transport Sequence function
    //it's just a list of notes to be played a a regular interval
    //transportSequence();

    //next we'll play a sequence at more specified intervals
    //transportPart();
    let darthMFVader =  transportPart;
    darthMFVader();
});

/* Each function below is an example from chapter 12 - Generating Sounds */
