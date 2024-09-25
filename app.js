import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Create a Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('aircraftCanvas') });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a Cannon.js world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Set gravity

// Create an aircraft model (box) in Three.js
const aircraftGeometry = new THREE.BoxGeometry(1, 0.2, 0.4);
const aircraftMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const aircraft = new THREE.Mesh(aircraftGeometry, aircraftMaterial);
scene.add(aircraft);

// Create a physics body for the aircraft
const aircraftBody = new CANNON.Body({
  mass: 1, // Set mass
  position: new CANNON.Vec3(0, 5, 0), // Initial position
});
aircraftBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 0.2))); // Shape matching the Three.js model
world.addBody(aircraftBody);

// Create a terrain (plane) in Three.js
const terrainGeometry = new THREE.PlaneGeometry(10, 10, 32, 32);
const terrainMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
terrain.position.y = 0; // Position the terrain
scene.add(terrain);

// Create a physics body for the terrain
const terrainBody = new CANNON.Body({ mass: 0 });
terrainBody.addShape(new CANNON.Plane());
world.addBody(terrainBody);

// Create characters (colored cubes) in Three.js
const createCharacter = (x, z, color) => {
  const characterGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
  const characterMaterial = new THREE.MeshBasicMaterial({ color });
  const character = new THREE.Mesh(characterGeometry, characterMaterial);
  character.position.set(x, 0.5, z);
  scene.add(character);

  // Create a physics body for the character
  const characterBody = new CANNON.Body({ mass: 1 });
  characterBody.addShape(new CANNON.Box(new CANNON.Vec3(0.15, 0.5, 0.15)));
  characterBody.position.set(x, 1, z);
  world.addBody(characterBody);
};

// Create two characters
createCharacter(2, 2, 0xff0000); // Red character
createCharacter(-2, -2, 0x0000ff); // Blue character

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);

  // Step the physics world
  world.step(1 / 60);

  // Update Three.js mesh positions based on Cannon.js bodies
  aircraft.position.copy(aircraftBody.position);
  aircraft.quaternion.copy(aircraftBody.quaternion);

  // Update characters' positions
  scene.children.forEach(child => {
    if (child instanceof THREE.Mesh && child.geometry.type === 'BoxGeometry') {
      const body = world.bodies.find(b => b.position.equals(child.position));
      if (body) {
        child.position.copy(body.position);
        child.quaternion.copy(body.quaternion);
      }
    }
  });

  renderer.render(scene, camera);
};

// Camera position
camera.position.z = 5;
camera.position.y = 2;
camera.lookAt(0, 0, 0);

// Start the animation loop
animate();

// Simple Chatbot Logic
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Function to add messages to the chat window
function addMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${text}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
}

// Event listener for send button
sendButton.addEventListener('click', () => {
  const userText = userInput.value;
  if (userText) {
    addMessage('You', userText);
    userInput.value = '';
    getBotResponse(userText);
  }
});

// Function to get bot response
function getBotResponse(input) {
  let response = "I'm not sure how to respond to that.";

  // Basic responses
  if (input.toLowerCase().includes('aircraft')) {
    response = "Aircraft are vehicles that can fly. What would you like to know?";
  } else if (input.toLowerCase().includes('wings')) {
    response = "The wings of an aircraft provide lift. Different wing types affect flight characteristics.";
  } else if (input.toLowerCase().includes('game')) {
    response = "This is an interactive aircraft game. You can change wing types and see their effects!";
  }

  // Add the bot's response
  addMessage('Bot', response);
}
