import { CONFIG, PATH_POINTS } from './Constants.js';

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.graphics = this.scene.add.graphics();
        this.drawPath();
    }

    drawPath() {
        this.graphics.clear();
        this.graphics.lineStyle(CONFIG.pathWidth, CONFIG.pathColor, 1);
        
        // Draw the main path
        this.graphics.beginPath();
        this.graphics.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
        
        for (let i = 1; i < PATH_POINTS.length; i++) {
            this.graphics.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
        }
        
        this.graphics.strokePath();

        // Add visual flair - borders for the path
        this.graphics.lineStyle(2, 0x5dade2, 0.5); // Light blue border
        this.graphics.beginPath();
        // Simplified border drawing (just re-drawing thin lines for now, could be more complex offset lines)
        this.graphics.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
        for (let i = 1; i < PATH_POINTS.length; i++) {
            this.graphics.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
        }
        this.graphics.strokePath();
    }

    isOnPath(x, y) {
        const halfWidth = CONFIG.pathWidth / 2;
        for (let i = 0; i < PATH_POINTS.length - 1; i++) {
            const p1 = PATH_POINTS[i];
            const p2 = PATH_POINTS[i + 1];
            
            const dist = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            
            if (dist < halfWidth) {
                return true;
            }
        }
        return false;
    }

    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq != 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
