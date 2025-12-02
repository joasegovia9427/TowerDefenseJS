export const CONFIG = {
    width: 1024,
    height: 768,
    backgroundColor: '#1a1a1a', // Darker, more premium background
    pathColor: 0x34495e, // Dark blue-grey for path
    pathWidth: 60,
    startMoney: 500,
    startLives: 20,
    interestRate: 0.02,
    interestInterval: 15000, // 15 seconds
};

export const PATH_POINTS = [
    { x: 0, y: 384 },
    { x: 200, y: 384 },
    { x: 200, y: 200 },
    { x: 600, y: 200 },
    { x: 600, y: 500 },
    { x: 900, y: 500 },
    { x: 900, y: 150 },
    { x: 1024, y: 150 }
];
