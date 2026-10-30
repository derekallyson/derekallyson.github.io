/***************/
/* INSTRUMENTS */
/***************/
function mkDrums(){

    //create the reverb (room size effect) we want to use.
    let reverb = new Tone.Reverb({
        decay: 1,
        wet: 0.3
    }).toDestination();

    //create the filter for use with the hihats it only lets notes in the 
    //frequency of 15000 Hz pass through.  Also add the reverb to the end of this 
    let hiHatFilter = new Tone.Filter(15000, "bandpass").connect(reverb);

    //create the hiHats
    let hiHat = new Tone.NoiseSynth({
        envelope: {
            attack: 0.001, decay: 0.1, sustain: 0, release:0
        },
        volume: -6
    }).connect(hiHatFilter);

    //let's build a class off the snare and put it inside this function.
    class Snare {
        constructor() {
            //first we need to filter out the noise we and only let the frequency of 5000 come through in a the bandpass.
            this.noiseFilter = new Tone.Filter(5000, "bandpass").connect(reverb);
            //set up the snare string part of the drum
            this.noiseSynth = new Tone.NoiseSynth({
                envelope: {
                    attack: 0.001, decay: 0.1, sustain:0, release:0 
                }, 
                volume: -12
            }).connect(this.noiseFilter);

            //set up the head of the snare drum
            this.synth = new Tone.Synth({
                envelope: {
                    attack: 0.0001, decay: 0.1, sustain: 0, release: 0
                },
                oscillator: {type: "sine"},
                volume: -12
            }).connect(reverb);
        }
        
        //this method will get called to play the drumes once created
        triggerAttackRelease(duration, when){
            this.noiseSynth.triggerAttackRelease(duration, when);
            this.synth.triggerAttackRelease("G3", duration, when);
        }
    }

    //finally create the snare drum object
    let snare = new Snare();

    //create the kick drum object
    let kick = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 4,
        volume: -18
    }).connect(reverb);

    return {hiHat, snare, kick};
}

//instantiate the drums and get back an object that contains a hihat, snare and kick drum
let drums = mkDrums();


//instantiate the bass
let lowBass = new Tone.FMSynth({
    oscillator: {type: "triangle"},
    envelope: {attack: 0.0001, decay: 0.5, sustain: 0.3, release: 0.1},
    volume: -3
}).toDestination();

let highBass = new Tone.FMSynth({
    oscillator: {type: "square"},
    envelope: {attack: 0.0001, decay: 0.1, sustain: 0.3, release: 0.1},
    volume: -9
}).toDestination();

//instantiate the chords
let chordSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {type: "triangle"},
    volume: -12
}).toDestination();

//instantiate the horns
let sampler = new Tone.Sampler({
    urls: {
        "C5": "trumpet-c5.mp3",
        "D5": "trumpet-d5.mp3",
        "F5": "trumpet-f5.mp3"
    },
    baseUrl: "https://skilldrick-jscc.s3.us-west-2.amazonaws.com/",
    attack: 0,
    release: 1,
    volume: -24
}).toDestination();


/**************/
/* SEQUENCING */
/**************/

//Converts a string to an array of notes or nulls
//Dots in the string become nulls in the array and are silent
function mkSequence(pattern){
    return pattern.split("").map(value => {
        if(value == "."){
            return null;
        }
        else{
            return value;
        }
    });
}

//Converts a string to an array of notes or nulls
//Spaces between pips in the string become nulls in the array and are silent.
function mkPipeSequence(pattern){
    return pattern.split("|").map(value => {
        if(value.trim() == ""){
            return null;
        }
        else{
            return value;
        }
    });
}

//here is the pattern we are going to follow for the drums
let drumPattern = {
    kick: "x...x...",
    snare: "..x...x.",
    hiHat: "xxxxxxxx"
};
      
//set up the hiHat sequence we are going to use
let hiHatSequence = new Tone.Sequence(time => {
    drums.hiHat.triggerAttackRelease("16n", time);
}, mkSequence(drumPattern.hiHat), "8n");

//set up the snare sequence we are going to use
let snareSequence = new Tone.Sequence(time => {
    drums.snare.triggerAttackRelease("16n", time);
}, mkSequence(drumPattern.snare), "8n");

//set up the kick sequence we are going to use
let kickSequence = new Tone.Sequence(time => {
    drums.kick.triggerAttackRelease("E1", "16n", time)
}, mkSequence(drumPattern.kick), "8n");

//set up the low bass sequence we are going to use
let lowBaseSequence = new Tone.Sequence((time, note) => {
    lowBass.triggerAttackRelease(note, "16n", time, 0.6);
}, mkPipeSequence("G2| | |G2|G2| | | "), "8n");

//set up the high bass sequence we are going to use
let highBaseSequence = new Tone.Sequence((time, note) => {
    highBass.triggerAttackRelease(note, "16n", time, 0.3);
}, mkPipeSequence("G3|F3|E3|D3|G2|D3|G3|D3"), "8n");

//bass chords
let chords = {
    1: ["D4", "G4"],
    2: ["E4", "G4"],
    3: ["C4", "E4", "G4"],
    4: ["B3", "F4", "G4"]
};

function playChord(time, chordname){
    let notes = chords[chordname];
    chordSynth.triggerAttackRelease(notes, "16n", time, 0.6);
}

let chordSequence1 = new Tone.Sequence((time, chordname) => {
    playChord(time, chordname);
}, mkSequence("1...2...3..4...31...2...3..4.343"), "8n")

let chordSequence2 = new Tone.Sequence((time, chordname) => {
    playChord(time, chordname);
}, mkSequence("3...2...4..1.213"), "8n")


let trumpetPart = new Tone.Part((time, note) => {
    sampler.triggerAttackRelease(note, "1n", time);
}, [
    ["0:0:0", "G5"],
    ["0:2:0", "C5"],
    ["1:0:0", "G5"],

    ["2:0:0", "D5"],
    ["2:2:0", "C5"],
    ["3:0:0", "B4"],

    ["4:0:0", "G5"],
    ["4:2:0", "C5"],
    ["5:0:0", "G5"],

    ["6:0:0", "D5"],
    ["6:2:0", "C5"],
    ["7:0:0", "B4"],
    ["7:2:0", "D5"],

    ["8:0:0", "C5"],
    ["8:2:0", "E5"],
    ["9:0:0", "F5"],
    ["9:2:0", "D5"],

    ["10:0:0", "C5"],
    ["10:2:0", "E5"],
    ["11:0:0", "D5"],

    ["12:0:0", "C5"],
    ["12:2:0", "E5"],
    ["13:0:0", "F5"],
    ["13:2:0", "D5"],

    ["14:0:0", "C5"],
    ["14:2:0", "E5"],
    ["15:0:0", ["B4", "G5"]],
]);

/********/
/* SONG */
/********/
//drums
hiHatSequence.start("0:0:0").stop("44:0:0");
snareSequence.start("0:0:0").stop("44:0:0");
kickSequence.start("0:0:0").stop("44:0:0");
//bass
lowBaseSequence.start("0:0:0").stop("47:3:0");
highBaseSequence.start("4:0:0").stop("47:3:0");
//chords
chordSequence1.start("8:0:0").stop("24:3:0");
chordSequence2.start("24:0:0").stop("32:3:0");
chordSequence1.start("32:0:0").stop("40:3:0");
//trumpet
trumpetPart.start("16:0:0");


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

    //this will let us modify where we start the playback of our song
    //Tone.Transport.position defaults to "0:0:0" but we'll leave this
    //here for debugging purpose so we can point to different sections of the song
    Tone.Transport.position = "46:0:0";

    //Tone.Transport.bpm.value = 110;

    //Start playing the song!
    Tone.Transport.start();
});
