const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let score = 0;
let combo = 0;
let level = 1;
let difficulty = 1;

let gameStarted = false;
let gameOver = false;

let rageMessages = [
"Skill issue detected.",
"The pipes are laughing.",
"Bird.exe stopped working.",
"You flew directly into danger.",
"Even the enemy is confused."
];

let gameOverMessage = "";

let bird = {
x:120,
y:250,
size:20,
speed:4
};

let enemy = {
x:700,
y:100,
size:28,
speed:1.5
};

let pipes = [];
let coins = [];
let clouds = [];
let portals = [];

let shield = false;
let magnet = false;
let confusion = false;
let speedBoost = false;

let keys = {};

let weather = "clear";

document.addEventListener("keydown", e=>{
keys[e.code] = true;
});

document.addEventListener("keyup", e=>{
keys[e.code] = false;
});

function startGame(){
document.getElementById("menu").style.display="none";
difficulty = parseFloat(document.getElementById("difficulty").value);
gameStarted = true;
}

function showInstructions(){
let el = document.getElementById("instructions");
el.style.display = el.style.display==="none" ? "block" : "none";
}

function createPipe(){
pipes.push({
x:Math.random()*700+150,
y:Math.random()*400+50,
width:40,
height:90
});
}

for(let i=0;i<5;i++){
createPipe();
}

function createCoin(){
coins.push({
x:Math.random()*800+50,
y:Math.random()*400+50,
size:10
});
}

setInterval(createCoin,4000);

function createPortal(){
portals = [
{x:120,y:100},
{x:780,y:380}
];
}

setInterval(createPortal,15000);

function createCloud(){
clouds.push({
x:Math.random()*900,
y:Math.random()*150,
speed:0.3
});
}

for(let i=0;i<6;i++){
createCloud();
}

function randomWeather(){
let types=["clear","rain","wind"];
weather = types[Math.floor(Math.random()*types.length)];
}

setInterval(randomWeather,20000);

function update(){

if(!gameStarted || gameOver) return;

let moveSpeed = speedBoost ? 7 : bird.speed;

let up="ArrowUp";
let down="ArrowDown";
let left="ArrowLeft";
let right="ArrowRight";

if(confusion){
up="ArrowDown";
down="ArrowUp";
left="ArrowRight";
right="ArrowLeft";
}

if(keys[up]) bird.y -= moveSpeed;
if(keys[down]) bird.y += moveSpeed;
if(keys[left]) bird.x -= moveSpeed;
if(keys[right]) bird.x += moveSpeed;

if(keys["ShiftLeft"]){
bird.x += moveSpeed*2;
}

bird.x = Math.max(0,Math.min(canvas.width,bird.x));
bird.y = Math.max(0,Math.min(canvas.height,bird.y));

pipes.forEach(pipe=>{

let dx = pipe.x - bird.x;
let dy = pipe.y - bird.y;

let d = Math.sqrt(dx*dx + dy*dy);

pipe.x += (dx/d) * (1.5*difficulty);
pipe.y += (dy/d) * (1.5*difficulty);

if(
bird.x < pipe.x + pipe.width &&
bird.x > pipe.x &&
bird.y < pipe.y + pipe.height &&
bird.y > pipe.y
){

score++;
combo++;

if(combo>=3){
score += 5;
combo = 0;
}

document.getElementById("score").innerText = score;
document.getElementById("combo").innerText = combo;

pipe.x = Math.random()*700+150;
pipe.y = Math.random()*400+50;

}

});

coins.forEach((coin,i)=>{

let dx = coin.x - bird.x;
let dy = coin.y - bird.y;

let d = Math.sqrt(dx*dx + dy*dy);

if(magnet){
coin.x -= dx*0.05;
coin.y -= dy*0.05;
}

if(d < 20){

score += 5;

let p = Math.random();

if(p<0.25){
shield = true;
setTimeout(()=>shield=false,5000);
}
else if(p<0.5){
speedBoost = true;
setTimeout(()=>speedBoost=false,5000);
}
else if(p<0.75){
magnet = true;
setTimeout(()=>magnet=false,5000);
}
else{
confusion = true;
setTimeout(()=>confusion=false,4000);
}

coins.splice(i,1);

}

});

portals.forEach(port=>{

let dx = bird.x - port.x;
let dy = bird.y - port.y;

if(Math.sqrt(dx*dx+dy*dy) < 20){

let other = portals.find(p=>p!==port);

bird.x = other.x;
bird.y = other.y;

}

});

let dx = bird.x - enemy.x;
let dy = bird.y - enemy.y;

let d = Math.sqrt(dx*dx + dy*dy);

enemy.x += (dx/d) * (enemy.speed + level*0.3);
enemy.y += (dy/d) * (enemy.speed + level*0.3);

if(d < enemy.size && !shield){

gameOver = true;

gameOverMessage = rageMessages[
Math.floor(Math.random()*rageMessages.length)
];

}

}

function drawClouds(){

clouds.forEach(c=>{

ctx.globalAlpha = 0.6;
ctx.fillStyle="white";

ctx.beginPath();
ctx.arc(c.x,c.y,20,0,Math.PI*2);
ctx.arc(c.x+20,c.y-10,25,0,Math.PI*2);
ctx.arc(c.x+45,c.y,20,0,Math.PI*2);
ctx.arc(c.x+20,c.y+10,18,0,Math.PI*2);
ctx.fill();

ctx.globalAlpha = 1;

c.x += c.speed;

if(c.x > canvas.width){
c.x = -50;
}

});

}

function drawBird(){

ctx.fillStyle = speedBoost ? "orange" : "yellow";

ctx.beginPath();
ctx.arc(bird.x,bird.y,bird.size,0,Math.PI*2);
ctx.fill();

}

function drawEnemy(){

ctx.fillStyle="red";

ctx.beginPath();
ctx.arc(enemy.x,enemy.y,enemy.size,0,Math.PI*2);
ctx.fill();

}

function drawPipes(){

pipes.forEach(pipe=>{

ctx.fillStyle="#2ecc71";
ctx.fillRect(pipe.x,pipe.y,pipe.width,pipe.height);

ctx.fillStyle="#27ae60";
ctx.fillRect(pipe.x-5,pipe.y-10,pipe.width+10,10);

});

}

function drawCoins(){

coins.forEach(c=>{

ctx.fillStyle="gold";

ctx.beginPath();
ctx.arc(c.x,c.y,c.size,0,Math.PI*2);
ctx.fill();

});

}

function drawPortals(){

portals.forEach(p=>{

ctx.strokeStyle="purple";
ctx.lineWidth=4;

ctx.beginPath();
ctx.arc(p.x,p.y,20,0,Math.PI*2);
ctx.stroke();

});

}

function drawWeather(){

if(weather==="rain"){

for(let i=0;i<50;i++){
ctx.fillRect(Math.random()*900,Math.random()*500,2,8);
}

}

if(weather==="wind"){
bird.x += Math.sin(Date.now()/300)*1.5;
}

}

function drawGameOver(){

ctx.fillStyle="rgba(0,0,0,0.7)";
ctx.fillRect(0,0,900,500);

ctx.fillStyle="white";
ctx.font="40px Arial";
ctx.textAlign="center";

ctx.fillText("GAME OVER",450,220);

ctx.font="20px Arial";

ctx.fillText(gameOverMessage,450,260);

ctx.fillText("Refresh page to play again",450,300);

}

function draw(){

ctx.clearRect(0,0,900,500);

drawClouds();
drawPipes();
drawCoins();
drawPortals();
drawBird();
drawEnemy();
drawWeather();

if(gameOver){
drawGameOver();
}

}

function loop(){

update();
draw();

requestAnimationFrame(loop);

}

loop();