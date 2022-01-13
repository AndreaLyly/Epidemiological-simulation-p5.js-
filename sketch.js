


// List of blocks
let blocks = [];

// Arrays of states
let S = []; // Susceptible
let I = []; // Infected
let R = []; // Recovered
let D = []; // Dead
let t = []; // time vector
let temp = 0;

// Parameters
let n = 400; // Number of blocks
let p = 0.9; // Probability of infection
let pd = 0.01; // Probability of death
let speed = 5; // speed
let speed_inf = 5; // speed infected
let duration = 5;  //floor(random() * (7 - 5) + 5); // unif(10,15)

// is simulation started?
let simu_start = false;

// Is the simulation ended?
let is_ended = false;


// Setup 
function setup() {
    // Create the canvas and position it
    var cnv = createCanvas(windowWidth/2, windowHeight/1.5);  
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - 0.7*height) / 2;
    cnv.position(x, y);
    cnv.parent("myChart");
    background(220);
    textAlign(CENTER);
    textSize(30);
    text("Press to start", width/2, height/2);
    

    // Create n numeber of blocks
    for (let j = 0; j < n; j++) {
        blocks.push(new Block());
    }

    //text4 = createElement('h6', 'Speed:');
    //text4.position(50, 250);
    //input4 = createSlider(1, 10,5);  //createInput(5);
    //input4.position(50, 280);

    //text5 = createElement('h6', 'Speed (on infection):');
    //text5.position(50, 320);
    //input5 = createSlider(0, 10, 4); //createInput(3);
    //input5.position(50, 350);

    //text6 = createElement('h6', 'Duration of infection:');
    //text6.position(50, 390);
    //input6 = createSlider(1, 10, 4); //createInput(5);
    //input6.position(50, 420);

    //var button = createButton("Reset simulation");
    //button.position(50, 190)
    //button.mousePressed(resetSimulation);

    //var start_button = createButton("Start simulation");
    //start_button.position(50, 150)
    //start_button.mousePressed(startSimulation);
}

// Click at beginning to start
function mouseClicked() {
    if (simu_start == false) {
        startSimulation();
    } 
}

// Initialize the simulation
function startSimulation() {
    speed =  speed //int(input4.value());
    speed_inf = speed_inf //int(input5.value());
    duration = duration //int(input6.value());
    simu_start = true;
}

// Reset the simulation NOT WORKING YET AS THERE IS NO BUTTON
function resetSimulation() {
    if (is_ended == true) {
        location.reload();
    } else {
        is_ended = false;
        speed = speed //int(input4.value());
        speed_inf = speed_inf //int(input5.value());
        duration = duration //int(input6.value());
        blocks = [];
        t = [];
        S = [];
        I = [];
        R = [];
        D = [];
        temp = 0;
        for (let j = 0; j < n; j++) {
            blocks.push(new Block());
        }
    }
}

// Draw the simulation
function draw() {
    if (simu_start == true) {
    // When epidemy is over, draw the plots of SIR
    if (blocks.filter(x => x.health_status == 1).length == 0 && is_ended == true) {
        clear();
        const data = {
            labels: t,
            datasets: [{
                label: 'Susceptible',
                borderColor: 'blue',
                data: S,
            },
            {
                label: 'Infected',
                borderColor: 'red',
                data: I,
            },
            {
                label: 'Recovered',
                borderColor: 'green',
                data: R,
            }]
        };
        const config = {
          type: 'line',
          data: data,
          options: {

          }
        };
        var ctx = document.getElementById("testing");
        myChart = new Chart(ctx, config);
    }
    else {
        // Set the background color
        stroke('black');
        strokeWeight(1);
        background(220);

        // Initialize first infection
        blocks[0].health_status = 1;
        blocks[0].timer();
        blocks[0].change_color_label();

        // Start loop
        for (let i = 0; i < blocks.length; i++){
            blocks[i].move(); // move block
            blocks[i].display(); // display block
            blocks[i].timer(); // check the infection timer
            blocks[i].change_color_label(); // change color according to health

            // Check contacts with other blocks
            for (let j = 0; j < blocks.length; j++) {
                // If the (x_i,y_i) and (x_j,y_j) distance is close enough, and block j is infected
                // then infecton to block i occurs with probability p
                if (abs(blocks[i].x - blocks[j].x) < 10 && abs(blocks[i].y - blocks[j].y) < 10 
                && blocks[j].health_status == 1 && blocks[i].health_status == 0 && 
                random() <= p) {
                    blocks[i].health_status = 1; // INFECTED
                    blocks[i].change_color_label(); // change color label
                }
            }
        }
        // Update the SIRD and t arrays
        if (frameCount % 30 == 0) {
            S.push(n - blocks.filter(x => x.health_status != 0).length);
            I.push(n - blocks.filter(x => x.health_status != 1).length);
            R.push(n - blocks.filter(x => x.health_status != 2).length);
            D.push(blocks.filter(x => x.health_status != 3).length);
            temp ++;
            t.push(temp);
        }
        if (blocks.filter(x => x.health_status == 1).length == 0) {
            is_ended = true;
        }
    }
    }
}

class Block {
    constructor(){
        this.w = width/50; // block width, old 15
        this.h = this.w; // block height
        this.x = random(width - this.w); // x-location
        this.y = random(height - this.h); // y-location
        this.max_s = speed; // max speed 
        this.min_s = -speed; // min speed
        this.color_label = 'white'; // color for susceptible blocks
        this.health_status = 0; // susceptible health status
        this.infection_time = duration;
    } 
    timer(){
        if (this.health_status == 1) {
            if (frameCount % 60 == 0 && this.infection_time > 0) {
                this.infection_time --;
            } 
            if (this.infection_time == 0) {
                this.health_status = 2; // recovered
            }
        }
    }
    change_color_label(){
        if (this.health_status == 1) { // infected
            this.color_label = 'red'
            this.max_s = speed_inf;
            this.min_s = -speed_inf;
        } else if (this.health_status == 2) { // recovered
            this.color_label = 'green'
            this.max_s = speed;
            this.min_s = -speed;
        } else if (this.health_status == 3) { // dead
            this.color_label = 'black'
        } else { // susceptible
            this.color_label = 'white'
        }
    }
    move(){
        // Move randomly in x-direction
        this.x += random() * (this.max_s - this.min_s) + this.min_s;
        if (this.x >= width - this.w) {
            this.x = width - this.w;
        } else if (this.x <= 0) {
            this.x = 0;
        } 
        // Move randomly in y-direction
        this.y += random() * (this.max_s - this.min_s) + this.min_s;
        if (this.y >= height - this.h) {
            this.y = height - this.h;
        } else if (this.y <= 0) {
            this.y = 0;
        }
    }
    display(){
        // Fill the block with desidered color
        fill(this.color_label);
        // Draw a rectangle
        rect(this.x, this.y, this.w, this.h);
    }
}


  