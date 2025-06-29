// hero section graphic
window.addEventListener('load', () => {
    let parentContainer = document.querySelector("#graphic-container");
    let height = parentContainer.offsetHeight;
    let width = parentContainer.offsetWidth;

    parentContainer.insertAdjacentHTML("beforeend", `<canvas height="${height}" width="${width}"></canvas>`);

    const container = document.querySelector("#graphic-container canvas");
    const context = container.getContext("2d");
    let rect = container.getBoundingClientRect();

    let radius = 1; // particle size
    let particleRadius = 100 // radius for defining "closeness"

    const randomValueExclude = (min, max, except) => { // returns a random value between two values excluding a list of values
        let value = Math.floor(Math.random() * (max - min + 1) + min);

        if (0 < except.length) {
            while (except.includes(value)) {
                value = Math.floor(Math.random() * (max - min + 1) + min);
            }
        }
        
        return value;
    }

    const randomFloatValue = (min, max, limit) => { // returns a random float above a lower limit
        let value;

        do {
            value = Math.random() * (max - min + 1) + min;
        } while (Math.abs(value) < limit); // keep running loop if random value is under limit
        
        return value;
    }

    // creates a random color value excluding one primary color
    const getColorValues = (exclude) => {
        let colorArray = []

        for (let i = 1; i < 4; i++) {
            if (i == exclude) {
                colorArray.push(0); // push zero so that rgb value will be null
            } else {
                colorArray.push(randomValueExclude(100, 255, []));
            }
        }

        return colorArray;
    }

    // group of particles
    class Particles {
        constructor(amount) {
            this.collection = [];
            this.amount = amount;

            this.createCollection();
        }

        createCollection() { // creates a set of randomly placed particles with mostly random colors
            let exclude = randomValueExclude(1, 3, []);
            for (let i = 0; i < this.amount; i++) {
                let colorArray = getColorValues(exclude);
                let coord_x = randomValueExclude(rect.x + radius, container.offsetWidth - radius, []);
                let coord_y = randomValueExclude(rect.y + radius, container.offsetHeight - radius, []);
                this.collection.push(new Particle(coord_x , coord_y, `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`));
            }
        }

        find_closest() { // gets all particles within a certain radius of a particular particle
            this.collection.forEach(particle => {
                let closest_particles = [];

                this.collection.forEach(particle_in_array => {
                    if (particle != particle_in_array) {
                        let z = Math.hypot(particle.x - particle_in_array.x, particle.y - particle_in_array.y);

                        if (z < particleRadius) {
                            closest_particles.push({particle: particle_in_array, distance: z}); // the distance is kept track of to vary line width
                        }
                    }
                });

                particle.closest = closest_particles;
            });
        }

        animate() {
            this.collection.forEach(particle => {
                particle.move();
                particle.drawLineToClosest();
            });
            this.find_closest(); // update each particles closeness array
        }
    }

    // particle object that moves on the screen
    class Particle {
        constructor(x, y, color) {
            Object.assign(this, { x, y, color})

            this.dx = randomFloatValue(-1, 1, 0.01); // x movement
            this.dy = randomFloatValue(-1, 1, 0.01); // y movement
            this.closest = [];
        }

        move() {
            this.x = this.x + this.dx;
            this.y = this.y + this.dy;
            
            if (this.x < rect.x + radius) { // if the particle is moving past the left edge
                this.dx = -this.dx;
            } else if (container.offsetWidth - radius < this.x) { // if the particle is moving past the right edge
                this.dx = -this.dx;
            }
            if (this.y < rect.y + radius) { // if the particle is moving past the top edge
                this.dy = -this.dy;
            } else if (container.offsetHeight - radius < this.y) { // if the particle is moving past the bottom edge
                this.dy = -this.dy;
            }

            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.x, this.y, radius, 0, 2 * Math.PI);
            context.fill()
        }

        drawLineToClosest() { // draws a line between a particle and all particles within a certain radius to it
            this.closest.forEach(element => {
                context.beginPath();
                context.moveTo(this.x, this.y);
                context.lineTo(element.particle.x, element.particle.y);
                context.strokeStyle = this.color;
                context.lineWidth = (particleRadius - element.distance)/particleRadius; // distance relates to line width
                context.stroke();
            });
        }
    }
    
    const advance = () => {
        context.clearRect(0, 0, container.width, container.height); // clear canvas
        particles.animate(); // move particles and create connections
        requestAnimationFrame(advance);
    }
    
    const particles = new Particles(300);
    advance();
})

// button that scrols user back to start of page
document.querySelector("#scroll-up").addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});
