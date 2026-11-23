const board = document.getElementById(ˋgame—board´);
const scoredisplay = document.getElementById(ˋscore´);
const timedisplay = document.getElementById(ˋtime´);
const startbtn = document.getElementById(ˋstart—btn´); 


let score = 0;
let timeLeft = 30;
let gameActive = false;

let countdownTimer = null;
let spawnTimer = null;

const bugImages = [

];