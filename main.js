// Create a 3D scene to hold all objects
const scene = new THREE.Scene()
// Set up a camera to view the scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

// Create a renderer to display the 3D scene
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )// Set the size of the canvas
document.body.appendChild( renderer.domElement )// Add the canvas to the webpage

// Add basic light to the scene (ambient light for even lighting)
const light = new THREE.AmbientLight( 0xffffff )
scene.add( light )

// Add a directional light (creates shadows)
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.castShadow = true
scene.add( directionalLight )
directionalLight.position.set( 0, 1, 1 )// Position the light

// Move the camera back to see the scene
camera.position.z = 5
// Set the background color
renderer.setClearColor( 0xB7C3F3, 1 )


// Load the doll model
const loader = new THREE.GLTFLoader()
let doll

// Define game starting and ending positions
const start_position = 6
const end_position = -start_position

// Access UI elements on the page
const text = document.querySelector('.text')
const startBtn = document.querySelector('.start-btn')

// Variables to track players' status
let DEAD_PLAYERS = 0
let SAFE_PLAYERS = 0



//musics
const bgMusic = new Audio('./Music/music_bg.mp3')
bgMusic.loop = true
const winMusic = new Audio('./Music/music_win.mp3')
const loseMusic = new Audio('./Music/music_lose.mp3')

// Load the doll model and add it to the scene
loader.load( '../model/scene.gltf', function ( gltf ){
    scene.add( gltf.scene )
    doll = gltf.scene
    gltf.scene.position.set(0,-1, 0)  // Position the doll
    gltf.scene.scale.set(0.4, 0.4, 0.4) // Scale down the doll
    startBtn.innerText = "start" // Update button text
})

// Function to make the doll look forward
function lookBackward(){
    gsap.to(doll.rotation, {duration: .45, y: -3.15})
    setTimeout(() => dallFacingBack = true, 150)
}
// Function to make the doll look forward
function lookForward(){
    gsap.to(doll.rotation, {duration: .45, y: 0})
    setTimeout(() => dallFacingBack = false, 450)
}

// Function to create cubes for the runway and other objects
function createCube(size, posX, rotY = 0, color = 0x00FF00){  // Default color set to green
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d ) // Cube shape
    const material = new THREE.MeshBasicMaterial( { color } ) // Cube color
    const cube = new THREE.Mesh( geometry, material ) // Combine shape and color
    cube.position.set(posX, 0, 0) // Position the cube
    cube.rotation.y = rotY // Rotate the cube if needed
    scene.add( cube )  // Add the cube to the scene
    return cube // Return the cube for later use
}


// Create the runway (the path players run on)
createCube({w: start_position * 2 + .21, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1
createCube({w: .2, h: 1.5, d: 1}, start_position, -.4)
createCube({w: .2, h: 1.5, d: 1}, end_position, .4)

// Player class to represent each player
class Player {
    constructor(name = "Player", radius = .25, posY = 0, color = 0xffffff){
        // Create a sphere to represent the player
        const geometry = new THREE.SphereGeometry( radius, 100, 100 )
        const material = new THREE.MeshBasicMaterial( { color } )
        const player = new THREE.Mesh( geometry, material )
        scene.add( player )
         // Set initial position
        player.position.x = start_position - .4
        player.position.z = 1
        player.position.y = posY
        this.player = player
        // Player information (position, speed, etc.)
        this.playerInfo = {
            positionX: start_position - .4, // Start position
            velocity: 0, // Player speed
            name, // Player name
            isDead: false  // Is the player out?
        }
        
    }
    // Make the player move
    run(){
        if(this.playerInfo.isDead) return
        this.playerInfo.velocity = .03
    }
    // Stop the player
    stop(){
        gsap.to(this.playerInfo, { duration: .1, velocity: 0 })
    }   
    // Check if the player broke the rules or is safe
    check(){
        if(this.playerInfo.isDead) return
         // If the doll is looking forward and the player moves, they lose
        if(!dallFacingBack && this.playerInfo.velocity > 0){
            text.innerText = this.playerInfo.name + " lost!!!"
            this.playerInfo.isDead = true
            this.stop()
            DEAD_PLAYERS++
            loseMusic.play()
        // If the player reaches the end position or not, they are safe nor not;
        if(DEAD_PLAYERS == players.length){
                text.innerText = "Everyone lost!!!"
                gameStat = "ended"
            }
        if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
        if(this.playerInfo.positionX < end_position + .7){
            text.innerText = this.playerInfo.name + " is safe!!!"
            this.playerInfo.isDead = true
            this.stop()
            SAFE_PLAYERS++
            winMusic.play()
            if(SAFE_PLAYERS == players.length){
                text.innerText = "Everyone is safe!!!"
                gameStat = "ended"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
    }
     // Update the player's position and check their status
    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }
}

async function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}
// Create two players
const player1 = new Player("Player 1", .25, .3, 0x02bdb8)  
const player2 = new Player("Player 2", .25, -.3, 0x02bdb8)  
// List of players and their controls
const players = [
    {
        player: player1,
        key: "ArrowUp",
        name: "Player 1"
    },
    {
        player: player2,
        key: "w",
        name: "Player 2"
    }
]
// Function to start the game countdown
const TIME_LIMIT = 15
async function init(){
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    lookBackward()
    await delay(500)
    text.innerText = "Gooo!!!"
    bgMusic.play()
    start()
}

let gameStat = "loading" // initial state of the game
// Function to start the game
function start(){
    gameStat = "started"// Update the game status to "started"
    const progressBar = createCube({w: 8, h: .1, d: 1}, 0, 0, 0xFF0000)  // Position the progress bar above the game area
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {duration: TIME_LIMIT, x: 0, ease: "none"}) // Animate the progress bar to shrink over the TIME_LIMIT duration

    // End the game if time runs out and it hasn't already ended
    setTimeout(() => {
        if(gameStat != "ended"){
            text.innerText = "Time Out!!!"
            loseMusic.play()
            gameStat = "ended"
        }
    }, TIME_LIMIT * 1000)
    startDall() // Start the doll's movement logic
}
 // Tracks whether the doll is facing backward
let dallFacingBack = true

// Function to handle the doll's Timing 
async function startDall(){
   lookBackward()
   await delay((Math.random() * 1500) + 1500)
   lookForward()
   await delay((Math.random() * 750) + 750)
   startDall()
}

// Event listener for the Start button
startBtn.addEventListener('click', () => {
    if(startBtn.innerText == "START"){
        init()
        document.querySelector('.modal').style.display = "none"
    }
})
// Function to animate the game
function animate(){
    renderer.render( scene, camera )
    players.map(player => player.player.update())
    if(gameStat == "ended") return
    requestAnimationFrame( animate )
}
animate()
// Handle key release events (when a player stops running)
window.addEventListener( "keydown", function(e){
    if(gameStat != "started") return
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.run()
    }
})
window.addEventListener( "keyup", function(e){
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.stop()
    }
})
// Adjust the camera and renderer on window resize
window.addEventListener( 'resize', onWindowResize, false )
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}