const parseExpiration = (exp: string | number): number => {
    if (typeof exp === "number") return exp; // Already in milliseconds
  
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error("Invalid expiration format. Use '7d', '60m', etc.");
  
    const value = parseInt(match[1], 10);
    const unit = match[2];
  
    const unitMultipliers: Record<string, number> = {
      s: 1000,       // 1s  = 1000ms
      m: 60000,      // 1m  = 60 * 1000ms
      h: 3600000,    // 1h  = 60 * 60 * 1000ms
      d: 86400000,   // 1d  = 24 * 60 * 60 * 1000ms
    };
  
    return value * unitMultipliers[unit]; // Convert to milliseconds
  };

  export default parseExpiration;