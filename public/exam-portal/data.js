// =====================================================
// BITSAT 2018 (Memory Based) — Structured Question Data
// Parsed from PaddleOCR layout analysis output
// =====================================================

const QUESTIONS = [
  // ======================== PHYSICS ========================
  {
    id: 1,
    subject: "Physics",
    text: "Four point charges $-Q$, $-q$, $2q$ and $2Q$ are placed, one at each corner of the square. The relation between Q and q for which the potential at the centre of the square is zero is:",
    options: [
      { label: "a", text: "$Q = -q$" },
      { label: "b", text: "$Q = -\\dfrac{1}{q}$" },
      { label: "c", text: "$Q = q$" },
      { label: "d", text: "$Q = \\dfrac{1}{q}$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 2,
    subject: "Physics",
    text: "Two long parallel wires carry equal current $i$ flowing in the same direction are at a distance $2d$ apart. The magnetic field $B$ at a point lying on the perpendicular line joining the wires and at a distance $x$ from the midpoint is:",
    options: [
      { label: "a", text: "$\\dfrac{\\mu_{0}id}{\\pi\\left(d^{2}+x^{2}\\right)}$" },
      { label: "b", text: "$\\dfrac{\\mu_{0}ix}{\\pi\\left(d^{2}-x^{2}\\right)}$" },
      { label: "c", text: "$\\dfrac{\\mu_{0}ix}{d^{2}+x^{2}}$" },
      { label: "d", text: "$\\dfrac{\\mu_{0}id}{d^{2}+x^{2}}$" }
    ],
    image: null,
    displayFormula: true
  },
  {
    id: 3,
    subject: "Physics",
    text: "In the circuit shown, the symbols have their usual meanings. The cell has emf $E$. $X$ is initially joined to $Y$ for a long time. Then, $X$ is joined to $Z$. The maximum charge on $C$ at any later time will be:",
    options: [
      { label: "a", text: "$\\dfrac{E}{R\\sqrt{LC}}$" },
      { label: "b", text: "$\\dfrac{ER}{2\\sqrt{LC}}$" },
      { label: "c", text: "$\\dfrac{E\\sqrt{LC}}{2R}$" },
      { label: "d", text: "$\\dfrac{E\\sqrt{LC}}{R}$" }
    ],
    image: "imgs/q3_circuit.jpg",
    displayFormula: true
  },
  {
    id: 4,
    subject: "Physics",
    text: "A point object $O$ is placed in front of a glass rod having spherical end of radius of curvature 30 cm. The image would be formed at:",
    options: [
      { label: "a", text: "30 cm to the left" },
      { label: "b", text: "Infinity" },
      { label: "c", text: "1 cm to the right" },
      { label: "d", text: "18 cm to the left" }
    ],
    image: "imgs/q4_glass_rod.jpg",
    displayFormula: false
  },
  {
    id: 5,
    subject: "Physics",
    text: "In Young's double slit experiment, $\\lambda = 500\\,\\text{nm}$, $d = 1\\,\\text{mm}$, $D = 1\\,\\text{m}$. Minimum distance from the central maximum for which intensity is half of the maximum intensity is:",
    options: [
      { label: "a", text: "$2.5 \\times 10^{-4}$ m" },
      { label: "b", text: "$1.25 \\times 10^{-4}$ m" },
      { label: "c", text: "$0.625 \\times 10^{-4}$ m" },
      { label: "d", text: "$0.3125 \\times 10^{-4}$ m" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 6,
    subject: "Physics",
    text: "What is the voltage gain in a common emitter amplifier, where input resistance is 3 Ω and load resistance 24 Ω, $\\beta = 0.6$?",
    options: [
      { label: "a", text: "8.4" },
      { label: "b", text: "4.8" },
      { label: "c", text: "2.4" },
      { label: "d", text: "480" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 7,
    subject: "Physics",
    text: "The acceleration due to gravity on the surface of the moon is $\\frac{1}{6}$ that on the surface of earth and the diameter of the moon is one-fourth that of earth. The ratio of escape velocities on earth and moon will be:",
    options: [
      { label: "a", text: "$\\dfrac{\\sqrt{6}}{2}$" },
      { label: "b", text: "$\\sqrt{24}$" },
      { label: "c", text: "$3$" },
      { label: "d", text: "$\\dfrac{\\sqrt{3}}{2}$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 8,
    subject: "Physics",
    text: "Given $\\vec{P} = 2\\hat{i} - 3\\hat{j} + 4\\hat{k}$ and $\\vec{Q} = \\hat{j} - 2\\hat{k}$. The magnitude of their resultant is:",
    options: [
      { label: "a", text: "$\\sqrt{3}$" },
      { label: "b", text: "$2\\sqrt{3}$" },
      { label: "c", text: "$3\\sqrt{3}$" },
      { label: "d", text: "$4\\sqrt{3}$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 9,
    subject: "Physics",
    text: "A particle of mass $m$ executes simple harmonic motion with amplitude $a$ and frequency $\\nu$. The average kinetic energy during its motion from the position of equilibrium to the end is:",
    options: [
      { label: "a", text: "$2\\pi^{2}ma^{2}\\nu^{2}$" },
      { label: "b", text: "$\\pi^{2}ma^{2}\\nu^{2}$" },
      { label: "c", text: "$\\dfrac{1}{4}ma^{2}\\nu^{2}$" },
      { label: "d", text: "$4\\pi^{2}ma^{2}\\nu^{2}$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 10,
    subject: "Physics",
    text: "The dipole moment of the given charge distribution is:",
    options: [
      { label: "a", text: "$-\\dfrac{4Rq}{\\pi}\\hat{i}$" },
      { label: "b", text: "$\\dfrac{4Rq}{\\pi}\\hat{i}$" },
      { label: "c", text: "$-\\dfrac{2Rq}{\\pi}\\hat{i}$" },
      { label: "d", text: "$\\dfrac{2Rq}{\\pi}\\hat{i}$" }
    ],
    image: "imgs/q10_dipole.jpg",
    displayFormula: true
  },
  {
    id: 11,
    subject: "Physics",
    text: "At a place, if the earth's horizontal and vertical components of magnetic fields are equal, then the angle of dip will be:",
    options: [
      { label: "a", text: "$30^{\\circ}$" },
      { label: "b", text: "$90^{\\circ}$" },
      { label: "c", text: "$45^{\\circ}$" },
      { label: "d", text: "$0^{\\circ}$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 12,
    subject: "Physics",
    text: "The third line of Balmer series of an ion equivalent to hydrogen atom has wavelength of 108.5 nm. The ground state energy of an electron of this ion will be:",
    options: [
      { label: "a", text: "3.4 eV" },
      { label: "b", text: "13.6 eV" },
      { label: "c", text: "54.4 eV" },
      { label: "d", text: "122.4 eV" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 13,
    subject: "Physics",
    text: "The binding energy per nucleon of ${}^{10}X$ is 9 MeV and that of ${}^{11}X$ is 7.5 MeV where $X$ represents an element. The minimum energy required to remove a neutron from ${}^{11}X$ is:",
    options: [
      { label: "a", text: "7.5 MeV" },
      { label: "b", text: "2.5 MeV" },
      { label: "c", text: "8 MeV" },
      { label: "d", text: "0.5 MeV" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 14,
    subject: "Physics",
    text: "If $C$, the velocity of light, $g$ the acceleration due to gravity and $P$ the atmospheric pressure be the fundamental quantities in MKS system, then the dimensions of length will be same as that of:",
    options: [
      { label: "a", text: "$\\dfrac{C}{g}$" },
      { label: "b", text: "$\\dfrac{C}{P}$" },
      { label: "c", text: "$PcG$" },
      { label: "d", text: "$\\dfrac{C^{2}}{g}$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 15,
    subject: "Physics",
    text: "Figure shows a capillary rise $H$. If the air is blown through the horizontal tube in the direction as shown then rise in capillary tube will be:",
    options: [
      { label: "a", text: "$= H$" },
      { label: "b", text: "$> H$" },
      { label: "c", text: "$< H$" },
      { label: "d", text: "Zero" }
    ],
    image: "imgs/q15_capillary.jpg",
    displayFormula: false
  },
  {
    id: 16,
    subject: "Physics",
    text: "A boy running on a horizontal road at 8 km/h finds the rain falling vertically. He increases his speed to 12 km/h and finds that the drops make $30°$ with the vertical. The speed of rain with respect to the road is:",
    options: [
      { label: "a", text: "$4\\sqrt{7}$ km/h" },
      { label: "b", text: "$9\\sqrt{7}$ km/h" },
      { label: "c", text: "$12\\sqrt{7}$ km/h" },
      { label: "d", text: "$15\\sqrt{7}$ km/h" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 17,
    subject: "Physics",
    text: "A hunter aims his gun and fires a bullet directly at a monkey on a tree. At the instant the bullet leaves the barrel of the gun, the monkey drops. Pick the correct statement regarding the situation.",
    options: [
      { label: "a", text: "The bullet will never hit the monkey" },
      { label: "b", text: "The bullet will always hit the monkey" },
      { label: "c", text: "The bullet may or may not hit the monkey" },
      { label: "d", text: "Can't be predicted" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 18,
    subject: "Physics",
    text: "A particle of mass $m_{1}$ moving with velocity $v$ collides with a mass $m_{2}$ at rest, then they get embedded. Just after collision, velocity of the system:",
    options: [
      { label: "a", text: "Increases" },
      { label: "b", text: "Decreases" },
      { label: "c", text: "Remains constant" },
      { label: "d", text: "Becomes zero" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 19,
    subject: "Physics",
    text: "The ratio of the specific heats of a gas is $\\dfrac{C_{p}}{C_{v}} = 1.66$, then the gas may be:",
    options: [
      { label: "a", text: "$\\text{CO}_2$" },
      { label: "b", text: "$\\text{He}$" },
      { label: "c", text: "$\\text{H}_2$" },
      { label: "d", text: "$\\text{NO}_2$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 20,
    subject: "Physics",
    text: "Two oscillators are started simultaneously in same phase. After 50 oscillations of one, they get out of phase by $\\pi$, that is half oscillation. The percentage difference of frequencies of the two oscillators is nearest to:",
    options: [
      { label: "a", text: "2%" },
      { label: "b", text: "1%" },
      { label: "c", text: "0.5%" },
      { label: "d", text: "0.25%" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 21,
    subject: "Physics",
    text: "A juggler keeps on moving four balls in the air throwing the balls after intervals. When one ball leaves his hand (speed $= 20\\;\\text{ms}^{-1}$) the position of other balls (height in m) will be (Take $g = 10\\;\\text{ms}^{-2}$):",
    options: [
      { label: "a", text: "10, 20, 10" },
      { label: "b", text: "15, 20, 15" },
      { label: "c", text: "5, 15, 20" },
      { label: "d", text: "5, 10, 20" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 22,
    subject: "Physics",
    text: "If a stone of mass 0.05 kg is thrown out a window of a train moving at a constant speed of 100 km/h then magnitude of the net force acting on the stone is:",
    options: [
      { label: "a", text: "0.5 N" },
      { label: "b", text: "Zero" },
      { label: "c", text: "50 N" },
      { label: "d", text: "5 N" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 23,
    subject: "Physics",
    text: "A body of mass $M$ hits normally a rigid wall with velocity $V$ and bounces back with the same velocity. The impulse experienced by the body is:",
    options: [
      { label: "a", text: "$MV$" },
      { label: "b", text: "$1.5\\,MV$" },
      { label: "c", text: "$2\\,MV$" },
      { label: "d", text: "Zero" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 24,
    subject: "Physics",
    text: "A hoop rolls down an inclined plane. The fraction of its total kinetic energy that is associated with rotational motion is:",
    options: [
      { label: "a", text: "$1 : 2$" },
      { label: "b", text: "$1 : 3$" },
      { label: "c", text: "$1 : 4$" },
      { label: "d", text: "$2 : 3$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 25,
    subject: "Physics",
    text: "Infinite number of masses, each 1 kg are placed along the x-axis at $x = \\pm 1\\,\\text{m},\\; \\pm 2\\,\\text{m},\\; \\pm 4\\,\\text{m},\\; \\pm 8\\,\\text{m},\\; \\pm 16\\,\\text{m}\\ldots$ The magnitude of the resultant gravitational potential in terms of gravitational constant $G$ at the origin $(x = 0)$ is:",
    options: [
      { label: "a", text: "$G/2$" },
      { label: "b", text: "$G$" },
      { label: "c", text: "$2G$" },
      { label: "d", text: "$4G$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 26,
    subject: "Physics",
    text: "Water of volume 2 litre in a container is heated with a coil of 1 kW at 27°C. The lid of the container is open and energy dissipates at rate of 160 J/s. In how much time temperature will rise from 27°C to 77°C? [Given specific heat of water is 4.2 kJ/kg]",
    options: [
      { label: "a", text: "8 min 20 s" },
      { label: "b", text: "6 min 2 s" },
      { label: "c", text: "7 min" },
      { label: "d", text: "14 min" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 27,
    subject: "Physics",
    text: "In the following P-V diagram of an ideal gas, two adiabates cut two isotherms at $T_{1} = 300\\,\\text{K}$ and $T_{2} = 200\\,\\text{K}$. The value of $V_{A} = 2$ unit, $V_{B} = 8$ unit, $V_{C} = 16$ unit. Find the value of $V_{D}$.",
    options: [
      { label: "a", text: "4 unit" },
      { label: "b", text: "< 4 unit" },
      { label: "c", text: "> 5 unit" },
      { label: "d", text: "5 unit" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 28,
    subject: "Physics",
    text: "The mass of H₂ molecule is $3.32 \\times 10^{-24}$ g. If $10^{23}$ hydrogen molecules per second strike $2\\;\\text{cm}^2$ of wall at an angle of $45°$ with the normal, while moving with a speed of $10^5\\;\\text{cm/s}$, the pressure exerted on the wall is nearly:",
    options: [
      { label: "a", text: "$1350\\;\\text{N/m}^2$" },
      { label: "b", text: "$2350\\;\\text{N/m}^2$" },
      { label: "c", text: "$3320\\;\\text{N/m}^2$" },
      { label: "d", text: "$1660\\;\\text{N/m}^2$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 29,
    subject: "Physics",
    text: "The wavelengths of two waves are 50 cm and 51 cm respectively. If the temperature of the room is 20°C then what will be the number of beats produced per second by these waves, when the speed of sound at 0°C is 332 m/s?",
    options: [
      { label: "a", text: "24" },
      { label: "b", text: "14" },
      { label: "c", text: "10" },
      { label: "d", text: "None of these" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 30,
    subject: "Physics",
    text: "The figure shows the interference pattern obtained in a double-slit experiment using light of wavelength 600 nm. 1, 2, 3, 4 and 5 are marked on five fringes. The third order bright fringe is:",
    options: [
      { label: "a", text: "2" },
      { label: "b", text: "3" },
      { label: "c", text: "4" },
      { label: "d", text: "5" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 31,
    subject: "Physics",
    text: "Electric potential at any point is $V = -5x + 3y + \\sqrt{15}\\,z$, then the magnitude of the electric field is:",
    options: [
      { label: "a", text: "$3\\sqrt{2}$" },
      { label: "b", text: "$4\\sqrt{2}$" },
      { label: "c", text: "$5\\sqrt{2}$" },
      { label: "d", text: "$7$" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 32,
    subject: "Physics",
    text: "Seven resistances, each of value 20 Ω, are connected to a 2 V battery as shown in the figure. The ammeter reading will be:",
    options: [
      { label: "a", text: "$\\frac{1}{10}$ A" },
      { label: "b", text: "$\\frac{3}{10}$ A" },
      { label: "c", text: "$\\frac{4}{10}$ A" },
      { label: "d", text: "$\\frac{7}{10}$ A" }
    ],
    image: null,
    displayFormula: false
  },
  {
    id: 33,
    subject: "Physics",
    text: "The variation of magnetic susceptibility ($\\chi$) with temperature for a diamagnetic substance is best represented by:",
    options: [
      { label: "a", text: "Graph (a) — $\\chi$ positive and constant" },
      { label: "b", text: "Graph (b) — $\\chi$ negative and constant" },
      { label: "c", text: "Graph (c) — $\\chi$ increases with $T$" },
      { label: "d", text: "Graph (d) — $\\chi$ decreases with $T$" }
    ],
    image: null,
    displayFormula: false
  }
];

// Subjects extracted from the data
const SUBJECTS = [...new Set(QUESTIONS.map(q => q.subject))];
