// colorUtils.js - Global Function Version

/**
 * Generates a random color that works well as a background for white text.
 * If an input color is provided, generates a color with sufficiently different hue.
 * @param {string|null} inputHex - Input color in hex format (e.g., "#FF0000") or null
 * @returns {string} - Resulting color in hex format
 */
function generateContrastingColor(inputHex = null) {
    // If no input color provided, generate a random suitable background color
    if (!inputHex) {
        return generateRandomBackgroundColor();
    }
    
    // Convert input hex to HSL
    const inputHsl = hexToHsl(inputHex);
    
    // Generate a color with sufficiently different hue
    return generateDifferentHueColor(inputHsl.h);
}

// Helper functions
function generateRandomBackgroundColor() {
    const h = Math.floor(Math.random() * 360);
    const s = 50 + Math.floor(Math.random() * 50); // 50-100%
    const l = 20 + Math.floor(Math.random() * 30); // 20-50%
    return hslToHex(h, s, l);
}

function generateDifferentHueColor(inputHue) {

    // make sure it is between 90 and 270
    const minHueDifference = 90;
    const maxHueDifference = 250;
    let newHue;
    do {
        newHue = Math.floor(Math.random() * 360);
    } while (Math.abs(newHue - inputHue) < minHueDifference && 
             Math.abs(newHue - inputHue) > maxHueDifference);
    
    
    // do {
    //     newHue = Math.floor(Math.random() * 360);
    // } while (Math.abs(newHue - inputHue) < minHueDifference && 
    //          Math.abs(newHue - inputHue) < (360 - minHueDifference));
    
    const s = 50 + Math.floor(Math.random() * 50);
    const l = 20 + Math.floor(Math.random() * 30);
    return hslToHex(newHue, s, l);
}

function hexToHsl(hex) {
    hex = hex.replace('#', '');
    
    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16).padStart(2, '0');
        return hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}